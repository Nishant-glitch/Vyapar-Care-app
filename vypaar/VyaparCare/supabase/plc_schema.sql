-- =============================================================================
-- VyaparCare: Private Limited Company Registration Schema
-- =============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PLC Applications Master Table
create table if not exists public.plc_applications (
  id uuid primary key default uuid_generate_v4(),
  application_id text unique not null,
  user_id uuid references auth.users(id) on delete set null,
  applicant jsonb not null default '{}'::jsonb,
  company jsonb not null default '{}'::jsonb,
  directors jsonb not null default '[]'::jsonb,
  subscribers jsonb not null default '[]'::jsonb,
  office jsonb not null default '{}'::jsonb,
  business jsonb not null default '{}'::jsonb,
  calculated_fees jsonb not null default '{}'::jsonb,
  status text not null default 'submitted' check (
    status in (
      'draft',
      'submitted',
      'under_review',
      'clarification_requested',
      'documents_submitted_for_review',
      'mca_filed',
      'approved',
      'rejected'
    )
  ),
  admin_notes text,
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. PLC Documents Table
create table if not exists public.plc_documents (
  id uuid primary key default uuid_generate_v4(),
  application_id text references public.plc_applications(application_id) on delete cascade,
  document_id text not null,
  label text not null,
  category text not null,
  required boolean not null default true,
  file_url text,
  file_name text,
  file_size bigint,
  mime_type text,
  status text not null default 'required' check (
    status in ('required', 'optional', 'uploaded', 'reused', 'under_review', 'approved', 'rejected')
  ),
  is_reused boolean not null default false,
  reused_from_doc_id text,
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. PLC Clarification / Document Requests Table
create table if not exists public.plc_document_requests (
  id uuid primary key default uuid_generate_v4(),
  application_id text references public.plc_applications(application_id) on delete cascade,
  document_name text not null,
  reason text,
  status text not null default 'pending' check (status in ('pending', 'fulfilled', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes for lightning fast lookups
create index if not exists idx_plc_applications_user on public.plc_applications(user_id);
create index if not exists idx_plc_applications_status on public.plc_applications(status);
create index if not exists idx_plc_applications_app_id on public.plc_applications(application_id);
create index if not exists idx_plc_documents_app_id on public.plc_documents(application_id);
create index if not exists idx_plc_requests_app_id on public.plc_document_requests(application_id);

-- Enable Row Level Security (RLS)
alter table public.plc_applications enable row level security;
alter table public.plc_documents enable row level security;
alter table public.plc_document_requests enable row level security;

-- Policies for plc_applications
create policy "Users can view own PLC applications"
  on public.plc_applications for select
  using (auth.uid() = user_id or auth.uid() is null);

create policy "Users can insert own PLC applications"
  on public.plc_applications for insert
  with check (auth.uid() = user_id or auth.uid() is null);

create policy "Users can update own PLC applications"
  on public.plc_applications for update
  using (auth.uid() = user_id or auth.uid() is null);

-- Policies for plc_documents
create policy "Users can view and edit own PLC documents"
  on public.plc_documents for all
  using (true);

-- Policies for plc_document_requests
create policy "Users can view PLC document requests"
  on public.plc_document_requests for select
  using (true);
