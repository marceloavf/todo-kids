create table private.device_codes (
  child_id uuid primary key references public.profiles,
  guardian_id uuid not null references public.profiles,
  code_hash bytea unique not null,
  expires_at timestamptz not null
);

create table private.child_devices (
  user_id uuid primary key references auth.users on delete cascade,
  child_id uuid not null references public.profiles,
  guardian_id uuid not null references public.profiles,
  linked_at timestamptz not null default now()
);
create index child_devices_child on private.child_devices(child_id);

create table private.device_attempts (
  user_id uuid primary key references auth.users on delete cascade,
  failures int not null
);

create function public.device_child_id() returns uuid
language sql stable security definer set search_path = '' as $$
  select d.child_id from private.child_devices d join public.profiles p on p.id = d.child_id
  where d.user_id = auth.uid() and p.archived_at is null
$$;

create function private.family_for_login() returns uuid
language sql stable security definer set search_path = '' as $$
  select case when coalesce((auth.jwt()->>'is_anonymous')::boolean, false)
    then (select p.family_id from public.profiles p where p.id = public.device_child_id())
    else auth.uid() end
$$;

create function public.issue_device_code(p_token text, p_child_id uuid)
returns table(code text, expires_at timestamptz)
language plpgsql security definer set search_path = '' as $$
declare
  guardian uuid := private.require_guardian(p_token);
  alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  entropy bytea := extensions.gen_random_bytes(6);
begin
  perform 1 from public.profiles where id=p_child_id and family_id=auth.uid()
    and kind='child' and archived_at is null for update;
  if not found then raise exception 'not_found'; end if;
  select string_agg(substr(alphabet, 1 + get_byte(entropy,i) % 32, 1), '' order by i)
    into code from generate_series(0,5) i;
  expires_at := now() + interval '10 minutes';
  delete from private.device_codes c where c.child_id=p_child_id or c.expires_at <= now();
  insert into private.device_codes values(p_child_id, guardian, sha256(convert_to(code,'UTF8')), expires_at);
  return next;
end $$;

create function public.redeem_device_code(p_code text) returns text
language plpgsql security definer set search_path = '' as $$
declare
  claimed private.device_codes;
  attempts int;
begin
  perform 1 from auth.users where id=auth.uid() and is_anonymous for update;
  if not found then raise exception 'not_authorized'; end if;
  if public.device_child_id() is not null then return 'linked'; end if;
  delete from private.device_codes c where c.code_hash=sha256(convert_to(upper(trim(p_code)),'UTF8'))
    and c.expires_at > now() returning * into claimed;
  if found then
    perform 1 from public.profiles where id=claimed.child_id and archived_at is null for share;
    if found then
      insert into private.child_devices values(auth.uid(),claimed.child_id,claimed.guardian_id,now());
      delete from private.device_attempts where user_id=auth.uid();
      return 'linked';
    end if;
  end if;
  insert into private.device_attempts values(auth.uid(),1) on conflict(user_id)
    do update set failures=private.device_attempts.failures+1 returning failures into attempts;
  if attempts >= 5 then
    delete from auth.users where id=auth.uid() and is_anonymous;
    return 'discard';
  end if;
  return 'invalid';
end $$;

create function public.list_child_devices(p_token text, p_child_id uuid)
returns table(id uuid, linked_at timestamptz, guardian_name text)
language plpgsql security definer set search_path = '' as $$
begin
  perform private.require_guardian(p_token);
  return query select d.user_id,d.linked_at,g.name from private.child_devices d
    join public.profiles p on p.id=d.child_id join public.profiles g on g.id=d.guardian_id
    where p.family_id=auth.uid() and p.id=p_child_id order by d.linked_at desc;
end $$;

