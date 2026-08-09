/*
# Quantum AI Dataset Lab — Schema

1. Tables
- `dataset_uploads`: stores metadata for each uploaded dataset per user
- `dataset_analyses`: stores cached analysis results (JSON) per dataset

2. Security
- RLS enabled on both tables
- Owner-scoped CRUD (authenticated only)

3. Notes
- Raw file data is NOT stored in DB (too large); only metadata + analysis JSON
- Files stored in Supabase Storage bucket "datasets"
*/

CREATE TABLE IF NOT EXISTS dataset_uploads (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name        text NOT NULL,
  format      text NOT NULL,
  rows        integer,
  columns     integer,
  size_bytes  bigint,
  headers     jsonb,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE dataset_uploads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_datasets"  ON dataset_uploads;
DROP POLICY IF EXISTS "insert_own_datasets"  ON dataset_uploads;
DROP POLICY IF EXISTS "delete_own_datasets"  ON dataset_uploads;

CREATE POLICY "select_own_datasets" ON dataset_uploads FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_datasets" ON dataset_uploads FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_datasets" ON dataset_uploads FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS dataset_analyses (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_id  uuid REFERENCES dataset_uploads(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  summary     jsonb,
  insights    jsonb,
  ml_recs     jsonb,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE dataset_analyses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_analyses"  ON dataset_analyses;
DROP POLICY IF EXISTS "insert_own_analyses"  ON dataset_analyses;

CREATE POLICY "select_own_analyses" ON dataset_analyses FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_analyses" ON dataset_analyses FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_dataset_uploads_user ON dataset_uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_dataset_analyses_dataset ON dataset_analyses(dataset_id);
