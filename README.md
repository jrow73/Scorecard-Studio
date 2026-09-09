# Scorecard Studio is a Baseball Scorecard Generator

An interactive, browser-based web application that allows baseball fans, scorekeepers, and broadcasters to upload custom PDF scorecard templates, visually map cusomizable data fields to specific coordinates across multi-page scorecards, and instantly generate pre-filled scorecards for any scheduled or historical game, for which MLB API data is available.

![Project Status](https://img.shields.io/badge/Status-In_Development-blue)
![License](https://img.shields.io/badge/License-MIT-green)
![Hosting](https://img.shields.io/badge/Hosting-GitHub_Pages-orange)

---

## Key Features

- **Multi-Page Template Support:** Upload 1, 2, or multi-page PDF scorecard sheets. The app automatically detects total pages and renders each page on an interactive HTML canvas.
- **Interactive Field Mapping:** Click directly on the rendered PDF preview to place MLB data fields (team names, lineups, starting pitchers, YTD statistics) at the desired location.
- **Data Customization & Formatting:**
  - Configurable name display formats (Full Name, Last Name Only, Initial + Last Name).
  - Multi-column lineups such as [Handedness] [Jersey#] [Name] [Position]
  - Single-column support using custom strings (e.g., `#17 - S. Ohtani (DH)`).
  - Position formatting (numbers 1–9 vs. standard abbreviations).
  - Conditional text styling and RGB color-coding if desired (e.g., Red for Left-handed batters, Green for Right, Blue for Switch hitters).
  - Font size (pt) and alignment options (Left, Center, Right).
- **Persistent Local Browser Storage:** No account requried, nothing sent to any server. Everything is done locally in your browser. All completed scorecard layout profiles and PDF binary files stored directly in the browser.
- **Live MLB Data Fetching:** Automatically fetches daily game schedules, rosters, and player stats directly from the official, free MLB Stats API.
- **One-Click Generation:** Easily generate "Today's Scorecard" based on pre-selected favorite team, favorite scorecard, and today's game data. 
- **Backup & Portability:** Export and import saved layout profiles and PDF templates via `.json` backup files. Prevents needing to start over in the event you completely clear your browser or want to use a different browser or different/multiple device(s). (Since data is not stored in the cloud, each browser and each device maintains its own scorecard data and settings)

---

## User Workflows

### 1. Template Setup & Field Mapping
1. Upload a blank PDF scorecard template (`.pdf`).
2. Use the **Page Navigation** controls to switch between pages if working with a multi-page PDF.
3. Use the **Field Customizer** panel to choose data fields you want to use on this scorecard and how you want each field to be formatted (e.g., Last Name Only, Left/Right color-coding, font size). Each scorecard can have different fields and formatting settings.
4. Click on the canvas preview to map each field to the desired location.
5. Save the profile with a custom name (e.g., *"My 3-Page Detailed Scorecard"*).

### 2. Daily Scorecard Generation
1. Open the app and instantly generate "today's scorecard" for your favorite team on your favorite scorecard (stored in application settings). 
  | OR |
  Select any available game from any date for any team, select a desired scorecard if you have multiple templates, and generate a PDF for that specific game. 

2. The PDF will download to your local device (or indicated cloud-storage location).
3. Print the PDF Scorecard and take to the ballpark 
  | OR |
  Open the Scorecard in your favorite tablet PDF markup application to score the game on your portable device with a stylus.

---



## License

This project is open-source and available under the [MIT License](LICENSE).
