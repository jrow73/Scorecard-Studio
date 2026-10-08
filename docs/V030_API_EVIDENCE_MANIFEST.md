# Scorecard Studio v0.3.0 — API Evidence Manifest

**Manifest introduced:** Build 002.1  
**Schema authority:** `docs/V030_API_EVIDENCE_SCHEMA.md`  
**Fixture root:** `tests/fixtures/api-discovery/`

## Captured evidence

### DISC-001 — gamePk 822955 Schedule harness control

| Property | Capture A | Capture B |
|---|---|---|
| Fixture | `disc-001-822955-schedule-a.json` | `disc-001-822955-schedule-b.json` |
| Evidence kind | `historical-current` | `historical-current` |
| Retrieved UTC | `2026-10-05T12:31:19.379Z` | `2026-10-05T18:33:25.379Z` |
| HTTP result | 200 | 200 |
| Duration | 323 ms | 262 ms |
| Full response bytes | 7,602 | 7,602 |
| Full response SHA-256 | `c54b36647fb0f629e2ab107179b7e9480584335aae7ac4602d40626f50dbc010` | same |
| Selected paths | 6 | 6 |

Exact request:

```text
GET https://statsapi.mlb.com/api/v1/schedule?sportId=1&gamePk=822955&hydrate=lineups%2Cweather%2Cvenue%2Cteam%2CprobablePitcher
Accept: application/json
```

Selected evidence:

- gamePk `822955`;
- official date `2026-07-10`;
- current status `Final` (`F`);
- away team ID `136`;
- home team ID `139`;
- venue ID `12`, Tropicana Field.

Comparison result: all six selected paths match, with zero differences. The complete response fingerprints also match.

Interpretation and limitation: these captures validate the harness and show a stable current historical response across the two retrievals. They do not show when pregame lineups, probable pitchers, weather, or officials became available. Because the game is now Final, neither fixture replaces the separately recorded pregame evidence for this game.

## Build 002.2 captured evidence

| Fixture | Kind | Retrieved UTC | HTTP / raw bytes | Full-response SHA-256 |
|---|---|---|---:|---|
| `disc-001-849834-schedule-pregame.json` | `live-snapshot` | `2026-10-05T18:54:35.254Z` | 200 / 7,620 | `fa8ffc797945f8d6464a4520fef62b24b7877f585084da782eef2ee0916c6be6` |
| `disc-002-849834-feed-pregame.json` | `live-snapshot` | `2026-10-05T18:54:32.765Z` | 200 / 223,432 | `e49ccc1b7b3d7fa0b97690aa9476200b4af05ddba1f4e60aab0a94314109a076` |
| `disc-001-849839-schedule-scheduled.json` | `live-snapshot` | `2026-10-05T18:52:03.056Z` | 200 / 3,475 | `32bf62ac93f8f4a6f99522cd0565f860ccdccffd41599788ab24fb4d80489252` |
| `disc-002-849839-feed-scheduled.json` | `live-snapshot` | `2026-10-05T18:54:30.282Z` | 200 / 180,266 | `e371e687346e82208db50a89d0cb3d342a37f0a7412a3b5189b2bce6a92b8012` |
| `disc-001-777164-schedule-postponed.json` | `historical-current` | `2026-10-05T18:53:55.999Z` | 200 / 11,008 | `3147524ec3d87bf4c6741daea700b1a689d7ca23de3049ceafc7eac2fe6d3b53` |
| `disc-001-777164-feed-rescheduled-final.json` | `historical-current` | `2026-10-05T18:53:42.383Z` | 200 / 721,235 | `90a3e5b0b530661751f78d97d4b3274670fe849c6038ec7de130ddec66f5dcce` |
| `disc-001-777861-schedule-resumed-final.json` | `historical-current` | `2026-10-05T18:52:22.000Z` | 200 / 14,845 | `559f976ea93ce53c9d5c90819f1e13038ee16e6f0b980cbc1dd8c2186c3bf1bf` |
| `disc-001-777861-feed-resumed-final.json` | `historical-current` | `2026-10-05T18:52:09.113Z` | 200 / 864,236 | `e0f8b43a2e53173ffbf7a81f5082fe7b3b02a164f50e8dc7a9919593594f20aa` |
| `disc-001-746577-schedule-cancelled.json` | `historical-current` | `2026-10-05T18:56:29.215Z` | 200 / 3,454 | `5371a6d692cfd7290a066f818c11fde5eb22c0828ea78214a863e555b6b0c914` |
| `disc-001-849809-schedule-time-tbd.json` | `live-snapshot` | `2026-10-05T18:56:20.208Z` | 200 / 2,824 | `5df4ffb9423c4c80f82265e7e64ef8a754018315536166252beb2638c80723f8` |

### Live postseason timing pair

gamePk `849834` was captured in `Pre-Game` approximately 125 minutes before scheduled first pitch. Schedule contained both probable pitchers and two nine-player lineups; feed contained a six-person field crew with Home Plate, First Base, Second Base, Third Base, Left Field, and Right Field roles.

gamePk `849839` was captured in `Scheduled` approximately 308 minutes before scheduled first pitch. Schedule contained both probable pitchers but omitted both lineup paths; feed returned a present-empty officials array.

These different-game observations establish presence/absence states, not an exact publication threshold or a same-game transition.

### Exceptional-state controls

- **Postponed/rescheduled — gamePk `777164`:** Schedule retained `Postponed`, reason `Rain`, and reschedule fields while feed represented the completed rescheduled contest as `Final`. This is a deliberate paired-source fixture.
- **Suspended/resumed — gamePk `777861`:** current Schedule/feed responses are `Final` but preserve original/official and resume dates. They cannot reproduce the transient suspended state.
- **Cancelled — gamePk `746577`:** a regular-season cancellation with `codedGameState: C`, `statusCode: CR`, and reason `Rain`; probable pitchers remain present while lineup is absent.
- **Start time TBD — gamePk `849809`:** future postseason placeholder with `startTimeTBD: true`, placeholder teams, and a sentinel-like `07:33Z` timestamp that must not be displayed as confirmed.

