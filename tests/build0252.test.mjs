import fs from 'node:fs';
import assert from 'node:assert/strict';
import { normalizePregameData } from '../js/normalize.js';

const root = new URL('../', import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, root), 'utf8');
const app = read('js/app.js');
const api = read('js/api.js');
const formatter = read('js/formatter.js');
const meta = JSON.parse(read('app-meta.json'));

assert.equal(meta.build, '025.2');
assert.match(api, /hydrate: "lineups,weather,venue,team,probablePitcher"/);
assert.match(api, /fetchTeamRoster/);
assert.match(api, /fetchPeoplePregameStats/);
assert.match(api, /group=\[hitting,pitching\]/);
assert.match(app, /previousDateString\(officialDate\)/);
assert.match(app, /fetchPeoplePregameStats\(personIds, seasonStart, cutoffDate\)/);
assert.match(formatter, /nameFormat === "boxscore"\) return text\(player\?\.boxscoreName\);/);

const cal = {
  id: 663728, fullName: 'Cal Raleigh', firstName: 'Caleb', lastName: 'Raleigh', useName: 'Cal',
  boxscoreName: 'Raleigh', primaryNumber: '29', batSide: { code: 'S' }, pitchHand: { code: 'R' },
  primaryPosition: { code: '2', name: 'Catcher', type: 'Catcher', abbreviation: 'C' },
  stats: [{ type: { displayName: 'byDateRange' }, group: { displayName: 'hitting' }, splits: [
    { stat: { gamesPlayed: 10, atBats: 30, hits: 9, homeRuns: 2, avg: '.300', obp: '.400', slg: '.500', ops: '.900' }, team: { id: 136 }, sport: { id: 1 } },
    { stat: { gamesPlayed: 10, atBats: 30, hits: 9, homeRuns: 2, avg: '.300', obp: '.400', slg: '.500', ops: '.900' }, sport: { id: 0, code: 'All' } }
  ] }]
};
const pitcher = {
  id: 669923, fullName: 'George Kirby', firstName: 'George', lastName: 'Kirby', useName: 'George',
  boxscoreName: 'Kirby, G', primaryNumber: '68', batSide: { code: 'R' }, pitchHand: { code: 'R' },
  primaryPosition: { code: '1', name: 'Pitcher', type: 'Pitcher', abbreviation: 'P' },
  stats: [{ type: { displayName: 'byDateRange' }, group: { displayName: 'pitching' }, splits: [
    { stat: { gamesPlayed: 4, gamesStarted: 4, wins: 2, losses: 1, era: '3.10', whip: '1.05' }, sport: { id: 0, code: 'All' } }
  ] }]
};
const bench = {
  id: 621493, fullName: 'Taylor Ward', firstName: 'Joseph', lastName: 'Ward', useName: 'Taylor',
  boxscoreName: 'Ward, T', primaryNumber: '27', batSide: { code: 'R' }, pitchHand: { code: 'R' },
  primaryPosition: { code: '7', name: 'Outfielder', type: 'Outfielder', abbreviation: 'LF' },
  stats: [{ type: { displayName: 'byDateRange' }, group: { displayName: 'hitting' }, splits: [
    { stat: { gamesPlayed: 30, homeRuns: 0, avg: '.105' }, team: { id: 136 }, sport: { id: 1 } },
    { stat: { gamesPlayed: 141, homeRuns: 7, avg: '.222' }, sport: { id: 0, code: 'All' } }
  ] }]
};

const scheduleGame = {
  gamePk: '1', officialDate: '2026-09-23', season: 2026, sportId: 1, gameType: 'R', gameNumber: 1,
  gameDate: '2026-09-23T20:00:00Z', awayTeam: 'Away', homeTeam: 'Seattle Mariners',
  awayTeamId: 999, homeTeamId: 136,
  awayTeamData: { id: 999, name: 'Away' },
  homeTeamData: { id: 136, name: 'Seattle Mariners', league: { id: 103, name: 'American League' } },
  awayLineup: [], homeLineup: [cal],
  awayProbablePitcher: null, homeProbablePitcher: { id: 669923, fullName: 'George Kirby' },
  venue: 'T-Mobile Park', venueData: { id: 680, name: 'T-Mobile Park' }, weather: { condition: 'Clear', temp: '70', wind: '5 mph' }
};
const homeRoster = { roster: [
  { person: cal, jerseyNumber: '29', position: cal.primaryPosition },
  { person: bench, jerseyNumber: '27', position: bench.primaryPosition },
  { person: pitcher, jerseyNumber: '68', position: pitcher.primaryPosition }
] };
const supplemental = { rosters: { away: { roster: [] }, home: homeRoster }, people: { people: [cal, bench, pitcher] }, standingsPayloads: [] };
const model = normalizePregameData(null, supplemental, scheduleGame);
assert.equal(model.home.lineup[0].player.boxscoreName, 'Raleigh');
assert.equal(model.home.startingPitcher.player.boxscoreName, 'Kirby, G');
assert.equal(model.home.bench[0].player.boxscoreName, 'Ward, T');
assert.equal(model.home.bench[0].stats.homeRuns, 7, 'traded player should use All aggregate split');
assert.equal(model.home.bullpen.length, 0, 'starter must be removed from bullpen');

const noLineup = normalizePregameData(null, supplemental, { ...scheduleGame, homeLineup: [] });
assert.equal(noLineup.home.bench.length, 0, 'bench stays blank until lineup is posted');

const noStarter = normalizePregameData(null, supplemental, { ...scheduleGame, homeProbablePitcher: null });
assert.equal(noStarter.home.startingPitcher, null);
assert.equal(noStarter.home.bullpen.length, 1, 'all pitchers remain in bullpen when SP is unavailable');

console.log('Build 025.2 pregame API normalization checks passed.');
