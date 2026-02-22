import { initDB } from '@/lib/db/init.js';
import { Snapshots, Runs, ChangeEvents, Sites } from '@/lib/db/models.js';
import { mockSnapshots, mockChanges, mockSummary } from '@/lib/mock-data.js';

export async function GET(request) {
  try {
    await initDB();

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7');
    const limit = parseInt(searchParams.get('limit') || '5');

    // Get recent runs
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - days);

    // Get latest run
    const runs = Runs.getLatest(1);
    const latestRun = runs[0];

    if (!latestRun) {
      return Response.json({
        success: true,
        data: {
          period_days: days,
          period_start: sinceDate.toISOString(),
          featured_products: [],
          notable_changes: [],
          summary_text: 'No data available yet. Run scraper to generate snapshots.',
        },
      });
    }

    // Get changes since date
    const changes = ChangeEvents.getLatestChanges(limit * 10, {
      since: sinceDate.toISOString(),
    });

    // Get latest snapshots for summary
    const snapshots = Snapshots.getLatestByEachSite();

    // Prepare summary data
    const allProducts = snapshots.flatMap(snapshot =>
      (snapshot.featured_products || []).map(p => ({
        title: p.raw_title,
        price: p.price,
        site: snapshot.name,
        url: p.raw_url,
      }))
    );

    // Top changes
    const topChanges = changes.slice(0, limit).map(change => ({
      type: change.type,
      site: change.site_name,
      description: change.description,
      confidence: change.confidence,
    }));

    // Generate summary text
    const summaryLines = [
      `WEEKLY COMPETITOR SUMMARY`,
      `Period: Last ${days} days`,
      `Generated: ${new Date().toLocaleString()}`,
      '',
      `FEATURED PRODUCTS (${allProducts.length} total)`,
      ...allProducts.slice(0, 6).map(p => {
        const priceStr = p.price ? ` - ${p.price}` : '';
        return `• ${p.title}${priceStr} (${p.site})`;
      }),
      '',
      `NOTABLE CHANGES (${topChanges.length} of ${changes.length})`,
      ...topChanges.map(change => `• ${change.site}: ${change.description}`),
    ].join('\n');

    return Response.json({
      success: true,
      data: {
        period_days: days,
        period_start: sinceDate.toISOString(),
        period_end: new Date().toISOString(),
        featured_products: allProducts,
        notable_changes: topChanges,
        summary_text: summaryLines,
        total_products: allProducts.length,
        total_changes: changes.length,
        generated_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error generating summary:', error);

    // Fall back to mock data if database unavailable
    if (error.message.includes('ENOENT') || error.message.includes('mkdir')) {
      console.log('Using mock data (database unavailable)');

      const days = 7;
      const sinceDate = new Date();
      sinceDate.setDate(sinceDate.getDate() - days);

      const allProducts = mockSnapshots.flatMap(snapshot =>
        (snapshot.featured_products || []).map(p => ({
          title: p.title,
          price: p.price,
          site: snapshot.site_name,
          url: p.product_url,
        }))
      );

      const topChanges = mockChanges.slice(0, 5).map(change => ({
        type: change.type,
        site: change.site_name,
        description: change.description,
        confidence: change.confidence,
      }));

      const summaryLines = [
        `WEEKLY COMPETITOR SUMMARY`,
        `Period: Last ${days} days`,
        `Generated: ${new Date().toLocaleString()}`,
        '',
        `FEATURED PRODUCTS (${allProducts.length} total)`,
        ...allProducts.slice(0, 6).map(p => {
          const priceStr = p.price ? ` - ${p.price}` : '';
          return `• ${p.title}${priceStr} (${p.site})`;
        }),
        '',
        `NOTABLE CHANGES (${topChanges.length})`,
        ...topChanges.map(change => `• ${change.site}: ${change.description}`),
      ].join('\n');

      return Response.json({
        success: true,
        data: {
          period_days: days,
          period_start: sinceDate.toISOString(),
          period_end: new Date().toISOString(),
          featured_products: allProducts,
          notable_changes: topChanges,
          summary_text: summaryLines,
          total_products: allProducts.length,
          total_changes: mockChanges.length,
          generated_at: new Date().toISOString(),
        },
        mock: true
      });
    }

    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
