export const DESIGNER_DRAG_THRESHOLDS = Object.freeze({
  mouse: 2,
  pen: 7,
  touch: 14
});

export function designerPointerIsTouchLike(pointerType = "mouse", firesTouchEvents = false, width = 1, height = 1) {
  return pointerType === "touch" || firesTouchEvents === true || Number(width) > 4 || Number(height) > 4;
}

export function designerDragThreshold(pointerType = "mouse") {
  return DESIGNER_DRAG_THRESHOLDS[pointerType] || DESIGNER_DRAG_THRESHOLDS.mouse;
}

export function designerDragHasStarted(startX, startY, currentX, currentY, pointerType = "mouse") {
  const dx = Number(currentX) - Number(startX);
  const dy = Number(currentY) - Number(startY);
  if (![dx, dy].every(Number.isFinite)) return false;
  return Math.hypot(dx, dy) >= designerDragThreshold(pointerType);
}

function finiteGesturePoint(point) {
  const x = Number(point?.clientX ?? point?.x);
  const y = Number(point?.clientY ?? point?.y);
  return Number.isFinite(x) && Number.isFinite(y) ? { x, y } : null;
}

export function designerGesturePair(points) {
  const values = points instanceof Map ? [...points.values()] : [...(points || [])];
  if (values.length < 2) return null;
  const first = finiteGesturePoint(values[0]);
  const second = finiteGesturePoint(values[1]);
  return first && second ? [first, second] : null;
}

export function designerGestureDistance(first, second) {
  const pair = designerGesturePair([first, second]);
  return pair ? Math.hypot(pair[1].x - pair[0].x, pair[1].y - pair[0].y) : 0;
}

export function designerGestureMidpoint(first, second) {
  const pair = designerGesturePair([first, second]);
  if (!pair) return null;
  return {
    x: (pair[0].x + pair[1].x) / 2,
    y: (pair[0].y + pair[1].y) / 2
  };
}

export function designerPinchZoom(startZoom, startDistance, currentDistance, minZoom = 0.5, maxZoom = 3) {
  const zoom = Number(startZoom);
  const initial = Number(startDistance);
  const current = Number(currentDistance);
  const min = Number(minZoom);
  const max = Number(maxZoom);
  if (![zoom, initial, current, min, max].every(Number.isFinite) || initial <= 0 || min > max) return null;
  return Math.min(max, Math.max(min, zoom * (current / initial)));
}

export function designerAnchoredScroll(anchorRatio, renderedSize, viewportOffset = 0) {
  const ratio = Number(anchorRatio);
  const size = Number(renderedSize);
  const offset = Number(viewportOffset);
  if (![ratio, size, offset].every(Number.isFinite)) return 0;
  return Math.max(0, (ratio * size) - offset);
}
