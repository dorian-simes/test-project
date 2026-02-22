import styles from './Header.module.css';

export default function Header({ onRefresh, loading }) {
  const now = new Date();
  const lastUpdated = now.toLocaleString('en-AU', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.titleSection}>
          <div className={styles.logoMark}>W</div>
          <div className={styles.titleText}>
            <h1 className={styles.title}>Watch Intelligence Dashboard</h1>
            <p className={styles.subtitle}>Weekly competitor monitoring</p>
          </div>
        </div>

        <div className={styles.actions}>
          <div className={styles.timestamp}>
            <span className={styles.timestampLabel}>Last updated</span>
            <span className={styles.timestampValue}>{lastUpdated}</span>
          </div>
          <button
            onClick={onRefresh}
            disabled={loading}
            className={styles.refreshButton}
            title="Refresh data"
          >
            {loading ? (
              <>
                <span className={styles.spinner}></span>
                Refreshing...
              </>
            ) : (
              'Refresh Data'
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
