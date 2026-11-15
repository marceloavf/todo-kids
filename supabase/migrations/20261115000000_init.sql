create schema private;

create type public.profile_kind as enum ('guardian', 'child');
create type public.completion_status as enum ('pending', 'approved', 'rejected', 'reversed');
create type public.statement_kind as enum ('completion', 'adjustment', 'reversal', 'redemption');
create type public.redemption_status as enum ('pending', 'confirmed', 'refused');
create type public.task_status as enum ('todo', 'pending', 'done');

create table public.families (
  id uuid primary key references auth.users (id),
  name text not null,
  timezone text not null
);

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families (id),
  kind public.profile_kind not null,
  name text not null,
  color text not null default '#64748b',
  avatar text not null default '🙂',
  balance int not null default 0 check (balance >= 0),
  read_aloud boolean not null default false,
  sounds boolean not null default true,
  reduced_motion boolean not null default false,
  archived_at timestamptz,
  check (kind = 'child' or balance = 0)
);

create table private.guardian_credentials (
  profile_id uuid primary key references public.profiles (id),
  pin_hash text not null,
  failed_attempts int not null default 0,
  locked_until timestamptz
);

create table private.guardian_sessions (
  token_hash bytea primary key,
  profile_id uuid not null references public.profiles (id),
  expires_at timestamptz not null
);

create table public.routines (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families (id),
  name text not null,
  weekdays smallint[] not null check (weekdays <@ array[0, 1, 2, 3, 4, 5, 6]::smallint[]),
  child_ids uuid[] not null,
  position int not null,
  archived_at timestamptz
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families (id),
  routine_id uuid references public.routines (id),
  one_off_date date,
  child_ids uuid[],
  name text not null,
  icon text not null,
  description text not null default '',
  steps jsonb not null default '[]'
    check (case when jsonb_typeof(steps) = 'array' then jsonb_array_length(steps) <= 5 else false end),
  points int not null check (points >= 0),
  requires_approval boolean not null,
  position int not null,
  archived_at timestamptz,
  check (
    (routine_id is not null and one_off_date is null and child_ids is null)
    or (routine_id is null and one_off_date is not null and child_ids is not null)
  )
);

create table public.completions (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families (id),
  task_id uuid not null references public.tasks (id),
  child_id uuid not null references public.profiles (id),
  day date not null,
  status public.completion_status not null,
  points int not null,
  decided_by uuid references public.profiles (id),
  hint text check (char_length(hint) <= 120),
  created_at timestamptz not null default now(),
  decided_at timestamptz
);

create unique index completions_active_key on public.completions (task_id, child_id, day)
  where status in ('pending', 'approved');

create table public.rewards (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families (id),
  name text not null,
  icon text not null,
  cost int not null check (cost > 0),
  archived_at timestamptz
);

create table public.redemptions (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families (id),
  reward_id uuid not null references public.rewards (id),
  child_id uuid not null references public.profiles (id),
  cost int not null,
  status public.redemption_status not null default 'pending',
  decided_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  decided_at timestamptz
);

create unique index redemptions_pending_key on public.redemptions (child_id) where status = 'pending';

