-- Starter catalog snapshot from scripts/pilot-content.ts.
create function private.seed_family_starters(p_family_id uuid) returns void
language plpgsql set search_path = '' as $$
declare
  v_children uuid[];
  v_day date;
  v_routine jsonb;
  v_routine_id uuid;
  v_position integer;
  v_routines constant jsonb := $catalog$[
    {"name":"Manhã","weekdays":[0,1,2,3,4,5,6],"tasks":[{"name":"Arrumar a cama","icon":"🛏️","description":"Deixe a cama pronta para a próxima noite.","points":5,"steps":[{"text":"Estique o lençol","emoji":"🛏️"},{"text":"Puxe o cobertor","emoji":"🛏️"},{"text":"Ponha o travesseiro no lugar","emoji":"💤"}],"requiresApproval":false},{"name":"Vestir a roupa","icon":"👕","description":"Troque o pijama pela roupa do dia.","points":5,"steps":[{"text":"Vista a roupa que você separou","emoji":"👕"},{"text":"Dobre o pijama ou leve ao cesto","emoji":"🧺"}],"requiresApproval":false},{"name":"Tomar café da manhã","icon":"🥣","description":"Depois do café, ajude a deixar a mesa livre.","points":0,"steps":[{"text":"Sente à mesa para o café","emoji":"🥣"},{"text":"Leve seu prato à pia quando terminar","emoji":"🍽️"}],"requiresApproval":false},{"name":"Escovar os dentes","icon":"🪥","description":"Escove os dentes depois do café.","points":5,"steps":[{"text":"Coloque a pasta na escova","emoji":"🪥"},{"text":"Escove por fora, por dentro e em cima","emoji":"🦷"},{"text":"Cuspa a pasta e guarde a escova","emoji":"🚰"}],"requiresApproval":false}]},
    {"name":"Antes da escola","weekdays":[1,2,3,4,5],"tasks":[{"name":"Conferir a mochila","icon":"🎒","description":"Confira se você tem o material para hoje.","points":5,"steps":[{"text":"Olhe a agenda do dia","emoji":"📒"},{"text":"Confira os cadernos e o estojo","emoji":"📚"},{"text":"Coloque a lancheira e feche a mochila","emoji":"🎒"}],"requiresApproval":false},{"name":"Calçar os sapatos","icon":"👟","description":"Deixe os sapatos prontos para sair.","points":0,"steps":[{"text":"Encontre o par de sapatos","emoji":"👟"},{"text":"Calce e feche os sapatos","emoji":"👟"}],"requiresApproval":false}]},
    {"name":"Depois da escola","weekdays":[1,2,3,4,5],"tasks":[{"name":"Guardar a mochila","icon":"🎒","description":"Deixe a mochila no lugar dela quando chegar.","points":5,"steps":[{"text":"Tire a lancheira e leve à cozinha","emoji":"🍱"},{"text":"Guarde a mochila no lugar de sempre","emoji":"🎒"}],"requiresApproval":false},{"name":"Fazer a lição","icon":"📚","description":"Veja o que tem para hoje e peça ajuda se precisar.","points":10,"steps":[{"text":"Abra a agenda","emoji":"📒"},{"text":"Faça a atividade de hoje","emoji":"✏️"},{"text":"Mostre a atividade a um adulto","emoji":"👀"}],"requiresApproval":true},{"name":"Guardar os brinquedos","icon":"🧸","description":"Deixe espaço livre para andar depois de brincar.","points":10,"steps":[{"text":"Recolha os brinquedos do chão","emoji":"🧸"},{"text":"Guarde cada um no seu lugar","emoji":"📦"},{"text":"Confira se o caminho ficou livre","emoji":"👀"}],"requiresApproval":true},{"name":"Dar comida ao cachorro","icon":"🐶","description":"Use a porção que um adulto separou.","points":5,"steps":[{"text":"Pegue a porção separada","emoji":"🥣"},{"text":"Ponha a ração no pote","emoji":"🐶"},{"text":"Confira a água com um adulto","emoji":"💧"}],"requiresApproval":false}]},
    {"name":"Antes de dormir","weekdays":[0,1,2,3,4,5,6],"tasks":[{"name":"Tomar banho","icon":"🚿","description":"Separe o que vai usar antes de entrar no banho.","points":0,"steps":[{"text":"Pegue a toalha e o pijama","emoji":"👕"},{"text":"Tome banho com ajuda se precisar","emoji":"🚿"},{"text":"Pendure a toalha","emoji":"🧺"}],"requiresApproval":false},{"name":"Colocar o pijama","icon":"👕","description":"Vista o pijama e guarde a roupa do dia.","points":5,"steps":[{"text":"Vista o pijama","emoji":"👕"},{"text":"Ponha a roupa usada no cesto","emoji":"🧺"}],"requiresApproval":false},{"name":"Escovar os dentes à noite","icon":"🪥","description":"Escove os dentes antes de deitar.","points":5,"steps":[{"text":"Coloque a pasta na escova","emoji":"🪥"},{"text":"Escove por fora, por dentro e em cima","emoji":"🦷"},{"text":"Cuspa a pasta e guarde a escova","emoji":"🚰"}],"requiresApproval":false},{"name":"Ler uma história","icon":"📖","description":"Escolha uma história para ler ou ouvir.","points":0,"steps":[{"text":"Escolha um livro","emoji":"📚"},{"text":"Leia ou peça para alguém ler com você","emoji":"📖"},{"text":"Guarde o livro quando terminar","emoji":"📚"}],"requiresApproval":false}]},
    {"name":"Fim de semana","weekdays":[0,6],"tasks":[{"name":"Guardar as roupas dobradas","icon":"🧺","description":"Ajude a guardar suas roupas limpas.","points":10,"steps":[{"text":"Separe suas roupas da pilha","emoji":"👕"},{"text":"Guarde cada peça na gaveta certa","emoji":"🧺"}],"requiresApproval":false},{"name":"Regar as plantas","icon":"🪴","description":"Pergunte a um adulto quais plantas precisam de água.","points":5,"steps":[{"text":"Veja quais vasos precisam de água","emoji":"👀"},{"text":"Coloque um pouco de água na terra","emoji":"💧"}],"requiresApproval":false},{"name":"Organizar os livros","icon":"📚","description":"Deixe os livros fáceis de encontrar.","points":5,"steps":[{"text":"Junte os livros que ficaram espalhados","emoji":"📖"},{"text":"Coloque os livros na estante","emoji":"📚"}],"requiresApproval":false}]}
  ]$catalog$;
  v_one_offs constant jsonb := $catalog$[
    {"daysFromToday":0,"task":{"name":"Pôr a mesa","icon":"🍽️","description":"Prepare um lugar para cada pessoa que vai comer.","points":10,"steps":[{"text":"Pergunte quantas pessoas vão comer","emoji":"👀"},{"text":"Coloque os pratos e os talheres","emoji":"🍽️"},{"text":"Ponha um copo em cada lugar","emoji":"🥛"}],"requiresApproval":false}},
    {"daysFromToday":2,"task":{"name":"Separar papel para reciclar","icon":"♻️","description":"Ajude a separar papéis limpos para a coleta.","points":10,"steps":[{"text":"Junte o papel e o papelão limpos","emoji":"📦"},{"text":"Leve tudo ao cesto da reciclagem","emoji":"♻️"}],"requiresApproval":true}}
  ]$catalog$;
  v_rewards constant jsonb := $catalog$[
    {"name":"Escolher a música","icon":"🎹","cost":15},
    {"name":"Escolher o jogo em família","icon":"🧩","cost":25},
    {"name":"Desenhar juntos","icon":"🎨","cost":35},
    {"name":"Escolher o jantar","icon":"🍕","cost":45},
    {"name":"Sorvete","icon":"🍦","cost":50},
    {"name":"Soltar pipa juntos","icon":"🪁","cost":65},
    {"name":"30 minutos de videogame","icon":"🎮","cost":80},
    {"name":"Cinema em casa","icon":"🎬","cost":100},
    {"name":"Passeio de bicicleta","icon":"🚲","cost":120},
    {"name":"Passeio no parque","icon":"🛝","cost":150}
  ]$catalog$;
