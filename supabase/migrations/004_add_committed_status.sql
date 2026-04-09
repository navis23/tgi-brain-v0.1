-- Add 'committed' value to status enum (audit Gap 3)
-- Postgres 15+ supports ALTER TYPE ADD VALUE outside transactions.

ALTER TYPE tgibrain_note_status ADD VALUE 'committed';
