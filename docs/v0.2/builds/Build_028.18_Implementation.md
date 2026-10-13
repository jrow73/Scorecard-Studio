# Build 028.18 - Toolbar Popover Dismissal

## Scope
This decimal build is intentionally limited to the Designer toolbar Paste and Zoom mini-popovers.

1. Paste and Zoom are mutually exclusive: opening one closes the other.
2. Clicking anywhere outside an open Paste/Zoom popover closes it.
3. Re-clicking the toolbar summary keeps the native toggle behavior.
4. Zoom **Reset** resets to 100% and closes the Zoom popover.
5. Zoom -, +, and other interactions inside the active popover do not dismiss it prematurely.
6. Paste action buttons retain their existing behavior and close the Paste popover when placement begins.

## Acceptance
- Paste and Zoom cannot remain open at the same time.
- An outside click dismisses whichever toolbar popover is open.
- Zoom Reset closes Zoom after returning to 100%.
- Multiple zoom-in/zoom-out clicks can be made without the Zoom popover closing.
- Existing clipboard placement behavior is unchanged.
