/**
 * Scorecard Studio v0.5 — player identity presentation.
 * Source pronunciation is displayed verbatim; missing values are never inferred.
 */

function text(value) {
  return typeof value === "string" && value.trim() ? value : null;
}

export function normalizedIdentityName(value) {
  const source = text(value);
  if (!source) return "";
  return source
    .normalize("NFKC")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u2010-\u2015]/g, "-")
    .replace(/\s+/gu, " ")
    .trim()
    .toLocaleLowerCase("und");
}

export function playerIdentityPresentation(player = {}) {
  const displayedName = text(player.name)
    || [text(player.useName) || text(player.firstName), text(player.useLastName) || text(player.lastName)].filter(Boolean).join(" ")
    || "Player";
  const formalFirstName = text(player.firstName);
  const formalLastName = text(player.lastName);
  const formalName = formalFirstName && formalLastName ? `${formalFirstName} ${formalLastName}` : null;
  const distinctFormalName = formalName && normalizedIdentityName(formalName) !== normalizedIdentityName(displayedName)
    ? formalName
    : null;
  const pronunciation = text(player.pronunciation) ? String(player.pronunciation) : null;
  if (!distinctFormalName && !pronunciation) return Object.freeze({ displayedName, formalName: null, pronunciation: null, hasDetails: false });
  return Object.freeze({ displayedName, formalName: distinctFormalName, pronunciation, hasDetails: true });
}
