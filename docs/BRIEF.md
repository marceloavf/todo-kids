# Product brief

Todo Kids serves a family with children using a shared device or their own phones. A guardian plans the day; a child opens a picture, does the task and taps **Fiz!** (I did it). An adult can approve work, explain a retry and administer points. The [glossary](../GLOSSARY.md) defines the terms used here.

## Tasks and the family day

A routine repeats on selected weekdays and has no fixed hour. A guardian controls task order and assignment. A one-off task applies to one date. The server calculates today in the family's time zone. Children assigned the same routine each have their own completions and balance.

Editing a routine affects outstanding work immediately. A completion keeps the point value recorded when it was created. Unfinished work closes at midnight without a deduction. Children cannot backdate completions.

## Review and points

| Event | Result |
| --- | --- |
| Complete an automatically credited task | Record the completion and its points together. A zero-point task still shows completion feedback. |
| Complete a task requiring approval | Show a pending item. A guardian's approval credits the recorded points, including after midnight. |
| Reject a completion | Keep the balance unchanged. A same-day task returns to the board with the guardian's name and optional hint of up to 120 characters. A prior day's task stays unfinished. |
| Undo a completion | A guardian records a reversal in the child's statement. |
| Adjust a balance | Record a signed whole-number amount and a written reason. A debit stops at zero. The statement keeps both requested and actual amounts. |
| Request a reward | Require sufficient points and allow one pending request per child. Record the cost at request time. |
| Confirm a redemption | Check the available balance again and record the debit. If the balance has fallen below the cost, the guardian can refuse the request. |

Points do not expire. The child's balance equals the sum of their statement entries. Transactions and constraints in PostgreSQL preserve these rules when devices submit work concurrently. Archiving profiles, routines, tasks and rewards preserves history.

## Screens

| Audience | Screen | Main action |
| --- | --- | --- |
| Family | Entry and profiles | Sign in, pair a device, choose a shared-device profile or unlock a guardian profile with its PIN. |
| Child | Today | See progress, today's task tiles and balance. Open a card for a short description and up to five illustrated steps. Confirm with a second tap. |
| Child | Rewards | Check costs, available points and pending requests. Confirm a request in the reward card. |
| Guardian | Home | Review pending work and reward requests, approve in bulk, or reject a task with a hint. |
| Guardian | Routines and rewards | Configure recurring and one-off work, point values and the reward catalog. |
| Guardian | Statement | Inspect the child's credits and debits, make a reasoned adjustment or reverse a completion. |
| Guardian | Family | Edit profiles, PINs, avatars, colors, time zone, child preferences and linked devices. |

## Feedback and accessibility

Use large picture tiles, short labels and visible state icons. Tapping outside a card dismisses it. A short delay helps prevent an opening tap from confirming the task. Steps explain the work; each task has one completion. Read-aloud, sounds and reduced motion are configurable per child. Respect the device's reduced-motion setting.

Pending work has a waiting indicator. An immediate completion gives brief feedback, an approval gives a short notice, and finishing the day gives one dismissible celebration. A zero-point task still acknowledges the child's effort. Keep language specific to the action. The [research notes](research/README.md) explain the choices and what to observe with children.

## Release scope

The pilot uses Brazilian Portuguese and requires internet access. Photo proof, push reminders, offline completion, native store distribution, streak bonuses, prize draws, levels, collections and sibling leaderboards are outside its scope. Real-device installation, QR handoff, speech, sound and touch remain important checks for each family's hardware. See the [pilot guide](family-pilot.md) and [architecture decisions](adr/README.md).
