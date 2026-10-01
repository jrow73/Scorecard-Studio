import fs from 'node:fs';
import { normalizePregameData } from '../js/normalize.js';
import { getFieldDefinition, resolveField } from '../js/field-registry.js';
import { formatFieldValue } from '../js/formatter.js';

const app = fs.readFileSync(new URL('../js/app.js', import.meta.url), 'utf8');
const api = fs.readFileSync(new URL('../js/api.js', import.meta.url), 'utf8');
const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const meta = JSON.parse(fs.readFileSync(new URL('../app-meta.json', import.meta.url), 'utf8'));

if (meta.build !== '029.1') throw new Error('app-meta build is not 029.1');
if (!html.includes('./js/app.js?v=0291')) throw new Error('Build 029.1 app cache key missing');
if (!api.includes('export async function fetchGameBoxscore')) throw new Error('Game boxscore fetch helper missing');
if (!api.includes('startTimeTBD: Boolean(game.status?.startTimeTBD)')) throw new Error('Schedule startTimeTBD plumbing missing');
if (!api.includes('awayIsWinner: game.teams?.away?.isWinner === true')) throw new Error('Earlier-game result plumbing missing');
if (!app.includes('findEarlierSameDayCompletedGame')) throw new Error('Earlier same-day game detection missing');
if (!app.includes('refreshDoubleheaderSelectionContext')) throw new Error('Game 2 schedule refresh missing');
if (!app.includes('fetchGameBoxscore(earlierSameDayGame.gamePk)')) throw new Error('Earlier-game boxscore fetch missing');

const previousDayPeople = {
  people: [
    {
      id: 1,
      fullName: 'Game One Hitter',
      stats: [{
        group: { displayName: 'hitting' },
        splits: [{ stat: { gamesPlayed: 50, atBats: 200, hits: 60, avg: '.300', obp: '.360', slg: '.450', ops: '.810', homeRuns: 8, rbi: 30 } }]
      }]
    },
    {
      id: 2,
      fullName: 'Fallback Bench',
      stats: [{
        group: { displayName: 'hitting' },
        splits: [{ stat: { gamesPlayed: 40, atBats: 100, hits: 25, avg: '.250', obp: '.310', slg: '.350', ops: '.660', homeRuns: 2, rbi: 10 } }]
      }]
    }
  ]
};

const roster = {
  roster: [
    { person: { id: 1, fullName: 'Game One Hitter' }, jerseyNumber: '11', position: { code: '8', abbreviation: 'CF', name: 'Outfielder' } },
    { person: { id: 2, fullName: 'Fallback Bench' }, jerseyNumber: '22', position: { code: '3', abbreviation: '1B', name: 'First Base' } }
  ]
};

const standingsPayloads = [{
  records: [{ teamRecords: [
    { team: { id: 138 }, leagueRecord: { wins: 38, losses: 35, pct: '.521' }, divisionRank: '4', divisionGamesBack: '7.0', streak: { streakCode: 'W1' } },
    { team: { id: 145 }, leagueRecord: { wins: 23, losses: 50, pct: '.315' }, divisionRank: '5', divisionGamesBack: '23.5', streak: { streakCode: 'L6' } }
  ] }]
}];

const priorBoxscore = {
  teams: {
    away: {
      team: { id: 138, record: { gamesPlayed: 74, wins: 39, losses: 35, winningPercentage: '.527' } },
      players: {
        ID1: { person: { id: 1 }, seasonStats: { batting: { gamesPlayed: 51, atBats: 204, hits: 63, avg: '.309', obp: '.368', slg: '.461', ops: '.829', homeRuns: 9, rbi: 32 }, pitching: {} } }
      }
    },
    home: {
      team: { id: 145, record: { gamesPlayed: 74, wins: 23, losses: 51, winningPercentage: '.311' } },
      players: {}
    }
  }
};

