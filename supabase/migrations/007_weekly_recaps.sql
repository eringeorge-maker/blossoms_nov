-- Weekly recaps shown on the notice board as comic strips.
-- panels: ordered json array of { caption, speech?, sfx?, tone } objects (tone picks the panel colour).
create table public.weekly_recaps (
  id           uuid primary key default gen_random_uuid(),
  week_label   text not null,
  title        text not null,
  panels       jsonb not null default '[]'::jsonb check (jsonb_typeof(panels) = 'array'),
  is_published boolean not null default false,
  published_at timestamptz,
  created_by   uuid references public.admin_profiles(id),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index weekly_recaps_published_idx on public.weekly_recaps(is_published, published_at desc);

alter table public.weekly_recaps enable row level security;

create policy "Public reads published recaps"
  on public.weekly_recaps for select
  using (is_published = true);

create policy "Admin manages recaps"
  on public.weekly_recaps for all
  using (public.current_admin_role() in ('super_admin','content_editor'))
  with check (public.current_admin_role() in ('super_admin','content_editor'));
