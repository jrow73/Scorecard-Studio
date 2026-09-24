import assert from 'node:assert/strict';
import { DESIGNER_SAMPLE_MODEL } from '../js/sample-data.js';
import { getFieldDefinition, resolveField } from '../js/field-registry.js';
import { formatFieldValue } from '../js/formatter.js';
import { resolveSlotContent } from '../js/slot-content.js';

function formatted(fieldId, selector, nameFormat) {
  const definition = getFieldDefinition(fieldId);
  const resolution = resolveField(DESIGNER_SAMPLE_MODEL, fieldId, selector);
  return formatFieldValue(definition, resolution, DESIGNER_SAMPLE_MODEL, { nameFormat });
}

// 025.3 source-fidelity acceptance: each name format uses its documented API-backed property.
assert.equal(formatted('away.lineup[].player.name', { slot: 1 }, 'full'), 'Bo Yu');
assert.equal(formatted('away.lineup[].player.name', { slot: 1 }, 'first'), 'Robert');
assert.equal(formatted('away.lineup[].player.name', { slot: 1 }, 'use'), 'Bo Yu');
assert.equal(formatted('away.lineup[].player.name', { slot: 1 }, 'last'), 'Yu');
assert.equal(formatted('away.lineup[].player.name', { slot: 1 }, 'first-initial-last'), 'R. Yu');
assert.equal(formatted('away.lineup[].player.name', { slot: 1 }, 'boxscore'), 'Yu, B');

assert.equal(formatted('home.bench[].player.name', { slot: 1 }, 'first'), 'Nicholas');
assert.equal(formatted('home.bench[].player.name', { slot: 1 }, 'use'), 'Nico Bell');
assert.equal(formatted('home.bench[].player.name', { slot: 1 }, 'boxscore'), 'Bell, N');

assert.equal(formatted('home.bullpen[].player.name', { slot: 1 }, 'first'), 'Silas');
assert.equal(formatted('home.bullpen[].player.name', { slot: 1 }, 'use'), 'Si Crowe');
assert.equal(formatted('home.bullpen[].player.name', { slot: 1 }, 'boxscore'), 'Crowe, S');

assert.equal(formatted('home.startingPitcher.player.name', null, 'first'), 'Thaddeus');
assert.equal(formatted('home.startingPitcher.player.name', null, 'use'), 'Thad McAllister');
assert.equal(formatted('home.startingPitcher.player.name', null, 'boxscore'), 'McAllister, T');

// Stored/legacy human-readable name-format values remain readable rather than silently falling back to Full Name.
assert.equal(formatted('home.startingPitcher.player.name', null, 'Boxscore Name'), 'McAllister, T');
assert.equal(formatted('home.startingPitcher.player.name', null, 'Use Name + Last Name'), 'Thad McAllister');
assert.equal(formatted('home.startingPitcher.player.name', null, 'First Name'), 'Thaddeus');

// Repeated/record Text Templates use the same formatter path.
assert.equal(
  resolveSlotContent({ type: 'template', template: 'Box: [Pitcher Name|boxscore]' }, DESIGNER_SAMPLE_MODEL, 'home.bullpen', { slot: 1 }),
  'Box: Crowe, S'
);
assert.equal(
  resolveSlotContent({ type: 'template', template: 'Box: [Player Name|boxscore]' }, DESIGNER_SAMPLE_MODEL, 'home.startingPitcher'),
  'Box: McAllister, T'
);

// Clipboard regression guard: page navigation must clear stale selection without clearing the copied payload.
const appSource = await (await import('node:fs/promises')).readFile(new URL('../js/app.js', import.meta.url), 'utf8');
assert.match(appSource, /changeDesignerPage[\s\S]*clearDesignerSelection\(\{ render: false, preserveClipboard: true \}\)/,
  'Designer page navigation preserves clipboard while clearing source-page selection');

console.log('Build 025.3 acceptance checks passed.');
