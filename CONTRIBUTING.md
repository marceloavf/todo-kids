# Contributing

For a bug report, describe the device, browser, steps, expected result and what you observed. Say whether it happened on a shared family device or a paired child device. Use fictional names and sample tasks in reports and screenshots. Keep passwords, PINs, pairing codes, service keys and family records out of issues and pull requests.

## Before opening a pull request

1. Follow the [development guide](docs/development.md) to install the dependencies and start local Supabase.
2. Make the change through the normal user flow. Keep documentation in English and user-facing app strings in Brazilian Portuguese. Check the [glossary](GLOSSARY.md) when naming domain concepts.
3. Run the checks below. In the pull request, describe the change, how you tested it, and any device or environment you could not check.

```sh
npm run lint
npm run typecheck
npm test
npm run build
npm run e2e
```

The full test suite needs local Supabase. Database fixtures create disposable families, and some tests invoke PostgreSQL through Docker. Playwright uses installed Google Chrome and serves a production build on port 4319. It exercises both a shared device and separate guardian and child sessions. For a quick check without Docker, run `npx vitest run src tests/db/error-keys.test.ts`.

## Database changes

Add a new migration for a deployed schema change. Specify table and function privileges explicitly, enable row-level security for exposed tables, and check both family and paired-device access. Keep privileged writes in server functions. A child device should only be able to act for its linked child.

Regenerate the types with `npm run db:types`. When an RPC introduces an application error, update the error key list and its Portuguese message. Exercise same-family, other-family and unpaired-device cases where relevant. Use disposable local data for schema resets.

## Assets

Record the upstream source, license and modifications when adding assets. Include the required notices in the distributed build. See [third-party notices](THIRD_PARTY_NOTICES.md).