create function public.revoke_child_device(p_token text, p_device_id uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
  perform private.require_guardian(p_token);
  delete from auth.users u using private.child_devices d, public.profiles p
    where u.id=p_device_id and d.user_id=u.id and d.child_id=p.id and p.family_id=auth.uid() and u.is_anonymous;
  delete from private.child_devices d using public.profiles p
    where d.user_id=p_device_id and d.child_id=p.id and p.family_id=auth.uid();
end $$;

create function private.unlink_archived_child() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  delete from private.device_codes where child_id=new.id;
  delete from auth.users u using private.child_devices d where d.child_id=new.id and d.user_id=u.id and u.is_anonymous;
  delete from private.child_devices where child_id=new.id;
  return new;
end $$;
create trigger unlink_archived_child after update of archived_at on public.profiles
  for each row when (new.archived_at is not null and old.archived_at is null)
  execute function private.unlink_archived_child();

-- Keep the family-login policy and add a separate, narrower device policy.
create policy device_read on public.families for select to authenticated
  using (id=(select private.family_for_login()));
create policy device_read on public.profiles for select to authenticated
  using (family_id=(select private.family_for_login()) and (kind='guardian' or id=(select public.device_child_id())));
do $$
declare t text;
begin
  foreach t in array array['routines','tasks','rewards'] loop
    execute format('create policy device_read on public.%I for select to authenticated using (family_id=(select private.family_for_login()))',t);
  end loop;
  foreach t in array array['completions','redemptions','statement_entries'] loop
    execute format('create policy device_read on public.%I for select to authenticated using (child_id=(select public.device_child_id()))',t);
  end loop;
end $$;

create or replace function private.today() returns date
language sql stable set search_path = '' as $$
  select (now() at time zone f.timezone)::date from public.families f where f.id = private.family_for_login()
$$;

create or replace function private.move_points(
  p_child_id uuid,
  p_kind public.statement_kind,
  p_requested int,
  p_description text,
  p_completion_id uuid default null,
  p_redemption_id uuid default null,
  p_guardian_id uuid default null
) returns public.statement_entries
language plpgsql set search_path = '' as $$
declare
  v_balance int;
  v_entry public.statement_entries;
begin
  select p.balance into v_balance from public.profiles p
  where p.id = p_child_id and p.family_id = private.family_for_login() and p.kind = 'child'
  for update;
  if not found then raise exception 'not_found'; end if;

  insert into public.statement_entries
    (family_id, child_id, kind, requested_amount, amount, description, completion_id, redemption_id, guardian_id)
  values
    (private.family_for_login(), p_child_id, p_kind, p_requested, greatest(p_requested, -v_balance), p_description,
     p_completion_id, p_redemption_id, p_guardian_id)
  returning * into v_entry;

  update public.profiles p set balance = p.balance + v_entry.amount where p.id = p_child_id;
  return v_entry;
end $$;

create or replace function public.today_tasks()
returns table (
  child_id uuid, day date, task_id uuid, name text, icon text, description text, steps jsonb, points int,
  requires_approval boolean, "position" int, routine_id uuid, routine_name text, routine_position int,
  status public.task_status, completion_id uuid, rejected_by_name text, hint text
)
language sql stable security definer set search_path = '' as $$
  select c.id, d.day, t.id, t.name, t.icon, t.description, t.steps, t.points,
    t.requires_approval, t.position, t.routine_id, r.name, r.position,
    (case k.status when 'approved' then 'done' when 'pending' then 'pending' else 'todo' end)::public.task_status,
    k.id, rj.name, rj.hint
  from public.profiles c
  cross join private.today() d (day)
  cross join lateral private.tasks_for(c.id, d.day) t
  left join public.routines r on r.id = t.routine_id
  left join public.completions k
    on k.task_id = t.id and k.child_id = c.id and k.day = d.day and k.status in ('pending', 'approved')
  -- The latest rejection shows only while the task is back to todo.
  left join lateral (
    select g.name, x.hint from public.completions x
    join public.profiles g on g.id = x.decided_by
    where k.id is null and x.task_id = t.id and x.child_id = c.id and x.day = d.day and x.status = 'rejected'
    order by x.decided_at desc limit 1
  ) rj on true
  where c.family_id = private.family_for_login()
    and (c.family_id=auth.uid() or c.id=public.device_child_id())
  order by r.position nulls last, r.id, t.position, t.id
$$;

create or replace function public.complete_task(p_task_id uuid, p_child_id uuid) returns public.completions
language plpgsql security definer set search_path = '' as $$
declare
  v_day date := private.today();
  v_task public.tasks;
  v_completion public.completions;
begin
  if private.family_for_login() is distinct from auth.uid() and p_child_id is distinct from public.device_child_id() then
    raise exception 'not_authorized';
  end if;
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

create or replace function public.request_redemption(p_reward_id uuid, p_child_id uuid) returns public.redemptions
language plpgsql security definer set search_path = '' as $$
declare
  v_cost int;
  v_balance int;
  v_redemption public.redemptions;
begin
  if private.family_for_login() is distinct from auth.uid() and p_child_id is distinct from public.device_child_id() then
    raise exception 'not_authorized';
  end if;
  select w.cost into v_cost from public.rewards w
  where w.id = p_reward_id and w.family_id = private.family_for_login() and w.archived_at is null;
  if not found then raise exception 'not_found'; end if;

  select c.balance into v_balance from public.profiles c
  where c.id = p_child_id and c.family_id = private.family_for_login() and c.kind = 'child' and c.archived_at is null;
  if not found then raise exception 'not_found'; end if;
  if v_balance < v_cost then raise exception 'insufficient_balance'; end if;

  begin
    insert into public.redemptions (family_id, reward_id, child_id, cost)
    values (private.family_for_login(), p_reward_id, p_child_id, v_cost)
    returning * into v_redemption;
  exception when unique_violation then
    raise exception 'pending_redemption_exists';
  end;
  return v_redemption;
end $$;

create or replace function public.create_family(p_name text, p_timezone text, p_guardian_name text, p_pin text)
returns public.profiles
language plpgsql security definer set search_path = '' as $$
declare
  v_guardian public.profiles;
begin
  if coalesce((auth.jwt()->>'is_anonymous')::boolean,false) then raise exception 'not_authorized'; end if;
  perform private.assert_timezone(p_timezone);
  insert into public.families (id, name, timezone)
  values (auth.uid(), private.clean_name(p_name), p_timezone)
  on conflict (id) do nothing;
  if not found then raise exception 'family_exists'; end if;

  insert into public.profiles (family_id, kind, name)
  values (auth.uid(), 'guardian', private.clean_name(p_guardian_name))
  returning * into v_guardian;
  insert into private.guardian_credentials (profile_id, pin_hash)
  values (v_guardian.id, private.pin_hash(p_pin));
  return v_guardian;
end $$;

create or replace function public.end_guardian_session(p_token text) returns void
language sql security definer set search_path = '' as $$
  delete from private.guardian_sessions s where s.profile_id in (select p.id from public.profiles p where p.family_id=auth.uid()) and s.token_hash = sha256(convert_to(p_token, 'utf8'))
$$;
revoke all on function public.device_child_id() from public, anon;
grant execute on function public.device_child_id() to authenticated;
revoke all on function public.issue_device_code(text,uuid) from public, anon;
grant execute on function public.issue_device_code(text,uuid) to authenticated;
revoke all on function public.redeem_device_code(text) from public, anon;
grant execute on function public.redeem_device_code(text) to authenticated;
revoke all on function public.list_child_devices(text,uuid) from public, anon;
grant execute on function public.list_child_devices(text,uuid) to authenticated;
revoke all on function public.revoke_child_device(text,uuid) from public, anon;
grant execute on function public.revoke_child_device(text,uuid) to authenticated;