Detailed interpretation and recommended future-model requirements are in `docs/V030_API_FINDINGS.md`.

## Build 002.3 captured evidence

| Fixture | Kind | Retrieved UTC | HTTP / raw bytes | Full-response SHA-256 |
|---|---|---|---:|---|
| `disc-004-145-roster-dh-2025-06-19.json` | `historical-current` | `2026-10-05T19:06:50.101Z` | 200 / 28,653 | `8b91033b6a3a890fcc1c09666731b0ec5bdf0db6b51ed5687904c5eba9c112b9` |
| `disc-004-402-roster-aa-2025-06-01.json` | `historical-current` | `2026-10-05T19:06:31.666Z` | 200 / 29,421 | `4d5c58e9659aa913810169d203cd82dc1e5990bfa0cc37311730f533fcb45a50` |
| `disc-004-445-roster-aaa-2025-06-01.json` | `historical-current` | `2026-10-05T19:06:24.171Z` | 200 / 31,466 | `c32e6883ae3d8177d1a32758c77741111e606c1640245a643559764f5a828137` |
| `disc-004-592450-roster-nya-2025-07-25.json` | `historical-current` | `2026-10-05T19:05:35.415Z` | 200 / 30,243 | `3e96b58ef4c8cad5a3bb88b8091017dcd0f3e558a9774a22b930243d7bec93a2` |
| `disc-004-592450-roster-nya-2025-07-28.json` | `historical-current` | `2026-10-05T19:05:40.875Z` | 200 / 30,444 | `e6fd5c1f68a2b8f046130f841110f275d04eeff4096f5da8403a597f4051f303` |
| `disc-004-592450-roster-nya-2025-08-05.json` | `historical-current` | `2026-10-05T19:05:46.177Z` | 200 / 30,390 | `2d7bac911bafe8f64a67871579706d889bd10ee15e1c3c517ba34045008c6753` |
| `disc-004-592450-transaction.json` | `historical-current` | `2026-10-05T19:05:50.950Z` | 200 / 994 | `5ab24f00092484049b6de7091a25035659f7c71ef63fa7eb63c8e6cd14da06a1` |
| `disc-004-622554-roster-bal-2025-07-28.json` | `historical-current` | `2026-10-05T19:05:20.272Z` | 200 / 30,079 | `4c3f71a9370336a5e502328c111e952b6b0772ae42546c5bb454a9013f0f7825` |
| `disc-004-622554-roster-tor-2025-07-30.json` | `historical-current` | `2026-10-05T19:05:25.362Z` | 200 / 28,073 | `ffb5372efee7e30b2fdd153b4c9ae1605ac3b30db23d399bea581bf47335e07e` |
| `disc-004-622554-transaction.json` | `historical-current` | `2026-10-05T19:05:30.550Z` | 200 / 1,414 | `2608b99d6bbbaf37f4e2baa09e92181b08304988e9036317f9c131dd522aea89` |
| `disc-004-660271-roster-lan-2025-06-16.json` | `historical-current` | `2026-10-05T19:06:18.076Z` | 200 / 30,114 | `2ba81835980549adb7d6b137bd7efffa817dc447ebb685f570aae795fbaa2fcf` |
| `disc-004-777447-schedule-dh-g1.json` | `historical-current` | `2026-10-05T19:06:37.277Z` | 200 / 7,478 | `f857e4e0e0a7acad6b7e14709dad69c0e3fac6c13b49ace4f6f596983dc00660` |
| `disc-004-777458-schedule-dh-g2.json` | `historical-current` | `2026-10-05T19:06:44.312Z` | 200 / 10,831 | `6051f5df07dc6db3cdaedd61b81d69cd45a85007ecd2fb37ed40c97e8ca40cbc` |
| `disc-004-777458-schedule-dh-rescheduled-view.json` | `historical-current` | `2026-10-05T19:10:11.730Z` | 200 / 10,831 | `6051f5df07dc6db3cdaedd61b81d69cd45a85007ecd2fb37ed40c97e8ca40cbc` |
| `disc-005-660271-people-postseason-end-2025-10-30.json` | `historical-current` | `2026-10-05T19:08:05.642Z` | 200 / 5,469 | `ea7ffd70b0f19e2b85e8d549905958349139da142d05e73c31a923f68e7dc73b` |
| `disc-005-660271-people-pre-opening-2025-03-17.json` | `historical-current` | `2026-10-05T19:07:52.554Z` | 200 / 1,349 | `3c10c429199d2244c6757a84fe7e05b3209c6e6b6945478adbed30f0ad39a347` |
| `disc-005-660271-people-regular-end-2025-09-28.json` | `historical-current` | `2026-10-05T19:07:59.723Z` | 200 / 5,469 | `ea7ffd70b0f19e2b85e8d549905958349139da142d05e73c31a923f68e7dc73b` |
| `disc-005-660271-people-two-way-2025-06-17.json` | `historical-current` | `2026-10-05T19:07:44.736Z` | 200 / 5,474 | `77770ee1430287d26b9fbc61d31f6db32a6b0a721bf85d6bce24f68dcf40a958` |
| `disc-005-806068-people-post-debut.json` | `historical-current` | `2026-10-05T19:07:36.895Z` | 200 / 2,770 | `10cd94cb31fd64e291fed5f3fa3af9536ff2dfa446f2d0904e7099c51a9f4363` |
| `disc-005-806068-people-pre-debut.json` | `historical-current` | `2026-10-05T19:07:30.275Z` | 200 / 1,251 | `3c071ed5df9d80fde49f89aace284a5d35156b6b8ac2fcfa78c662ab41a260eb` |
| `disc-005-aggregate-controls-2026-10-04.json` | `historical-current` | `2026-10-05T19:07:22.503Z` | 200 / 11,126 | `0ea2e30c5c36a4903a921f85bcbeae3dc5aa7803febb8ff337d1e34840472583` |
| `disc-007-114-coaches-2026-postseason.json` | `live-snapshot` | `2026-10-05T19:08:31.619Z` | 200 / 3,103 | `bc6645461e9b3298eb2ffe7dd6d6b764d0e7e39275a49f1a889b0d7458ab2756` |
| `disc-007-120-coaches-after-change.json` | `historical-current` | `2026-10-05T19:08:25.736Z` | 200 / 1,783 | `79990e4b14d8f4e62b58343566a2840e9285591af067f879918a57ccc2f8216f` |
| `disc-007-120-coaches-before-change.json` | `historical-current` | `2026-10-05T19:08:20.667Z` | 200 / 1,926 | `cda96dd99f9233eac5a12b244dbb70e8f5b573cebaf9fc3707ce37e7d09525c0` |
| `disc-007-445-coaches-aaa-2025.json` | `historical-current` | `2026-10-05T19:08:37.054Z` | 200 / 1,430 | `789480e31ce5813077b15618772234be0bc1f1e42bc961f0d0c3e7afaedcb7d4` |

