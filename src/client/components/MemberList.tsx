import { useState } from 'react';
import type { Member } from '../../shared/types.js';
import LoadingSkeleton from './LoadingSkeleton.js';
import EmptyState from './EmptyState.js';

interface Props {
  members: Member[];
  loading: boolean;
  error: string | null;
  onAdd: (data: Partial<Member>) => void;
  onDelete: (id: string) => void;
  onRetry: () => void;
}

export default function MemberList({ members, loading, error, onAdd, onDelete, onRetry }: Props) {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [age, setAge] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !role.trim() || !age) return;
    setSubmitting(true);
    try {
      await onAdd({ name: name.trim(), role: role.trim(), age: Number(age) });
      setName('');
      setRole('');
      setAge('');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div>
        <h3>家庭成员管理</h3>
        <LoadingSkeleton variant="table" count={3} />
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

  return (
    <div>
      <h3>家庭成员管理</h3>

      <form className="member-form" onSubmit={handleAdd}>
        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="姓名" required />
        <input type="text" value={role} onChange={e => setRole(e.target.value)} placeholder="角色（父亲/母亲/孩子等）" required />
        <input type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="年龄" min="0" max="120" required />
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? '添加中...' : '添加成员'}
        </button>
      </form>

      {members.length === 0 ? (
        <EmptyState
          icon="👥"
          title="暂无家庭成员"
          description="添加家庭成员以关联风险"
        />
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>姓名</th>
              <th>角色</th>
              <th>年龄</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {members.map(m => (
              <tr key={m.id}>
                <td>{m.name}</td>
                <td>{m.role}</td>
                <td>{m.age}岁</td>
                <td>
                  <button className="btn btn-sm btn-danger" onClick={() => onDelete(m.id)}>删除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
