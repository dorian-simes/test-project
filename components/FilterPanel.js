'use client';

import { useState } from 'react';
import styles from './FilterPanel.module.css';

const CHANGE_TYPES = [
  { value: 'product_added', label: 'Product Added' },
  { value: 'product_removed', label: 'Product Removed' },
  { value: 'price_changed', label: 'Price Changed' },
  { value: 'promo_copy_changed', label: 'Promo Text Changed' },
  { value: 'headline_changed', label: 'Headline Changed' },
  { value: 'cta_changed', label: 'CTA Changed' },
  { value: 'other', label: 'Other' },
];

export default function FilterPanel({
  sites,
  selectedCompetitors,
  selectedChangeTypes,
  dateRange,
  onFilterChange,
}) {
  const [showDateFilter, setShowDateFilter] = useState(false);

  const handleCompetitorToggle = (siteId) => {
    const newSelection = new Set(selectedCompetitors);

    if (siteId === 'all') {
      newSelection.clear();
      newSelection.add('all');
    } else {
      const siteIdStr = String(siteId);
      if (newSelection.has(siteIdStr)) {
        newSelection.delete(siteIdStr);
        if (newSelection.size === 0) {
          newSelection.add('all');
        }
      } else {
        newSelection.add(siteIdStr);
        newSelection.delete('all');
      }

      if (newSelection.size === sites.length) {
        newSelection.clear();
        newSelection.add('all');
      }
    }

    onFilterChange('competitors', newSelection);
  };

  const handleChangeTypeToggle = (type) => {
    const newSelection = new Set(selectedChangeTypes);

    if (type === 'all') {
      newSelection.clear();
      newSelection.add('all');
    } else {
      if (newSelection.has(type)) {
        newSelection.delete(type);
        if (newSelection.size === 0) {
          newSelection.add('all');
        }
      } else {
        newSelection.add(type);
        newSelection.delete('all');
      }

      if (newSelection.size === CHANGE_TYPES.length) {
        newSelection.clear();
        newSelection.add('all');
      }
    }

    onFilterChange('changeTypes', newSelection);
  };

  const handleClearAll = () => {
    onFilterChange('competitors', new Set(['all']));
    onFilterChange('changeTypes', new Set(['all']));
    onFilterChange('dateRange', 'last-week');
    setShowDateFilter(false);
  };

  const isFiltered =
    !selectedCompetitors.has('all') ||
    !selectedChangeTypes.has('all') ||
    dateRange !== 'last-week';

  return (
    <div className={styles.filterPanel}>
      <div className={styles.filterHeader}>
        <h3 className={styles.filterTitle}>Filters</h3>
        <div className={styles.filterActions}>
          {isFiltered && (
            <button
              className={styles.clearButton}
              onClick={handleClearAll}
              type="button"
            >
              Clear All
            </button>
          )}
          <button
            className={`${styles.toggleButton} ${showDateFilter ? styles.toggleActive : ''}`}
            onClick={() => setShowDateFilter(!showDateFilter)}
            type="button"
          >
            {showDateFilter ? 'Hide Date Filter' : 'Date Filter'}
          </button>
        </div>
      </div>

      <div className={styles.filterContent}>
        {/* Competitors */}
        <div className={styles.filterGroup}>
          <span className={styles.groupLabel}>Competitors</span>
          <div className={styles.pillGroup}>
            <button
              type="button"
              className={`${styles.pill} ${selectedCompetitors.has('all') ? styles.pillActive : ''}`}
              onClick={() => handleCompetitorToggle('all')}
            >
              All
            </button>
            {sites.map(site => (
              <button
                key={site.id}
                type="button"
                className={`${styles.pill} ${selectedCompetitors.has(String(site.id)) ? styles.pillActive : ''}`}
                onClick={() => handleCompetitorToggle(site.id)}
              >
                {site.name}
              </button>
            ))}
          </div>
        </div>

        {/* Change Types */}
        <div className={styles.filterGroup}>
          <span className={styles.groupLabel}>Change Type</span>
          <div className={styles.pillGroup}>
            <button
              type="button"
              className={`${styles.pill} ${selectedChangeTypes.has('all') ? styles.pillActive : ''}`}
              onClick={() => handleChangeTypeToggle('all')}
            >
              All Types
            </button>
            {CHANGE_TYPES.map(type => (
              <button
                key={type.value}
                type="button"
                className={`${styles.pill} ${selectedChangeTypes.has(type.value) ? styles.pillActive : ''}`}
                onClick={() => handleChangeTypeToggle(type.value)}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Date Range */}
        {showDateFilter && (
          <div className={styles.filterGroup}>
            <span className={styles.groupLabel}>Date Range</span>
            <div className={styles.pillGroup}>
              {[
                { value: 'last-week', label: 'Last Week' },
                { value: 'last-month', label: 'Last 4 Weeks' },
                { value: 'all-time', label: 'All Time' },
              ].map(option => (
                <button
                  key={option.value}
                  type="button"
                  className={`${styles.pill} ${dateRange === option.value ? styles.pillActive : ''}`}
                  onClick={() => onFilterChange('dateRange', option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