### Dated roster and transaction controls

- Dated team rosters identify themselves as `rosterType: active`; they expose the active list for that team/date, not a game-specific list.
- Seranthony Domínguez moved from Baltimore jersey 56 on July 28 to Toronto jersey 48 on July 30, corroborated by the July 29 transaction response.
- Aaron Judge is present before his injured-list placement, absent while inactive, and present again after activation.
- Shohei Ohtani is coded as a two-way player (`position.code: Y`, `abbreviation: TWP`), which the v0.2.0 pitcher predicate does not recognize.
- Doubleheader Game 2's direct Schedule response contains both the original postponed date bucket and the rescheduled final date bucket. Consumers must select the matching game object, not assume `dates[0]` is authoritative.
- Transaction fixtures are corroborative evidence only; transactions are not a v0.2.0 application dependency.

### People statistics controls

- Multi-team seasons return club splits plus a sport-level `All` split; the `All` split is the aggregate and can omit `team`.
- A one-team season can also return an `All` split, sometimes with the team still attached. Aggregate selection therefore must use the sport identity, not team absence.
- Before an MLB debut, the requested hitting group can be present with an empty `splits` array; after the debut it contains both club and aggregate splits.
- A two-way player can return independent hitting and pitching groups in one response.
- Ohtani's regular-season-end and postseason-end default `byDateRange` responses are byte-identical, confirming that this request did not add postseason results without an explicit game-type selection.

### Coach controls

- Washington's dated staff changes from an exact `Manager` role to `Interim Manager`; an exact-label-only lookup will not find the acting manager after the change.
- Current Cleveland and historical Triple-A Columbus staffs include repeated broad role families such as multiple hitting or pitching coaches, so labels are not unique keys.
- The Cleveland fixture is a live snapshot. The dated Washington and Columbus observations are historical-current responses and should not be treated as immutable records of what the endpoint returned on those dates.

## Build 002.4 captured evidence

