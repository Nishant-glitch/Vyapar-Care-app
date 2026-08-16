-- =============================================================================
-- INCOME TAX RETURN (ITR) FILING APPLICATIONS SCHEMA
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.itr_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id TEXT UNIQUE NOT NULL,
    user_id TEXT NOT NULL DEFAULT 'guest_user',
    status TEXT NOT NULL DEFAULT 'submitted', -- 'submitted', 'under_review', 'computation_prepared', 'ready_for_filing', 'filed', 'completed'
    
    assessment_year TEXT NOT NULL DEFAULT 'AY_2026_27',
    taxpayer_type TEXT NOT NULL DEFAULT 'individual',
    residential_status TEXT NOT NULL DEFAULT 'resident',
    recommended_itr_form TEXT NOT NULL DEFAULT 'ITR-1',
    selected_regime TEXT DEFAULT 'new',
    
    -- Profile & Personal Info
    profile JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Income Sources & Head-wise Details
    income_sources JSONB NOT NULL DEFAULT '{}'::jsonb,
    income_details JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Deductions & Chapter VI-A
    deductions JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Taxes Paid & Bank Refund Details
    tax_paid JSONB NOT NULL DEFAULT '{}'::jsonb,
    bank_details JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Supporting Records (Annexure-less verification)
    documents JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Tax Computation Breakdown
    tax_computation JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Fee & Payment Details
    calculated_fees JSONB NOT NULL DEFAULT '{}'::jsonb,
    amount_paid NUMERIC(10, 2) NOT NULL DEFAULT 3000.00,
    payment_status TEXT NOT NULL DEFAULT 'successful',
    
    -- Official Filing Records
    acknowledgment_number TEXT, -- 15-digit e-filing ack number
    itr_v_url TEXT,
    computation_sheet_url TEXT,
    admin_remarks TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_itr_app_id ON public.itr_applications(application_id);
CREATE INDEX IF NOT EXISTS idx_itr_user_id ON public.itr_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_itr_status ON public.itr_applications(status);
CREATE INDEX IF NOT EXISTS idx_itr_ay ON public.itr_applications(assessment_year);
