import type { ReactNode } from 'react';

interface Action {
  label: string;
  onClick: () => void;
}

interface Props {
  icon?: string;
  title: string;
  description?: string;
  action?: Action;
  children?: ReactNode;
}

export default function EmptyState({ icon = '📭', title, description, action, children }: Props) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <h3 className="empty-state-title">{title}</h3>
      {description && <p className="empty-state-desc">{description}</p>}
      {action && (
        <button className="btn btn-primary" onClick={action.onClick}>
          {action.label}
        </button>
      )}
      {children}
    </div>
  );
}
