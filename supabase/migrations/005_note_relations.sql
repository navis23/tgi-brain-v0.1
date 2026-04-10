-- Note-to-note relations (audit Gap 7)
-- Three relation types only. Resist adding more until a genuine gap emerges.

CREATE TABLE tgibrain_note_relations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_note_id UUID NOT NULL REFERENCES tgibrain_notes(id) ON DELETE CASCADE,
  to_note_id UUID NOT NULL REFERENCES tgibrain_notes(id) ON DELETE CASCADE,
  relation_type TEXT NOT NULL CHECK (relation_type IN ('supersedes', 'followup_of', 'child_of')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES auth.users(id) DEFAULT auth.uid()
);

-- Prevent duplicate relations
CREATE UNIQUE INDEX tgibrain_note_relations_unique
  ON tgibrain_note_relations (from_note_id, to_note_id, relation_type);

-- Performance
CREATE INDEX idx_tgibrain_note_relations_from ON tgibrain_note_relations(from_note_id);
CREATE INDEX idx_tgibrain_note_relations_to ON tgibrain_note_relations(to_note_id);

-- RLS
ALTER TABLE tgibrain_note_relations ENABLE ROW LEVEL SECURITY;

-- Users can read relations involving their own notes
CREATE POLICY "tgibrain_users_read_own_relations"
  ON tgibrain_note_relations FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tgibrain_notes
      WHERE id = from_note_id AND user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM tgibrain_notes
      WHERE id = to_note_id AND user_id = auth.uid()
    )
  );

-- Users can create/update/delete their own relations
CREATE POLICY "tgibrain_users_manage_own_relations"
  ON tgibrain_note_relations FOR ALL TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());
