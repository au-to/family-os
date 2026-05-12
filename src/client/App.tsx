import { useState, useCallback, useEffect } from 'react';
import type { Risk, Member } from '../shared/types.js';
import { ToastProvider, useToast } from './contexts/ToastContext.js';
import ErrorBoundary from './components/ErrorBoundary.js';
import ToastContainer from './components/Toast.js';
import ConfirmDialog from './components/ConfirmDialog.js';
import Dashboard from './components/Dashboard.js';
import RiskMatrix from './components/RiskMatrix.js';
import RiskList from './components/RiskList.js';
import RiskForm from './components/RiskForm.js';
import MemberList from './components/MemberList.js';
import AgentPanel from './components/AgentPanel.js';
import { useRisks } from './hooks/useRisks.js';
import { useMembers } from './hooks/useMembers.js';
import { useDashboard } from './hooks/useDashboard.js';
import { useAgentSummary } from './hooks/useAgentSummary.js';

type Tab = 'dashboard' | 'matrix' | 'risks' | 'members' | 'agent';

function AppContent() {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [editingRisk, setEditingRisk] = useState<Risk | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'risk' | 'member'; id: string } | null>(null);

  const {
    risks,
    loading: risksLoading,
    error: risksError,
    refetch: refetchRisks,
    createRisk,
    updateRisk,
    deleteRisk,
  } = useRisks();

  const {
    members,
    loading: membersLoading,
    error: membersError,
    refetch: refetchMembers,
    addMember,
    deleteMember,
  } = useMembers();

  const {
    dashboard,
    loading: dashboardLoading,
    error: dashboardError,
    refetch: refetchDashboard,
  } = useDashboard();

  const {
    summary,
    loading: summaryLoading,
    error: summaryError,
    refetch: refetchSummary,
  } = useAgentSummary();

  const { addToast } = useToast();

  const refresh = useCallback(() => {
    refetchRisks();
    refetchDashboard();
    refetchSummary();
  }, [refetchRisks, refetchDashboard, refetchSummary]);

  useEffect(() => {
    refetchMembers();
  }, [refetchMembers]);

  const handleSave = useCallback(async (data: Partial<Risk>) => {
    try {
      if (editingRisk) {
        await updateRisk(editingRisk.id, data);
        addToast('success', '风险已更新');
      } else {
        await createRisk(data);
        addToast('success', '风险已创建');
      }
      setShowForm(false);
      setEditingRisk(null);
    } catch {
      addToast('error', '保存失败，请稍后重试');
    }
  }, [editingRisk, updateRisk, createRisk, addToast]);

  const handleDelete = useCallback((id: string) => {
    setDeleteTarget({ type: 'risk', id });
  }, []);

  const handleEdit = useCallback((risk: Risk) => {
    setEditingRisk(risk);
    setShowForm(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === 'risk') {
        await deleteRisk(deleteTarget.id);
        addToast('success', '风险已删除');
      } else {
        await deleteMember(deleteTarget.id);
        addToast('success', '成员已删除');
      }
    } catch {
      addToast('error', '删除失败，请稍后重试');
    }
    setDeleteTarget(null);
  }, [deleteTarget, deleteRisk, deleteMember, addToast]);

  const handleMemberAdd = useCallback(async (data: Partial<Member>) => {
    try {
      await addMember(data);
      addToast('success', '成员已添加');
    } catch {
      addToast('error', '添加失败，请稍后重试');
    }
  }, [addMember, addToast]);

  const tabs: { key: Tab; label: string }[] = [
    { key: 'dashboard', label: '总览' },
    { key: 'matrix', label: '风险矩阵' },
    { key: 'risks', label: '风险清单' },
    { key: 'members', label: '家庭成员' },
    { key: 'agent', label: 'Agent 分析' },
  ];

  return (
    <div className="app">
      <header className="app-header">
        <h1>🏠 家庭风险管理操作系统</h1>
        <span className="badge">MVP v0.1</span>
      </header>
      <nav className="tabs">
        {tabs.map(t => (
          <button key={t.key} className={`tab ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </nav>
      <main className="content">
        {tab === 'dashboard' && (
          <Dashboard
            data={dashboard}
            loading={dashboardLoading}
            error={dashboardError}
            onRetry={refetchDashboard}
          />
        )}
        {tab === 'matrix' && (
          <RiskMatrix
            risks={risks}
            loading={risksLoading}
            onSelect={(r) => handleEdit(r)}
          />
        )}
        {tab === 'risks' && (
          <RiskList
            risks={risks}
            members={members}
            loading={risksLoading}
            error={risksError}
            onAdd={() => { setEditingRisk(null); setShowForm(true); }}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onRetry={refetchRisks}
          />
        )}
        {tab === 'members' && (
          <MemberList
            members={members}
            loading={membersLoading}
            error={membersError}
            onAdd={handleMemberAdd}
            onDelete={(id: string) => setDeleteTarget({ type: 'member', id })}
            onRetry={refetchMembers}
          />
        )}
        {tab === 'agent' && (
          <AgentPanel
            summary={summary}
            risks={risks}
            loading={summaryLoading}
            error={summaryError}
            onRetry={refetchSummary}
          />
        )}
      </main>

      {showForm && (
        <div className="modal-overlay" onClick={() => { setShowForm(false); setEditingRisk(null); }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <RiskForm
              risk={editingRisk}
              members={members}
              onSave={handleSave}
              onCancel={() => { setShowForm(false); setEditingRisk(null); }}
            />
          </div>
        </div>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title="确认删除"
        message={deleteTarget?.type === 'risk' ? '确定要删除此风险吗？此操作不可撤销。' : '确定要删除此成员吗？此操作不可撤销。'}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </ErrorBoundary>
  );
}
