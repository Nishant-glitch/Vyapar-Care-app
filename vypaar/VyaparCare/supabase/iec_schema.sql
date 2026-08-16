-- =============================================================================
-- IMPORT EXPORT CODE (IEC) REGISTRATION APPLICATIONS SCHEMA (DGFT)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.iec_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id TEXT UNIQUE NOT NULL,
    user_id TEXT NOT NULL DEFAULT 'guest_user',
    status TEXT NOT NULL DEFAULT 'submitted', -- 'submitted', 'under_review', 'pfms_verified', 'dgft_submitted', 'clarification_required', 'approved', 'completed'
    
    entity_type TEXT NOT NULL DEFAULT 'proprietorship',
    
    -- Entity & PAN Information
    pan_details JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Business Profile & Trade Intent
    business_details JSONB NOT NULL DEFAULT '{}'::jsonb,
    trade_details JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Registered Place of Business Address
    address_details JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Bank Account Details & Pre-validation Status
    bank_details JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Authorized Signatory Details
    signatory_details JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Products & Destination Countries
    products JSONB NOT NULL DEFAULT '[]'::jsonb,
    countries JSONB NOT NULL DEFAULT '[]'::jsonb,
    
    -- Uploaded Supporting Documents
    documents JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Declarations
    declarations JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Fee & Payment Details
    calculated_fees JSONB NOT NULL DEFAULT '{}'::jsonb,
    amount_paid NUMERIC(10, 2) NOT NULL DEFAULT 4500.00,
    payment_status TEXT NOT NULL DEFAULT 'successful',
    
    -- DGFT Official Issuance Records
    iec_number TEXT, -- 10-digit PAN matching code
    iec_certificate_url TEXT,
    dgft_ack_number TEXT,
    additional_document_request JSONB,
    admin_remarks TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_iec_app_id ON public.iec_applications(application_id);
CREATE INDEX IF NOT EXISTS idx_iec_user_id ON public.iec_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_iec_status ON public.iec_applications(status);
CREATE INDEX IF NOT EXISTS idx_iec_pan ON public.iec_applications((pan_details->>'panNumber'));
