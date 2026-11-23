drop function public.complete_task(uuid, uuid);

create function public.complete_task(p_task_id uuid, p_child_id uuid, p_expected_day date) returns public.completions
language plpgsql security definer set search_path = '' as $$
declare
  v_day date := private.today();
  v_task public.tasks;
  v_completion public.completions;
begin
  if private.family_for_login() is distinct from auth.uid() and p_child_id is distinct from public.device_child_id() then
    raise exception 'not_authorized';
  end if;
  -- Use the same server day for validation, task eligibility, and the ledger transaction.
  if p_expected_day is distinct from v_day then raise exception 'family_day_changed'; end if;
  select t.* into v_task from private.tasks_for(p_child_id, v_day) t
  where t.id = p_task_id and t.family_id = private.family_for_login();
  if not found then raise exception 'task_not_available'; end if;

  -- Loops only when a concurrent call holds the active completion: wait for it, then return its row.
  loop
    insert into public.completions (family_id, task_id, child_id, day, status, points)
    values (
      private.family_for_login(), p_task_id, p_child_id, v_day,
      (case when v_task.requires_approval then 'pending' else 'approved' end)::public.completion_status,
      v_task.points
    )
    on conflict (task_id, child_id, day) where status in ('pending', 'approved') do nothing
    returning * into v_completion;
    if found then
      if not v_task.requires_approval then
        perform private.move_points(p_child_id, 'completion', v_task.points, v_task.name, v_completion.id);
      end if;
      return v_completion;
    end if;

    select k.* into v_completion from public.completions k
    where k.task_id = p_task_id and k.child_id = p_child_id and k.day = v_day
      and k.status in ('pending', 'approved');
    if found then return v_completion; end if;
  end loop;
end $$;

revoke all on function public.complete_task(uuid, uuid, date) from public, anon;
grant execute on function public.complete_task(uuid, uuid, date) to authenticated;
