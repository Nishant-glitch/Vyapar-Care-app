-- =============================================================================
-- OTHER SERVICES CONSULTATION & REQUIREMENTS SCHEMA
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.other_service_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id TEXT UNIQUE NOT NULL,
    user_id TEXT NOT NULL DEFAULT 'guest_user',
    status TEXT NOT NULL DEFAULT 'submitted', -- 'submitted', 'under_review', 'documents_required', 'quote_generated', 'payment_pending', 'in_progress', 'clarification_required', 'completed', 'closed'
    
    -- Selected Service & Category
    selected_service JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_uncertain_service BOOLEAN NOT NULL DEFAULT false,
    
    -- Applicant Details
    applicant_details JSONB NOT NULL DEFAULT '{}'::jsonb,
    applicant_type TEXT NOT NULL DEFAULT 'individual',
    
    -- Requirement Details
    requirement_details JSONB NOT NULL DEFAULT '{}'::jsonb,
    department TEXT NOT NULL DEFAULT 'gst',
    urgency TEXT NOT NULL DEFAULT 'normal',
    deadline_date DATE,
    
    -- Business Profile (if commercial)
    business_details JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Uploaded Supporting Documents
    documents JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Additional Preferences & Callback
    additional_info JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Admin Classification & Assignment
    admin_classification JSONB,
    assigned_staff TEXT,
    
    -- Customized Quote & Payment Details
    custom_quote JSONB,
    calculated_fees JSONB NOT NULL DEFAULT '{}'::jsonb,
    amount_paid NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    payment_status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'successful', 'failed', 'refunded'
    
    -- Document Requests & Final Deliveries
    additional_document_request JSONB,
    final_document_delivery JSONB,
    admin_remarks TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_other_app_id ON public.other_service_requests(application_id);
CREATE INDEX IF NOT EXISTS idx_other_user_id ON public.other_service_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_other_status ON public.other_service_requests(status);
CREATE INDEX IF NOT EXISTS idx_other_dept ON public.other_service_requests(department);
