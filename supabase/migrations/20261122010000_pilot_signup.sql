-- Enable as the Before User Created hook only for a provisioned, single-family pilot.
create function public.pilot_signup_hook(event jsonb) returns jsonb
language sql immutable set search_path = '' as $$
  select case when event->'user'->>'is_anonymous' = 'true' then '{}'::jsonb
    else jsonb_build_object('error', jsonb_build_object(
      'http_code', 403, 'message', 'O cadastro desta família é feito pelo responsável pelo piloto.'
    )) end
$$;
revoke all on function public.pilot_signup_hook(jsonb) from public, anon, authenticated;
grant execute on function public.pilot_signup_hook(jsonb) to supabase_auth_admin;
