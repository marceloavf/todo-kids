# Development guide

Use Node.js 24 and install the locked dependency versions with `npm ci`. Commands run from the repository root. Vite reads client configuration when it starts or builds. Restart it after changing environment variables.

## Local Supabase

With Docker running, use `npm run db:start`. It starts PostgreSQL, Auth, PostgREST and Realtime and writes local connection settings to `.env.local`. This replaces that file, so keep hosted and local configurations separate. The first start downloads container images. On Windows, Docker Desktop can use the WSL 2 backend.

| Command | Effect |
| --- | --- |
| `npm run dev` | Start the Vite development server. |
| `npm run seed` | Create or refresh the demo family in local Supabase. |
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

Copy [the example environment file](../.env.example) to `.env.local`. Set `VITE_SUPABASE_URL` to the project's HTTPS endpoint and `VITE_SUPABASE_ANON_KEY` to its publishable or legacy anon key. Only public client settings belong in variables prefixed with `VITE_`.

Set the Auth Site URL to the URL that will receive sign-in redirects. Enable anonymous sign-ins to exercise child-device pairing. Start the client with `npm run dev`. The local database commands and Docker-based integration tests target the local stack.

For a phone on the same network, start Vite with `npm run dev -- --host` and open the computer's LAN address. With a local backend, replace the loopback host in the client's Supabase URL with that LAN address as well. Use HTTPS hosting for installation and QR trials on real devices.

## Seed hosted Supabase from GitHub Actions

1. Apply the migrations to a dedicated Supabase demo project. In **Authentication > Users**, create a confirmed email and password user for the demo family.
2. In GitHub **Settings > Environments**, create `supabase-demo`. Under **Deployment branches and tags**, allow only the `main` branch.
3. Add the following environment settings. Copy the project URL and publishable key from the Supabase Connect dialog.

   | Type | Name | Value |
   | --- | --- | --- |
   | Variable | `SUPABASE_URL` | HTTPS project URL |
   | Variable | `SUPABASE_PUBLISHABLE_KEY` | Project's `sb_publishable_…` key |
   | Secret | `SEED_GUARDIAN_EMAIL` | Confirmed demo user's email |
   | Secret | `SEED_GUARDIAN_PASSWORD` | Demo user's password |
   | Secret | `SEED_GUARDIAN_PIN` | Four digits. Use the existing guardian PIN if the family already exists. |

4. In **Actions > Seed Supabase demo**, select **Run workflow** on `main`.

The workflow signs in as the demo user and writes through the app's guardian RPCs under that account. It creates the family on the first run if needed. Later runs refresh matching catalog entries and add dated tasks for the current seed dates. Use a dedicated demo account because the workflow updates matching routines, tasks, and rewards.

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
