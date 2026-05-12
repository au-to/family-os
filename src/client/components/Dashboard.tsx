import type { DashboardData } from '../../shared/types.js';
import { CATEGORY_LABELS, LEVEL_LABELS } from '../../shared/types.js';
import LoadingSkeleton from './LoadingSkeleton.js';
import EmptyState from './EmptyState.js';

interface Props {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

export default function Dashboard({ data, loading, error, onRetry }: Props) {
  if (loading) {
    return <LoadingSkeleton variant="dashboard" />;
  }

  if (error) {
    return (
      <div className="error-boundary">
        <div className="error-boundary-icon">⚠️</div>
        <h2>加载失败</h2>
        <p className="error-boundary-message">{error}</p>
        <button className="btn btn-primary" onClick={onRetry}>重试</button>
      </div>
    );
  }

  if (!data) {
    return <EmptyState icon="📊" title="暂无统计数据" description="请先添加风险数据" />;
  }

  const maxLevel = Math.max(...Object.values(data.byLevel), 1);
  const maxCat = Math.max(...Object.values(data.byCategory), 1);

  const levelColors: Record<string, string> = {
    low: '#52c41a', medium: '#faad14', high: '#ff7a45', critical: '#ff4d4f',
  };

  return (
    <div className="dashboard">
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-num">{data.totalRisks}</div>
          <div className="stat-label">总风险数</div>
        </div>
        <div className="stat-card active">
          <div className="stat-num">{data.activeRisks}</div>
          <div className="stat-label">活跃风险</div>
        </div>
        <div className="stat-card mitigated">
          <div className="stat-num">{data.mitigatedRisks}</div>
          <div className="stat-label">已缓解</div>
        </div>
        <div className="stat-card">
          <div className="stat-num">{data.avgScore}</div>
          <div className="stat-label">平均评分</div>
        </div>
      </div>

      <div className="panels">
        <div className="panel">
          <h3>风险等级分布</h3>
          <div className="bar-chart">
            {Object.entries(data.byLevel).map(([level, count]) => (
              <div key={level} className="bar-row">
                <span className="bar-label">{LEVEL_LABELS[level as keyof typeof LEVEL_LABELS]}</span>
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{ width: `${(count / maxLevel) * 100}%`, background: levelColors[level] }}
                  />
                </div>
                <span className="bar-count">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <h3>风险类别分布</h3>
          <div className="bar-chart">
            {Object.entries(data.byCategory).map(([cat, count]) => (
              <div key={cat} className="bar-row">
                <span className="bar-label">{CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS]}</span>
                <div className="bar-track">
                  <div
                    className="bar-fill cat"
                    style={{ width: `${(count / maxCat) * 100}%` }}
                  />
                </div>
                <span className="bar-count">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="panel">
        <h3>Top 5 高危风险</h3>
        {data.topRisks.length === 0 ? (
          <EmptyState icon="✅" title="暂无高危风险" description="所有风险都处于可控范围内" />
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>风险名称</th>
                <th>类别</th>
                <th>概率</th>
                <th>影响</th>
                <th>评分</th>
                <th>等级</th>
              </tr>
            </thead>
            <tbody>
              {data.topRisks.map(r => (
                <tr key={r.id}>
                  <td>{r.title}</td>
                  <td>{CATEGORY_LABELS[r.category]}</td>
                  <td>{r.probability}</td>
                  <td>{r.impact}</td>
                  <td className={`score score-${r.level}`}>{r.score}</td>
                  <td><span className={`tag tag-${r.level}`}>{LEVEL_LABELS[r.level]}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
