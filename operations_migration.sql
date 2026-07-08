CREATE TABLE IF NOT EXISTS public.operations (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id uuid NOT NULL,
    title text NOT NULL,
    department text NOT NULL,
    assigned_to text NOT NULL,
    priority text NOT NULL,
    status text NOT NULL,
    due_date timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Turn on Row Level Security
ALTER TABLE public.operations ENABLE ROW LEVEL SECURITY;

-- Policies for operations
CREATE POLICY "Users can view operations for their business" ON public.operations
    FOR SELECT USING (business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert operations for their business" ON public.operations
    FOR INSERT WITH CHECK (business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid()));

CREATE POLICY "Users can update operations for their business" ON public.operations
    FOR UPDATE USING (business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete operations for their business" ON public.operations
    FOR DELETE USING (business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid()));


-- Operation Logs Table
CREATE TABLE IF NOT EXISTS public.operation_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id uuid NOT NULL,
    operation_id uuid NOT NULL REFERENCES public.operations(id) ON DELETE CASCADE,
    action text NOT NULL, -- e.g., 'Operation Created', 'Operation Updated', 'Operation Completed'
    details text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.operation_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view operation logs for their business" ON public.operation_logs
    FOR SELECT USING (business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert operation logs for their business" ON public.operation_logs
    FOR INSERT WITH CHECK (business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid()));
