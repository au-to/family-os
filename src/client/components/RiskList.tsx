import { useState } from 'react';
import type { Risk, Member } from '../../shared/types.js';
import { CATEGORY_LABELS, LEVEL_LABELS, STATUS_LABELS } from '../../shared/types.js';
import LoadingSkeleton from './LoadingSkeleton.js';
import EmptyState from './EmptyState.js';

interface Props {
  risks: Risk[];
  members: Member[];
  loading: boolean;
  error: string | null;
  onAdd: () => void;
  onEdit: (risk: Risk) => void;
  onDelete: (id: string) => void;
  onRetry: () => void;
}

export default function RiskList({ risks, members, loading, error, onAdd, onEdit, onDelete, onRetry }: Props) {
  const [filterCat, setFilterCat] = useState('all');
  const [filterLevel, setFilterLevel] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  if (loading) {
    return (
      <div>
        <div className="toolbar">
          <h3>风险清单</h3>
          <button className="btn btn-primary" disabled>+ 新增风险</button>
        </div>
        <LoadingSkeleton variant="table" count={5} />
      </div>
    );
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

  const filtered = risks.filter(r => {
    if (filterCat !== 'all' && r.category !== filterCat) return false;
    if (filterLevel !== 'all' && r.level !== filterLevel) return false;
    if (filterStatus !== 'all' && r.status !== filterStatus) return false;
    return true;
  });

  return (
    <div>
      <div className="toolbar">
        <h3>风险清单</h3>
        <button className="btn btn-primary" onClick={onAdd}>+ 新增风险</button>
      </div>

      <div className="filters">
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)}>
          <option value="all">全部类别</option>
          {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={filterLevel} onChange={e => setFilterLevel(e.target.value)}>
          <option value="all">全部等级</option>
          {Object.entries(LEVEL_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">全部状态</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <span className="filter-count">共 {filtered.length} 项</span>
      </div>

      {risks.length === 0 ? (
        <EmptyState
          icon="📋"
          title="暂无风险数据"
          description="点击「新增风险」开始管理家庭风险"
          action={{ label: '+ 新增风险', onClick: onAdd }}
        />
      ) : filtered.length === 0 ? (
        <EmptyState icon="🔍" title="无匹配结果" description="尝试调整筛选条件" />
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>名称</th>
              <th>类别</th>
              <th>概率</th>
              <th>影响</th>
              <th>评分</th>
              <th>等级</th>
              <th>状态</th>
              <th>关联成员</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => {
              const member = members.find(m => m.id === r.memberId);
              return (
                <tr key={r.id}>
                  <td>
                    <div className="risk-title">{r.title}</div>
                    <div className="risk-desc">{r.description || '-'}</div>
                  </td>
                  <td>{CATEGORY_LABELS[r.category]}</td>
                  <td>{r.probability}</td>
                  <td>{r.impact}</td>
                  <td className={`score score-${r.level}`}>{r.score}</td>
                  <td><span className={`tag tag-${r.level}`}>{LEVEL_LABELS[r.level]}</span></td>
                  <td><span className={`tag tag-status tag-${r.status}`}>{STATUS_LABELS[r.status]}</span></td>
                  <td>{member?.name || '-'}</td>
                  <td className="actions">
                    <button className="btn btn-sm" onClick={() => onEdit(r)}>编辑</button>
                    <button className="btn btn-sm btn-danger" onClick={() => onDelete(r.id)}>删除</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
