-- =============================================================================
-- MSME / UDYAM REGISTRATION ASSISTED APPLICATIONS SCHEMA
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.udyam_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id TEXT UNIQUE NOT NULL,
    user_id TEXT NOT NULL DEFAULT 'guest_user',
    status TEXT NOT NULL DEFAULT 'submitted', -- 'submitted', 'under_review', 'clarification_required', 'certificate_generated', 'completed'
    
    -- Section 1: Applicant & Aadhaar
    aadhaar_details JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Section 2: PAN & GST
    pan_details JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Section 3: Business & Enterprise
    business_details JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Section 4: Organisation Details
    organisation_details JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Section 5: Official Address
    official_address JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Section 6: Plants & Units
    plant_units JSONB NOT NULL DEFAULT '[]'::jsonb,
    
    -- Section 7: Bank Details
    bank_details JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Section 8: NIC 2008 Codes
    selected_nic_codes JSONB NOT NULL DEFAULT '[]'::jsonb,
    
    -- Section 9: Financials & MSME Classification
    financial_details JSONB NOT NULL DEFAULT '{}'::jsonb,
    msme_classification JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Section 10: Optional Documents & Self-Declaration
    optional_documents JSONB NOT NULL DEFAULT '{}'::jsonb,
    declaration_accepted BOOLEAN NOT NULL DEFAULT true,
    
    -- Section 11: Fee & Payment Details
    calculated_fees JSONB NOT NULL DEFAULT '{}'::jsonb,
    amount_paid NUMERIC(10, 2) NOT NULL DEFAULT 2000.00,
    payment_status TEXT NOT NULL DEFAULT 'successful',
    
    -- Administration & Certificate
    udyam_registration_number TEXT, -- e.g. UDYAM-DL-01-0012345
    certificate_url TEXT,
    admin_remarks TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for lightning fast searches
CREATE INDEX IF NOT EXISTS idx_udyam_app_id ON public.udyam_applications(application_id);
CREATE INDEX IF NOT EXISTS idx_udyam_user_id ON public.udyam_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_udyam_status ON public.udyam_applications(status);
