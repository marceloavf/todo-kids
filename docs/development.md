# Development guide

Use Node.js 24 and install the locked dependency versions with `npm ci`. Commands run from the repository root. Vite reads client configuration when it starts or builds. Restart it after changing environment variables.

## Local Supabase

With Docker running, use `npm run db:start`. It starts PostgreSQL, Auth, PostgREST and Realtime and writes local connection settings to `.env.local`. This replaces that file, so keep hosted and local configurations separate. The first start downloads container images. On Windows, Docker Desktop can use the WSL 2 backend.

| Command | Effect |
| --- | --- |
| `npm run dev` | Start the Vite development server. |
| `npm run seed` | Create or refresh the public demo family in the configured database. |
| `npm run db:env` | Refresh local API settings from the running Supabase stack. |
| `npm run db:stop` | Stop local containers and preserve the database. |
| `npm run db:reset` | **Erase local records** and recreate the schema from the migrations. |
| `npm run db:types` | Regenerate the TypeScript database contract from local PostgreSQL. |
| `npm run build` / `npm run preview` | Build the static site in `dist/` and serve that build locally. |
| `npm run emoji:fetch` | Fetch missing SVGs after editing the curated emoji set. |

## Hosted development without Docker

Create an empty Supabase project dedicated to development. Inspect the target and dry run before applying migrations:

```sh
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push --remote --dry-run
npx supabase db push --remote
```

Copy [the example environment file](../.env.example) to `.env.local`. Set `VITE_SUPABASE_URL` to the project's HTTPS endpoint and `VITE_SUPABASE_ANON_KEY` to its publishable or legacy anon key. For the demo seed only, set the server-side `SUPABASE_SERVICE_ROLE_KEY`. Only public client settings belong in variables prefixed with `VITE_`.

Set the Auth Site URL to the URL that will receive sign-in redirects. Enable anonymous sign-ins to exercise child-device pairing. You can use `npm run seed` with a disposable project or create a family through the regular signup flow. Start the client with `npm run dev`. The local database commands and Docker-based integration tests target the local stack.

For a phone on the same network, start Vite with `npm run dev -- --host` and open the computer's LAN address. With a local backend, replace the loopback host in the client's Supabase URL with that LAN address as well. Use HTTPS hosting for installation and QR trials on real devices.

## Source map

| Path | Responsibility |
| --- | --- |
| `src/entry/`, `src/lib/session.tsx` | Sign-in, pairing, profile selection and guardian authorization. |
| `src/child/` | Today, task cards, rewards, read-aloud and completion feedback. |
| `src/guardian/` | Review queue, routines, rewards, points statement and family management. |
| `src/lib/queries.ts`, `src/lib/realtime.ts` | Query cache and refresh after database changes. |
| `supabase/migrations/`, `src/database.types.ts` | Database schema, policies, RPCs and their TypeScript contract. |
| `tests/db/`, `e2e/` | Database integration and browser tests. |
| `prototype/` | Historical interface experiments and screenshots. The deployed client lives in `src/`. |
