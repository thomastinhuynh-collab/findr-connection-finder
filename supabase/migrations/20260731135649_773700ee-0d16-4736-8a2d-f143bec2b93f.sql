alter table public.waitlist
  add column if not exists first_name text,
  add column if not exists consent_given boolean default false;

alter table public.waitlist alter column role drop not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.waitlist'::regclass
      and conname = 'waitlist_email_unique'
  ) then
    alter table public.waitlist add constraint waitlist_email_unique unique (email);
  end if;
end $$;

grant insert on public.waitlist to anon;

alter table public.waitlist enable row level security;

drop policy if exists "anon can join waitlist" on public.waitlist;
create policy "anon can join waitlist"
  on public.waitlist for insert to anon with check (true);