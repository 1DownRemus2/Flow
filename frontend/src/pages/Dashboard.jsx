import { useState, useEffect } from 'react';
import { getPeriods, createPeriod, deletePeriod, getPredictions } from '../api';
import Calendar from '../components/Calendar';

function Dashboard({ onLogout }) {
  const [periods, setPeriods] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [predictions, setPredictions] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadPeriods();
    loadPredictions();
  }, []);

  const loadPeriods = async () => {
    try {
      const response = await getPeriods();
      setPeriods(response.data);
    } catch (err) {
      setError('Could not load your history. Try refreshing.');
    } finally {
      setLoading(false);
    }
  };

  const loadPredictions = async () => {
    try {
      const response = await getPredictions();
      setPredictions(response.data);
    } catch (err) {
      console.error('Failed to load predictions', err);
    }
  };

  const handleAddPeriod = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await createPeriod(startDate, endDate || null);
      setStartDate('');
      setEndDate('');
      setShowForm(false);
      loadPeriods();
      loadPredictions();
    } catch (err) {
      setError('Could not save that entry. Try again.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deletePeriod(id);
      loadPeriods();
      loadPredictions();
    } catch (err) {
      setError('Could not delete that entry. Try again.');
    }
  };

  const regularityStyle = {
    regular: { color: 'var(--teal)', background: 'var(--teal-soft)' },
    'somewhat irregular': { color: '#9A6B12', background: '#F7E8C9' },
    irregular: { color: 'var(--coral)', background: 'var(--coral-soft)' },
    'not enough data yet': { color: 'var(--ink-soft)', background: 'var(--card)' },
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <header style={styles.header}>
          <div style={styles.brandGroup}>
            <div style={styles.logoMark}>F</div>
            <span style={styles.brand}>Flow</span>
          </div>
          <button onClick={onLogout} style={styles.logoutButton}>Log out</button>
        </header>

        <Calendar periods={periods} predictions={predictions} />

        {predictions && predictions.predictedNextStart && (
          <div style={styles.statsRow}>
            <div style={styles.statCard}>
              <p style={styles.statLabel}>NEXT PERIOD</p>
              <p style={styles.statValue}>{formatPretty(predictions.predictedNextStart)}</p>
            </div>
            <div style={styles.statCard}>
              <p style={styles.statLabel}>AVG CYCLE</p>
              <p style={styles.statValue}>{predictions.averageCycleLength}d</p>
            </div>
            <div style={styles.statCard}>
              <p style={styles.statLabel}>REGULARITY</p>
              <span style={{ ...styles.badge, ...regularityStyle[predictions.regularity] }}>
                {predictions.regularity}
              </span>
            </div>
          </div>
        )}

        {predictions && predictions.predictedNextStart && predictions.regularity === 'not enough data yet' && (
          <p style={styles.hintText}>
            Based on {predictions.cyclesLogged} logged cycles. Log a few more for a more reliable estimate.
          </p>
        )}

        {predictions && !predictions.predictedNextStart && (
          <div style={styles.emptyCard}>
            <p style={styles.hintText}>
              {predictions.message || 'Log at least two periods to see predictions.'}
            </p>
          </div>
        )}

        {error && <p style={styles.errorText}>{error}</p>}

        <section style={styles.historySection}>
          <div style={styles.historyHeader}>
            <h2 style={styles.historyTitle}>History</h2>
            <button onClick={() => setShowForm((s) => !s)} style={styles.addButton}>
              {showForm ? 'Cancel' : '+ Log period'}
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleAddPeriod} style={styles.form}>
              <div style={styles.formRow}>
                <label style={styles.formLabel}>
                  START DATE
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    style={styles.dateInput}
                  />
                </label>
                <label style={styles.formLabel}>
                  END DATE <span style={styles.optionalTag}>optional</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    style={styles.dateInput}
                  />
                </label>
              </div>
              <button type="submit" style={styles.saveButton}>Save entry</button>
            </form>
          )}

          {loading ? (
            <p style={styles.mutedText}>Loading…</p>
          ) : periods.length === 0 ? (
            <p style={styles.mutedText}>Nothing logged yet. Add your first period above.</p>
          ) : (
            <ul style={styles.list}>
              {periods.map((p) => (
                <li key={p.id} style={styles.listItem}>
                  <span style={styles.dot} aria-hidden="true" />
                  <span style={styles.listDates}>
                    {formatPretty(p.start_date)}
                    {p.end_date ? ` – ${formatPretty(p.end_date)}` : ' · ongoing'}
                  </span>
                  <button onClick={() => handleDelete(p.id)} style={styles.deleteButton} aria-label="Delete entry">
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function formatPretty(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const styles = {
  page: {
    minHeight: '100vh',
    background: 'var(--bg)',
    padding: '24px 16px 60px',
  },
  container: {
    maxWidth: '460px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  brandGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  logoMark: {
    width: '26px',
    height: '26px',
    borderRadius: 'var(--radius-sm)',
    background: 'var(--ink)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: '13px',
  },
  brand: {
    fontFamily: 'var(--font-display)',
    fontSize: '18px',
    fontWeight: 700,
    color: 'var(--ink)',
    letterSpacing: '-0.3px',
  },
  logoutButton: {
    border: 'none',
    background: 'none',
    color: 'var(--ink-soft)',
    fontSize: '13px',
    cursor: 'pointer',
    fontWeight: 500,
  },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '10px',
    marginTop: '14px',
  },
  statCard: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    padding: '12px 10px',
  },
  statLabel: {
    fontSize: '10px',
    fontWeight: 600,
    letterSpacing: '0.05em',
    color: 'var(--ink-faint)',
    margin: 0,
  },
  statValue: {
    fontFamily: 'var(--font-display)',
    fontSize: '17px',
    fontWeight: 700,
    margin: '5px 0 0',
    color: 'var(--ink)',
  },
  badge: {
    display: 'inline-block',
    marginTop: '6px',
    padding: '3px 8px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'capitalize',
  },
  hintText: {
    fontSize: '12.5px',
    color: 'var(--ink-soft)',
    marginTop: '10px',
    lineHeight: 1.5,
  },
  emptyCard: {
    background: 'var(--card)',
    borderRadius: 'var(--radius-md)',
    padding: '14px 16px',
    marginTop: '14px',
  },
  errorText: {
    color: 'var(--coral)',
    fontSize: '13px',
    marginTop: '14px',
    fontWeight: 500,
  },
  historySection: {
    marginTop: '28px',
  },
  historyHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  historyTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: '16px',
    fontWeight: 700,
    margin: 0,
    color: 'var(--ink)',
  },
  addButton: {
    border: 'none',
    background: 'var(--accent)',
    color: '#fff',
    borderRadius: 'var(--radius-sm)',
    padding: '8px 14px',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  form: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    padding: '16px',
    marginBottom: '16px',
  },
  formRow: {
    display: 'flex',
    gap: '12px',
    marginBottom: '12px',
  },
  formLabel: {
    flex: 1,
    fontSize: '10.5px',
    fontWeight: 600,
    letterSpacing: '0.05em',
    color: 'var(--ink-faint)',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  optionalTag: {
    color: '#B4B0B6',
    fontWeight: 400,
    textTransform: 'none',
    letterSpacing: 0,
  },
  dateInput: {
    padding: '10px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border)',
    fontSize: '14px',
    background: 'var(--bg)',
    color: 'var(--ink)',
  },
  saveButton: {
    width: '100%',
    border: 'none',
    background: 'var(--ink)',
    color: '#fff',
    borderRadius: 'var(--radius-sm)',
    padding: '11px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  mutedText: {
    color: 'var(--ink-soft)',
    fontSize: '14px',
  },
  list: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  listItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    padding: '12px 14px',
  },
  dot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    background: 'var(--coral)',
    flexShrink: 0,
  },
  listDates: {
    flex: 1,
    fontSize: '13.5px',
    color: 'var(--ink)',
    fontWeight: 500,
  },
  deleteButton: {
    border: 'none',
    background: 'none',
    color: 'var(--ink-faint)',
    fontSize: '12px',
    cursor: 'pointer',
    fontWeight: 500,
  },
};

export default Dashboard;
