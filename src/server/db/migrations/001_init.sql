-- ==========================================================
-- Migration 001: Initial Schema
-- ==========================================================

CREATE TABLE members (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL CHECK(length(name) > 0),
  role       TEXT NOT NULL,
  age        INTEGER NOT NULL CHECK(age >= 0 AND age <= 150),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE risks (
  id          TEXT PRIMARY KEY,
  category    TEXT NOT NULL CHECK(category IN ('financial','health','safety','legal','property')),
  title       TEXT NOT NULL CHECK(length(title) > 0),
  description TEXT NOT NULL DEFAULT '',
  probability INTEGER NOT NULL CHECK(probability >= 1 AND probability <= 5),
  impact      INTEGER NOT NULL CHECK(impact >= 1 AND impact <= 5),
  score       INTEGER NOT NULL CHECK(score >= 1 AND score <= 25),
  level       TEXT NOT NULL CHECK(level IN ('low','medium','high','critical')),
  status      TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','mitigated','closed')),
  mitigation  TEXT NOT NULL DEFAULT '',
  member_id   TEXT REFERENCES members(id) ON DELETE SET NULL,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_risks_category ON risks(category);
CREATE INDEX idx_risks_level   ON risks(level);
CREATE INDEX idx_risks_status  ON risks(status);
CREATE INDEX idx_risks_member  ON risks(member_id);

CREATE TABLE advice (
  id         TEXT PRIMARY KEY,
  risk_id    TEXT NOT NULL REFERENCES risks(id) ON DELETE CASCADE,
  content    TEXT NOT NULL,
  source     TEXT NOT NULL DEFAULT 'rule' CHECK(source IN ('rule','ai')),
  priority   INTEGER NOT NULL CHECK(priority >= 0 AND priority <= 10),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_advice_risk ON advice(risk_id);
