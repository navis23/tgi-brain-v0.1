-- TGI BRAIN Phase 1 Schema
-- All tables prefixed with tgibrain_ to prevent duplication

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Entities lookup table
CREATE TABLE tgibrain_entities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Seed the 6 entities
INSERT INTO tgibrain_entities (name, slug, color) VALUES
  ('TGI', 'tgi', '#6366f1'),
  ('Enterbiner', 'enterbiner', '#f43f5e'),
  ('SBS', 'sbs', '#0ea5e9'),
  ('Mbink Farm', 'mbink-farm', '#22c55e'),
  ('TOS', 'tos', '#f59e0b'),
  ('DRC Trans', 'drc-trans', '#a855f7');

-- Categories enum
DO $$ BEGIN
  CREATE TYPE tgibrain_note_category AS ENUM (
    'strategic', 'technical', 'marketing', 'financial', 'operations'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Status enum
DO $$ BEGIN
  CREATE TYPE tgibrain_note_status AS ENUM (
    'raw_idea', 'active_pipeline', 'shelved'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Notes table
CREATE TABLE tgibrain_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  category tgibrain_note_category NOT NULL DEFAULT 'strategic',
  status tgibrain_note_status NOT NULL DEFAULT 'raw_idea',
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Many-to-many: notes <-> entities
CREATE TABLE tgibrain_note_entities (
  note_id UUID NOT NULL REFERENCES tgibrain_notes(id) ON DELETE CASCADE,
  entity_id UUID NOT NULL REFERENCES tgibrain_entities(id) ON DELETE CASCADE,
  PRIMARY KEY (note_id, entity_id)
);

-- Indexes for performance
CREATE INDEX idx_tgibrain_notes_user ON tgibrain_notes(user_id);
CREATE INDEX idx_tgibrain_notes_category ON tgibrain_notes(category);
CREATE INDEX idx_tgibrain_notes_status ON tgibrain_notes(status);
CREATE INDEX idx_tgibrain_notes_created ON tgibrain_notes(created_at DESC);
CREATE INDEX idx_tgibrain_note_entities_entity ON tgibrain_note_entities(entity_id);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION tgibrain_update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tgibrain_notes_updated_at
  BEFORE UPDATE ON tgibrain_notes
  FOR EACH ROW
  EXECUTE FUNCTION tgibrain_update_updated_at();

-- Row Level Security
ALTER TABLE tgibrain_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tgibrain_note_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE tgibrain_entities ENABLE ROW LEVEL SECURITY;

-- Notes: users can only CRUD their own notes
CREATE POLICY "tgibrain_users_crud_own_notes" ON tgibrain_notes
  FOR ALL TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- Note entities: users can manage entity links for own notes
CREATE POLICY "tgibrain_users_manage_own_note_entities" ON tgibrain_note_entities
  FOR ALL TO authenticated
  USING (note_id IN (SELECT id FROM tgibrain_notes WHERE user_id = (SELECT auth.uid())))
  WITH CHECK (note_id IN (SELECT id FROM tgibrain_notes WHERE user_id = (SELECT auth.uid())));

-- Entities: readable by all authenticated users
CREATE POLICY "tgibrain_entities_readable_by_authenticated" ON tgibrain_entities
  FOR SELECT TO authenticated USING (true);
