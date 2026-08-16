-- =====================================================================
-- Vyapar Care — Storage bucket for uploaded documents
-- schema.sql ke baad run kijiye.
-- =====================================================================

-- 'documents' bucket. public = true isliye rakha hai ki app file_url ko
-- seedhe kholta hai. Agar documents private chahiye, public ko false karke
-- app me getPublicUrl ki jagah createSignedUrl use karna hoga.
insert into storage.buckets (id, name, public)
values ('documents', 'documents', true)
on conflict (id) do nothing;

-- upload: sirf logged-in user, aur sirf apne order ke folder me
-- (path format: <order_uuid>/<document_id>.<ext>)
drop policy if exists "documents upload own" on storage.objects;
create policy "documents upload own" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'documents'
    and exists (
      select 1 from public.orders o
      where o.user_id = auth.uid()
        and o.id::text = (storage.foldername(name))[1]
    )
  );

-- update (upsert dobara upload karne pe)
drop policy if exists "documents update own" on storage.objects;
create policy "documents update own" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'documents'
    and exists (
      select 1 from public.orders o
      where o.user_id = auth.uid()
        and o.id::text = (storage.foldername(name))[1]
    )
  );

-- read: bucket public hai, isliye sabko allowed
drop policy if exists "documents public read" on storage.objects;
create policy "documents public read" on storage.objects
  for select using (bucket_id = 'documents');