create table public.statement_entries (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families (id),
  child_id uuid not null references public.profiles (id),
  kind public.statement_kind not null,
  requested_amount int not null,
  amount int not null,
  description text not null,
  completion_id uuid references public.completions (id),
  redemption_id uuid references public.redemptions (id),
  guardian_id uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

do $$
declare
  v_table text;
begin
  for v_table in select tablename from pg_tables where schemaname = 'public' loop
    execute format('alter table public.%I enable row level security', v_table);
    execute format(
      'create policy family_read on public.%I for select to authenticated using (%I = (select auth.uid()))',
      v_table, case v_table when 'families' then 'id' else 'family_id' end
    );
    execute format('alter publication supabase_realtime add table public.%I', v_table);
  end loop;
end $$;

create function private.today() returns date
language sql stable set search_path = '' as $$
  select (now() at time zone f.timezone)::date from public.families f where f.id = auth.uid()
$$;

create function private.tasks_for(p_child_id uuid, p_day date) returns setof public.tasks
language sql stable set search_path = '' as $$
  select t.*
  from public.tasks t
  join public.profiles c on c.id = p_child_id and c.family_id = t.family_id
  left join public.routines r on r.id = t.routine_id
  where c.kind = 'child' and c.archived_at is null and t.archived_at is null
    and (
      (r.archived_at is null and extract(dow from p_day)::smallint = any (r.weekdays) and p_child_id = any (r.child_ids))
      or (t.one_off_date = p_day and p_child_id = any (t.child_ids))
    )
$$;

create function private.move_points(
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
  where p.id = p_child_id and p.family_id = auth.uid() and p.kind = 'child'
  for update;
  if not found then raise exception 'not_found'; end if;

  insert into public.statement_entries
    (family_id, child_id, kind, requested_amount, amount, description, completion_id, redemption_id, guardian_id)
  values
    (auth.uid(), p_child_id, p_kind, p_requested, greatest(p_requested, -v_balance), p_description,
     p_completion_id, p_redemption_id, p_guardian_id)
  returning * into v_entry;

  update public.profiles p set balance = p.balance + v_entry.amount where p.id = p_child_id;
  return v_entry;
end $$;

create function private.require_guardian(p_token text) returns uuid
language plpgsql set search_path = '' as $$
declare
  v_profile_id uuid;
begin
  update private.guardian_sessions s
  set expires_at = now() + interval '15 minutes'
  from public.profiles p
  where s.token_hash = sha256(convert_to(p_token, 'utf8'))
    and s.expires_at > now()
    and p.id = s.profile_id and p.family_id = auth.uid() and p.archived_at is null
  returning s.profile_id into v_profile_id;
  if not found then raise exception 'not_authorized'; end if;
  return v_profile_id;
end $$;

create function private.pin_hash(p_pin text) returns text
language plpgsql set search_path = '' as $$
begin
  if (p_pin ~ '^[0-9]{4}$') is not true then raise exception 'invalid_pin_format'; end if;
  return extensions.crypt(p_pin, extensions.gen_salt('bf'));
end $$;

create function private.clean_name(p_name text) returns text
language plpgsql set search_path = '' as $$
begin
  if btrim(coalesce(p_name, '')) = '' then raise exception 'name_required'; end if;
  return btrim(p_name);
end $$;

create function private.assert_timezone(p_timezone text) returns void
language plpgsql set search_path = '' as $$
begin
  if not exists (select 1 from pg_catalog.pg_timezone_names z where z.name = p_timezone) then
    raise exception 'invalid_timezone';
  end if;
end $$;

create function private.assert_children(p_ids uuid[]) returns void
language plpgsql set search_path = '' as $$
begin
  if exists (
    select 1 from unnest(p_ids) i
    where not exists (
      select 1 from public.profiles p where p.id = i and p.family_id = auth.uid() and p.kind = 'child'
    )
  ) then
    raise exception 'invalid_child_ids';
  end if;
end $$;

create function private.valid_steps(p_steps jsonb) returns boolean
language sql immutable set search_path = '' as $$
  select case when jsonb_typeof(p_steps) = 'array' and jsonb_array_length(p_steps) <= 5 then
    not exists (
      select 1 from jsonb_array_elements(p_steps) s
      where jsonb_typeof(s) <> 'object'
        or s - 'text' - 'emoji' <> '{}'
        or jsonb_typeof(s -> 'text') is distinct from 'string'
        or char_length(s ->> 'text') not between 1 and 60
        or coalesce(jsonb_typeof(s -> 'emoji'), 'missing') not in ('string', 'null')
    )
  else false end
$$;

create function public.create_family(p_name text, p_timezone text, p_guardian_name text, p_pin text)
returns public.profiles
language plpgsql security definer set search_path = '' as $$
declare
  v_guardian public.profiles;
begin
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

create function public.today_tasks()
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
  where c.family_id = auth.uid()
  order by r.position nulls last, r.id, t.position, t.id
$$;

create function public.complete_task(p_task_id uuid, p_child_id uuid) returns public.completions
language plpgsql security definer set search_path = '' as $$
declare
  v_day date := private.today();
  v_task public.tasks;
  v_completion public.completions;
begin
  select t.* into v_task from private.tasks_for(p_child_id, v_day) t
  where t.id = p_task_id and t.family_id = auth.uid();
  if not found then raise exception 'task_not_available'; end if;

  -- Loops only when a concurrent call holds the active completion: wait for it, then return its row.
  loop
    insert into public.completions (family_id, task_id, child_id, day, status, points)
    values (
      auth.uid(), p_task_id, p_child_id, v_day,
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

create function public.request_redemption(p_reward_id uuid, p_child_id uuid) returns public.redemptions
language plpgsql security definer set search_path = '' as $$
declare
  v_cost int;
  v_balance int;
  v_redemption public.redemptions;
begin
  select w.cost into v_cost from public.rewards w
  where w.id = p_reward_id and w.family_id = auth.uid() and w.archived_at is null;
  if not found then raise exception 'not_found'; end if;

  select c.balance into v_balance from public.profiles c
  where c.id = p_child_id and c.family_id = auth.uid() and c.kind = 'child' and c.archived_at is null;
  if not found then raise exception 'not_found'; end if;
  if v_balance < v_cost then raise exception 'insufficient_balance'; end if;

  begin
    insert into public.redemptions (family_id, reward_id, child_id, cost)
    values (auth.uid(), p_reward_id, p_child_id, v_cost)
    returning * into v_redemption;
  exception when unique_violation then
    raise exception 'pending_redemption_exists';
  end;
  return v_redemption;
end $$;

-- A wrong PIN returns ok=false instead of raising, so the failed-attempt counter commits.
create function public.start_guardian_session(p_profile_id uuid, p_pin text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_cred private.guardian_credentials;
  v_token text;
  v_attempts int;
begin
  select c.* into v_cred from private.guardian_credentials c
  join public.profiles p on p.id = c.profile_id
  where c.profile_id = p_profile_id and p.family_id = auth.uid() and p.archived_at is null
  for update of c;
  if not found then raise exception 'not_found'; end if;

  if v_cred.locked_until > now() then
    return jsonb_build_object('ok', false, 'token', null, 'attempts_left', 0, 'locked_until', v_cred.locked_until);
  end if;

  if v_cred.pin_hash = extensions.crypt(p_pin, v_cred.pin_hash) then
    v_token := encode(extensions.gen_random_bytes(32), 'hex');
    update private.guardian_credentials c set failed_attempts = 0, locked_until = null
    where c.profile_id = p_profile_id;
    delete from private.guardian_sessions s where s.expires_at <= now();
    insert into private.guardian_sessions (token_hash, profile_id, expires_at)
    values (sha256(convert_to(v_token, 'utf8')), p_profile_id, now() + interval '15 minutes');
    return jsonb_build_object('ok', true, 'token', v_token, 'attempts_left', 5, 'locked_until', null);
  end if;

  v_attempts := v_cred.failed_attempts + 1;
  update private.guardian_credentials c
  set failed_attempts = case when v_attempts >= 5 then 0 else v_attempts end,
      locked_until = case when v_attempts >= 5 then now() + interval '5 minutes' end
  where c.profile_id = p_profile_id
  returning c.locked_until into v_cred.locked_until;
  return jsonb_build_object(
    'ok', false, 'token', null, 'attempts_left', greatest(5 - v_attempts, 0), 'locked_until', v_cred.locked_until
  );
end $$;

create function public.end_guardian_session(p_token text) returns void
language sql security definer set search_path = '' as $$
  delete from private.guardian_sessions s where s.token_hash = sha256(convert_to(p_token, 'utf8'))
$$;

create function public.decide_completions(
  p_token text, p_completion_ids uuid[], p_approve boolean, p_hint text default null
)
returns setof public.completions
language plpgsql security definer set search_path = '' as $$
declare
  v_guardian uuid := private.require_guardian(p_token);
  v_hint text := case when not p_approve then nullif(btrim(p_hint), '') end;
  v_completion public.completions;
  v_decided int := 0;
begin
  if char_length(v_hint) > 120 then raise exception 'invalid_hint'; end if;
  for v_completion in
    update public.completions k
    set status = (case when p_approve then 'approved' else 'rejected' end)::public.completion_status,
        decided_by = v_guardian, decided_at = now(), hint = v_hint
    where k.id = any (p_completion_ids) and k.family_id = auth.uid() and k.status = 'pending'
    returning k.*
  loop
    if p_approve then
      perform private.move_points(
        v_completion.child_id, 'completion', v_completion.points,
        (select t.name from public.tasks t where t.id = v_completion.task_id),
        v_completion.id, null, v_guardian
      );
    end if;
    v_decided := v_decided + 1;
    return next v_completion;
  end loop;

  if v_decided <> (select count(distinct i) from unnest(p_completion_ids) i) then
    raise exception 'completion_not_pending';
  end if;
end $$;

create function public.reverse_completion(p_token text, p_completion_id uuid) returns public.statement_entries
language plpgsql security definer set search_path = '' as $$
declare
  v_guardian uuid := private.require_guardian(p_token);
  v_completion public.completions;
begin
  update public.completions k
  set status = 'reversed', decided_by = v_guardian, decided_at = now()
  where k.id = p_completion_id and k.family_id = auth.uid() and k.status = 'approved'
  returning k.* into v_completion;
  if not found then raise exception 'completion_not_approved'; end if;

  return private.move_points(
    v_completion.child_id, 'reversal', -v_completion.points,
    (select t.name from public.tasks t where t.id = v_completion.task_id),
    v_completion.id, null, v_guardian
  );
end $$;

create function public.adjust_points(p_token text, p_child_id uuid, p_amount int, p_reason text)
returns public.statement_entries
language plpgsql security definer set search_path = '' as $$
declare
  v_guardian uuid := private.require_guardian(p_token);
begin
  if coalesce(p_amount, 0) = 0 then raise exception 'invalid_amount'; end if;
  if btrim(coalesce(p_reason, '')) = '' then raise exception 'reason_required'; end if;
  return private.move_points(p_child_id, 'adjustment', p_amount, btrim(p_reason), null, null, v_guardian);
end $$;

create function public.decide_redemption(p_token text, p_redemption_id uuid, p_confirm boolean)
returns public.redemptions
language plpgsql security definer set search_path = '' as $$
declare
  v_guardian uuid := private.require_guardian(p_token);
  v_redemption public.redemptions;
  v_entry public.statement_entries;
begin
  update public.redemptions r
  set status = (case when p_confirm then 'confirmed' else 'refused' end)::public.redemption_status,
      decided_by = v_guardian, decided_at = now()
  where r.id = p_redemption_id and r.family_id = auth.uid() and r.status = 'pending'
  returning r.* into v_redemption;
  if not found then raise exception 'redemption_not_pending'; end if;

  if p_confirm then
    v_entry := private.move_points(
      v_redemption.child_id, 'redemption', -v_redemption.cost,
      (select w.name from public.rewards w where w.id = v_redemption.reward_id),
      null, v_redemption.id, v_guardian
    );
    -- move_points caps a debit at the balance, so a short debit means the balance no longer covers the cost.
    if v_entry.amount <> -v_redemption.cost then raise exception 'insufficient_balance'; end if;
  end if;
  return v_redemption;
end $$;

create function public.save_routine(
  p_token text, p_name text, p_weekdays smallint[], p_child_ids uuid[], p_id uuid default null
) returns public.routines
language plpgsql security definer set search_path = '' as $$
declare
  v_guardian uuid := private.require_guardian(p_token);
  v_routine public.routines;
begin
  if (p_weekdays <@ array[0, 1, 2, 3, 4, 5, 6]::smallint[]) is not true then
    raise exception 'invalid_weekdays';
  end if;
  perform private.assert_children(p_child_ids);

  if p_id is null then
    insert into public.routines (family_id, name, weekdays, child_ids, position)
    values (
      auth.uid(), private.clean_name(p_name), p_weekdays, p_child_ids,
      (select coalesce(max(r.position) + 1, 0) from public.routines r where r.family_id = auth.uid())
    )
    returning * into v_routine;
  else
    update public.routines r
    set name = private.clean_name(p_name), weekdays = p_weekdays, child_ids = p_child_ids
    where r.id = p_id and r.family_id = auth.uid()
    returning r.* into v_routine;
    if not found then raise exception 'not_found'; end if;
  end if;
  return v_routine;
end $$;

create function public.archive_routine(p_token text, p_id uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare
  v_guardian uuid := private.require_guardian(p_token);
begin
  update public.routines r set archived_at = coalesce(r.archived_at, now())
  where r.id = p_id and r.family_id = auth.uid();
  if not found then raise exception 'not_found'; end if;
end $$;

create function public.set_routine_order(p_token text, p_ids uuid[]) returns void
language plpgsql security definer set search_path = '' as $$
declare
  v_guardian uuid := private.require_guardian(p_token);
begin
  update public.routines r set position = o.ord - 1
  from unnest(p_ids) with ordinality o (id, ord)
  where r.id = o.id and r.family_id = auth.uid();
end $$;

create function public.save_task(
  p_token text, p_name text, p_icon text, p_description text, p_steps jsonb, p_points int,
  p_requires_approval boolean, p_id uuid default null, p_routine_id uuid default null,
  p_one_off_date date default null, p_child_ids uuid[] default null
) returns public.tasks
language plpgsql security definer set search_path = '' as $$
declare
  v_guardian uuid := private.require_guardian(p_token);
  v_task public.tasks;
begin
  if (p_routine_id is null) = (p_one_off_date is null) or (p_one_off_date is null) <> (p_child_ids is null) then
    raise exception 'invalid_task_target';
  end if;
  if p_routine_id is not null and not exists (
    select 1 from public.routines r where r.id = p_routine_id and r.family_id = auth.uid()
  ) then
    raise exception 'not_found';
  end if;
  perform private.assert_children(p_child_ids);
  if (p_points >= 0) is not true then raise exception 'invalid_points'; end if;
  if private.valid_steps(p_steps) is not true then raise exception 'invalid_steps'; end if;

  if p_id is null then
    insert into public.tasks
      (family_id, routine_id, one_off_date, child_ids, name, icon, description, steps, points, requires_approval, position)
    values (
      auth.uid(), p_routine_id, p_one_off_date, p_child_ids, private.clean_name(p_name), p_icon, p_description,
      p_steps, p_points, p_requires_approval,
      (select coalesce(max(t.position) + 1, 0) from public.tasks t
       where t.family_id = auth.uid() and t.routine_id is not distinct from p_routine_id)
    )
    returning * into v_task;
  else
    update public.tasks t
    set routine_id = p_routine_id, one_off_date = p_one_off_date, child_ids = p_child_ids,
        name = private.clean_name(p_name), icon = p_icon, description = p_description, steps = p_steps,
        points = p_points, requires_approval = p_requires_approval
    where t.id = p_id and t.family_id = auth.uid()
    returning t.* into v_task;
    if not found then raise exception 'not_found'; end if;
  end if;
  return v_task;
end $$;

create function public.archive_task(p_token text, p_id uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare
  v_guardian uuid := private.require_guardian(p_token);
begin
  update public.tasks t set archived_at = coalesce(t.archived_at, now())
  where t.id = p_id and t.family_id = auth.uid();
  if not found then raise exception 'not_found'; end if;
end $$;

create function public.set_task_order(p_token text, p_routine_id uuid, p_task_ids uuid[]) returns void
language plpgsql security definer set search_path = '' as $$
declare
  v_guardian uuid := private.require_guardian(p_token);
begin
  update public.tasks t set position = o.ord - 1
  from unnest(p_task_ids) with ordinality o (id, ord)
  where t.id = o.id and t.family_id = auth.uid() and t.routine_id = p_routine_id;
end $$;

create function public.save_reward(p_token text, p_name text, p_icon text, p_cost int, p_id uuid default null)
returns public.rewards
language plpgsql security definer set search_path = '' as $$
declare
  v_guardian uuid := private.require_guardian(p_token);
  v_reward public.rewards;
begin
  if (p_cost > 0) is not true then raise exception 'invalid_cost'; end if;

  if p_id is null then
    insert into public.rewards (family_id, name, icon, cost)
    values (auth.uid(), private.clean_name(p_name), p_icon, p_cost)
    returning * into v_reward;
  else
    update public.rewards w set name = private.clean_name(p_name), icon = p_icon, cost = p_cost
    where w.id = p_id and w.family_id = auth.uid()
    returning w.* into v_reward;
    if not found then raise exception 'not_found'; end if;
  end if;
  return v_reward;
end $$;

create function public.archive_reward(p_token text, p_id uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare
  v_guardian uuid := private.require_guardian(p_token);
begin
  update public.rewards w set archived_at = coalesce(w.archived_at, now())
  where w.id = p_id and w.family_id = auth.uid();
  if not found then raise exception 'not_found'; end if;
end $$;

create function public.save_profile(
  p_token text, p_kind public.profile_kind, p_name text, p_color text, p_avatar text, p_read_aloud boolean,
  p_sounds boolean, p_reduced_motion boolean, p_id uuid default null, p_pin text default null
) returns public.profiles
language plpgsql security definer set search_path = '' as $$
declare
  v_guardian uuid := private.require_guardian(p_token);
  v_profile public.profiles;
begin
  if p_kind = 'child' and p_pin is not null then raise exception 'pin_not_allowed'; end if;

  if p_id is null then
    if p_kind = 'guardian' and p_pin is null then raise exception 'pin_required'; end if;
    insert into public.profiles (family_id, kind, name, color, avatar, read_aloud, sounds, reduced_motion)
    values (
      auth.uid(), p_kind, private.clean_name(p_name), p_color, p_avatar, p_read_aloud, p_sounds, p_reduced_motion
    )
    returning * into v_profile;
  else
    update public.profiles p
    set name = private.clean_name(p_name), color = p_color, avatar = p_avatar, read_aloud = p_read_aloud,
        sounds = p_sounds, reduced_motion = p_reduced_motion
    where p.id = p_id and p.family_id = auth.uid()
    returning p.* into v_profile;
    if not found then raise exception 'not_found'; end if;
    if v_profile.kind is distinct from p_kind then raise exception 'kind_immutable'; end if;
  end if;

  if p_pin is not null then
    insert into private.guardian_credentials (profile_id, pin_hash)
    values (v_profile.id, private.pin_hash(p_pin))
    on conflict (profile_id) do update
    set pin_hash = excluded.pin_hash, failed_attempts = 0, locked_until = null;
  end if;
  return v_profile;
end $$;

create function public.archive_profile(p_token text, p_id uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare
  v_guardian uuid := private.require_guardian(p_token);
begin
  -- Serializes archives, so two guardians can't archive each other at the same moment.
  perform 1 from public.families f where f.id = auth.uid() for update;

  update public.profiles p set archived_at = coalesce(p.archived_at, now())
  where p.id = p_id and p.family_id = auth.uid();
  if not found then raise exception 'not_found'; end if;

  if not exists (
    select 1 from public.profiles p
    where p.family_id = auth.uid() and p.kind = 'guardian' and p.archived_at is null
  ) then
    raise exception 'last_guardian';
  end if;
end $$;

create function public.update_family(p_token text, p_name text, p_timezone text) returns public.families
language plpgsql security definer set search_path = '' as $$
declare
  v_guardian uuid := private.require_guardian(p_token);
  v_family public.families;
begin
  perform private.assert_timezone(p_timezone);
  update public.families f set name = private.clean_name(p_name), timezone = p_timezone
  where f.id = auth.uid()
  returning f.* into v_family;
  return v_family;
end $$;

-- Supabase's default privileges give anon and authenticated full access to new tables and functions in public.
revoke all on all tables in schema public from public, anon, authenticated;
grant select on all tables in schema public to authenticated;
revoke all on all functions in schema public from public, anon, authenticated;
grant execute on all functions in schema public to authenticated;
