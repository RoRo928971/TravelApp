-- ============================================================
-- 旅のしおり — Supabase スキーマ（骨組み）
-- Supabase の SQL Editor に貼り付けて実行してください。
-- 二人での共同編集・リアルタイム同期を前提にしたテーブル構成です。
-- ============================================================

-- 役割（あなた / 相手）を表す列挙
do $$ begin
  create type member_role as enum ('me', 'partner');
exception when duplicate_object then null; end $$;

-- 旅程
create table if not exists public.trips (
  id          uuid primary key default gen_random_uuid(),
  title       text not null default '新しい旅',
  date_range  text not null default '',
  nights      text not null default '',
  created_by  uuid references auth.users (id) default auth.uid(),
  created_at  timestamptz not null default now()
);

-- 共同編集メンバー（二人）
create table if not exists public.trip_members (
  trip_id   uuid references public.trips (id) on delete cascade,
  user_id   uuid references auth.users (id) on delete cascade,
  role      member_role not null default 'me',
  joined_at timestamptz not null default now(),
  primary key (trip_id, user_id)
);

-- 日（Day 1, Day 2 …）
create table if not exists public.days (
  id        text primary key,
  trip_id   uuid references public.trips (id) on delete cascade not null,
  label     text not null,
  date      text not null,
  sub       text not null default '',
  position  int  not null default 0
);

-- 予定（タイムラインの 1 ストップ）
create table if not exists public.stops (
  id          text primary key,
  day_id      text references public.days (id) on delete cascade not null,
  time        text not null default '',
  place       text not null default '',
  note        text not null default '',
  by_role     member_role not null default 'me',
  scene       text not null default 'kiyomizu',
  info        jsonb not null default '{}'::jsonb,
  editing_by  member_role,
  updated_at  timestamptz not null default now()
);

-- 持ち物・やること
create table if not exists public.checklist_items (
  id          text primary key,
  trip_id     uuid references public.trips (id) on delete cascade not null,
  category    text not null check (category in ('common', 'todo')),
  text        text not null default '',
  owner_role  member_role not null default 'me',
  done        boolean not null default false,
  position    int not null default 0
);

-- ------------------------------------------------------------
-- Row Level Security
-- ------------------------------------------------------------
alter table public.trips           enable row level security;
alter table public.trip_members    enable row level security;
alter table public.days            enable row level security;
alter table public.stops           enable row level security;
alter table public.checklist_items enable row level security;

-- メンバーかどうかを判定するヘルパ
create or replace function public.is_trip_member(t uuid)
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.trip_members m
    where m.trip_id = t and m.user_id = auth.uid()
  );
$$;

-- trips: メンバーのみ参照／作成者は作成可
drop policy if exists trips_select on public.trips;
create policy trips_select on public.trips for select
  using (created_by = auth.uid() or public.is_trip_member(id));
drop policy if exists trips_insert on public.trips;
create policy trips_insert on public.trips for insert
  with check (created_by = auth.uid());
drop policy if exists trips_update on public.trips;
create policy trips_update on public.trips for update
  using (public.is_trip_member(id) or created_by = auth.uid());

-- trip_members: 本人の行のみ
drop policy if exists members_all on public.trip_members;
create policy members_all on public.trip_members for all
  using (user_id = auth.uid() or public.is_trip_member(trip_id))
  with check (true);

-- days / stops / checklist_items: 所属 trip のメンバーのみ
drop policy if exists days_all on public.days;
create policy days_all on public.days for all
  using (public.is_trip_member(trip_id)) with check (public.is_trip_member(trip_id));

drop policy if exists stops_all on public.stops;
create policy stops_all on public.stops for all
  using (exists (select 1 from public.days d where d.id = day_id and public.is_trip_member(d.trip_id)))
  with check (exists (select 1 from public.days d where d.id = day_id and public.is_trip_member(d.trip_id)));

drop policy if exists checklist_all on public.checklist_items;
create policy checklist_all on public.checklist_items for all
  using (public.is_trip_member(trip_id)) with check (public.is_trip_member(trip_id));

-- ------------------------------------------------------------
-- Realtime（変更を購読できるようにする）
-- ------------------------------------------------------------
alter publication supabase_realtime add table public.trips;
alter publication supabase_realtime add table public.days;
alter publication supabase_realtime add table public.stops;
alter publication supabase_realtime add table public.checklist_items;
