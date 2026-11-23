# 2. Installable static web client

The first release needs to reach Android and iPhone from a single URL. Its daily loop uses an internet connection and requires neither push notifications nor camera access inside the app. Vite, React and TypeScript produce a static build that families can add to their Home Screen.

Expo with web export was the strongest alternative. A native runtime and store distribution would add build, signing and installation work before the family could test the routine. A future need for native APIs or store distribution would justify revisiting Expo or a Capacitor wrapper. Store acceptance of a wrapped website would still need evaluation.

Use HTTPS and test installation on real phones. Safari and the iPhone Home Screen app can have separate login state; redeem a child's code in the intended session. [Client platform research](../research/client-platform.md)
