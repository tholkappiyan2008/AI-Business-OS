CREATE TABLE IF NOT EXISTS public.reports (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id uuid NOT NULL,
    report_name text NOT NULL,
    report_type text NOT NULL,
    agent_name text NOT NULL,
    file_type text NOT NULL,
    file_size text NOT NULL,
    generated_at timestamp with time zone,
    status text NOT NULL,
    download_url text,
    created_at timestamp with time zone DEFAULT now()
);

-- Turn on Row Level Security
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see reports for their business
CREATE POLICY "Users can view reports for their business" ON public.reports
    FOR SELECT
    USING (business_id IN (
        SELECT id FROM public.businesses WHERE user_id = auth.uid()
    ));

-- Policy: Users can insert reports for their business
CREATE POLICY "Users can insert reports for their business" ON public.reports
    FOR INSERT
    WITH CHECK (business_id IN (
        SELECT id FROM public.businesses WHERE user_id = auth.uid()
    ));

-- Policy: Users can delete reports for their business
CREATE POLICY "Users can delete reports for their business" ON public.reports
    FOR DELETE
    USING (business_id IN (
        SELECT id FROM public.businesses WHERE user_id = auth.uid()
    ));


-- Executive Brief Schedules Table
CREATE TABLE IF NOT EXISTS public.report_schedules (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id uuid NOT NULL,
    name text NOT NULL,
    frequency text NOT NULL,
    description text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

-- Turn on Row Level Security
ALTER TABLE public.report_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view report schedules for their business" ON public.report_schedules
    FOR SELECT
    USING (business_id IN (
        SELECT id FROM public.businesses WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can insert report schedules for their business" ON public.report_schedules
    FOR INSERT
    WITH CHECK (business_id IN (
        SELECT id FROM public.businesses WHERE user_id = auth.uid()
    ));
