-- =====================================================================
-- Vyapar Care — seed data (8 services)
-- schema.sql run karne ke baad ye paste kijiye.
-- Dobara run karne pe duplicate nahi banenge (name pe unique index).
-- =====================================================================

create unique index if not exists services_name_key on public.services (name);

insert into public.services
  (name, detail_title, description, fee, advance_percent, processing_days, icon, included)
values
  (
    'GST Services',
    'GST Registration',
    'New GST Registration for Proprietorship, Partnership or Private Limited.',
    10000, 50, '3-5 Working Days', '📋',
    array['GST Number', 'GST Certificate', 'All Government Fees']
  ),
  (
    'Company Registration',
    'Private Limited Company Registration',
    'Incorporate your Private Limited Company with MCA.',
    15000, 50, '7-10 Working Days', '🏢',
    array['Certificate of Incorporation', 'PAN & TAN', 'DIN for 2 Directors', 'All Government Fees']
  ),
  (
    'Trademark Registration',
    'Trademark Registration',
    'Protect your brand name and logo with a registered trademark.',
    8000, 50, '5-7 Working Days', '™️',
    array['Trademark Application', 'TM Number', 'Government Fees (1 class)']
  ),
  (
    'FSSAI License',
    'FSSAI Food License',
    'Food business license registration for manufacturers, traders and restaurants.',
    5000, 50, '5-7 Working Days', '🍽️',
    array['FSSAI Registration Certificate', 'Application Filing', 'Government Fees']
  ),
  (
    'MSME / Udyam',
    'MSME / Udyam Registration',
    'Udyam registration for micro, small and medium enterprises.',
    2000, 50, '1-2 Working Days', '🏭',
    array['Udyam Certificate', 'Udyam Number', 'Application Filing']
  ),
  (
    'ITR Filing',
    'Income Tax Return Filing',
    'Annual income tax return filing for individuals and businesses.',
    3000, 50, '2-3 Working Days', '📄',
    array['ITR Filing', 'Acknowledgment (ITR-V)', 'Computation Sheet']
  ),
  (
    'IEC / Import Export',
    'Import Export Code (IEC)',
    'IEC registration required for import and export businesses.',
    4000, 50, '3-5 Working Days', '🌐',
    array['IEC Certificate', 'DGFT Application', 'Government Fees']
  ),
  (
    'Other Services',
    'Other Services',
    'Tell us your requirement and our team will guide you.',
    2500, 50, 'Varies', '⚙️',
    array['Expert Consultation', 'Document Guidance']
  )
on conflict (name) do update set
  detail_title    = excluded.detail_title,
  description     = excluded.description,
  fee             = excluded.fee,
  advance_percent = excluded.advance_percent,
  processing_days = excluded.processing_days,
  icon            = excluded.icon,
  included        = excluded.included,
  is_active       = true;
