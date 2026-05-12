export type RiskCategory = 'financial' | 'health' | 'safety' | 'legal' | 'property';

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export type RiskStatus = 'active' | 'mitigated' | 'closed';

export interface Member {
  id: string;
  name: string;
  role: string;
  age: number;
  createdAt: string;
  updatedAt: string;
}

export interface Risk {
  id: string;
  category: RiskCategory;
  title: string;
  description: string;
  probability: number;
  impact: number;
  score: number;
  level: RiskLevel;
  status: RiskStatus;
  mitigation: string;
  memberId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AgentAdvice {
  id: string;
  riskId: string;
  content: string;
  source?: 'rule' | 'ai';
  priority: number;
  createdAt: string;
}

export interface DashboardData {
  totalRisks: number;
  activeRisks: number;
  mitigatedRisks: number;
  byLevel: Record<RiskLevel, number>;
  byCategory: Record<RiskCategory, number>;
  topRisks: Risk[];
  avgScore: number;
}

export const CATEGORY_LABELS: Record<RiskCategory, string> = {
  financial: '财务风险',
  health: '健康风险',
  safety: '安全风险',
  legal: '法律风险',
  property: '财产风险',
};

export const LEVEL_LABELS: Record<RiskLevel, string> = {
  low: '低风险',
  medium: '中风险',
  high: '高风险',
  critical: '严重风险',
};

export interface AgentSummary {
  overallAssessment: string;
  topConcerns: string[];
  recommendations: string[];
  categoryInsights: { category: RiskCategory; label: string; insight: string }[];
}

export const STATUS_LABELS: Record<RiskStatus, string> = {
  active: '活跃',
  mitigated: '已缓解',
  closed: '已关闭',
};
