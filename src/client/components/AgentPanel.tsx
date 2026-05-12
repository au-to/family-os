import { useState, useEffect } from 'react';
import type { Risk, AgentAdvice, AgentSummary } from '../../shared/types.js';
import { CATEGORY_LABELS } from '../../shared/types.js';
import LoadingSkeleton from './LoadingSkeleton.js';
import EmptyState from './EmptyState.js';

interface Props {
  summary: AgentSummary | null;
  risks: Risk[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

export default function AgentPanel({ summary, risks, loading, error, onRetry }: Props) {
  const [selectedRiskId, setSelectedRiskId] = useState('');
  const [advice, setAdvice] = useState<AgentAdvice[]>([]);
  const [adviceLoading, setAdviceLoading] = useState(false);
  const [adviceError, setAdviceError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedRiskId) { setAdvice([]); return; }
    setAdviceLoading(true);
    setAdviceError(null);
    fetch(`/api/agent/advice/${selectedRiskId}`)
      .then(async res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<AgentAdvice[]>;
      })
      .then(d => { setAdvice(d); setAdviceLoading(false); })
      .catch(err => {
        setAdviceError(err.message || '获取建议失败');
        setAdviceLoading(false);
      });
  }, [selectedRiskId]);

  return (
    <div className="agent-panel">
      {loading ? (
        <div className="panel">
          <h3>🤖 Agent 风险总览</h3>
          <LoadingSkeleton variant="panel" />
        </div>
      ) : error ? (
        <div className="error-boundary" style={{ marginBottom: 16 }}>
          <div className="error-boundary-icon">⚠️</div>
          <h2>Agent 分析加载失败</h2>
          <p className="error-boundary-message">{error}</p>
          <button className="btn btn-primary" onClick={onRetry}>重试</button>
        </div>
      ) : !summary ? (
        <EmptyState
          icon="🤖"
          title="暂无 Agent 分析"
          description="添加风险数据后将自动生成分析"
        />
      ) : (
        <div className="panel agent-summary">
          <h3>🤖 Agent 风险总览</h3>
          <p className="agent-verdict">{summary.overallAssessment}</p>

          {summary.topConcerns.length > 0 && (
            <div className="agent-section">
              <h4>重点关注</h4>
              <ul>
                {summary.topConcerns.map((c, i) => <li key={i}>{c}</li>)}
              </ul>
            </div>
          )}

          {summary.recommendations.length > 0 && (
            <div className="agent-section">
              <h4>行动建议</h4>
              <ul>
                {summary.recommendations.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </div>
          )}

          {summary.categoryInsights.length > 0 ? (
            <div className="agent-section">
              <h4>各类别洞察</h4>
              <div className="category-insights">
                {summary.categoryInsights.map(c => (
                  <div key={c.category} className="insight-card">
                    <div className="insight-label">{c.label}</div>
                    <div className="insight-text">{c.insight}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="agent-section">
              <h4>各类别洞察</h4>
              <EmptyState icon="📊" title="暂无洞察数据" />
            </div>
          )}
        </div>
      )}

      <div className="panel">
        <h3>💡 单项风险建议</h3>
        {risks.length === 0 ? (
          <EmptyState
            icon="📝"
            title="暂无风险数据"
            description="添加风险后可查看单项建议"
          />
        ) : (
          <>
            <select
              value={selectedRiskId}
              onChange={e => setSelectedRiskId(e.target.value)}
              className="risk-select"
            >
              <option value="">选择风险查看Agent建议...</option>
              {risks
                .filter(r => r.status === 'active')
                .sort((a, b) => b.score - a.score)
                .map(r => (
                  <option key={r.id} value={r.id}>
                    [{CATEGORY_LABELS[r.category]}] {r.title} (评分: {r.score})
                  </option>
                ))}
            </select>

            {adviceLoading && <p className="loading">Agent 分析中...</p>}

            {adviceError && (
              <p className="error-message" style={{ color: '#ff4d4f', fontSize: 13, padding: 8 }}>
                {adviceError}
              </p>
            )}

            {!adviceLoading && !adviceError && advice.length === 0 && selectedRiskId && (
              <EmptyState icon="💡" title="暂无建议" description="该风险暂无 Agent 分析建议" />
            )}

            {advice.length > 0 && (
              <div className="advice-list">
                {advice.map(a => (
                  <div key={a.id} className="advice-item" style={{
                    borderLeftColor: a.priority >= 8 ? '#ff4d4f' : a.priority >= 5 ? '#faad14' : '#1890ff',
                  }}>
                    <div className="advice-content">{a.content}</div>
                    <div className="advice-meta">优先级: {a.priority}/10</div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
