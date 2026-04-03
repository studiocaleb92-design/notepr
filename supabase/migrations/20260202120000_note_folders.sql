-- Folders for organizing notes (per user)

create table if not exists public.note_folders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null default 'New folder',
  position int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.notes
  add column if not exists folder_id uuid references public.note_folders (id) on delete set null;

create index if not exists notes_folder_id_idx on public.notes (folder_id);

alter table public.note_folders enable row level security;

create policy "Users manage own folders"
  on public.note_folders
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

comment on table public.note_folders is 'User-defined folders for grouping notes';
