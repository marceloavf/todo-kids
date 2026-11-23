# Todo Kids

Todo Kids helps families manage daily routines on a shared tablet or a child's own phone. A guardian sets up tasks and rewards. A child taps a picture, follows the steps and marks the task complete. The guardian can review the work from another device. Each child has a separate points balance.

The app is in Brazilian Portuguese. This repository includes the React client, Supabase migrations, and tests for the database rules and both device flows. The [hosted family pilot](https://marceloavf.github.io/todo-kids/) requires a provisioned account. To explore the app with sample data, run it locally.

## Run the demo

Install Node.js 24 and start Docker. From the repository root, run:

```sh
npm ci
npm run db:start
npm run seed
npm run dev
```

Open the URL printed by Vite, usually `http://localhost:5173`. Sign in with `demo@todokids.local` and password `todokids-demo`. Select a child to see today's tasks, or select the guardian and enter PIN `1234` to edit the routines. These credentials are public and intended for disposable development data.

The seed creates two demo children, five routines, 17 recurring tasks, two dated tasks and ten rewards. Weekday and weekend routines follow the family calendar. Running it again refreshes matching demo records. Use `npm run db:stop` to stop the containers and keep your data.

## Try a child's own device

On the guardian's device, open **Família** (Family), select the child, then choose **Vincular aparelho** (Link device). On the child's device, open the same deployment and choose **Tenho um código** (I have a code), or scan the QR code. Once paired, the device opens directly in that child's profile. A guardian can revoke it from the same Family screen. [Device setup and pilot guide](docs/family-pilot.md)

## Project guide

| If you want to… | Start here |
| --- | --- |
| Set up a development environment, including without Docker | [Development guide](docs/development.md) |
| Run checks or submit a change | [Contributing](CONTRIBUTING.md) |
| Understand task approvals, balances and rewards | [Product brief](docs/BRIEF.md) and [glossary](GLOSSARY.md) |
| Understand the client, database and authentication decisions | [Architecture decisions](docs/adr/README.md) |
| Explore the design research behind the child interface | [Research notes](docs/research/README.md) |
| Host your own family pilot | [Deployment and first trial](docs/family-pilot.md) |

## License

Original project code and documentation are available under the [MIT License](LICENSE). Bundled emoji, sounds, icons and fonts retain their upstream licenses. See [third-party notices](THIRD_PARTY_NOTICES.md) for credits and redistribution notices.