| Fixture | Kind | Retrieved UTC | HTTP / raw bytes | Full-response SHA-256 |
|---|---|---|---:|---|
| `disc-003-10-venue-2024.json` | `historical-current` | `2026-10-06T01:27:27.162Z` | 200 / 805 | `102151be45de677c92b099d2506359088bd504a9ec7ccd4819e55a23a6da1255` |
| `disc-003-2397-venue-2025.json` | `historical-current` | `2026-10-06T01:27:29.847Z` | 200 / 719 | `4d3650fbbc857ad329dc306f24ef681dc993a3fbef7db9e65310961d3569e24c` |
| `disc-003-2529-venue-2025.json` | `historical-current` | `2026-10-06T01:27:25.819Z` | 200 / 788 | `c945fdc2c55b5eb38fbe14c92f6cabdcb4f6b237324dada96dc7a34ab97a4ae6` |
| `disc-003-2541-venue-2025.json` | `historical-current` | `2026-10-06T01:27:24.448Z` | 200 / 736 | `bff297ce45a22f996166a92c292b46b60efd1b6622c7824203d1bb74957b97c6` |
| `disc-003-5000-venue-2025.json` | `historical-current` | `2026-10-06T01:27:28.539Z` | 200 / 765 | `af9644ca34de6671499e9f8229cf407fac73919f34488cdf7f1cb6e59bde46b4` |
| `disc-003-5325-venue-2024.json` | `historical-current` | `2026-10-06T01:27:23.121Z` | 200 / 796 | `92a462164ff75b9d355aef31bbc5e929cdfd7c795fec53f8f68a82e4a3cdb190` |
| `disc-003-5381-venue-2024.json` | `historical-current` | `2026-10-06T01:27:21.739Z` | 200 / 697 | `cdd200eac404afa028eee0212f54c9f05312c3bc4ae4ea0594869e2d5365bb14` |
| `disc-003-745001-feed-ordinary.json` | `historical-current` | `2026-10-06T01:23:02.375Z` | 200 / 763,755 | `6bb814aa256fce17c03b03505693a162d27fbde1d68573e07fb4b3c2baaa4457` |
| `disc-003-745001-schedule-ordinary.json` | `historical-current` | `2026-10-06T01:23:11.786Z` | 200 / 3,309 | `07d730d2fc6677e895eb53eb1f3596c9fd660b6a38d42e5902173ec06c763371` |
| `disc-003-745652-feed-oakland-2024.json` | `historical-current` | `2026-10-06T01:25:11.594Z` | 200 / 738,695 | `b208906b1940469ba04f4116ab6e651e83213fc3c3b068c33f575296cde4d4ef` |
| `disc-003-745652-schedule-oakland-2024.json` | `historical-current` | `2026-10-06T01:25:14.227Z` | 200 / 3,304 | `28f0c070a30c174bc5e6f8fb8c547a83edc0603dfcce5164a6754515372287ca` |
| `disc-003-745814-feed-london.json` | `historical-current` | `2026-10-06T01:23:06.484Z` | 200 / 775,255 | `c24deaa79469e1f5b2aac41aeaaf8d297e26dac5938e1276dc859106d854e3dc` |
| `disc-003-745814-schedule-london.json` | `historical-current` | `2026-10-06T01:23:03.635Z` | 200 / 3,358 | `4086ae75075b13890213d3ce39b1bc76d288203f5048b304cdeba662f69d942e` |
| `disc-003-778494-feed-sutter-2025.json` | `historical-current` | `2026-10-06T01:25:15.699Z` | 200 / 754,415 | `1b69d0d821a65e9911da7a051b0bfbfb7511c6d168043b260440726f0f41f4e5` |
| `disc-003-778494-schedule-sutter-2025.json` | `historical-current` | `2026-10-06T01:25:12.895Z` | 200 / 3,292 | `c920d02231e312c9c1b6472f9538672ecf0bc66b6117bfc4e3620984b3f9d6ba` |
| `disc-003-778563-feed-tokyo.json` | `historical-current` | `2026-10-06T01:23:07.783Z` | 200 / 802,062 | `088c748138ea6858c1e798f808e319f6d4448d5b7dced57076f0f3d1adbc5a15` |
| `disc-003-778563-schedule-tokyo.json` | `historical-current` | `2026-10-06T01:23:11.220Z` | 200 / 3,318 | `5f9b4a67a03374a354cc164b0ad4fcf8e467946c0df447afa386153de0aa0ace` |
| `disc-003-778718-feed-spring.json` | `historical-current` | `2026-10-06T01:22:59.635Z` | 200 / 1,122,421 | `6cee51c9776821582ba1484a5ed539b5a2f87e50d12748bd107f2df34ebf1bde` |
| `disc-003-778718-schedule-spring.json` | `historical-current` | `2026-10-06T01:23:00.912Z` | 200 / 3,310 | `ad3098f9c2b581e70464d8f9e67dcfae30eeb36f50b69172d953890715bbb18a` |
| `disc-003-781501-feed-aaa.json` | `historical-current` | `2026-10-06T01:23:09.141Z` | 200 / 893,843 | `13145bcbf280df5c9b80db7a9b643555b8703e2162504eec0dca913b8d8ce276` |
| `disc-003-781501-schedule-aaa.json` | `historical-current` | `2026-10-06T01:23:04.995Z` | 200 / 2,919 | `be8d7697abc679d0faf43211c4a22c86402b92784592c473e77a9b3c3685df69` |
| `disc-006-il-final-2025-09-21.json` | `historical-current` | `2026-10-06T01:23:37.554Z` | 200 / 48,863 | `9e76c914b1744ee1d5249bd0eb5ce8548c2403a9f9090a8b444b471f90e1910c` |
| `disc-006-mlb-al-early-2025-04-05.json` | `historical-current` | `2026-10-06T01:23:40.263Z` | 200 / 39,802 | `6e8ea9980fe206b0bad4b459c0182cfd73d4aaf3bbacf32bab90231ad78e329f` |
| `disc-006-mlb-al-final-2025-09-28.json` | `historical-current` | `2026-10-06T01:23:38.941Z` | 200 / 40,557 | `db37050d7c9da91b2378e4c30501cd81994e944221a9877f4022f3e07f2a3969` |
| `disc-006-mlb-al-opening-day-2025-03-27.json` | `historical-current` | `2026-10-06T01:23:32.133Z` | 200 / 39,157 | `633f3afb78af9f4e7f39cf988ebf417a5219490fcf066cfa8d8da90bc8ebd0f9` |
| `disc-006-mlb-al-pre-opening-2025-03-26.json` | `historical-current` | `2026-10-06T01:23:30.786Z` | 200 / 35,656 | `58eeac5ded2b170170850c5cbcd506c0d543fab74ca2e9f5f23629265aef7f1b` |
| `disc-006-mlb-nl-final-2025-09-28.json` | `historical-current` | `2026-10-06T01:23:34.834Z` | 200 / 40,576 | `5579bd51d27f47c896118622a0092b145d4bc01a3c3a32727f21502be25e212f` |
| `disc-006-mlb-postseason-2025-10-05.json` | `historical-current` | `2026-10-06T01:24:13.342Z` | 200 / 11,241 | `955411df81fac4f43ba66b0864b3730e19c024e9f349582c4dfd6aebe36da9b0` |
| `disc-006-mlb-spring-2025-03-15.json` | `historical-current` | `2026-10-06T01:23:35.092Z` | 200 / 92,010 | `8cc269279cf3958ee5c5d7c83a67b3d192ad99154a4abcd0c39db2513776c249` |
| `disc-006-mlb-wildcard-final-2025-09-28.json` | `historical-current` | `2026-10-06T01:23:43.024Z` | 200 / 81,333 | `aa5e87a2cd1f5bd0807a6f15fc4d9be8096f24d1dd10c7a9dac8f8edeb3adea0` |
| `disc-006-pcl-final-2025-09-21.json` | `historical-current` | `2026-10-06T01:23:41.617Z` | 200 / 24,764 | `205cf1f61709eee181e1a1b69152b389d6a2c707bb88e22f6e34c18b10f6dcf1` |
| `disc-006-standings-types.json` | `historical-current` | `2026-10-06T01:23:54.807Z` | 200 / 1,037 | `7328a0e46cd24afb8f40fbc773c9dcaf1452f35e1de58b8ac15a6dde9d74d3d4` |

