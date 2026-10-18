# Scorecard Studio is a Baseball Scorecard Generator

An interactive, browser-based web application that allows baseball fans, scorekeepers, and broadcasters to upload custom PDF scorecard templates, visually map customizable data fields to specific coordinates across multi-page scorecards, and instantly generate pre-filled scorecards for any scheduled or historical game for which MLB API data is available.

![Project Status](https://img.shields.io/badge/Release-v1.0.0-blue)
![License](https://img.shields.io/badge/License-MIT-green)
![Hosting](https://img.shields.io/badge/Hosting-GitHub_Pages-orange)

---

## Key Features

- **Multi-Page Template Support:** Upload 1, 2, or multi-page PDF scorecard sheets. The app automatically detects total pages and renders each page on an interactive HTML canvas.
- **Interactive Field Mapping:** Click directly on the rendered PDF preview to place MLB data fields (team names, lineups, starting pitchers, YTD statistics, etc.) at the desired location.
- **Data Customization & Formatting:**
  - Configurable name display formats (Full Name, Last Name Only, Initial + Last Name, etc.).
  - Multi-column lineups such as [Handedness] [Jersey#] [Name] [Position].
  - Single-column support using custom strings (e.g., `#17 - S. Ohtani (DH)`).
  - Position formatting (numbers 2–9+DH, standard abbreviations, or full position names).
  - Conditional text styling and RGB color-coding if desired (e.g., Red for Left-handed batters, Green for Right, Blue for Switch hitters).
  - Font size (pt) and alignment options (Left, Center, Right).
- **Persistent Local Browser Storage:** No account is required. Scorecard layout profiles, settings, and PDF files remain stored directly in your browser rather than on a Scorecard Studio server.
- **Live MLB Data Fetching:** Automatically fetches daily game schedules, rosters, and player stats directly from the official, free MLB Stats API.
- **One-Click Generation:** Easily generate today's scorecard based on a selected game and saved layout.
- **Backup & Portability:** Export and import saved layout profiles and PDF templates via `.json` backup files. This prevents needing to start over after clearing browser storage and makes it easy to move configurations to another browser or device. Because data is not stored in the cloud, each browser and device maintains its own scorecard data and settings.
- **Game Day Research Companion:** View expanded team and player statistics and other pregame details that do not fit on a typical scorecard. Game Day remains spoiler-safe—even for historical games—and adapts responsively to desktop, tablet, and phone screens.
- **Touch-Friendly Designer:** On touch devices, use the explicit **Select multiple** mode to tap-toggle fields or draw a one-finger lasso, then move the selected group with its drag handle.

---

## Typical First Workflow

1. Open **Layouts** and install the ready-to-use Starter Layout, or create your own layout by uploading a blank PDF scorecard.
2. If you create your own, open the **Layout Designer** and choose the fields or collections you want on the scorecard.
3. Place and format those items on the PDF, then use **Generate Test PDF** to verify the design.
4. Return to **Home**, select an available game and the layout you want to use, and generate the live pregame PDF.
5. Print the PDF or open it in a tablet PDF-markup application for scorekeeping.

Thereafter, open the app a few hours before game time to generate a pre-filled PDF for today's game involving your favorite team. You can also select another game for today, or choose any available date at the MLB and MiLB levels.

---

## Current Limitations

- Availability and completeness of live pregame information depend on the data MLB has published for that game.
- For the second game of a same-day doubleheader, Scorecard Studio can use completed Game 1 information for supported player/team values, but standings-derived values such as division/league/wild-card position and **Last 10** intentionally remain based on the previous-day snapshot. Game Day displays an information indicator when this mixed cutoff is active.
- Pinch-to-zoom is not provided inside the Designer because supported iPad browsers did not make it dependable enough without harming ordinary scrolling. Use the existing zoom controls instead.
- Because storage is local to the browser, layouts do not automatically synchronize between devices. Automatic cloud synchronization is not planned; importing a backup is the supported way to move a PDF configuration to another browser or device.

---

## Release

Scorecard Studio v1.0.0 is the current stable release. Development history,
accepted decisions, and future roadmap items are maintained separately from
this runtime distribution.

---

## License

Copyright (c) 2026. Scorecard Studio is open-source software released under the [MIT License](LICENSE). The license applies to the Scorecard Studio source code; third-party names, trademarks, data, and other materials remain subject to their respective owners' rights and terms.
