# 1. Shared family login and guardian PIN

A family can pass a tablet between adults and children. Requiring each child to manage an email address and password would interrupt that handoff. The shared device signs in once with the family account. Children select their avatars. Each guardian has a personal PIN.

A client-side PIN check would leave privileged database calls accessible with the shared login. PostgreSQL verifies the hashed PIN, limits failed attempts, and issues a random guardian token. The client holds it in memory and sends it with guardian operations. The server keeps its hash, extends its expiry on use, and invalidates it on explicit profile exit. Five failed PIN attempts lock the guardian profile for five minutes. The authorization expires after fifteen minutes of inactivity.

The shared picker allows siblings to select each other's child profiles. Use a [dedicated child device](0004-dedicated-child-devices.md) for unsupervised use. Family isolation and guardian authorization are separate checks.
