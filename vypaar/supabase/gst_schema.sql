-- GST REGISTRATION SUPABASE SCHEMA
-- Form GST REG-01 Application Tables & Indexes

CREATE TABLE IF NOT EXISTS public.gst_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id TEXT UNIQUE NOT NULL,
    user_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'submitted', -- submitted, under_scrutiny, clarification_needed, gstin_issued, rejected
    constitution TEXT NOT NULL,
    registration_reason TEXT NOT NULL,
    is_composition BOOLEAN DEFAULT false,
    business_details JSONB NOT NULL DEFAULT '{}'::jsonb,
    promoters JSONB NOT NULL DEFAULT '[]'::jsonb,
    premises_details JSONB NOT NULL DEFAULT '{}'::jsonb,
    goods_services JSONB NOT NULL DEFAULT '[]'::jsonb,
    bank_details JSONB NOT NULL DEFAULT '{}'::jsonb,
    documents JSONB NOT NULL DEFAULT '{}'::jsonb,
    custom_documents JSONB NOT NULL DEFAULT '[]'::jsonb,
    calculated_fees JSONB NOT NULL DEFAULT '{}'::jsonb,
    amount_paid NUMERIC NOT NULL DEFAULT 0,
    payment_plan TEXT NOT NULL DEFAULT 'advance',
    official_gstin TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_gst_app_id ON public.gst_applications(application_id);
CREATE INDEX IF NOT EXISTS idx_gst_user_id ON public.gst_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_gst_status ON public.gst_applications(status);