const game2 = {
  gamePk: '777458', officialDate: '2025-06-19', gameDate: '2025-06-19T18:15:00Z', season: 2025,
  gameNumber: 2, startTimeTBD: false,
  awayTeamId: 138, homeTeamId: 145,
  awayTeam: 'St. Louis Cardinals', homeTeam: 'Chicago White Sox',
  awayTeamData: { id: 138, name: 'St. Louis Cardinals' }, homeTeamData: { id: 145, name: 'Chicago White Sox' },
  awayLineup: [{ id: 1, fullName: 'Game One Hitter', primaryPosition: { abbreviation: 'CF', name: 'Outfielder' } }], homeLineup: [],
  venueData: { id: 4, name: 'Rate Field', timeZone: { id: 'America/Chicago' } }
};

const earlierSameDayGame = {
  gamePk: '777447', officialDate: '2025-06-19', gameNumber: 1,
  awayTeamId: 138, homeTeamId: 145, awayIsWinner: true, homeIsWinner: false, isTie: false
};

const model = normalizePregameData(null, {
  people: previousDayPeople,
  rosters: { away: roster, home: { roster: [] } },
  standingsPayloads,
  earlierSameDayGame,
  earlierSameDayBoxscore: priorBoxscore
}, game2);

if (model.away.lineup[0]?.stats?.avg !== 0.309) throw new Error('Game 2 lineup did not use Game 1 boxscore seasonStats');
if (model.away.lineup[0]?.stats?.homeRuns !== 9) throw new Error('Game 2 counting stats did not use Game 1 boxscore seasonStats');
if (model.away.bench[0]?.stats?.avg !== 0.25) throw new Error('Missing Game 1 player did not fall back to previous-day People stats');
if (model.away.team.record.wins !== 39 || model.away.team.record.losses !== 35) throw new Error('Game 2 away pregame record did not use Game 1 postgame record');
if (model.away.team.record.gamesPlayed !== 74 || model.away.team.gameNumber !== 75) throw new Error('Away team game number is not pregame gamesPlayed + 1');
if (model.home.team.record.gamesPlayed !== 74 || model.home.team.gameNumber !== 75) throw new Error('Home team game number is not pregame gamesPlayed + 1');
if (model.away.team.standings.streak !== 'W2') throw new Error('Game 2 away streak did not advance through completed Game 1');
if (model.home.team.standings.streak !== 'L7') throw new Error('Game 2 home streak did not advance through completed Game 1');
if (model.away.team.standings.divisionRank !== 4 || model.away.team.standings.divisionGamesBack !== '7.0') throw new Error('Division standings should remain at pre-Game-1 snapshot');

const pendingModel = normalizePregameData(null, {
  people: previousDayPeople,
  rosters: { away: roster, home: { roster: [] } },
  standingsPayloads
}, game2);
if (pendingModel.away.lineup[0]?.stats?.avg !== 0.3) throw new Error('Pending Game 2 should use previous-day player stats');
if (pendingModel.away.team.record.wins !== 38 || pendingModel.away.team.record.losses !== 35) throw new Error('Pending Game 2 should keep previous-day team record');
if (pendingModel.away.team.standings.streak !== 'W1' || pendingModel.home.team.standings.streak !== 'L6') throw new Error('Pending Game 2 should not invent post-Game-1 streak');
if (pendingModel.away.team.gameNumber !== 75 || pendingModel.home.team.gameNumber !== 75) throw new Error('Pending Game 2 Team Game Number should still be known');

const teamGameField = getFieldDefinition('away.team.gameNumber');
if (!teamGameField) throw new Error('Away Team Game Number field is not registered');
if (resolveField(model, 'away.team.gameNumber').value !== 75) throw new Error('Away Team Game Number field does not resolve');

const timedModel = { ...model, game: { ...model.game, startTime: '2025-06-19T18:10:00Z', venue: { ...model.game.venue, timeZone: 'America/Chicago' } } };
const startDef = getFieldDefinition('game.startTime');
const startText = formatFieldValue(startDef, resolveField(timedModel, 'game.startTime'), timedModel);
if (!/^1:10\s*PM$/i.test(startText)) throw new Error(`Venue-local PDF start time formatting failed: ${startText}`);

const tbdModel = normalizePregameData(null, {}, { ...game2, startTimeTBD: true });
if (tbdModel.game.startTime !== null) throw new Error('startTimeTBD did not blank normalized PDF start time');
if (resolveField(tbdModel, 'game.startTime').state !== 'missing') throw new Error('TBD start time should resolve as missing/blank');

console.log('Build 029.1 focused checks passed.');
