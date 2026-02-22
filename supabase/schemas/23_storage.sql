-- =============================================================================
-- 23_storage.sql — Storage RLS policies
-- Buckets are defined in config.toml and provisioned via: npx supabase seed buckets
-- =============================================================================

-- ── Avatars bucket policies ─────────────────────────────────────────

-- Anyone can read avatars (public bucket)
DROP POLICY IF EXISTS "avatars_public_read" ON storage.objects;
CREATE POLICY "avatars_public_read"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'avatars');

-- Authenticated users can upload their own avatar (path = <user_id>/*)
DROP POLICY IF EXISTS "avatars_auth_insert" ON storage.objects;
CREATE POLICY "avatars_auth_insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Authenticated users can update their own avatar
DROP POLICY IF EXISTS "avatars_auth_update" ON storage.objects;
CREATE POLICY "avatars_auth_update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Authenticated users can delete their own avatar
DROP POLICY IF EXISTS "avatars_auth_delete" ON storage.objects;
CREATE POLICY "avatars_auth_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ── Uploads bucket policies ─────────────────────────────────────────

-- Anyone can read uploads (public bucket)
DROP POLICY IF EXISTS "uploads_public_read" ON storage.objects;
CREATE POLICY "uploads_public_read"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'uploads');

-- Authenticated users can upload files
DROP POLICY IF EXISTS "uploads_auth_insert" ON storage.objects;
CREATE POLICY "uploads_auth_insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'uploads');

-- Authenticated users can update their own uploads
DROP POLICY IF EXISTS "uploads_auth_update" ON storage.objects;
CREATE POLICY "uploads_auth_update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'uploads');

-- Authenticated users can delete uploads
DROP POLICY IF EXISTS "uploads_auth_delete" ON storage.objects;
CREATE POLICY "uploads_auth_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'uploads');

-- service_role has full access (used by server-side operations)
DROP POLICY IF EXISTS "service_role_all_storage" ON storage.objects;
CREATE POLICY "service_role_all_storage"
  ON storage.objects FOR ALL
  TO service_role
  USING (true);
