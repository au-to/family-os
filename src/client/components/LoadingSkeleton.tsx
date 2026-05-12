interface Props {
  variant?: 'dashboard' | 'table' | 'panel' | 'card';
  count?: number;
}

export default function LoadingSkeleton({ variant = 'panel', count = 1 }: Props) {
  if (variant === 'dashboard') {
    return (
      <div className="skeleton-dashboard">
        <div className="skeleton-stats">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="skeleton-stat">
              <div className="skeleton-line skeleton-line-title" />
              <div className="skeleton-line skeleton-line-value" />
            </div>
          ))}
        </div>
        <div className="panels">
          <div className="skeleton-panel">
            <div className="skeleton-line skeleton-line-title" style={{ width: '40%' }} />
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="skeleton-bar-row">
                <div className="skeleton-line" style={{ width: '20%' }} />
                <div className="skeleton-bar" />
              </div>
            ))}
          </div>
          <div className="skeleton-panel">
            <div className="skeleton-line skeleton-line-title" style={{ width: '40%' }} />
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="skeleton-bar-row">
                <div className="skeleton-line" style={{ width: '20%' }} />
                <div className="skeleton-bar" />
              </div>
            ))}
          </div>
        </div>
        <div className="skeleton-panel">
          <div className="skeleton-line skeleton-line-title" style={{ width: '30%' }} />
          <div className="skeleton-table">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="skeleton-table-row">
                <div className="skeleton-line" style={{ width: '40%' }} />
                <div className="skeleton-line" style={{ width: '20%' }} />
                <div className="skeleton-line" style={{ width: '15%' }} />
                <div className="skeleton-line" style={{ width: '15%' }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div className="skeleton-table">
        <div className="skeleton-table-header">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="skeleton-line" style={{ width: `${15 + Math.random() * 10}%` }} />
          ))}
        </div>
        {Array.from({ length: count }, (_, i) => (
          <div key={i} className="skeleton-table-row">
            <div className="skeleton-line" style={{ width: '30%' }} />
            <div className="skeleton-line" style={{ width: '15%' }} />
            <div className="skeleton-line" style={{ width: '10%' }} />
            <div className="skeleton-line" style={{ width: '10%' }} />
            <div className="skeleton-line" style={{ width: '20%' }} />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '8px' }}>
        {Array.from({ length: count }, (_, i) => (
          <div key={i} className="skeleton-card">
            <div className="skeleton-line skeleton-line-title" style={{ width: '60%' }} />
            <div className="skeleton-line" style={{ width: '90%' }} />
            <div className="skeleton-line" style={{ width: '70%' }} />
          </div>
        ))}
      </div>
    );
  }

  // panel variant (default)
  return (
    <div className="skeleton-panel">
      <div className="skeleton-line skeleton-line-title" style={{ width: '40%' }} />
      <div className="skeleton-line" style={{ width: '90%' }} />
      <div className="skeleton-line" style={{ width: '80%' }} />
      <div className="skeleton-line" style={{ width: '60%' }} />
    </div>
  );
}