### Venue controls

- Seven Schedule/feed pairs cover ordinary MLB, London, Tokyo, spring training, Triple-A, and the Athletics' 2024/2025 home-venue transition.
- Schedule supplied venue identity only. Feed supplied location, timezone, field information, and optional dimensions.
- For each venue, the season-scoped hydrated Venue endpoint returned an object identical to the Feed venue object in a response under 1 KB.
- These are historical-current responses; matching season labels do not prove immutable historical venue metadata.

### Standings controls

- Pre-opening versus Opening Day captures establish the tested endpoint's end-of-day date cutoff.
- Early and final MLB controls preserve partial Last 10, streak, rank, games-back, clinch, and elimination states.
- Explicit Wild Card-with-leaders, spring-training, and postseason requests demonstrate type-dependent group structures.
- International League and Pacific Coast League responses demonstrate different valid division/team cardinalities.
- DISC-010 reuses these DISC-006 fixtures; it adds no separate request or fixture.

## Build 002.5 captured evidence

| Fixture | Kind | Retrieved UTC | HTTP / raw bytes | Full-response SHA-256 |
|---|---|---|---:|---|
| `disc-008-119-depthchart-2025.json` | `historical-current` | `2026-10-06T01:35:34.813Z` | 200 / 11,286 | `2da8b6a0f35a17f734053822cc9202f4cd73ada1d8ca7f1f6205de2961b791de` |
| `disc-008-119-depthchart-2026.json` | `historical-current` | `2026-10-06T01:35:31.096Z` | 200 / 11,286 | `2da8b6a0f35a17f734053822cc9202f4cd73ada1d8ca7f1f6205de2961b791de` |
| `disc-008-139-depthchart-2025.json` | `historical-current` | `2026-10-06T01:35:36.275Z` | 200 / 8,937 | `be9ea14a791ac27555488d9cf8c900e80b3f7bfdd958135afcb653e12c4af78a` |
| `disc-008-445-depthchart-2025.json` | `historical-current` | `2026-10-06T01:35:33.314Z` | 200 / 253 | `77879ee316875340ae753bbc280ec5d7e7a6b6ec4aee8ea1a92c7e0f4d782a33` |
| `disc-009-119-logo-current-mlb.json` | `live-snapshot` | `2026-10-06T01:36:18.245Z` | 200 / 1,188 | `9840fd7c20fb4614a1797f1fcf9613586fb54dac49dbe4b894086aa07555280f` |
| `disc-009-133-logo-relocated.json` | `live-snapshot` | `2026-10-06T01:36:14.188Z` | 200 / 2,853 | `598538b486eef1fc4834f0a88093fc03b26c558e264afc21f5c3c4b2ba209f0c` |
| `disc-009-159-logo-al-all-star.json` | `live-snapshot` | `2026-10-06T01:36:08.787Z` | 200 / 11,658 | `107a245daa37b0d83a03e441dae131dcf8f729a3e145e8506894d9d91ba6ff98` |
| `disc-009-160-logo-nl-all-star.json` | `live-snapshot` | `2026-10-06T01:36:10.100Z` | 200 / 25,504 | `428a9411d3a3836aef382ce85c00efc02ba190cbf59d5a30f1eef43a7333c9fd` |
| `disc-009-402-logo-aa.json` | `live-snapshot` | `2026-10-06T01:36:15.550Z` | 200 / 10,452 | `4d193f21ee4f378466e14a7c7dd298ab28f0999adc4e6f9ba7816cdb6318fea3` |
| `disc-009-42-logo-placeholder.json` | `live-snapshot` | `2026-10-06T01:36:16.922Z` | 200 / 1,474 | `f7ef8a376658a96fc0de5427a788ddf03798948c0b75c51fb1451dd13a9620af` |
| `disc-009-445-logo-aaa.json` | `live-snapshot` | `2026-10-06T01:36:12.827Z` | 200 / 4,160 | `3b2389eee8275c2811cd54aa5aa6b8449be08b9673b2018702eafa6e9cbf165b` |
| `disc-009-999999-logo-missing.json` | `live-snapshot` | `2026-10-06T01:36:11.518Z` | 404 / 14 | `a469ab4ca4e55bf547566e9ebfa1b809c933207e9d558156bc0c4252b17533fe` |

### Depth-chart controls

- Dodgers season-2025 and season-2026 requests were byte-identical and included active plus injured-list entries.
- `SP`, `P`, and `CP` demonstrate useful annotations, but Ohtani was reduced to `DH` rather than the dated roster's `TWP` identity.
- Triple-A Columbus returned no `roster` property while its dated active-roster fixture contained 28 players.
- After intersection with the dated active roster, `SP` is approved as separately sourced metadata for deriving `additionalStarters`; it may affect Bullpen grouping and the user's include/exclude presentation choice, but never roster membership or selected-starter authority.

### Logo controls

- Seven valid samples cover MLB, Triple-A, Double-A, relocated/current-brand, All-Star, and placeholder IDs.
- Valid responses were vector SVGs with viewBox, no intrinsic dimensions, permissive CORS, 14-day caching, and no redirects or embedded raster image.
- The missing-ID control deliberately records a 404/non-SVG response. Asset failure is not game-data failure.
- SVG bodies are fingerprinted but not retained.

