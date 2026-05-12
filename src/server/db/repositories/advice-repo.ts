import { v4 as uuid } from 'uuid';
import type { AgentAdvice } from '../../../shared/types.js';
import { getDb } from '../connection.js';

// ── Internal row shape ─────────────────────────────
interface AdviceRow {
  id: string;
  risk_id: string;
  content: string;
  source: string;
  priority: number;
  created_at: string;
}

// ── Mappers ────────────────────────────────────────
function rowToAdvice(row: AdviceRow): AgentAdvice {
  return {
    id: row.id,
    riskId: row.risk_id,
    content: row.content,
    source: row.source as 'rule' | 'ai',
    priority: row.priority,
    createdAt: row.created_at,
  };
}

// ── Queries ────────────────────────────────────────

export function findByRiskId(riskId: string): AgentAdvice[] {
  const db = getDb();
  const rows = db
    .prepare('SELECT * FROM advice WHERE risk_id = ? ORDER BY priority DESC')
    .all(riskId) as AdviceRow[];
  return rows.map(rowToAdvice);
}

export function create(data: {
  riskId: string;
  content: string;
  source?: 'rule' | 'ai';
  priority: number;
}): AgentAdvice {
  const db = getDb();
  const advice: AgentAdvice = {
    id: uuid(),
    riskId: data.riskId,
    content: data.content,
    source: data.source ?? 'rule',
    priority: data.priority,
    createdAt: new Date().toISOString(),
  };

  db.prepare(
    'INSERT INTO advice (id, risk_id, content, source, priority, created_at) VALUES (?, ?, ?, ?, ?, ?)',
  ).run(advice.id, advice.riskId, advice.content, advice.source, advice.priority, advice.createdAt);

  return advice;
}

/**
 * Inserts multiple advice records in a single transaction.
 * All records default to `source = 'rule'`.
 */
export function createBatch(advices: Omit<AgentAdvice, 'source'>[]): void {
  const db = getDb();
  const insert = db.prepare(
    'INSERT INTO advice (id, risk_id, content, source, priority, created_at) VALUES (?, ?, ?, ?, ?, ?)',
  );

  const trx = db.transaction((items: Omit<AgentAdvice, 'source'>[]) => {
    for (const item of items) {
      insert.run(item.id, item.riskId, item.content, 'rule', item.priority, item.createdAt);
    }
  });

  trx(advices);
}

export function deleteByRiskId(riskId: string): void {
  const db = getDb();
  db.prepare('DELETE FROM advice WHERE risk_id = ?').run(riskId);
}
