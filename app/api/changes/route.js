import { initDB } from '@/lib/db/init.js';
import { ChangeEvents, Sites } from '@/lib/db/models.js';
import { mockChanges } from '@/lib/mock-data.js';

const CHANGE_TYPES = [
  'product_added',
  'product_removed',
  'price_changed',
  'promo_copy_changed',
  'headline_changed',
  'cta_changed',
  'other'
];

export async function GET(request) {
  try {
    await initDB();

    const { searchParams } = new URL(request.url);
    const siteId = searchParams.get('siteId');
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '50');
    const since = searchParams.get('since');

    const filters = {};

    if (siteId) {
      filters.siteId = parseInt(siteId);
    }

    if (type && CHANGE_TYPES.includes(type)) {
      filters.type = type;
    }

    if (since) {
      filters.since = since;
    }

    const changes = ChangeEvents.getLatestChanges(limit, filters);

    return Response.json({
      success: true,
      data: changes,
      count: changes.length,
      filters
    });
  } catch (error) {
    console.error('Error fetching changes:', error);

    // Fall back to mock data if database unavailable
    if (error.message.includes('ENOENT') || error.message.includes('mkdir')) {
      console.log('Using mock data (database unavailable)');
      let filtered = mockChanges;

      const siteId = new URL(request.url).searchParams.get('siteId');
      const type = new URL(request.url).searchParams.get('type');

      if (siteId) {
        filtered = filtered.filter(c => c.site_id === parseInt(siteId));
      }

      if (type && CHANGE_TYPES.includes(type)) {
        filtered = filtered.filter(c => c.type === type);
      }

      return Response.json({
        success: true,
        data: filtered,
        count: filtered.length,
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
    const { site_id, run_id, type, description, before, after, confidence } = body;

    if (!site_id || !run_id || !type || !description) {
      return Response.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!CHANGE_TYPES.includes(type)) {
      return Response.json(
        { success: false, error: `Invalid change type. Must be one of: ${CHANGE_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    const change = ChangeEvents.create(
      site_id,
      run_id,
      type,
      description,
      before || null,
      after || null,
      confidence || 1.0
    );

    return Response.json({
      success: true,
      data: change
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating change event:', error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
