-- Add source field for provenance tracking (audit Gap 4)
-- Nullable, no validation. RLS policies reference user_id only — unaffected.

ALTER TABLE tgibrain_notes ADD COLUMN source TEXT NULL;

COMMENT ON COLUMN tgibrain_notes.source IS
  'Free-text provenance: Claude.ai share URL, Claude Code session path, meeting note, voice memo, etc.';
