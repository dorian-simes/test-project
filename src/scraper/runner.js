/**
 * Scraper Runner
 * Orchestrates the scraping process for all competitors
 */

import { SITES } from './config.js';
import { fetchWithRetry } from './fetcher.js';
import { parseHtml } from './parser.js';
import { initializeStorage, saveSnapshot, getLatestSnapshot } from './storage.js';
import { compareSnapshots, summarizeChanges } from './change-detector.js';

/**
 * Scrape a single site
 * @param {Object} siteConfig - Site configuration
 * @returns {Promise<Object>} Result object
 */
async function scrapeSite(siteConfig) {
  try {
    console.log(`\n📍 Scraping: ${siteConfig.name}`);

    // Fetch the page
    const html = await fetchWithRetry(siteConfig.url);

    // Parse the HTML
    const snapshot = parseHtml(html, siteConfig.url, siteConfig.selectors);

    // Generate run ID (timestamp)
    const runId = new Date().toISOString().replace(/[:.]/g, '-');

    // Save the snapshot
    await saveSnapshot(snapshot, siteConfig.id, runId);

    // Detect changes from previous snapshot
    const latestPrevious = await getLatestSnapshot(siteConfig.id);
    let changes = [];

    if (latestPrevious) {
      const snapshotWithMeta = { data: snapshot };
      changes = compareSnapshots(latestPrevious, snapshotWithMeta);
      const summary = summarizeChanges(changes);
      console.log(`  📊 ${summary.summary}`);
    } else {
      console.log(`  📊 First snapshot for this site`);
    }

    return {
      success: true,
      site: siteConfig.name,
      message: `✅ Scraped ${snapshot.featuredProducts?.length || 0} products`,
      snapshot,
      changes
    };
  } catch (error) {
    console.error(`  ❌ Error: ${error.message}`);
    return {
      success: false,
      site: siteConfig.name,
      message: `❌ ${error.message}`,
      snapshot: null,
      changes: []
    };
  }
}

/**
 * Run scrapers for all configured sites
 * @returns {Promise<Object[]>} Results for each site
 */
export async function runScrapers() {
  try {
    // Initialize storage
    await initializeStorage();

    // Scrape all sites
    const results = [];
    for (const [key, siteConfig] of Object.entries(SITES)) {
      const result = await scrapeSite(siteConfig);
      results.push(result);
    }

    return results;
  } catch (error) {
    console.error('Fatal error in scraper:', error);
    throw error;
  }
}

export default { runScrapers, scrapeSite };
