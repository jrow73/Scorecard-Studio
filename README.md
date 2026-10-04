# Scorecard Studio is a Baseball Scorecard Generator

An interactive, browser-based web application that allows baseball fans, scorekeepers, and broadcasters to upload custom PDF scorecard templates, visually map cusomizable data fields to specific coordinates across multi-page scorecards, and instantly generate pre-filled scorecards for any scheduled or historical game, for which MLB API data is available.

![Project Status](https://img.shields.io/badge/Status-In_Development-blue)
![License](https://img.shields.io/badge/License-MIT-green)
![Hosting](https://img.shields.io/badge/Hosting-GitHub_Pages-orange)

---

## Key Features

- **Multi-Page Template Support:** Upload 1, 2, or multi-page PDF scorecard sheets. The app automatically detects total pages and renders each page on an interactive HTML canvas.
- **Interactive Field Mapping:** Click directly on the rendered PDF preview to place MLB data fields (team names, lineups, starting pitchers, YTD statistics, etc.) at the desired location.
- **Data Customization & Formatting:**
  - Configurable name display formats (Full Name, Last Name Only, Initial + Last Name, etc.).
  - Multi-column lineups such as [Handedness] [Jersey#] [Name] [Position]
  - Single-column support using custom strings (e.g., `#17 - S. Ohtani (DH)`).
  - Position formatting (numbers 2–9+DH, standard abbreviations, or even full position names).
  - Conditional text styling and RGB color-coding if desired (e.g., Red for Left-handed batters, Green for Right, Blue for Switch hitters).
  - Font size (pt) and alignment options (Left, Center, Right).
- **Persistent Local Browser Storage:** No account required, nothing sent to any server. Everything is done locally in your browser. All completed scorecard layout profiles and PDF binary files stored directly in the browser.
- **Live MLB Data Fetching:** Automatically fetches daily game schedules, rosters, and player stats directly from the official, free MLB Stats API.
- **One-Click Generation:** Easily generate "Today's Scorecard" based on pre-selected favorite team, favorite scorecard, and today's game data. 
- **Backup & Portability:** Export and import saved layout profiles and PDF templates via `.json` backup files. Prevents needing to start over in the event you completely clear your browser or want to use a different browser or different/multiple device(s). (Since data is not stored in the cloud, each browser and each device maintains its own scorecard data and settings)
- **Optional Cloud Storage and Synchronization:** Optionally configure your own cloud storage service, such as Google Drive, Dropbox, etc., to host saved layout profiles and app settings, keeping multiple devices and/or browsers synced with latest changes automatically. All authorization is conducted and stored in the local browser - no information is sent to nor processed by Scorecard Studio. If configured, this setting does not replace manual backup and portability capability.

---

## Typical Workflow

1. Open **Layouts** and create a layout by uploading a blank PDF scorecard.
2. Open the **Layout Designer** and choose the fields or collections you want on the scorecard.
3. Place and format those items on the PDF, then use **Generate Test PDF** to verify the design.
4. Return to **Home**, select an available game and the layout you want to use, and generate the live pregame PDF.
5. Print the PDF or open it in a tablet PDF-markup application for scorekeeping.

---

## Current Limitations

- Availability and completeness of live pregame information depend on the data MLB has published for that game.
- For the second game of a same-day doubleheader, Scorecard Studio can use completed Game 1 information for supported player/team values, but standings-derived values such as division/league/wild-card position and **Last 10** intentionally remain based on the previous-day snapshot.
- The Designer works on touch devices, but touch-specific conveniences such as pinch-to-zoom, touch multi-select/lasso, and stronger protection against accidental object dragging while panning remain future work.
- Because storage is local to the browser, layouts do not automatically synchronize between devices.

---

## License

Copyright (c) 2026. Scorecard Studio is open-source software released under the [MIT License](LICENSE). The license applies to the Scorecard Studio source code; third-party names, trademarks, data, and other materials remain subject to their respective owners' rights and terms.
