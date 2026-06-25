import { useState } from 'react';

function toDateOnly(str) {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

function isInRange(day, startStr, endStr) {
  if (!startStr) return false;
  const start = toDateOnly(startStr);
  const end = endStr ? toDateOnly(endStr) : start;
  return day >= start && day <= end;
}

export default function Calendar({ periods, predictions }) {
  const [viewDate, setViewDate] = useState(new Date());

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstOfMonth = new Date(year, month, 1);
  const startWeekday = firstOfMonth.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

  const today = new Date();

  const goPrev = () => setViewDate(new Date(year, month - 1, 1));
  const goNext = () => setViewDate(new Date(year, month + 1, 1));

  const monthLabel = viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const fertileStart = predictions?.fertileWindowStart;
  const fertileEnd = predictions?.fertileWindowEnd;
  const predictedDate = predictions?.predictedNextStart ? toDateOnly(predictions.predictedNextStart) : null;

  return (
    <div style={styles.wrap}>
      <div style={styles.header}>
        <span style={styles.monthLabel}>{monthLabel}</span>
        <div style={styles.navGroup}>
          <button onClick={goPrev} aria-label="Previous month" style={styles.navButton}>‹</button>
          <button onClick={goNext} aria-label="Next month" style={styles.navButton}>›</button>
        </div>
      </div>

      <div style={styles.weekdayRow}>
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div key={i} style={styles.weekdayCell}>{d}</div>
        ))}
      </div>

      <div style={styles.grid}>
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;

          const isLogged = periods.some((p) => isInRange(day, p.start_date, p.end_date));
          const isFertile = fertileStart && fertileEnd && isInRange(day, fertileStart, fertileEnd);
          const isPredicted = predictedDate && sameDay(day, predictedDate);
          const isToday = sameDay(day, today);

          let cellStyle = { ...styles.dayCell };
          if (isFertile) cellStyle = { ...cellStyle, ...styles.fertileCell };
          if (isLogged) cellStyle = { ...cellStyle, ...styles.loggedCell };
          if (isPredicted) cellStyle = { ...cellStyle, ...styles.predictedCell };
          if (isToday) cellStyle = { ...cellStyle, ...styles.todayCell };

          return (
            <div key={i} style={cellStyle}>
              {day.getDate()}
            </div>
          );
        })}
      </div>

      <div style={styles.legend}>
        <LegendItem swatch={styles.legendLogged} label="Period" />
        <LegendItem swatch={styles.legendFertile} label="Fertile window" />
        <LegendItem swatch={styles.legendPredicted} label="Predicted" />
      </div>
    </div>
  );
}

function LegendItem({ swatch, label }) {
  return (
    <div style={styles.legendItem}>
      <span style={{ ...styles.legendSwatch, ...swatch }} />
      <span style={styles.legendLabel}>{label}</span>
    </div>
  );
}

const styles = {
  wrap: {
    background: 'var(--surface)',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--border)',
    padding: '20px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '14px',
  },
  navGroup: {
    display: 'flex',
    gap: '4px',
  },
  navButton: {
    border: '1px solid var(--border)',
    background: 'var(--surface)',
    width: '28px',
    height: '28px',
    borderRadius: 'var(--radius-sm)',
    fontSize: '15px',
    cursor: 'pointer',
    color: 'var(--ink)',
  },
  monthLabel: {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: '15px',
    color: 'var(--ink)',
    letterSpacing: '-0.2px',
  },
  weekdayRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    marginBottom: '4px',
  },
  weekdayCell: {
    textAlign: 'center',
    fontSize: '10.5px',
    fontWeight: 600,
    letterSpacing: '0.04em',
    color: 'var(--ink-faint)',
    padding: '4px 0',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '3px',
  },
  dayCell: {
    aspectRatio: '1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'var(--radius-sm)',
    fontSize: '13px',
    color: 'var(--ink)',
  },
  loggedCell: {
    background: 'var(--coral)',
    color: '#fff',
    fontWeight: 600,
  },
  fertileCell: {
    background: 'var(--teal-soft)',
    color: 'var(--teal)',
    fontWeight: 600,
  },
  predictedCell: {
    border: '1.5px dashed var(--accent)',
    color: 'var(--accent)',
    fontWeight: 700,
  },
  todayCell: {
    boxShadow: 'inset 0 0 0 1.5px var(--ink)',
  },
  legend: {
    display: 'flex',
    gap: '16px',
    marginTop: '16px',
    paddingTop: '14px',
    borderTop: '1px solid var(--border)',
    flexWrap: 'wrap',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  legendSwatch: {
    width: '10px',
    height: '10px',
    borderRadius: '3px',
    display: 'inline-block',
  },
  legendLogged: { background: 'var(--coral)' },
  legendFertile: { background: 'var(--teal-soft)' },
  legendPredicted: { border: '1.5px dashed var(--accent)', background: 'transparent' },
  legendLabel: {
    fontSize: '11.5px',
    color: 'var(--ink-soft)',
    fontWeight: 500,
  },
};
