# Build 028 — Designer Cleanup, Workflow Polish, and Closure

## Baseline

Build 027 Final (`Scorecard-Studio_v0.2.0_Build027_Final.zip`). Build 028 was completed through Build 028.20.

## Final accepted scope

Build 028 became the main Designer cleanup and workflow-polish phase before the remaining v0.2.0 completion builds. The accepted final state includes the following work.

### Date presentation and representative-data cleanup

- Direct Game Date placements support a per-placement Date Format using `D`, `DD`, `M`, `MM`, `MMM`, `MMMM`, `Y`, `YY`, and `YYYY` tokens.
- Default Game Date presentation remains `M/D/YYYY`.
- Date Format is shown only for Game Date placements.
- Representative player-name semantics were reviewed so formal First Name, Use Name, Full Name, First Initial + Last Name, and Boxscore Name exercise the intended distinctions. The representative-data review passed without requiring a dedicated Build 028.12 code package.

### Palette and placement workflows

- Palette used-state presentation was simplified: a green-tinted border indicates a used field/object, while a chevron indicates expandable placed instances. The former right-side `Available` / instance-count text and placed checkmarks were removed.
- Defensive Alignment is a first-class Away/Home Player palette object.
- Starting Lineup routes directly to Repeated Layout.
- Starting Pitcher routes directly to Record Layout. Whole-record Starting Pitcher Text Template creation was removed; child fields may still be placed as Text Templates.
- Defensive Alignment routes directly to Individual Placement.
- Bench and Bullpen route directly to Repeated Layout.
- First-item Individual Placement uses progressive reveal; subsequent items retain the efficient fully populated continuation workflow.

### Inspector and formatting polish

- Formatting remains a collapsible section within Selected Item and uses the standard chevron interaction.
- X/Y and typography controls were compacted and constrained to the Inspector width.
- Current Defaults / Restore Defaults and formatting groups were reorganized with clearer separators.
- Text Template editor, Preview, field selector, and Insert Field controls remain above the Formatting section.
- Create New Item / Remove Item and other secondary Inspector actions use the compact Selected Object button language.
- Repeated Layout Change Placement is grouped with layout actions above the divider; Create New Item remains below the divider.

### Starting Pitcher context and conditional formatting

- Starting Pitcher Record Layout, Single Item, and Starting-Pitcher-derived Text Template placements retain the correct Away/Home Starting Pitcher context.
- Single Item and Starting-Pitcher-derived Text Template placements inherit pitcher conditional formatting correctly, including Restore Defaults.
- Starting-Pitcher-derived Text Template field selection is scoped to the matching Starting Pitcher record.
- Generic Text Templates remain generic and do not inherit Starting Pitcher context merely because they contain Starting Pitcher tokens.

### Team Information Text Template context

- Text Templates created from Away/Home Team Information fields retain their originating side and Team Information context.
- Their field selector is scoped to the matching team side.
- Palette ownership and Away/Home contextual copy/paste remain intact.
- Generic Text Templates remain unrestricted and context-free.

### Repeated collection sorting

- Bench and Bullpen Repeated Layouts support optional per-block sorting.
- Sort choices are derived from sensible fields available to the collection rather than a fixed preset list.
- Numeric/text behavior is type-aware; Jersey # receives numeric treatment and Player Name sorts by Last Name.
- Blank values remain at the bottom; equal values retain source order.
- Sorting is stored independently per repeated-layout instance.
- Ordinary fields, Text Templates, mixed-content rows, handedness formatting, Representative preview, Test PDF, and live PDF share the same display-slot to source-row mapping.

### Modal, toolbar, and color-picker polish

- Layout Settings received stronger modal separation through a darker backdrop, clearer edge, and deeper shadow without blur.
- Paste and Zoom toolbar popovers are mutually exclusive, dismiss on outside click, and Zoom Reset closes the Zoom popover.
- Custom Color interaction remains open during slider/hex editing and receives boundary-aware positioning behavior.

### Build 028.20 closure tweaks

- Designer header action text changed from **Back to Layouts** to **Close Layout Designer**.
- Designer PDF page navigation text changed from **Previous / Next** to **← / →**, with accessible Previous/Next labels retained.
- Build 028 documentation was reconciled to the accepted state and the remaining v0.2.0 roadmap.

## Explicitly deferred beyond Build 028

The following are intentionally not Build 028 work:

- application-wide Fahrenheit/Celsius preference;
- broad application-wide card/CSS redesign;
- generic Text Template palette flattening/workflow completion;
- full Layout Settings parent/child modal workflow redesign;
- same-day doubleheader pregame-state semantics;
- venue-local First Pitch display; and
- Team Game Number.

## Remaining v0.2.0 roadmap

1. **Build 029 — Pregame Data Context & Semantics**
   - define the pregame snapshot as everything true immediately before the selected game;
   - include completed earlier same-day games when the selected game is Game 2 of a doubleheader;
   - correct team and player YTD values for that pregame cutoff;
   - display First Pitch in the ballpark's local timezone;
   - add Away/Home Team Game Number from the verified pregame context.

2. **Build 030 — Layout Settings Workflow**
   - give the parent Layout Settings modal fixed header/footer chrome with a scrollable body;
   - make Layout Details a read-only summary with an Edit child view;
   - standardize Layout Details, Select Custom Fields, and Default Formatting Options as consistent full-size child views above Layout Settings;
   - use fixed child headers/footers, bottom-right Cancel/Save actions, and consistent dirty-state / close-X behavior.

3. **Build 031 — Text Template Workflow Completion**
   - complete the generic Text Template creation workflow for v0.2.0;
   - preferred direction is to remove the redundant `Text Template -> Text Template -> instances` palette hierarchy so the category can expose its instances directly, provided the palette plumbing supports that cleanly;
   - preserve generic/unscoped Text Template semantics and contextual Text Template behavior established by earlier builds.

4. **Build 032 — v0.2.0 Designer Completion / Release Review**
   - no planned feature expansion;
   - perform fresh-layout/full-scorecard regression, persistence/reload, Representative Test PDF vs live PDF comparison, copy/paste, formatting, collection, multi-page, viewport, import/export, and release-readiness checks;
   - reconcile final documentation and fix only demonstrated release-blocking Designer defects.

Build 028 is considered closed after acceptance of Build 028.20. `README.md` remains intentionally untouched during this development milestone.
