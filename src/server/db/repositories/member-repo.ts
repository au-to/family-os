import { v4 as uuid } from 'uuid';
import type { Member } from '../../../shared/types.js';
import { getDb } from '../connection.js';

// ── Internal row shape ─────────────────────────────
interface MemberRow {
  id: string;
  name: string;
  role: string;
  age: number;
  created_at: string;
  updated_at: string;
}

// ── Mappers ────────────────────────────────────────
function rowToMember(row: MemberRow): Member {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    age: row.age,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ── Queries ────────────────────────────────────────

export function findAll(): Member[] {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM members ORDER BY created_at ASC').all() as MemberRow[];
  return rows.map(rowToMember);
}

export function findById(id: string): Member | undefined {
  const db = getDb();
  const row = db.prepare('SELECT * FROM members WHERE id = ?').get(id) as
    | MemberRow
    | undefined;
  return row ? rowToMember(row) : undefined;
}

export function create(data: { name: string; role: string; age: number }): Member {
  const db = getDb();
  const now = new Date().toISOString();
  const member: Member = {
    id: uuid(),
    name: data.name,
    role: data.role,
    age: data.age,
    createdAt: now,
    updatedAt: now,
  };

  db.prepare(
    'INSERT INTO members (id, name, role, age, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
  ).run(member.id, member.name, member.role, member.age, member.createdAt, member.updatedAt);

  return member;
}

export function remove(id: string): boolean {
  const db = getDb();
  const result = db.prepare('DELETE FROM members WHERE id = ?').run(id);
  return result.changes > 0;
}
