import { useState } from 'react';
import type { Risk, RiskCategory, RiskStatus, Member } from '../../shared/types.js';
import { CATEGORY_LABELS } from '../../shared/types.js';

interface Props {
  risk: Risk | null;
  members: Member[];
  onSave: (data: Partial<Risk>) => void;
  onCancel: () => void;
}

export default function RiskForm({ risk, members, onSave, onCancel }: Props) {
  const [category, setCategory] = useState<RiskCategory>(risk?.category ?? 'financial');
  const [title, setTitle] = useState(risk?.title ?? '');
  const [description, setDescription] = useState(risk?.description ?? '');
  const [probability, setProbability] = useState(risk?.probability ?? 3);
  const [impact, setImpact] = useState(risk?.impact ?? 3);
  const [status, setStatus] = useState<RiskStatus>(risk?.status ?? 'active');
  const [mitigation, setMitigation] = useState(risk?.mitigation ?? '');
  const [memberId, setMemberId] = useState(risk?.memberId ?? '');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try {
      await onSave({
        category, title: title.trim(), description: description.trim(),
        probability, impact, status,
        mitigation: mitigation.trim(), memberId: memberId || undefined,
      });
    } finally {
      setSaving(false);
    }
  };

  const score = probability * impact;
  const scoreLevel = score >= 20 ? 'critical' : score >= 15 ? 'high' : score >= 8 ? 'medium' : 'low';

  return (
    <form className="risk-form" onSubmit={handleSubmit}>
      <h3>{risk ? '编辑风险' : '新增风险'}</h3>

      <label>风险类别</label>
      <select value={category} onChange={e => setCategory(e.target.value as RiskCategory)}>
        {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
      </select>

      <label>风险名称</label>
      <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="例如：突发疾病医疗支出" required disabled={saving} />

      <label>描述</label>
      <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="详细描述风险场景..." rows={3} disabled={saving} />

      <div className="form-row">
        <div className="form-col">
          <label>发生概率 (1-5)</label>
          <div className="scale">
            {[1, 2, 3, 4, 5].map(v => (
              <button key={v} type="button" className={`scale-btn ${probability === v ? 'active' : ''}`} onClick={() => setProbability(v)} disabled={saving}>
                {v}
              </button>
            ))}
          </div>
        </div>
        <div className="form-col">
          <label>影响程度 (1-5)</label>
          <div className="scale">
            {[1, 2, 3, 4, 5].map(v => (
              <button key={v} type="button" className={`scale-btn ${impact === v ? 'active' : ''}`} onClick={() => setImpact(v)} disabled={saving}>
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="form-row">
        <div className="form-col">
          <label>评分预览</label>
          <div className="score-preview">
            <span className={`tag tag-${scoreLevel}`}>
              {probability} × {impact} = {score}
            </span>
          </div>
        </div>
        <div className="form-col">
          <label>状态</label>
          <select value={status} onChange={e => setStatus(e.target.value as RiskStatus)} disabled={saving}>
            <option value="active">活跃</option>
            <option value="mitigated">已缓解</option>
            <option value="closed">已关闭</option>
          </select>
        </div>
      </div>

      <label>缓解措施</label>
      <textarea value={mitigation} onChange={e => setMitigation(e.target.value)} placeholder="已采取或计划的缓解措施..." rows={2} disabled={saving} />

      <label>关联家庭成员</label>
      <select value={memberId} onChange={e => setMemberId(e.target.value)} disabled={saving}>
        <option value="">不关联</option>
        {members.map(m => <option key={m.id} value={m.id}>{m.name} ({m.role})</option>)}
      </select>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={saving || !title.trim()}>
          {saving ? '保存中...' : (risk ? '保存修改' : '创建风险')}
        </button>
        <button type="button" className="btn" onClick={onCancel} disabled={saving}>取消</button>
      </div>
    </form>
  );
}
