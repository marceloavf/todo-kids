# Run a family pilot

## Prepare the deployment

1. Create a dedicated Supabase project and apply the migrations using the [hosted development instructions](development.md#hosted-development-without-docker). Run the full local database and browser suites before sharing the release.
2. Provision a confirmed guardian email/password account through Supabase Auth. The guardian chooses the family name, display name and PIN in the app on first sign-in. Use a private password and PIN. Keep the demo seed confined to development.
3. Enable anonymous sign-ins for child devices. For a closed pilot, configure the **Before User Created** Auth hook to call `public.pilot_signup_hook`. It allows anonymous device creation and declines new public family signups. Keep Auth signups enabled so a child can obtain its anonymous identity.
4. Set the Auth Site URL to the final HTTPS address, including the project path on GitHub Pages. Build with `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (public key) and `VITE_FAMILY_PILOT=true`. The last flag hides the public signup form. The backend hook enforces the restriction.
5. Run `npm ci` and `npm run build`; publish the contents of `dist/` to your static host. Vite uses relative asset paths and the app uses hash routes. Retain the previous build for rollback. Database migrations and existing point entries have their own lifecycle.

## Set up the first routine

On the guardian's device, sign in and enter the guardian profile with its PIN. Check the family time zone before adding the first child in **Família** (Family). The app adds starter routines, tasks, and rewards for the first child. The migration also adds missing starters to existing families with active child profiles. Edit the defaults in **Rotinas** (Routines) and **Recompensas** (Rewards), and assign the routines to additional children as needed.

## Pair a phone or tablet

1. On the guardian's device, open **Família**, select the child, and tap **Vincular aparelho** (Link device).
2. On the child's device, scan the QR or open the site, tap **Tenho um código** (I have a code), and enter the six characters. A code expires after ten minutes. Generating another invalidates the earlier code.
3. On iPhone, a QR opened in Safari shows installation instructions. Add the app to the Home Screen, open it there, and enter the code. This keeps the session in the app the child will actually use.
4. Close and reopen the linked app. It should open **Hoje** (Today) for that child. A guardian can remove an individual device with **Desvincular** (Unlink). Archiving a child removes all of that child's links.

## Rehearse the daily loop

Use fictional profiles first. Complete a task on the child's device, approve it on the guardian's, and check the points on both. Request and confirm a reward, then check the statement and the sibling's balance. Test reconnecting after a network interruption and unlinking one device while another remains paired.

During the first family session, watch whether the child recognizes the pictured action, understands that approval is pending, and notices when points arrive. Record the device and the exact step if something is confusing. Desktop touch emulation does not cover camera scanning, Home Screen storage, speech voices or haptics on the family's phones.

## Release the dated completion contract

Coordinate the client build with migration `20261123010000_completion_day` during a quiet period. Apply the forward migration, publish the matching build, and reopen any already-open shared tablet or child app. An older client calls the retired two-argument function and its submission fails safely. After refresh, reopen the current task and confirm once. Check the statement before repeating an action whose response was interrupted. Use this client and schema as a pair when rehearsing rollback.

The release workflow first runs the development signup scenarios. It then provisions a fictional guardian on the runner, restarts the local Auth service with the pilot hook enabled, and exercises the closed production build. This verifies the repository configuration and does not inspect the hosted project's settings.

## Restore access during the pilot

The pilot operator who provisioned the account handles guardian account recovery through Supabase Auth. Keep a private contact route available to the participating guardian. For lost child-device storage, open the guardian profile on a trusted device, revoke the old link in **Família**, and issue a new code for the same child. The new link uses the existing routines, statement and balance.

For the release record, capture the build revision, latest applied migration, device and OS, family timezone, the task tested, and the expected and observed outcomes. Use fictional names for the rehearsal. Record the results of camera pairing, Home Screen reopening, VoiceOver or TalkBack navigation, and a disconnected device returning to the correct family day. Have the guardian reorder two tasks and ask the child which comes next. Record actual observations before changing the board again.
