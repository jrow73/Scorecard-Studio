# Scorecard Studio v0.4 — Compact UI Component Contract

**Status:** Authoritative for Build 004 implementation  
**Applies to:** new or materially revised Build 004 interface work

## 1. Hierarchy rules

1. A page has one clear title and one primary task region.
2. Use an elevated card for an independent object or task, not as a generic wrapper around every heading.
3. Do not place a decorative card inside another decorative card. Within a task surface, prefer headings, dividers, aligned rows, semantic tables, or `details` disclosures.
4. Keep the primary action beside the object or decision it affects.
5. Do not reveal the next step by silently scrolling to a distant region.
6. Reserve pills for concise state, not ordinary metadata or engineering success messages.
7. Preserve whitespace needed for scanning, but do not stack page padding, card padding, subsection padding, and cell padding around the same content.

## 2. Shared primitives

Build 004 implementations should converge on these conceptual primitives even when existing class names must be migrated incrementally:

| Primitive | Use | Avoid |
|---|---|---|
| Page header | Title, concise description, page-level primary action | Build identifiers, source success, large empty framing |
| Toolbar | Search, filters, view switches, bulk actions | Paragraph-length help or unrelated settings |
| Record row/card | One saved layout or one game choice with local actions | A single action detached at the opposite edge on very wide screens |
| Section | Related content separated by heading/rule/spacing | Another elevated card solely to create padding |
| Disclosure | Optional detail, advanced fields, or collapsible categories | Hiding the only route to a primary action |
| Data table/list | Repeated comparable values | Individual bordered cells for every label/value pair |
| Status message | Actionable progress, empty state, warning, or failure | Expected “API loaded” or “storage ready” noise in primary content |
| Modal frame | One focused interrupting workflow | Opening a second differently sized modal over the first |

## 3. Density and sizing

- Define compact shared spacing variables rather than continuing page-specific pixel accumulation.
- Default controls retain comfortable pointer and keyboard targets even when surrounding chrome becomes denser.
- Long-form research tables may scroll within their section; the page itself must not gain horizontal overflow.
- Headers and footers of long modal workflows remain visible while the body scrolls.
- Dialog width and viewport bounds are determined by the workflow family, not by the amount of content in the current internal step.
- A narrow viewport changes arrangement, not content ownership or action meaning.

## 4. Navigation contract

- Desktop exposes Home, Game Day, Layouts, and Settings in one compact application header.
- Narrow presentation exposes the same four destinations without horizontal page overflow.
- Current destination uses `aria-current="page"` and remains visually distinct in both themes.
- Designer displays layout identity and a clear return to Layouts; it is not in primary navigation.
- The skip link remains the first page-level keyboard destination and targets the main content landmark.
- Moving between primary views does not masquerade as scrolling within one page.

## 5. Search and filtering

- Search filters already-loaded collections immediately and case-insensitively.
- Search never triggers schedule hydration, layout mutation, or API calls unless explicitly labeled as server search.
- The unfiltered count and visible count remain understandable.
- A zero-match state differs from a truly empty collection.
- Clearing search restores the prior collection without altering selection.
- Hidden filtered items remain selected only when that persistence is safe and clearly represented; otherwise selection is cleared deliberately and announced.

For Home, filtering never chooses a game. For Field Palette, filtering never clears enabled fields merely because they are hidden from the filtered view.

## 6. Progressive workflow rules

- A workflow begins with a clear action such as Create Layout or Import Backup rather than an always-expanded form.
- Each step presents only the choices required for that step plus enough context to understand consequences.
- Back preserves a valid draft. Cancel exits without writes. Save/Confirm communicates the actual write boundary.
- Successful completion returns to the owning surface and makes the result visible without forcing the user to hunt for it.
- Workflows that fit one modal use one modal shell with internal steps; they do not open nested dialog surfaces.

## 7. Layout Settings frame

- The summary and each editor occupy the same dialog shell.
- The shell owns one header, one scrollable body, and one footer.
- Summary actions use clear section names rather than repeated generic “Open” labels where space permits.
- Internal editor transitions update the accessible dialog title.
- Focus moves to the internal heading on transition and returns to the invoking section when navigating Back.
- Escape and close behavior respect dirty-state confirmation.

## 8. Home/Away mirrored field selection

- Pairing is derived ahead of interaction from registry definitions with equivalent semantic suffixes and opposite team side.
- The pair map is complete and duplicate-free before mirrored selection is enabled.
- Mirroring defaults on because symmetric scorecards are the common workflow.
- The control label states the action plainly: “Mirror Home and Away selections.”
- With mirroring on, selecting or clearing one field performs the same operation on its verified counterpart in one state update.
- With mirroring off, only the activated field changes.
- Unpaired fields never block selection and never use guessed counterparts.
- Existing asymmetric selections are preserved when the toggle changes.
- The UI reports both resulting changes through visible state and an accessible status when necessary.

## 9. Game Day detail levels

- Compact, Standard, and Advanced form an additive hierarchy.
- Every displayed datum maps to an active field disposition or an explicitly accepted unregistered Game Day family.
- A maintained membership definition—not scattered DOM conditionals—controls which sections or columns appear at each level.
- Standard is the initial default for a user with no saved choice.
- The last choice is stored as an ordinary `appPreferencesV1` property and restored by complete backup.
- Switching level is immediate and does not refetch the game.
- Season context can prioritize, relabel, or mark unavailable content but cannot mutate the saved level.
- Empty or unavailable data receives a short user explanation; raw source outcome codes are excluded from ordinary presentation.

## 10. Status and diagnostic language

Show:

- loading when the user is waiting on an action;
- a success confirmation after a user-initiated write or download;
- a warning when output may be incomplete;
- a failure with a useful recovery action; and
- truthful empty/unavailable states.

Do not show as primary content:

- “API loaded” confirmations;
- normal IndexedDB readiness;
- schema/build identifiers;
- internal source names without user relevance; or
- diagnostics whose only audience is a developer.

Build identity remains available for support in a quiet global location. Detailed source availability remains testable and may be exposed through an intentional diagnostic disclosure if later required.

## 11. Appearance, accessibility, and motion

- Every new primitive uses the existing semantic theme tokens in both Light and Dark modes.
- Keyboard focus remains visible; source order follows visual order.
- Icon-only actions require accessible names and tooltips where useful.
- Disclosure controls expose expanded state through native semantics or `aria-expanded`.
- Status changes use restrained live regions and do not announce every filtering keystroke redundantly.
- Reduced-motion behavior remains honored. Workflow transitions do not depend on animation for meaning.
- Pointer targets remain usable after visual compaction.

## 12. Compatibility rule

Build 004 is a presentation and workflow revision. UI state may be added through the ordinary preference contract, but existing application data remains authoritative. A visual redesign must not require users to recreate layouts, reattach PDFs, choose pitcher groups again, or produce a new backup format.
