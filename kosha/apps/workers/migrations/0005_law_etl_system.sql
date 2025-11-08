-- Law ETL System Migration
-- Created: 2025-01-15
-- Purpose: Create tables for automated law ETL and checklist curation

-- Full law articles (complete text from Open API)
CREATE TABLE IF NOT EXISTS laws_full (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  law_id TEXT NOT NULL,              -- MOLEG law ID
  law_name TEXT NOT NULL,            -- Law name
  article_no TEXT,                   -- Article number (조)
  clause_no TEXT,                    -- Clause number (항)
  item_no TEXT,                      -- Item/sub-item number (호/목)
  path TEXT NOT NULL,                -- Path: 제34조-제2항-제1호
  title TEXT,                        -- Article title (if exists)
  text TEXT NOT NULL,                -- Full article text
  effective_date TEXT,               -- Effective date
  last_amended_date TEXT,            -- Last amendment date
  source_url TEXT,                   -- Source URL
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(law_id, path, effective_date)
);

CREATE INDEX IF NOT EXISTS idx_laws_full_law_id ON laws_full(law_id);
CREATE INDEX IF NOT EXISTS idx_laws_full_law_name ON laws_full(law_name);
CREATE INDEX IF NOT EXISTS idx_laws_full_path ON laws_full(path);
CREATE INDEX IF NOT EXISTS idx_laws_full_effective_date ON laws_full(effective_date);

-- Curated actionable checklist rules (200-300 rules)
CREATE TABLE IF NOT EXISTS laws_ruleset (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  law_id TEXT NOT NULL,
  law_name TEXT NOT NULL,
  path TEXT NOT NULL,                -- Article path
  title TEXT,                        -- Summary/title
  requirement TEXT NOT NULL,         -- Core requirement (imperative, 1 sentence)
  checklist TEXT NOT NULL,           -- JSON array: ["Check item 1", ...] (3-7 items)
  category TEXT NOT NULL,            -- 추락|끼임|화학물질|기계|감전|화재·폭발
  synonyms TEXT,                     -- CSV keywords
  penalty_ref TEXT,                  -- Penalty/administrative reference
  source_url TEXT,
  ruleset_version TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_laws_ruleset_category ON laws_ruleset(category);
CREATE INDEX IF NOT EXISTS idx_laws_ruleset_version ON laws_ruleset(ruleset_version);
CREATE INDEX IF NOT EXISTS idx_laws_ruleset_law_name ON laws_ruleset(law_name);

-- Ruleset version metadata
CREATE TABLE IF NOT EXISTS ruleset_meta (
  version TEXT PRIMARY KEY,
  note TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Synonyms/labels table (optional)
CREATE TABLE IF NOT EXISTS synonyms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  label TEXT NOT NULL,
  synonyms TEXT NOT NULL             -- CSV
);

-- Indexes for synonyms
CREATE INDEX IF NOT EXISTS idx_synonyms_label ON synonyms(label);
