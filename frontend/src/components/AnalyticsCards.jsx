export default function AnalyticsCards({ analytics, loading }) {
  if (loading) {
    return <div className="analytics-grid skeleton-grid">
      {[1, 2, 3, 4].map((i) => <div key={i} className="stat-card skeleton" />)}
    </div>;
  }
  if (!analytics) return null;

  const { total, completed, pending, completionPercentage } = analytics;

  const cards = [
    { label: "Total Tasks", value: total, tone: "neutral" },
    { label: "Completed", value: completed, tone: "success" },
    { label: "Pending", value: pending, tone: "warning" },
    { label: "Completion", value: `${completionPercentage}%`, tone: "info" },
  ];

  return (
    <div className="analytics-grid">
      {cards.map((c) => (
        <div key={c.label} className={`stat-card tone-${c.tone}`}>
          <div className="stat-value">{c.value}</div>
          <div className="stat-label">{c.label}</div>
        </div>
      ))}
      <div className="stat-card bar-card">
        <div className="stat-label">Completion Progress</div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${completionPercentage}%` }} />
        </div>
      </div>
    </div>
  );
}
