-- =========================================================================
-- TRADEMARK REGISTRATION (FORM TM-A) DATABASE SCHEMA & RLS POLICIES
-- =========================================================================

-- 1. Trademark Applications Master Table
CREATE TABLE IF NOT EXISTS public.tm_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id VARCHAR(64) UNIQUE NOT NULL, -- e.g. TM-2026-000001
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    applicant_type VARCHAR(64) NOT NULL, -- individual, startup, small_enterprise, company_pvt, etc.
    is_startup_claimed BOOLEAN DEFAULT FALSE,
    is_msme_claimed BOOLEAN DEFAULT FALSE,
    applicant_details JSONB NOT NULL DEFAULT '{}'::jsonb, -- legal name, pan, address, partners etc.
    mark_details JSONB NOT NULL DEFAULT '{}'::jsonb, -- markType, trademarkName, logoFile, colour claim, language
    selected_classes INTEGER[] NOT NULL DEFAULT '{}', -- e.g. [9, 35, 42]
    class_descriptions JSONB NOT NULL DEFAULT '{}'::jsonb, -- descriptions for each class
    usage_details JSONB NOT NULL DEFAULT '{}'::jsonb, -- proposed or used, first use date, territory
    agent_details JSONB NOT NULL DEFAULT '{}'::jsonb, -- TM-48 agent authorization details
    documents JSONB NOT NULL DEFAULT '[]'::jsonb, -- uploaded document checklist with URLs
    calculated_fees JSONB NOT NULL DEFAULT '{}'::jsonb, -- serviceFee, govtFee, totalPayable
    status VARCHAR(64) NOT NULL DEFAULT 'submitted', -- submitted, under_review, clarification_required, filed, examination, objection, published, registered, completed
    official_tm_number VARCHAR(64), -- Official IP India TM Application Number
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Trademark Document Clarification Requests
CREATE TABLE IF NOT EXISTS public.tm_document_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id VARCHAR(64) REFERENCES public.tm_applications(application_id) ON DELETE CASCADE,
    document_name VARCHAR(255) NOT NULL,
    reason TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'pending', -- pending, resolved
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for lightning fast queries
CREATE INDEX IF NOT EXISTS idx_tm_applications_user_id ON public.tm_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_tm_applications_app_id ON public.tm_applications(application_id);
CREATE INDEX IF NOT EXISTS idx_tm_applications_status ON public.tm_applications(status);
CREATE INDEX IF NOT EXISTS idx_tm_doc_requests_app_id ON public.tm_document_requests(application_id);

-- Enable RLS
ALTER TABLE public.tm_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tm_document_requests ENABLE ROW LEVEL SECURITY;

-- User Policies
CREATE POLICY "Users can view own TM applications"
    ON public.tm_applications FOR SELECT
    USING (auth.uid() = user_id OR auth.uid() IS NULL);

CREATE POLICY "Users can insert own TM applications"
    ON public.tm_applications FOR INSERT
    WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

CREATE POLICY "Users can update own TM applications"
    ON public.tm_applications FOR UPDATE
    USING (auth.uid() = user_id OR auth.uid() IS NULL);
