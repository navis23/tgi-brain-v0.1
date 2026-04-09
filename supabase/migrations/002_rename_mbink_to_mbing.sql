-- Rename Mbink Farm → Mbing Farm (data hygiene fix from audit)
-- Entity UUID remains unchanged — all existing note tags resolve automatically.

UPDATE tgibrain_entities
SET name = 'Mbing Farm', slug = 'mbing-farm'
WHERE slug = 'mbink-farm';
