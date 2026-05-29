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
-- 招待（リンク共有でもう一人を共同編集に追加）
-- ------------------------------------------------------------
create table if not exists public.trip_invites (
  code        text primary key,
  trip_id     uuid references public.trips (id) on delete cascade not null,
  role        member_role not null default 'partner',
  created_by  uuid references auth.users (id) default auth.uid(),
  created_at  timestamptz not null default now(),
  expires_at  timestamptz not null default now() + interval '14 days',
  used_at     timestamptz,
  used_by     uuid references auth.users (id)
);

alter table public.trip_invites enable row level security;

-- 招待行はメンバーのみ参照（受諾は下の関数経由で行うので select は最小限）
drop policy if exists invites_select on public.trip_invites;
create policy invites_select on public.trip_invites for select
  using (public.is_trip_member(trip_id));

-- 招待コードを発行する（メンバーのみ）。短いランダムコードを返す。
create or replace function public.create_trip_invite(t uuid)
returns text language plpgsql security definer as $$
declare
  new_code text;
begin
  if not public.is_trip_member(t) then
    raise exception 'not a member of this trip';
  end if;
  -- 衝突しにくい 10 文字のコード
  new_code := lower(replace(encode(gen_random_bytes(8), 'base64'), '/', '_'));
  new_code := left(regexp_replace(new_code, '[^a-z0-9]', '', 'g') || md5(random()::text), 10);
  insert into public.trip_invites (code, trip_id, created_by)
    values (new_code, t, auth.uid());
  return new_code;
end;
$$;

-- 招待を受諾する。RLS を越えて自分をメンバーに追加し、trip_id を返す。
create or replace function public.accept_trip_invite(invite_code text)
returns uuid language plpgsql security definer as $$
declare
  inv public.trip_invites%rowtype;
begin
  select * into inv from public.trip_invites where code = invite_code;
  if not found then
    raise exception 'invalid invite code';
  end if;
  if inv.expires_at < now() then
    raise exception 'invite expired';
  end if;

  insert into public.trip_members (trip_id, user_id, role)
    values (inv.trip_id, auth.uid(), inv.role)
    on conflict (trip_id, user_id) do nothing;

  update public.trip_invites
    set used_at = now(), used_by = auth.uid()
    where code = invite_code and used_at is null;

  return inv.trip_id;
end;
$$;

-- ------------------------------------------------------------
-- Realtime（変更を購読できるようにする）
-- ------------------------------------------------------------
alter publication supabase_realtime add table public.trips;
alter publication supabase_realtime add table public.days;
alter publication supabase_realtime add table public.stops;
alter publication supabase_realtime add table public.checklist_items;
