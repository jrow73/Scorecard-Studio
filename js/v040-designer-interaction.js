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
