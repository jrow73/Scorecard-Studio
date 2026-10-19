# v1.1 Installation and Rollback

## Packages

**Scorecard-Studio_v1.1.0_complete-release.zip** is the clean static application for deployment. It contains the required app files, icons, Starter Layout, schemas, current public documentation, a file manifest, and SHA-256 checksums. Historical build documents, tests, development tools, unused icon-source images, temporary files, and previous archives are omitted.

**Scorecard-Studio_v1.1.0_ReleaseUpdate_ChangedFiles.zip** updates an accepted v1.1 Build 003 development folder to stable v1.1.0, internal Build 004. It includes release documentation, current gate changes, the packaging tool, and coordinated identity/cache updates. It is not a standalone app and should not be applied directly to v1.0 or an earlier v1.1 build. Unchanged `help.html` is omitted from this overlay.

## Update your development folder

1. Keep a copy of accepted Build 003.
2. Extract the ReleaseUpdate archive over the project root, preserving folders and replacing the included files.
3. Run `node tools/run-v110-release-gate.mjs`. The current stable gate should pass all 212 tests and production syntax checks.
4. Serve the project as usual and reload the app. The visible version is `1.1.0`; the development suffix is gone. The internal build remains available in metadata.
5. In Help > What's New, confirm the v1.1 entry mentions search, excerpts, and highlights. A browser that already recorded v1.1 during acceptance will not receive a second automatic announcement.

For a combined release-finalization commit, a suitable message is:

```text
feat: release v1.1 with searchable Designer help and community links
```

## Deploy the clean application

1. Export a complete browser backup if you want a recovery copy of your saved settings and layouts.
2. Keep the currently deployed files as a rollback copy. Extract the complete-release ZIP into a fresh staging folder. `index.html`, `help.html`, `app-meta.json`, and the `js/`, `css/`, and `assets/` folders belong directly at the site's existing root.
3. If you have made additional Help wording edits since accepted Build 003, carry your maintained `help.html` into the deployment and check it through the app. That customized file will naturally differ from the packaged checksum.
4. Publish the staged files through your existing static hosting/GitHub Pages workflow. Keep `.nojekyll`, relative paths, and the current manifest/icons. The runtime-only package has no build or installation step.
5. Retain the same site origin/path to keep using that browser's existing local data. Reload open app tabs after the deployment completes.
6. Confirm the header shows `1.1.0`, open contextual Help, search `bullpen sort`, open a result and check highlights, clear the search, then verify a saved layout still opens and generates a PDF. Check the Discord entry and an iPad/narrow Help view.

## Roll back

Restore the complete previous site files, including their matching metadata and cache references, then reload. Do not reset browser data. No database migration is introduced in v1.1. If restoring browser data is necessary, import the complete backup through the existing preflight/restore flow.

## Rebuild and verify packages

The development update includes `tools/package-v110-release.py`. After the stable gate passes, run:

```text
python3 tools/package-v110-release.py --output-dir /absolute/path/to/output
```

To also produce the changed-files overlay, add `--baseline /absolute/path/to/accepted-build003`. Output files include manifests and checksums and are verified after writing. The supplied ZIPs were generated from the stable source with this tool.
