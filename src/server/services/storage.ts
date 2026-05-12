import type { Risk, Member } from '../../shared/types.js';
import { getDb } from '../db/connection.js';
import * as riskRepo from '../db/repositories/risk-repo.js';
import * as memberRepo from '../db/repositories/member-repo.js';

/**
 * Legacy compatibility wrapper.
 *
 * Prefer importing repositories directly (`risk-repo`, `member-repo`)
 * for new code. These functions delegate to repos internally.
 */

// ── Risks ──────────────────────────────────────────

export function loadRisks(): Risk[] {
  return riskRepo.findAll();
}

/**
 * Replaces ALL risks in a single transaction.
 * Only use for bulk-import scenarios; prefer `riskRepo.create()` / `.update()` / `.remove()`.
 */
export function saveRisks(risks: Risk[]): void {
  const db = getDb();
  const insert = db.prepare(`
    INSERT INTO risks (id, category, title, description, probability, impact, score, level, status, mitigation, member_id, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const trx = db.transaction(() => {
    db.prepare('DELETE FROM risks').run();
    for (const risk of risks) {
      insert.run(
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
    }
  });

  trx();
}

// ── Members ────────────────────────────────────────

export function loadMembers(): Member[] {
  return memberRepo.findAll();
}

/**
 * Replaces ALL members in a single transaction.
 * Only use for bulk-import scenarios; prefer `memberRepo.create()` / `.remove()`.
 */
export function saveMembers(members: Member[]): void {
  const db = getDb();
  const insert = db.prepare(
    'INSERT INTO members (id, name, role, age, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
  );

  const trx = db.transaction(() => {
    db.prepare('DELETE FROM members').run();
    for (const m of members) {
      insert.run(m.id, m.name, m.role, m.age, m.createdAt, m.updatedAt);
    }
  });

  trx();
}
