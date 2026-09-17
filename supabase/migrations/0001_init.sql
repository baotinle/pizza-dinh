-- Pizza Đình internal ops app — initial schema, RLS policies, storage bucket
-- Run against a fresh Supabase project (SQL editor or `supabase db push`).

-- ── Enums ──────────────────────────────────────────────────────────────────
create type user_role as enum ('admin', 'employee');
create type position_type as enum ('bep_chinh', 'bep_phu', 'phuc_vu', 'thu_ngan');
create type allowance_type as enum ('per_shift', 'fixed_monthly');
create type attendance_status as enum ('on_time', 'late', 'absent', 'leave');
create type adjustment_type as enum ('fine', 'bonus');
create type priority_level as enum ('normal', 'urgent');

-- ── Tables ─────────────────────────────────────────────────────────────────
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  phone text,
  email text,
  role user_role not null default 'employee',
  position position_type,
  hourly_wage numeric(12, 2) not null default 0,
  allowance_type allowance_type not null default 'fixed_monthly',
  allowance_rate numeric(12, 2) not null default 0,
  bank_account_number text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table schedule_postings (
  id uuid primary key default gen_random_uuid(),
  image_path text not null,
  start_date date not null,
  end_date date not null,
  note text,
  created_by uuid references profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create table attendance (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references profiles (id) on delete cascade,
  work_date date not null,
  check_in_time timestamptz,
  check_out_time timestamptz,
  status attendance_status not null default 'on_time',
  ot_hours numeric(5, 2) not null default 0,
  note text,
  recorded_by uuid references profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (employee_id, work_date)
);

create table payroll_adjustments (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references profiles (id) on delete cascade,
  period_start date not null,
  period_end date not null,
  type adjustment_type not null,
  amount numeric(12, 2) not null check (amount >= 0),
  note text,
  created_by uuid references profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create table announcements (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  priority priority_level not null default 'normal',
  created_by uuid references profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

-- ── updated_at trigger for attendance ────────────────────────────────────
create function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger attendance_set_updated_at
  before update on attendance
  for each row execute function set_updated_at();

-- ── Helper: is the current user an admin? (security definer avoids RLS recursion) ──
create function is_admin() returns boolean as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable;

-- ── RLS ────────────────────────────────────────────────────────────────────
alter table profiles enable row level security;
alter table schedule_postings enable row level security;
alter table attendance enable row level security;
alter table payroll_adjustments enable row level security;
alter table announcements enable row level security;

-- profiles: admin full access; employees can read only their own row
create policy "profiles_admin_all" on profiles for all
  using (is_admin()) with check (is_admin());
create policy "profiles_self_select" on profiles for select
  using (id = auth.uid());

-- schedule_postings: everyone authenticated can read; only admin can write
create policy "schedules_select_authenticated" on schedule_postings for select
  using (auth.uid() is not null);
create policy "schedules_admin_write" on schedule_postings for insert
  with check (is_admin());
create policy "schedules_admin_update" on schedule_postings for update
  using (is_admin()) with check (is_admin());
create policy "schedules_admin_delete" on schedule_postings for delete
  using (is_admin());

-- attendance: admin full access; employees read/write only their own rows
create policy "attendance_admin_all" on attendance for all
  using (is_admin()) with check (is_admin());
create policy "attendance_self_select" on attendance for select
  using (employee_id = auth.uid());
create policy "attendance_self_insert" on attendance for insert
  with check (employee_id = auth.uid());
create policy "attendance_self_update" on attendance for update
  using (employee_id = auth.uid()) with check (employee_id = auth.uid());

-- payroll_adjustments: admin full access; employees can read only their own
create policy "adjustments_admin_all" on payroll_adjustments for all
  using (is_admin()) with check (is_admin());
create policy "adjustments_self_select" on payroll_adjustments for select
  using (employee_id = auth.uid());

-- announcements: everyone authenticated can read; only admin can write
create policy "announcements_select_authenticated" on announcements for select
  using (auth.uid() is not null);
create policy "announcements_admin_write" on announcements for insert
  with check (is_admin());
create policy "announcements_admin_update" on announcements for update
  using (is_admin()) with check (is_admin());
create policy "announcements_admin_delete" on announcements for delete
  using (is_admin());

-- ── Storage: schedule images ────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('schedules', 'schedules', true)
on conflict (id) do nothing;

create policy "schedules_bucket_public_read" on storage.objects for select
  using (bucket_id = 'schedules');
create policy "schedules_bucket_admin_insert" on storage.objects for insert
  with check (bucket_id = 'schedules' and is_admin());
create policy "schedules_bucket_admin_update" on storage.objects for update
  using (bucket_id = 'schedules' and is_admin());
create policy "schedules_bucket_admin_delete" on storage.objects for delete
  using (bucket_id = 'schedules' and is_admin());
