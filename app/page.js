'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import FilterPanel from '@/components/FilterPanel';
import FeaturedProducts from '@/components/FeaturedProducts';
import NotableChanges from '@/components/NotableChanges';
import styles from './page.module.css';

export default function Home() {
  const [snapshots, setSnapshots] = useState([]);
  const [changes, setChanges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTab, setSelectedTab] = useState('products');

  // Filter states
  const [selectedCompetitors, setSelectedCompetitors] = useState(new Set(['all']));
  const [selectedChangeTypes, setSelectedChangeTypes] = useState(new Set(['all']));
  const [dateRange, setDateRange] = useState('last-week');
  const [sites, setSites] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch snapshots
      const snapshotRes = await fetch('/api/snapshots');
      if (!snapshotRes.ok) throw new Error('Failed to fetch snapshots');
      const snapshotData = await snapshotRes.json();
      setSnapshots(snapshotData.data || []);

      // Extract unique sites
      const uniqueSites = Array.from(
        new Map(
          (snapshotData.data || []).map(s => [s.site_id, { id: s.site_id, name: s.site_name }])
        ).values()
      );
      setSites(uniqueSites);

      // Fetch changes
      const changesRes = await fetch('/api/changes');
      if (!changesRes.ok) throw new Error('Failed to fetch changes');
      const changesData = await changesRes.json();
      setChanges(changesData.data || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (type, value) => {
    if (type === 'competitors') {
      setSelectedCompetitors(value);
    } else if (type === 'changeTypes') {
      setSelectedChangeTypes(value);
    } else if (type === 'dateRange') {
      setDateRange(value);
    }
  };

  const handleRefresh = () => {
    fetchData();
  };

  // Filter snapshots
  const filteredSnapshots = snapshots.filter(snapshot => {
    if (selectedCompetitors.has('all')) return true;
    return selectedCompetitors.has(String(snapshot.site_id));
  });

  // Filter changes
  const filteredChanges = changes.filter(change => {
    const competitorMatch =
      selectedCompetitors.has('all') || selectedCompetitors.has(String(change.site_id));
    const typeMatch =
      selectedChangeTypes.has('all') || selectedChangeTypes.has(change.type);
    return competitorMatch && typeMatch;
  });

  return (
    <div className={styles.page}>
      <Header onRefresh={handleRefresh} loading={loading} />

      <main className={styles.main}>
        <div className={styles.container}>
          {error && (
            <div className={styles.errorAlert}>
              <strong>Error:</strong> {error}
              <button onClick={handleRefresh}>Retry</button>
            </div>
          )}

          <FilterPanel
            sites={sites}
            selectedCompetitors={selectedCompetitors}
            selectedChangeTypes={selectedChangeTypes}
            dateRange={dateRange}
            onFilterChange={handleFilterChange}
          />

          <div className={styles.tabContainer}>
            <div className={styles.tabs}>
              <button
                className={`${styles.tab} ${selectedTab === 'products' ? styles.active : ''}`}
                onClick={() => setSelectedTab('products')}
              >
                Featured Products ({filteredSnapshots.reduce((acc, s) => acc + (s.featured_products?.length || 0), 0)})
              </button>
              <button
                className={`${styles.tab} ${selectedTab === 'changes' ? styles.active : ''}`}
                onClick={() => setSelectedTab('changes')}
              >
                Notable Changes ({filteredChanges.length})
              </button>
            </div>
          </div>

          {loading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.spinner}></div>
              <p>Loading competitor data...</p>
            </div>
          ) : selectedTab === 'products' ? (
            <FeaturedProducts snapshots={filteredSnapshots} loading={loading} />
          ) : (
            <NotableChanges changes={filteredChanges} loading={loading} />
          )}
        </div>
      </main>
    </div>
  );
}
