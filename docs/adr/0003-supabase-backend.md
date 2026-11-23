# 3. Supabase backend

Store household data, approvals and point transactions in PostgreSQL. Supabase supplies Auth, the database API and Realtime. The client reads permitted rows and calls server functions to write. Crediting a completion and updating the child's balance belong in one transaction.

Convex was attractive for TypeScript and reactive queries. PostgreSQL offered familiar constraints, row policies and a portable ledger, and matched the project's preference for open-source infrastructure. The trade-off is maintaining SQL and PL/pgSQL alongside the TypeScript client.

Local development uses Supabase in Docker. Hosted deployments need a reachable backend even when the site has been installed on a phone. Check the host's current inactivity, backup and quota policies before using it for a family. [Backend research](../research/backend-and-sync.md)
