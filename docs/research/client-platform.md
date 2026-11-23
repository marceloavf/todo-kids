# Client platform

The first distribution test is a guardian opening a link on two phones. An installable static client makes that possible with one build. The backend owns the day, permissions and point transactions, so both devices observe the same rules.

| Option considered | Trade-off for this project |
| --- | --- |
| Vite web app | Smallest distribution workflow for the pilot. Installation, audio, speech and storage behavior still vary by browser. |
| Capacitor and Ionic | A path to native APIs and stores when needed. Packaging introduces native projects and signing work. |
| Expo and React Native | Attractive if stores become the primary target. Web export adds a second platform to validate. |
| Flutter | Shared rendering across platforms, with an additional runtime and a different UI toolchain. |

QR redemption illustrates why browser testing matters. Scanning a code in Safari and opening the Home Screen app can land in separate sessions. A deployment should test the complete handoff on the intended phone. The manifest supplies installation metadata; the current app requires connectivity.

Sources: [Expo environments](https://docs.expo.dev/get-started/set-up-your-environment/), [Capacitor plugins](https://github.com/ionic-team/capacitor-plugins), [WebKit](https://webkit.org/), [original comparison and platform evidence](https://github.com/marceloavf/todo-kids/blob/f854579/docs/research/framework-do-app.md).
