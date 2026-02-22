import { initDB } from '@/lib/db/init.js';
import { Snapshots, Sites, Runs, FeaturedProducts } from '@/lib/db/models.js';
import { mockSnapshots } from '@/lib/mock-data.js';

export async function GET(request) {
  try {
    await initDB();

    const { searchParams } = new URL(request.url);
    const siteId = searchParams.get('siteId');
    const runId = searchParams.get('runId');

    let snapshots;

    if (runId) {
      // Get snapshots for a specific run
      snapshots = Snapshots.getByRunId(parseInt(runId));
    } else if (siteId) {
      // Get latest snapshot for a specific site
      const snapshot = Snapshots.getLatestBySite(parseInt(siteId));
      snapshots = snapshot ? [snapshot] : [];
    } else {
      // Get latest snapshot for each site
      snapshots = Snapshots.getLatestByEachSite();
    }

    // Enrich with featured products
    const enriched = snapshots.map(snapshot => {
      const featured = FeaturedProducts.getBySnapshot(snapshot.id);
      return {
        ...snapshot,
        featured_products: featured
      };
    });

    return Response.json({
      success: true,
      data: enriched,
      count: enriched.length
    });
  } catch (error) {
    console.error('Error fetching snapshots:', error);

    // Fall back to mock data if database unavailable
    if (error.message.includes('ENOENT') || error.message.includes('mkdir')) {
      console.log('Using mock data (database unavailable)');
      return Response.json({
        success: true,
        data: mockSnapshots,
        count: mockSnapshots.length,
        mock: true
      });
    }

    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await initDB();

    const body = await request.json();
    const { site_name, run_id, extracted_data } = body;

    if (!site_name || !run_id || !extracted_data) {
      return Response.json(
        { success: false, error: 'Missing required fields: site_name, run_id, extracted_data' },
        { status: 400 }
      );
    }

    // Get or find site
    let site = Sites.getByName(site_name);
    if (!site && body.base_url) {
      site = Sites.create(site_name, body.base_url);
    }

    if (!site) {
      return Response.json(
        { success: false, error: `Site not found: ${site_name}` },
        { status: 404 }
      );
    }

    // Create snapshot
    const snapshot = Snapshots.create(
      site.id,
      parseInt(run_id),
      extracted_data,
      body.raw_html_hash || null,
      body.extracted_text_hash || null
    );

    // Process featured products
    const featuredItems = extracted_data.featured_products || [];
    const featured = [];

    for (let i = 0; i < featuredItems.length; i++) {
      const item = featuredItems[i];
      const fp = FeaturedProducts.create(
        snapshot.id,
        null, // product_id can be null for now
        item.price || null,
        item.image_url || null,
        i,
        item.title,
        item.url || null
      );
      featured.push(fp);
    }

    return Response.json({
      success: true,
      data: {
        snapshot,
        featured_products: featured
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating snapshot:', error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
