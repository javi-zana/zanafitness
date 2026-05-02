-- Progress photos: before + weekly tracking

CREATE TABLE IF NOT EXISTS public.progress_photos (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id   uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  photo_url   text        NOT NULL,
  storage_path text       NOT NULL,
  photo_type  text        NOT NULL DEFAULT 'weekly'
                          CONSTRAINT progress_photos_type_check CHECK (photo_type IN ('before', 'weekly')),
  taken_at    date        NOT NULL DEFAULT CURRENT_DATE,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.progress_photos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "members manage own progress photos" ON public.progress_photos;
CREATE POLICY "members manage own progress photos" ON public.progress_photos
  FOR ALL
  USING  (member_id = auth.uid())
  WITH CHECK (member_id = auth.uid());

-- Storage bucket (public reads, service role writes via API)
INSERT INTO storage.buckets (id, name, public)
VALUES ('progress-photos', 'progress-photos', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "progress photos are publicly readable" ON storage.objects;
CREATE POLICY "progress photos are publicly readable" ON storage.objects
  FOR SELECT USING (bucket_id = 'progress-photos');
