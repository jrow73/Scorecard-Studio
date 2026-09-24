import fs from 'node:fs';
import assert from 'node:assert/strict';
import { normalizePregameData } from '../js/normalize.js';
import { DESIGNER_SAMPLE_MODEL } from '../js/sample-data.js';
import { resolveSlotContent } from '../js/slot-content.js';

const root = new URL('../', import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, root), 'utf8');
const api = read('js/api.js');
const app = read('js/app.js');

assert.match(api, /hydrate:\s*"lineups,weather,venue,team,probablePitcher"/);
assert.match(api, /export async function fetchTeamRoster/);
assert.match(api, /\/roster\?\$\{params\.toString\(\)\}/);
assert.match(app, /state\.selectedRosters/);
assert.match(app, /fieldsRequireGameFeed\(fieldIds\)/);
assert.match(app, /ensureSelectedGameFeed/);

const lineup = Array.from({ length: 9 }, (_, i) => ({ id: i + 1, fullName: `Starter ${i + 1}`, firstName: 'Starter', lastName: String(i + 1), useName: 'Starter', primaryPosition: { abbreviation: i === 8 ? 'DH' : 'IF', name: i === 8 ? 'Designated Hitter' : 'Infielder', type: i === 8 ? 'Hitter' : 'Infielder' } }));
const roster = {
  roster: [
    ...lineup.map((p, i) => ({ person: { ...p, boxscoreName: `S${i + 1}`, batSide: { code: 'R' }, pitchHand: { code: 'R' } }, jerseyNumber: String(i + 1), position: p.primaryPosition })),
    { person: { id: 20, fullName: 'Bench Player', firstName: 'Bench', lastName: 'Player', useName: 'Bench', useLastName: 'Player', boxscoreName: 'Player, B', primaryPosition: { abbreviation: 'OF', name: 'Outfielder', type: 'Outfielder' }, batSide: { code: 'L' }, pitchHand: { code: 'R' } }, jerseyNumber: '20', position: { abbreviation: 'OF', name: 'Outfielder', type: 'Outfielder' } },
    { person: { id: 30, fullName: 'Starter Pitcher', firstName: 'Starter', lastName: 'Pitcher', useName: 'Starter', useLastName: 'Pitcher', boxscoreName: 'Pitcher, S', primaryPosition: { abbreviation: 'P', name: 'Pitcher', type: 'Pitcher' }, batSide: { code: 'R' }, pitchHand: { code: 'L' } }, jerseyNumber: '30', position: { abbreviation: 'P', name: 'Pitcher', type: 'Pitcher' } },
    { person: { id: 31, fullName: 'Relief Pitcher', firstName: 'Relief', lastName: 'Pitcher', useName: 'Relief', useLastName: 'Pitcher', boxscoreName: 'Pitcher, R', primaryPosition: { abbreviation: 'P', name: 'Pitcher', type: 'Pitcher' }, batSide: { code: 'R' }, pitchHand: { code: 'R' } }, jerseyNumber: '31', position: { abbreviation: 'P', name: 'Pitcher', type: 'Pitcher' } }
  ]
};

const game = {
  gamePk: '1', officialDate: '2026-09-20', gameDate: '2026-09-20T19:10:00Z', season: 2026,
  awayTeam: 'Away', homeTeam: 'Home', awayTeamId: 100, homeTeamId: 200,
  awayTeamData: { id: 100, name: 'Away' }, homeTeamData: { id: 200, name: 'Home' },
  awayLineup: lineup, homeLineup: [], awayProbablePitcher: { id: 30, fullName: 'Starter Pitcher' }, homeProbablePitcher: null,
  venueData: { id: 1, name: 'Park' }, weather: { condition: 'Sunny', temp: '72', wind: '5 mph' }
};

const model = normalizePregameData(null, { rosters: { away: roster, home: roster } }, game);
assert.equal(model.away.lineup.filter((row) => row.player?.id).length, 9);
assert.equal(model.away.lineup[0].player.boxscoreName, 'S1');
assert.deepEqual(model.away.bench.map((row) => row.player.name), ['Bench Player']);
assert.equal(model.away.startingPitcher.player.name, 'Starter Pitcher');
assert.deepEqual(model.away.bullpen.map((row) => row.player.name), ['Relief Pitcher']);
assert.equal(model.home.bench.length, 0, 'bench stays blank until a lineup is posted');
assert.equal(model.home.startingPitcher, null);
assert.deepEqual(model.home.bullpen.map((row) => row.player.name), ['Starter Pitcher', 'Relief Pitcher'], 'all roster pitchers remain bullpen candidates when SP is unavailable');

assert.equal(resolveSlotContent({ type: 'field', field: 'home.bullpen[].player.name', format: { nameFormat: 'boxscore' } }, DESIGNER_SAMPLE_MODEL, 'home.bullpen', { slot: 1 }), 'Crowe');
assert.equal(resolveSlotContent({ type: 'field', field: 'home.startingPitcher.player.name', format: { nameFormat: 'boxscore' } }, DESIGNER_SAMPLE_MODEL, 'home.startingPitcher'), 'McAllister, T');

console.log('Build 025.1 pregame schedule + roster plumbing checks passed.');
