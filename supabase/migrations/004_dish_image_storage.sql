INSERT INTO storage.buckets (id, name, public)
VALUES ('dish-images', 'dish-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Members can upload dish images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'dish-images'
    AND EXISTS (
      SELECT 1
      FROM merchant_memberships
      WHERE merchant_memberships.user_id = auth.uid()
        AND merchant_memberships.food_outlet_id::text = (storage.foldername(name))[1]
    )
  );

CREATE POLICY "Members can update dish images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'dish-images'
    AND owner_id = auth.uid()
  )
  WITH CHECK (
    bucket_id = 'dish-images'
    AND owner_id = auth.uid()
  );

CREATE POLICY "Anyone can view dish images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'dish-images');
