# 4. Dedicated child devices

A child using a personal phone should open directly in their own profile. Putting the family credentials on that phone would expose the shared picker and sibling activity. A QR that merely signs in to the family account would have the same problem and would make individual revocation difficult.

The child device signs in anonymously. A guardian requests a single-use code for one child; the QR contains the same code. The database stores the code hash, expiry and issuing guardian. Redemption binds that anonymous identity to the child. A family can link multiple devices to the same child.

Row policies and server functions enforce the link. A device can read shared routines, tasks, rewards and guardian profiles, plus its own child's profile, completions, redemptions and statement. Guardian operations require separate authorization. Revoking a device removes its access even when it still holds an issued token. Archiving a child removes their links.

Codes expire after ten minutes and a replacement supersedes the old code. Five failed attempts discard the anonymous login. On iPhone, defer redemption from Safari to the installed app so the browser cannot consume the code for the wrong session. [Pairing instructions](../family-pilot.md#pair-a-phone-or-tablet)
