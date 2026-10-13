# Build 028.13 — Bench and Bullpen Placement Workflow

## Scope

Build 028.13 is intentionally limited to one Designer workflow cleanup: Bench and Bullpen now behave like the other single-purpose Player palette objects.

## Changes

- Away Bench and Home Bench now force **Repeated Layout**.
- Away Bullpen and Home Bullpen now force **Repeated Layout**.
- Selecting any of those palette objects skips the redundant **How would you like to use this?** chooser and enters the Repeated Layout workflow directly.
- **New Instance** from an existing Bench or Bullpen Repeated Layout also remains in Repeated Layout mode.
- No changes were made to Starting Lineup, Starting Pitcher, Defensive Alignment, Umpire Crew, formatting, PDF generation, or live-data behavior.

## Acceptance

For both Away and Home:

1. Select **Bench** in the Player palette. The Inspector should go directly to Repeated Layout setup with no Individual Placement choice.
2. Select **Bullpen** in the Player palette. The Inspector should go directly to Repeated Layout setup with no Individual Placement choice.
3. Place a Bench or Bullpen Repeated Layout, then use **New Instance**. The new-instance workflow should also go directly to Repeated Layout.
4. Starting Lineup, Starting Pitcher, and Defensive Alignment should retain their existing forced workflows.