## Build 002.6 captured evidence

| Fixture | Kind | Retrieved UTC | HTTP / raw bytes | Full-response SHA-256 |
|---|---|---|---:|---|
| `disc-011-113-standings-aa.json` | `historical-current` | `2026-10-06T12:11:42.524Z` | 200 / 29,420 | `f97ed8ecba6c9d7f07201cba434ec5504d24aaf7f4c0e159147e3e72ac1fbf6a` |
| `disc-011-116-standings-high-a.json` | `historical-current` | `2026-10-06T12:11:48.015Z` | 200 / 29,567 | `c6adf8cfc06c0d3c9d2a35212d609d5e23cf18350ae381d82f7440972548f1b5` |
| `disc-011-122-standings-single-a.json` | `historical-current` | `2026-10-06T12:11:37.122Z` | 200 / 29,356 | `40924a13c539b98a7ceec492a41246e2b160e4563e25ee5cfd93b3c43c1f4e44` |
| `disc-011-249-coaches-single-a.json` | `historical-current` | `2026-10-06T12:11:45.235Z` | 200 / 1,076 | `dd697409ff5f5bf40e3d0db9d6a93b6368e376b4c9dffa3c94e06b9dc2a437e5` |
| `disc-011-249-depthchart-single-a.json` | `historical-current` | `2026-10-06T12:11:50.662Z` | 200 / 253 | `11fb7f568fc2fbd5eab33ce38af222b3310669ac1d8389dc86b17691000120b3` |
| `disc-011-249-logo-single-a.json` | `live-snapshot` | `2026-10-06T12:12:06.232Z` | 200 / 58,565 | `53fb34afd22afce6bd4ba16644975c87797e9dcbc50337a293ef0b8c337f2ba6` |
| `disc-011-249-roster-single-a.json` | `historical-current` | `2026-10-06T12:11:39.796Z` | 200 / 29,184 | `41c0693d4069614d3986df33671c6a21bdd310cc6b18c4c6c87575403b1e0628` |
| `disc-011-402-coaches-aa.json` | `historical-current` | `2026-10-06T12:11:38.437Z` | 200 / 1,399 | `170afc860543131bf4c8fcfb4932c157fb473b17d1228e5ca586e2bf598c8fe4` |
| `disc-011-402-depthchart-aa.json` | `historical-current` | `2026-10-06T12:11:46.580Z` | 200 / 253 | `7c541139a34b8d63828b2c3e60f79490c9645d35b35c781b6b7242d438770512` |
| `disc-011-432-coaches-high-a.json` | `historical-current` | `2026-10-06T12:11:43.871Z` | 200 / 904 | `933dbd0b4599b1dbc350a4ecf86d1bbee257c0497f8772947292b80b9f01b199` |
| `disc-011-432-depthchart-high-a.json` | `historical-current` | `2026-10-06T12:11:49.316Z` | 200 / 253 | `5dc11bfe19b44603eff9b238e3e9c1c1a2beddbdc603765c600c441d14372262` |
| `disc-011-432-logo-high-a.json` | `live-snapshot` | `2026-10-06T12:12:03.150Z` | 200 / 10,219 | `68aa46cfaa694f5a3ed59495a7b5393e672967593fbc2c7450fe5386a009a48c` |
| `disc-011-432-roster-high-a.json` | `historical-current` | `2026-10-06T12:11:41.174Z` | 200 / 29,326 | `9fa6b1370348e50302da2d767b3f68c2431782a18ee4f42a9daa71674f0d7da5` |
| `disc-011-668954-people-aaa.json` | `historical-current` | `2026-10-06T12:15:44.078Z` | 200 / 3,771 | `68eb83861a0bc599d67d2609338a5dac85733a1c9a5fab4b9f82e9a237ef3f3b` |
| `disc-011-674868-people-aa.json` | `historical-current` | `2026-10-06T12:15:46.723Z` | 200 / 3,757 | `2b2848a606f9a9b674368730eaba5aac49dd7f1385980498c51f466b0d829487` |
| `disc-011-679977-people-single-a.json` | `historical-current` | `2026-10-06T12:15:48.086Z` | 200 / 3,644 | `d45987768dd18256034727acd970b470b3e68103b2bcf65f4241b68d070e6829` |
| `disc-011-781501-feed-aaa.json` | `historical-current` | `2026-10-06T12:11:06.147Z` | 200 / 893,843 | `13145bcbf280df5c9b80db7a9b643555b8703e2162504eec0dca913b8d8ce276` |
| `disc-011-781501-schedule-aaa.json` | `historical-current` | `2026-10-06T12:10:57.936Z` | 200 / 7,198 | `a10d87ec78d00a99e6c57cda381273aced4d853da1253ad7f1872d10b3de9c8a` |
| `disc-011-783048-feed-aa.json` | `historical-current` | `2026-10-06T12:11:01.978Z` | 200 / 546,174 | `b3288c4d8a6944efc9797eacdb2d71c10af0975c9020e480583f8a690af3d25b` |
| `disc-011-783048-schedule-aa.json` | `historical-current` | `2026-10-06T12:10:59.246Z` | 200 / 7,195 | `26503adcaf872e5a04c885be6cb3207a60cbf7cedd5b377056009f0959814ee5` |
| `disc-011-784002-feed-high-a.json` | `historical-current` | `2026-10-06T12:11:03.335Z` | 200 / 477,710 | `c37f4cee68d4c8ce2a0c68638dc520691680c6085e0fb1b51dc217e720316418` |
| `disc-011-784002-schedule-high-a.json` | `historical-current` | `2026-10-06T12:11:04.668Z` | 200 / 7,222 | `235574154176dfbfac5fe173fd058c9ce9321fb90a6dbf0fbf560e5f6b85aed2` |
| `disc-011-786772-feed-single-a.json` | `historical-current` | `2026-10-06T12:11:00.618Z` | 200 / 492,670 | `286b55d3ba7a75b57946ef92c52ec880e52633e3f237742ebf5e67c221043c86` |
| `disc-011-786772-schedule-single-a.json` | `historical-current` | `2026-10-06T12:11:07.412Z` | 200 / 7,212 | `f3074ad550b9149458c44c43b4e404b52f8344bd9128968d46d1742ded30bcb8` |
| `disc-011-802105-people-high-a.json` | `historical-current` | `2026-10-06T12:15:45.364Z` | 200 / 3,721 | `1ac558a8aed495a06134d420de85784500b9b779a1ae73e211f2bf89f1b210eb` |
| `disc-011-people-level-controls.json` | `historical-current` | `2026-10-06T12:11:52.035Z` | 200 / 3,792 | `503120f4670a6bf175df1c315066fe37cd159928662dd6b8bcf096479c6a3254` |
| `disc-012-660271-people-postseason-2025.json` | `historical-current` | `2026-10-06T12:14:34.759Z` | 200 / 10,416 | `3188e122f0ce4fe4b36efb8f88f4c57177e5b955f74836a4fb4fd3c95df705bb` |
| `disc-012-660271-people-regular-2025.json` | `historical-current` | `2026-10-06T12:14:32.740Z` | 200 / 5,469 | `bb6efe8d8f6b1cdcc9610b3b4bdaa9dc2e3b6d4324664406d0e0a7b5c391336c` |
| `disc-012-660271-people-spring-2025.json` | `historical-current` | `2026-10-06T12:14:29.760Z` | 200 / 2,782 | `860e87d54004a148b4b48b6fe40ac9330e0fd2d7a9f3d7858e13d1ca39926f8a` |
| `disc-012-778718-feed-spring.json` | `historical-current` | `2026-10-06T12:13:54.747Z` | 200 / 1,122,421 | `6cee51c9776821582ba1484a5ed539b5a2f87e50d12748bd107f2df34ebf1bde` |
| `disc-012-778718-schedule-spring.json` | `historical-current` | `2026-10-06T12:13:57.392Z` | 200 / 7,580 | `ea00d613029bb1d4e50dd5829cea1231383a8b68b667bdb8049f269cdbcc3b91` |
| `disc-012-813027-feed-world-series.json` | `historical-current` | `2026-10-06T12:14:11.864Z` | 200 / 859,046 | `5a7942fb6f01c5d489614fc79d2691b4ecd03278e9a202647d5ede94aecf7c10` |
| `disc-012-813027-schedule-world-series.json` | `historical-current` | `2026-10-06T12:14:17.180Z` | 200 / 7,653 | `0b2c564a9a8a7cfa6932b3e0b474e0e214c17da022446bb7bff8cf382c2f4115` |
| `disc-012-813040-feed-league-championship.json` | `historical-current` | `2026-10-06T12:14:13.197Z` | 200 / 720,264 | `e80b6ed0b109c779efd9b25b76b16993b7bf3204b99619cbc2dffe5b61d4ee7a` |
| `disc-012-813040-schedule-league-championship.json` | `historical-current` | `2026-10-06T12:14:14.484Z` | 200 / 7,676 | `3659df2da5714a954cb4fd8880facdc8725a248855c8db3459e6512a4b399138` |
| `disc-012-813047-feed-division-series.json` | `historical-current` | `2026-10-06T12:14:15.902Z` | 200 / 831,608 | `ee21c773260a4f6bb07b362427a6bbbe7607691e07cde6af311f5e77dde5d759` |
| `disc-012-813047-schedule-division-series.json` | `historical-current` | `2026-10-06T12:13:53.342Z` | 200 / 7,612 | `6a8904c4d81b51b149062e9e9e8c0644150f73f15409efec2085368628681009` |
| `disc-012-813072-feed-wild-card.json` | `historical-current` | `2026-10-06T12:13:56.115Z` | 200 / 712,205 | `e699153b4c23b6845a0d47a0416022cdbb6b8bca025319f5a450ce6de2edb09a` |
| `disc-012-813072-schedule-wild-card.json` | `historical-current` | `2026-10-06T12:13:52.022Z` | 200 / 7,690 | `fd287ddaf8f373dfc61c4e06a9d97def84c84707b77bc26174cb7f3f134f6679` |

