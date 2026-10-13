# Build 028.7 — Individual Placement Progressive Reveal

## Scope

This decimal build is intentionally limited to the first-item progressive-reveal workflow for a new Individual Placement object. The already-accepted Create New Item continuation workflow is unchanged.

## Change

The Individual Placement controls now reliably reveal in this order for the first item:

1. Role
2. Field
3. Field-specific option when required (for example, Name Format)
4. Alignment
5. Place Item on Scorecard

The workflow logic already controlled the `hidden` state correctly, but Designer label/button layout rules could override the browser's default handling of the `hidden` attribute. Build 028.7 explicitly enforces `display: none !important` for the progressive controls while hidden. The Place Item button also starts with the `hidden` attribute in the HTML so the initial render cannot flash it before JavaScript synchronizes the workflow.

After the first item is placed, the existing subsequent-item behavior remains unchanged: the form may remain fully available and pre-populated for efficient continuation through the remaining roles.

## Acceptance

- Enter a brand-new Individual Placement workflow. Only Role is initially available.
- Choosing Role reveals Field.
- Choosing Player Name reveals Name Format before Alignment.
- Choosing a non-name field reveals Alignment without Name Format.
- Completing any required field-specific option reveals Alignment.
- Choosing Alignment reveals Place Item on Scorecard.
- Subsequent-item behavior is unchanged.
- Existing Create New Item behavior is unchanged.
