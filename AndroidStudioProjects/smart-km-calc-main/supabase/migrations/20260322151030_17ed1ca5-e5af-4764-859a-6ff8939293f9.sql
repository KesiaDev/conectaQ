
ALTER TABLE public.fuel_entries
  ADD COLUMN IF NOT EXISTS estimated_consumption numeric,
  ADD COLUMN IF NOT EXISTS estimated_range numeric,
  ADD COLUMN IF NOT EXISTS actual_km numeric,
  ADD COLUMN IF NOT EXISTS actual_consumption numeric,
  ADD COLUMN IF NOT EXISTS cost_per_km numeric,
  ADD COLUMN IF NOT EXISTS total_cost numeric,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'open';

UPDATE public.fuel_entries SET status = 'closed', actual_km = km, actual_consumption = km / liters, cost_per_km = (liters * fuel_price) / km, total_cost = liters * fuel_price WHERE status = 'open';

CREATE POLICY "Users can update their own entries"
  ON public.fuel_entries
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
