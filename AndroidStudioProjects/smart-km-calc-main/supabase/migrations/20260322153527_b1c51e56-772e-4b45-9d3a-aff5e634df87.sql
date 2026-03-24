
CREATE TABLE public.vehicle_costs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  category TEXT NOT NULL DEFAULT 'outro',
  description TEXT NOT NULL DEFAULT '',
  amount NUMERIC NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.vehicle_costs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own vehicle costs"
  ON public.vehicle_costs FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own vehicle costs"
  ON public.vehicle_costs FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vehicle costs"
  ON public.vehicle_costs FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vehicle costs"
  ON public.vehicle_costs FOR DELETE TO authenticated
  USING (auth.uid() = user_id);
