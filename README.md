# Scorecard Studio is a Baseball Scorecard Generator

An interactive, browser-based web application that allows baseball fans, scorekeepers, and broadcasters to upload custom PDF scorecard templates, visually map live MLB/MiLB data fields to specific coordinates across multi-page scorecards, and instantly generate pre-filled scorecards for any scheduled game.

![Project Status](https://img.shields.io/badge/Status-In_Development-blue)
![License](https://img.shields.io/badge/License-MIT-green)
![Hosting](https://img.shields.io/badge/Hosting-GitHub_Pages-orange)

---

## Key Features

- **Multi-Page Template Support:** Upload 1, 2, or multi-page PDF scorecard sheets. The app automatically detects total pages and renders each page on an interactive HTML canvas.
- **Interactive Field Mapping:** Click directly on the rendered PDF preview to place MLB data fields (team names, lineups, starting pitchers, YTD statistics) at exact relative $X/Y$ coordinates.
- **Data Customization & Formatting:**
  - Configurable name display formats (Full Name, Last Name Only, Initial + Last Name).
  - Combined single-cell strings (e.g., `#17 - S. Ohtani (DH)`).
  - Position formatting (numbers 1–9 vs. standard abbreviations).
  - Conditional text styling and RGB color-coding (e.g., Red for Left-handed batters, Green for Right, Blue for Switch hitters).
  - Font size (pt) and alignment options (Left, Center, Right).
- **Persistent Storage via IndexedDB (`localForage`):** Save complete scorecard layout profiles and PDF binary files directly in the browser—no accounts or database servers required.
- **Live MLB Data Fetching:** Automatically fetches daily game schedules, rosters, and player stats directly from the official, free MLB Stats API.
- **One-Click Generation:** Select a saved scorecard profile and an upcoming game to instantly populate and download a finished PDF.
- **Backup & Portability:** Export and import saved layout profiles and PDF templates via `.json` backup files.

---

## User Workflows

### 1. Template Setup & Field Mapping
1. Upload a blank PDF scorecard template (`.pdf`).
2. Use the **Page Navigation** controls to switch between pages if working with a multi-page PDF.
3. Open the **Field Customizer** panel to choose data formatting rules (e.g., Last Name Only, Left/Right color-coding, font size).
4. Click on the canvas preview to map the selected field to that location.
5. Save the profile with a custom name (e.g., *"My 3-Page Detailed Scorecard"*).

### 2. Daily Scorecard Generation
1. Open the app and select your saved profile from the dropdown menu.
2. Select today's MLB game from the schedule list (`Away Team @ Home Team`).
3. Click **Generate Scorecard** to download your pre-filled PDF.

---

## Getting Started & Development

### Local Setup
Since this project consists of pure static web files, no node server or build step is required:

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/mlb-scorecard-generator.git
   ```
2. Open the directory in **Visual Studio Code**.
3. Use the **Live Server** extension in VS Code (or double-click `index.html`) to run the app in your browser.

---

## License

This project is open-source and available under the [MIT License](LICENSE).
