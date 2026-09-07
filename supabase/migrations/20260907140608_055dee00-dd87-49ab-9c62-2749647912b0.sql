create or replace function public.notify_admins_on_dispute()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if NEW.dispute_status = 'ouvert' and (OLD.dispute_status is distinct from 'ouvert') then
    insert into public.notifications (user_id, type, title, message, link)
    select ur.user_id,
           'dispute_admin',
           'Nouveau litige à traiter',
           coalesce(NEW.dispute_reason, 'Motif non précisé') || ' — montant ' || coalesce(NEW.total_buyr_amount::text, '?') || ' €',
           '/admin/litiges'
    from public.user_roles ur
    where ur.role = 'admin';
  end if;
  return NEW;
end;
$$;

drop trigger if exists trg_notify_admins_on_dispute on public.reservations;
create trigger trg_notify_admins_on_dispute
after update on public.reservations
for each row execute function public.notify_admins_on_dispute();