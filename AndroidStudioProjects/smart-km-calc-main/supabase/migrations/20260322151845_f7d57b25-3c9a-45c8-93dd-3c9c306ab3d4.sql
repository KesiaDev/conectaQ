
CREATE TABLE public.tolls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  fuel_entry_id uuid NOT NULL REFERENCES public.fuel_entries(id) ON DELETE CASCADE,
  description text NOT NULL DEFAULT '',
  amount numeric NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.tolls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tolls"
  ON public.tolls FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tolls"
  ON public.tolls FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tolls"
  ON public.tolls FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tolls"
  ON public.tolls FOR DELETE TO authenticated
  USING (auth.uid() = user_id);
