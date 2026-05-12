import type { Risk } from '../../shared/types.js';
import { LEVEL_LABELS } from '../../shared/types.js';
import LoadingSkeleton from './LoadingSkeleton.js';
import EmptyState from './EmptyState.js';

interface Props {
  risks: Risk[];
  loading: boolean;
  onSelect: (risk: Risk) => void;
}

const levelColors: Record<string, string> = {
  low: '#52c41a33', medium: '#faad1433', high: '#ff7a4533', critical: '#ff4d4f33',
};
const levelDots: Record<string, string> = {
  low: '#52c41a', medium: '#faad14', high: '#ff7a45', critical: '#ff4d4f',
};

export default function RiskMatrix({ risks, loading, onSelect }: Props) {
  if (loading) {
    return (
      <div className="matrix-container">
        <h3>风险矩阵 (概率 × 影响)</h3>
        <LoadingSkeleton variant="panel" />
      </div>
    );
  }

  if (risks.length === 0) {
    return (
      <div className="matrix-container">
        <h3>风险矩阵 (概率 × 影响)</h3>
        <EmptyState
          icon="🗺️"
          title="风险矩阵为空"
          description="添加风险后将在矩阵中展示"
        />
      </div>
    );
  }

  const matrix: Risk[][][] = Array.from({ length: 5 }, () => Array.from({ length: 5 }, () => []));
  for (const r of risks) {
    matrix[r.impact - 1]?.[r.probability - 1]?.push(r);
  }

  return (
    <div className="matrix-container">
      <h3>风险矩阵 (概率 × 影响)</h3>
      <div className="matrix-grid">
        <div className="matrix-corner">
          <span className="matrix-axis">影响 ↑</span>
          <span className="matrix-axis">概率 →</span>
        </div>
        {[5, 4, 3, 2, 1].map(i => (
          <div key={i} className="matrix-y-label">{i}</div>
        ))}
        {[5, 4, 3, 2, 1].map(impact => (
          [1, 2, 3, 4, 5].map(prob => {
            const cell = matrix[impact - 1]?.[prob - 1] ?? [];
            const score = impact * prob;
            const level = score >= 20 ? 'critical' : score >= 15 ? 'high' : score >= 8 ? 'medium' : 'low';
            return (
              <div
                key={`${impact}-${prob}`}
                className="matrix-cell"
                style={{ background: levelColors[level] }}
                title={`概率:${prob} 影响:${impact} 评分:${score}`}
              >
                {cell.length > 0 && (
                  <div className="cell-content" onClick={() => cell[0] && onSelect(cell[0])}>
                    {cell.map(r => (
                      <span key={r.id} className="cell-dot" style={{ background: levelDots[r.level] }} title={r.title} />
                    ))}
                    <span className="cell-count">{cell.length}</span>
                  </div>
                )}
              </div>
            );
          })
        ))}
      </div>
      <div className="matrix-legend">
        {Object.entries(LEVEL_LABELS).map(([key, label]) => (
          <span key={key} className="legend-item">
            <span className="legend-dot" style={{ background: levelDots[key] }} /> {label}
          </span>
        ))}
      </div>
    </div>
  );
}
