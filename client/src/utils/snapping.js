// Enhanced snapping utility for json2video editor

export const snapToGrid = (value, gridSize, fineGrid = false) => {
  const currentGridSize = fineGrid ? 5 : gridSize;
  return Math.round(value / currentGridSize) * currentGridSize;
};

export const snapToCenter = (value, containerSize, elementSize) => {
  const center = (containerSize - elementSize) / 2;
  const tolerance = 10; // pixels within which to snap to center
  
  if (Math.abs(value - center) <= tolerance) {
    return center;
  }
  return value;
};

export const snapToElements = (draggedElement, otherElements, tolerance = 8) => {
  const snapped = { x: draggedElement.x, y: draggedElement.y };
  const snapGuides = [];
  
  // Early return if no other elements
  if (!otherElements || otherElements.length === 0) {
    return { position: snapped, guides: snapGuides };
  }
  
  // Get all snap points from other elements (optimized)
  const snapPoints = [];
  for (const el of otherElements) {
    if (el.id === draggedElement.id) continue;
    
    // Only add snap points if element is within reasonable distance
    const distanceX = Math.abs(draggedElement.x - el.x);
    const distanceY = Math.abs(draggedElement.y - el.y);
    
    if (distanceX < tolerance * 3) {
      snapPoints.push(
        { x: el.x, y: null, type: 'element-vertical', element: el },
        { x: el.x + el.width, y: null, type: 'element-vertical', element: el },
        { x: el.x + el.width / 2, y: null, type: 'element-vertical', element: el }
      );
    }
    
    if (distanceY < tolerance * 3) {
      snapPoints.push(
        { x: null, y: el.y, type: 'element-horizontal', element: el },
        { x: null, y: el.y + el.height, type: 'element-horizontal', element: el },
        { x: null, y: el.y + el.height / 2, type: 'element-horizontal', element: el }
      );
    }
  }

  // Check X snapping with priority (closest first)
  const xSnapPoints = snapPoints.filter(point => point.x !== null);
  const closestX = xSnapPoints.reduce((closest, point) => {
    const distance = Math.abs(draggedElement.x - point.x);
    if (distance <= tolerance && (!closest || distance < closest.distance)) {
      return { ...point, distance };
    }
    return closest;
  }, null);

  if (closestX) {
    snapped.x = closestX.x;
    snapGuides.push({
      type: closestX.type,
      position: { x: closestX.x, y: 0 },
      element: closestX.element
    });
  }

  // Check Y snapping with priority (closest first)
  const ySnapPoints = snapPoints.filter(point => point.y !== null);
  const closestY = ySnapPoints.reduce((closest, point) => {
    const distance = Math.abs(draggedElement.y - point.y);
    if (distance <= tolerance && (!closest || distance < closest.distance)) {
      return { ...point, distance };
    }
    return closest;
  }, null);

  if (closestY) {
    snapped.y = closestY.y;
    snapGuides.push({
      type: closestY.type,
      position: { x: 0, y: closestY.y },
      element: closestY.element
    });
  }

  return { position: snapped, guides: snapGuides };
};

export const snapToCanvasCenter = (draggedElement, canvasDimensions, tolerance = 12) => {
  const snapped = { x: draggedElement.x, y: draggedElement.y };
  const snapGuides = [];
  
  // Snap to canvas center X
  const centerX = (canvasDimensions.width - draggedElement.width) / 2;
  if (Math.abs(draggedElement.x - centerX) <= tolerance) {
    snapped.x = centerX;
    snapGuides.push({
      type: 'center-vertical',
      position: { x: centerX, y: 0 }
    });
  }
  
  // Snap to canvas center Y
  const centerY = (canvasDimensions.height - draggedElement.height) / 2;
  if (Math.abs(draggedElement.y - centerY) <= tolerance) {
    snapped.y = centerY;
    snapGuides.push({
      type: 'center-horizontal',
      position: { x: 0, y: centerY }
    });
  }
  
  return { position: snapped, guides: snapGuides };
};

export const applySnapping = (draggedElement, otherElements, canvasDimensions, gridSize, fineGrid = false, lockAxis = null) => {
  let finalPosition = { x: draggedElement.x, y: draggedElement.y };
  let allGuides = [];
  
  // If axis is locked, determine which axis to lock based on initial movement
  if (lockAxis === 'auto') {
    const deltaX = Math.abs(draggedElement.x - (draggedElement.originalX || draggedElement.x));
    const deltaY = Math.abs(draggedElement.y - (draggedElement.originalY || draggedElement.y));
    lockAxis = deltaX > deltaY ? 'x' : 'y';
  }
  
  // Apply axis locking (but don't force center snapping)
  if (lockAxis === 'x') {
    finalPosition.y = draggedElement.originalY || draggedElement.y;
  } else if (lockAxis === 'y') {
    finalPosition.x = draggedElement.originalX || draggedElement.x;
  }
  
  // Only apply grid snapping when axis is locked
  if (lockAxis) {
    finalPosition.x = snapToGrid(finalPosition.x, gridSize, fineGrid);
    finalPosition.y = snapToGrid(finalPosition.y, gridSize, fineGrid);
  }
  
  // Constrain to canvas bounds
  finalPosition.x = Math.max(0, Math.min(finalPosition.x, canvasDimensions.width - draggedElement.width));
  finalPosition.y = Math.max(0, Math.min(finalPosition.y, canvasDimensions.height - draggedElement.height));
  
  return { position: finalPosition, guides: allGuides };
}; 