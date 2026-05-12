import { v4 as uuid } from 'uuid';
import type { Risk, DashboardData, RiskCategory, RiskLevel } from '../../../shared/types.js';
import { getDb } from '../connection.js';
import { enrichRisk } from '../../services/risk-engine.js';

// ── Internal row shape ─────────────────────────────
interface RiskRow {
  id: string;
  category: string;
  title: string;
  description: string;
  probability: number;
  impact: number;
  score: number;
  level: string;
  status: string;
  mitigation: string;
  member_id: string | null;
  created_at: string;
  updated_at: string;
}

// ── Mappers ────────────────────────────────────────
function rowToRisk(row: RiskRow): Risk {
  return {
    id: row.id,
    category: row.category as RiskCategory,
    title: row.title,
    description: row.description,
    probability: row.probability,
    impact: row.impact,
    score: row.score,
    level: row.level as RiskLevel,
    status: row.status as Risk['status'],
    mitigation: row.mitigation,
    memberId: row.member_id ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ── Queries ────────────────────────────────────────

export function findAll(options?: {
  category?: string;
  level?: string;
  status?: string;
  sort?: string;
}): Risk[] {
  const db = getDb();
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (options?.category && options.category !== 'all') {
    conditions.push('category = ?');
    params.push(options.category);
  }
  if (options?.level && options.level !== 'all') {
    conditions.push('level = ?');
    params.push(options.level);
  }
  if (options?.status && options.status !== 'all') {
    conditions.push('status = ?');
    params.push(options.status);
  }

  let sql = 'SELECT * FROM risks';
  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }

  if (options?.sort === 'score') {
    sql += ' ORDER BY score DESC';
  } else {
    sql += ' ORDER BY created_at DESC';
  }

  const rows = db.prepare(sql).all(...params) as RiskRow[];
  return rows.map(rowToRisk);
}

export function findById(id: string): Risk | undefined {
  const db = getDb();
  const row = db.prepare('SELECT * FROM risks WHERE id = ?').get(id) as
    | RiskRow
    | undefined;
  return row ? rowToRisk(row) : undefined;
}

export function create(data: {
  title: string;
  category: RiskCategory;
  description?: string;
  probability: number;
  impact: number;
  status?: Risk['status'];
  mitigation?: string;
  memberId?: string;
}): Risk {
  const db = getDb();
  const now = new Date().toISOString();

  const risk = enrichRisk({
    id: uuid(),
    category: data.category,
    title: data.title,
    description: data.description ?? '',
    probability: data.probability,
    impact: data.impact,
    score: 0,
    level: 'low',
    status: data.status ?? 'active',
    mitigation: data.mitigation ?? '',
    memberId: data.memberId,
    createdAt: now,
    updatedAt: now,
  });

  const stmt = db.prepare(`
    INSERT INTO risks (id, category, title, description, probability, impact, score, level, status, mitigation, member_id, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    risk.id,
    risk.category,
    risk.title,
    risk.description,
    risk.probability,
    risk.impact,
    risk.score,
    risk.level,
    risk.status,
    risk.mitigation,
    risk.memberId ?? null,
    risk.createdAt,
    risk.updatedAt,
  );

  return risk;
}

export function update(
  id: string,
  data: Partial<{
    category: RiskCategory;
    title: string;
    description: string;
    probability: number;
    impact: number;
    status: Risk['status'];
    mitigation: string;
    memberId: string | null | undefined;
  }>,
): Risk | undefined {
  const db = getDb();
  const existing = findById(id);
  if (!existing) return undefined;

  const updated = enrichRisk({
    ...existing,
    category: data.category ?? existing.category,
    title: data.title ?? existing.title,
    description: data.description ?? existing.description,
    probability: data.probability ?? existing.probability,
    impact: data.impact ?? existing.impact,
    status: data.status ?? existing.status,
    mitigation: data.mitigation ?? existing.mitigation,
    memberId:
      data.memberId !== undefined
        ? (data.memberId ?? undefined)
        : existing.memberId,
    updatedAt: new Date().toISOString(),
  });

  const stmt = db.prepare(`
    UPDATE risks
    SET category = ?, title = ?, description = ?, probability = ?, impact = ?,
        score = ?, level = ?, status = ?, mitigation = ?, member_id = ?, updated_at = ?
    WHERE id = ?
  `);

  stmt.run(
    updated.category,
    updated.title,
    updated.description,
    updated.probability,
    updated.impact,
    updated.score,
    updated.level,
    updated.status,
    updated.mitigation,
    updated.memberId ?? null,
    updated.updatedAt,
    id,
  );

  return updated;
}

export function remove(id: string): boolean {
  const db = getDb();
  const result = db.prepare('DELETE FROM risks WHERE id = ?').run(id);
  return result.changes > 0;
}

export function getDashboard(): DashboardData {
  const risks = findAll();

  const active = risks.filter((r) => r.status !== 'closed');

  const byLevel: Record<RiskLevel, number> = {
    low: 0,
    medium: 0,
    high: 0,
    critical: 0,
  };
  const byCategory: Record<RiskCategory, number> = {
    financial: 0,
    health: 0,
    safety: 0,
    legal: 0,
    property: 0,
  };

  for (const r of risks) {
    byLevel[r.level]++;
    byCategory[r.category]++;
  }

  const sorted = [...risks].sort((a, b) => b.score - a.score);
  const totalScore = active.reduce((s, r) => s + r.score, 0);

  return {
    totalRisks: risks.length,
    activeRisks: risks.filter((r) => r.status === 'active').length,
    mitigatedRisks: risks.filter((r) => r.status === 'mitigated').length,
    byLevel,
    byCategory,
    topRisks: sorted.slice(0, 5),
    avgScore:
      active.length > 0
        ? Math.round((totalScore / active.length) * 10) / 10
        : 0,
  };
}
