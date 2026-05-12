import type { Risk, RiskLevel, RiskCategory } from '../../shared/types.js';

export function calcScore(probability: number, impact: number): number {
  return probability * impact;
}

export function calcLevel(score: number): RiskLevel {
  if (score >= 20) return 'critical';
  if (score >= 15) return 'high';
  if (score >= 8) return 'medium';
  return 'low';
}

export function enrichRisk(risk: Risk): Risk {
  const score = calcScore(risk.probability, risk.impact);
  return {
    ...risk,
    score,
    level: calcLevel(score),
  };
}

export interface CategoryStats {
  total: number;
  active: number;
  avgProb: number;
  avgImpact: number;
  avgScore: number;
  topRisk: Risk | null;
}

export function categoryAnalysis(risks: Risk[], category: string): CategoryStats {
  const filtered = risks.filter(r => r.category === category && r.status !== 'closed');
  if (filtered.length === 0) return { total: 0, active: 0, avgProb: 0, avgImpact: 0, avgScore: 0, topRisk: null };
  const total = filtered.length;
  const active = filtered.filter(r => r.status === 'active').length;
  const avgProb = filtered.reduce((s, r) => s + r.probability, 0) / total;
  const avgImpact = filtered.reduce((s, r) => s + r.impact, 0) / total;
  const avgScore = filtered.reduce((s, r) => s + r.score, 0) / total;
  const topRisk = filtered.reduce((a, b) => a.score > b.score ? a : b);
  return { total, active, avgProb, avgImpact, avgScore, topRisk };
}

// ── Validation Helpers ─────────────────────────────

/**
 * Checks if a probability value is a valid integer between 1 and 5.
 */
export function isProbabilityValid(val: unknown): val is number {
  return typeof val === 'number' && Number.isInteger(val) && val >= 1 && val <= 5;
}

/**
 * Checks if an impact value is a valid integer between 1 and 5.
 */
export function isImpactValid(val: unknown): val is number {
  return typeof val === 'number' && Number.isInteger(val) && val >= 1 && val <= 5;
}

/**
 * Checks if a risk score falls within the valid range (1-25).
 */
export function isScoreValid(score: number): boolean {
  return score >= 1 && score <= 25;
}

/**
 * Checks if a category string is a valid RiskCategory.
 */
export function isCategoryValid(cat: string): cat is RiskCategory {
  return ['financial', 'health', 'safety', 'legal', 'property'].includes(cat);
}