### MiLB level controls

- Four Schedule/feed pairs cover completed regular-season games at sports 11–14. Each Schedule supplies probable pitchers and two nine-player lineups; each Feed supplies populated player maps and a non-MLB-sized officials collection.
- Active rosters now reach Single-A in the bounded set. Coaches and regular-season standings were captured at AA, High-A, and Single-A.
- Unscoped People hydration omitted stats for the four MiLB controls. Explicit matching `sportId` plus `gameType=[R]` produced the level split and `All` aggregate.
- AA, High-A, and Single-A depth-chart responses omitted `roster`, extending the prior Triple-A unavailable-state control.

### Competition controls

- Final-game Schedule/feed pairs cover spring (`S`) and the four current postseason game types (`F`, `D`, `L`, `W`).
- Explicit People controls separate spring, regular-season, and postseason totals; they are not interchangeable with the earlier default date-range request.
- These historical-current fixtures establish retrievable shape and scope, not original-date mutability or publication timing.

## Registered controls awaiting focused capture or migration

Registration records why a case belongs in the discovery set. It is not a claim that a schema-v1 fixture already exists.

| Control | Purpose | Planned coverage | Current status |
|---|---|---|---|
| gamePk `822955` | Existing recorded pregame control; current historical harness control | DISC-001, DISC-002, DISC-003 | Current historical pair captured; prior pregame evidence remains external/historical |
| gamePk `849834` | Live postseason Pre-Game Schedule/feed availability | DISC-001, DISC-002, DISC-012 | Pregame pair captured; same-game live/final follow-up remains opportunistic |
| gamePk `849839` | Same-day Scheduled postseason comparison | DISC-001, DISC-002, DISC-012 | Scheduled pair captured |
| gamePk `777164` | Postponed/rescheduled source-view divergence | DISC-001 | Schedule/feed pair captured |
| gamePk `777861` | Suspended/resumed date semantics | DISC-001 | Current historical Schedule/feed pair captured; transient suspension not reproducible |
| gamePk `746577` | Regular-season cancellation | DISC-001 | Schedule control captured |
| gamePk `849809` | Start-time-TBD and placeholder-team behavior | DISC-001, DISC-012 | Live future Schedule control captured |
| gamePk `777447` | Doubleheader Game 1 | DISC-001, DISC-005, source cutoff/precedence | Schedule control captured |
| gamePk `777458` | Doubleheader Game 2 | DISC-001, DISC-005, source cutoff/precedence | Direct response and multi-date rescheduled view captured |
| Taylor Ward, person `621493` | Traded-player aggregate stat selection | DISC-005 | 2026 club and aggregate splits captured |
| Seranthony Domínguez, person `622554` | Trade-boundary roster and aggregate-stat selection | DISC-004, DISC-005 | Baltimore/Toronto roster boundary, transaction, and 2026 club/aggregate splits captured |
| Cal Raleigh, person `663728` | Single-team aggregate control | DISC-005 | 2026 club and aggregate splits captured |
| Colt Emerson, person `806068` | MLB-debut boundary/no-prior-MLB-stat behavior | DISC-005, DISC-011 | Pre-debut empty and post-debut populated responses captured |
| Shohei Ohtani, person `660271` | Two-way roster classification and competition-scoped statistics | DISC-004, DISC-005, DISC-012 | TWP roster plus default-boundary and explicit spring/regular/postseason controls captured |
| Aaron Judge, person `592450` | Active/inactive roster membership boundary | DISC-004 | Pre-IL, on-IL, post-activation rosters and transaction response captured |
| Washington, team `120` | Manager-to-interim-manager label transition | DISC-007 | Before/after dated staff responses captured |
| Columbus, team `445` | MiLB roster and coaching-role controls | DISC-004, DISC-007 | Triple-A roster and staff captured |
| gamePks `745001`, `745814`, `778563`, `778718`, `781501` | Ordinary, international, spring, and Triple-A venue-source comparison | DISC-003, DISC-016 | Schedule/feed pairs and equivalent hydrated Venue records captured |
| gamePks `745652`, `778494` | Athletics Oakland-to-Sacramento venue transition | DISC-003 | 2024/2025 Schedule/feed pairs and season-scoped Venue records captured |
| MLB standings, `2025-03-26` through `2025-09-28` | Opening, early, final, Wild Card, clinch, and elimination semantics | DISC-006, DISC-010 | Regular-season and Wild Card-with-leaders controls captured |
| MLB spring/postseason standings, 2025 | Competition-specific standings scope | DISC-006, DISC-012 | Explicit spring-training and postseason controls captured |
| International League `117` and Pacific Coast League `112` | Triple-A group/cardinality controls | DISC-006, DISC-010, DISC-011 | Final-date regular-season standings captured |
| gamePks `781501`, `783048`, `784002`, `786772` | Completed Triple-A through Single-A source-shape controls | DISC-011 | Schedule/feed pairs captured at sports 11–14 |
| teams `402`, `432`, `249` | Lower-level roster, coaches, depth-chart, standings, and logo controls | DISC-011 | Endpoint-specific AA/High-A/Single-A evidence captured; depth-chart roster absent |
| people `668954`, `674868`, `802105`, `679977` | Explicit MiLB People-stat scope | DISC-011 | Sport-scoped regular-season pitching splits captured at sports 11–14 |
| gamePks `813072`, `813047`, `813040`, `813027` | Current postseason-round controls | DISC-012 | Final Schedule/feed pairs captured for `F`, `D`, `L`, and `W` |
| Dodgers `119`, Rays `139`, Columbus `445` | MLB/MiLB depth-chart role and availability controls | DISC-008 | Four captures establish annotation-only disposition |
| Logo IDs `119`, `133`, `159`, `160`, `402`, `42`, `445`, `999999` | Current-brand, MiLB, special/placeholder, and missing-asset controls | DISC-009 | Seven SVG successes and one intentional 404 captured |

## Planned fixture categories

Future discovery work must select identifiers from verified evidence and then add manifest rows. Remaining categories include:

- ordinary future MLB game captured at multiple pregame/live/final milestones;
- postponed/makeup, suspended/resumed, delayed, cancelled, and TBD states;
- Opening Day, spring training, and postseason games;
- postseason expanded officiating crew;
- neutral-site or international venue;
- roster transaction/injury/inactive and manager/staff-change cases;
- two-way player and opener/role edge cases;
- standings leader, tie, Wild Card, clinched, and eliminated states;
- future and completed games at each intended MiLB level;
- active, renamed/reaffiliated, inactive, MiLB, and special-team logo assets.

## Manifest maintenance rules

- Add a row when evidence is captured; do not mark a planned category verified in advance.
- Preserve exact identifiers, timestamps, requests, state, evidence kind, limitations, and relevant DISC links.
- Never silently replace `recorded-prior` evidence with a current refetch.
- Keep fixtures minimized and use the full-response hash to identify exact retrieval content.
- Record a failed or empty observation explicitly when it is material; do not collapse it into “unsupported.”
