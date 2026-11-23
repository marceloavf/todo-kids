-- Keep the existing atomic completion and ledger transaction behind a dated entry point.
alter function public.complete_task(uuid, uuid) set schema private;
revoke all on function private.complete_task(uuid, uuid) from public, anon, authenticated;

create function public.complete_task(p_task_id uuid, p_child_id uuid, p_expected_day date)
returns public.completions language plpgsql security definer set search_path = '' as $$
begin
  if p_expected_day is distinct from private.today() then
    raise exception 'family_day_changed';
  end if;
  return private.complete_task(p_task_id, p_child_id);
end $$;
revoke all on function public.complete_task(uuid, uuid, date) from public, anon;
grant execute on function public.complete_task(uuid, uuid, date) to authenticated;
