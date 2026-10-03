# Build 032.1 — Field Palette Counts & Filtering

## Status
Implementation candidate for Build 032 acceptance testing.

## Scope
Build 032.1 is the first pass of **Build 032 — Designer Remaining Tweaks**. It is intentionally limited to the Field Palette filtering and category-count cleanup identified after Build 031 closure.

### 1. Add `Unused only` filter
The Field Palette filter now offers three views:

- **All data**
- **Used only**
- **Unused only**

`Unused only` shows palette items that currently have no placement/reference on the scorecard. The existing search field continues to combine with the selected filter.

When either **Used only** or **Unused only** is active, matching categories are expanded so the filtered results are immediately visible.

### 2. Standardize category counts as `used of available`
Non-Text-Template category cards now show a compact ratio:

`[used] of [available]`

Both values are dynamic.

- **used** = number of immediate child palette items in that category that currently have at least one use/placement.
- **available** = total immediate child palette items currently available to that layout, using the layout's current Standard/Custom field availability and existing compatibility rules.

The ratio is calculated from the complete category, not from the temporary search/filter result set. For example, filtering to **Unused only** does not change a category's denominator.

### Player-category interpretation
For **Away Players** and **Home Players**, the immediate children are the five object/collection choices:

1. Starting Pitcher
2. Starting Lineup
3. Defensive Alignment
4. Bench
5. Bullpen

Therefore, if only Starting Lineup is used, the category displays **`1 of 5`**. It does not roll up every field used inside the Starting Lineup collection.

### Generic Text Template
The Build 031 flattened Text Template category remains a special creation/instance surface and does not gain the category ratio in this pass.

## Files changed
- `app-meta.json`
- `index.html`
- `js/app.js`
- `tests/build0321.test.mjs`
- `docs/Build_032.1_Implementation.md`

## Manual acceptance checklist

### Filter
- [ ] Filter menu contains **All data**, **Used only**, and **Unused only**.
- [ ] **All data** shows both used and unused palette items.
- [ ] **Used only** shows only items currently used on the scorecard.
- [ ] **Unused only** shows only items not currently used on the scorecard.
- [ ] Search text combines correctly with all three filter choices.
- [ ] Used/Unused filtered categories open so their matching children can be seen.

### Category counts
- [ ] Game Information displays `[used] of [available]`.
- [ ] Away Team Information displays `[used] of [available]`.
- [ ] Home Team Information displays `[used] of [available]`.
- [ ] Away Players counts immediate child objects/collections (for example, `1 of 5`).
- [ ] Home Players counts immediate child objects/collections.
- [ ] Adding/removing a placement updates the numerator immediately.
- [ ] Changing the layout's Standard/Custom field availability updates the denominator appropriately.
- [ ] Search and Used/Unused filters do not distort the category ratio.
- [ ] Generic Text Template behavior from Build 031 remains unchanged.

## Out of scope
The remaining Build 032 cleanup items are deliberately deferred to later decimals, including button sizing, inspector visual density, user-facing placement terminology, textarea affordance, and Designer header cleanup.
