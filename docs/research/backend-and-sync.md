# Backend and synchronization

A child may finish a task while a guardian is reviewing the same day on another phone. The backend must decide which family and child can act, prevent duplicate credit, and update the statement and balance atomically. Realtime events prompt clients to refetch; the database remains authoritative after reconnecting.

The survey considered Supabase, Convex, PocketBase, Appwrite, Firebase and a small custom service. Supabase matched the desired relational model and supplied authentication and change subscriptions. Convex offered simpler reactive TypeScript code but different licensing and data-model trade-offs. PocketBase would shift hosting and operations to the family or maintainer. A custom service would also need an identity, authorization and synchronization implementation.

When reconsidering the backend, test concurrent completion and redemption, cross-family isolation, recovery after disconnection, and the actual effort of restoring data. Hosting prices and service limits in the historical survey were observations at the time.

Sources: [Supabase documentation](https://supabase.com/docs), [Convex backend](https://github.com/convex/convex-backend), [PocketBase](https://github.com/pocketbase/pocketbase), [original comparison and cost assumptions](https://github.com/marceloavf/todo-kids/blob/f854579/docs/research/backend-e-sincronizacao.md).