begin
  select (now() at time zone f.timezone)::date into v_day
  from public.families f where f.id = p_family_id
  for no key update;

  select array_agg(p.id order by p.id) into v_children
  from public.profiles p
  where p.family_id = p_family_id and p.kind = 'child' and p.archived_at is null;

  if v_children is null then return; end if;

  select coalesce(max(position) + 1, 0) into v_position
  from public.routines where family_id = p_family_id;

  for v_routine in select value from jsonb_array_elements(v_routines) loop
    if exists (
      select 1 from public.routines
      where family_id = p_family_id and name = v_routine->>'name'
    ) then continue; end if;

    insert into public.routines (family_id, name, weekdays, child_ids, position)
    values (
      p_family_id, v_routine->>'name',
      array(select value::smallint from jsonb_array_elements_text(v_routine->'weekdays')),
      v_children, v_position
    ) returning id into v_routine_id;
    v_position := v_position + 1;

    insert into public.tasks (family_id, routine_id, name, icon, description, steps, points, requires_approval, position)
    select p_family_id, v_routine_id, t.name, t.icon, t.description, t.steps, t.points, t."requiresApproval",
           item.ordinality - 1
    from jsonb_array_elements(v_routine->'tasks') with ordinality as item(value, ordinality)
    cross join lateral jsonb_to_record(item.value) as t(
      name text, icon text, description text, steps jsonb, points int, "requiresApproval" boolean
    );
  end loop;

  select coalesce(max(position) + 1, 0) into v_position
  from public.tasks where family_id = p_family_id and routine_id is null;

  insert into public.tasks
    (family_id, one_off_date, child_ids, name, icon, description, steps, points, requires_approval, position)
  select p_family_id, v_day + (o.value->>'daysFromToday')::int, v_children,
         t.name, t.icon, t.description, t.steps, t.points, t."requiresApproval", v_position + o.ordinality - 1
  from jsonb_array_elements(v_one_offs) with ordinality as o(value, ordinality)
  cross join lateral jsonb_to_record(o.value->'task') as t(
    name text, icon text, description text, steps jsonb, points int, "requiresApproval" boolean
  )
  where not exists (
    select 1 from public.tasks existing
    where existing.family_id = p_family_id and existing.routine_id is null and existing.name = t.name
  );

  insert into public.rewards (family_id, name, icon, cost)
  select p_family_id, r.name, r.icon, r.cost
  from jsonb_to_recordset(v_rewards) as r(name text, icon text, cost int)
  where not exists (
    select 1 from public.rewards existing where existing.family_id = p_family_id and existing.name = r.name
  );
end
$$;

create function private.seed_first_child_starters() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  perform 1 from public.families where id = new.family_id for no key update;

  if not exists (
    select 1 from public.profiles
    where family_id = new.family_id and kind = 'child' and archived_at is null and id <> new.id
  ) then
    perform private.seed_family_starters(new.family_id);
  end if;
  return new;
end
$$;

revoke all on function private.seed_family_starters(uuid) from public, anon, authenticated;
revoke all on function private.seed_first_child_starters() from public, anon, authenticated;

create trigger seed_first_child_starters
after insert on public.profiles
for each row when (new.kind = 'child' and new.archived_at is null)
execute function private.seed_first_child_starters();

do $$
declare
  v_family_id uuid;
begin
  for v_family_id in
    select distinct family_id from public.profiles where kind = 'child' and archived_at is null
  loop
    perform private.seed_family_starters(v_family_id);
  end loop;
end
$$;
