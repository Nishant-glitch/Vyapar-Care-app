-- =========================================================================
-- FSSAI FOOD LICENSE / REGISTRATION (FOSCOS) DATABASE SCHEMA & RLS
-- =========================================================================

-- 1. FSSAI Applications Master Table
CREATE TABLE IF NOT EXISTS public.fssai_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id VARCHAR(64) UNIQUE NOT NULL, -- e.g. FSSAI-2026-000001
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    kob VARCHAR(64) NOT NULL, -- restaurant, manufacturer, bakery, dairy, water, etc.
    constitution VARCHAR(64) NOT NULL, -- proprietorship, partnership, llp, pvt_ltd, etc.
    license_type VARCHAR(64) NOT NULL DEFAULT 'state', -- registration, state, central
    validity_years INTEGER NOT NULL DEFAULT 1,
    applicant_details JSONB NOT NULL DEFAULT '{}'::jsonb, -- name, pan, mobile, email, address, partners, cin
    business_details JSONB NOT NULL DEFAULT '{}'::jsonb, -- foodBusinessName, turnover, startDate
    premises_details JSONB NOT NULL DEFAULT '{}'::jsonb, -- premisesName, address, premisesType
    products JSONB NOT NULL DEFAULT '[]'::jsonb, -- food category, product name, capacity
    specific_details JSONB NOT NULL DEFAULT '{}'::jsonb, -- equipment, dairyLPD, waterSource, vehicles, iec
    documents JSONB NOT NULL DEFAULT '[]'::jsonb, -- uploaded document checklist with URLs
    calculated_fees JSONB NOT NULL DEFAULT '{}'::jsonb, -- serviceFee, annualGovtFee, totalPayable
    eligibility JSONB NOT NULL DEFAULT '{}'::jsonb, -- recommended tier & reason
    status VARCHAR(64) NOT NULL DEFAULT 'submitted', -- submitted, under_review, clarification_required, inspection_scheduled, approved, rejected, completed
    official_fssai_number VARCHAR(64), -- Official 14-digit FSSAI License Number
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. FSSAI Document Clarification Requests
CREATE TABLE IF NOT EXISTS public.fssai_document_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id VARCHAR(64) REFERENCES public.fssai_applications(application_id) ON DELETE CASCADE,
    document_name VARCHAR(255) NOT NULL,
    reason TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'pending', -- pending, resolved
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- Indices for rapid querying
CREATE INDEX IF NOT EXISTS idx_fssai_app_id ON public.fssai_applications(application_id);
CREATE INDEX IF NOT EXISTS idx_fssai_user_id ON public.fssai_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_fssai_status ON public.fssai_applications(status);
CREATE INDEX IF NOT EXISTS idx_fssai_kob ON public.fssai_applications(kob);

-- Enable RLS
ALTER TABLE public.fssai_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fssai_document_requests ENABLE ROW LEVEL SECURITY;

-- User Policies: Select & Insert own records
CREATE POLICY "Users can view own FSSAI applications"
    ON public.fssai_applications FOR SELECT
    USING (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "Users can insert own FSSAI applications"
    ON public.fssai_applications FOR INSERT
    WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "Admin / Staff can update FSSAI applications"
    ON public.fssai_applications FOR ALL
    USING (auth.role() = 'service_role' OR auth.jwt() ->> 'email' LIKE '%@vyaparcare.com');
