-- =============================================================================
-- Make group_type explicit and constrained
-- =============================================================================

ALTER TABLE public."group"
  ALTER COLUMN group_type DROP DEFAULT;

ALTER TABLE public."group"
  DROP CONSTRAINT IF EXISTS group_group_type_check;

ALTER TABLE public."group"
  ADD CONSTRAINT group_group_type_check
  CHECK (group_type IN ('base', 'hierarchical'));
