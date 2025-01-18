import {GameMap} from "../map/GameMap";

/**
 * Ray traces on the game map to find the first non-water tile.
 * @param x The x coordinate of the starting point
 * @param y The y coordinate of the starting point
 * @param dx The x direction of the ray
 * @param dy The y direction of the ray
 * @param gameMap The game map
 * @returns The first non-water tile or null if no such tile exists
 */
export function rayTraceWater(x: number, y: number, dx: number, dy: number, gameMap: GameMap): number | null {
	const stepX = dx === 0 ? 0 : dx > 0 ? 1 : -1;
	const stepY = dy === 0 ? 0 : dy > 0 ? 1 : -1;
	const tDeltaX = dx === 0 ? 0 : Math.abs(1 / dx);
	const tDeltaY = dy === 0 ? 0 : Math.abs(1 / dy);
	let tMaxX = dx === 0 ? Infinity : tDeltaX / 2; // We start at the center of the first tile
	let tMaxY = dy === 0 ? Infinity : tDeltaY / 2;
	while (gameMap.getTile(x + y * gameMap.width).navigable) {
		if (tMaxX < tMaxY) {
			tMaxX += tDeltaX;
			x += stepX;
		} else {
			tMaxY += tDeltaY;
			y += stepY;
		}
		if (x < 0 || x >= gameMap.width || y < 0 || y >= gameMap.height) {
			return null;
		}
	}
	return x + y * gameMap.width;
}

/**
 * Checks if there is a line of sight between two points.
 * This function requires a distance of half a tile to non-water tiles.
 * @param x1 The x coordinate of the starting point
 * @param y1 The y coordinate of the starting point
 * @param x2 The x coordinate of the ending point
 * @param y2 The y coordinate of the ending point
 * @param gameMap The game map
 * @returns True if there is a line of sight, false otherwise
 */
export function checkLineOfSight(x1: number, y1: number, x2: number, y2: number, gameMap: GameMap): boolean {
	if (x1 === x2 && y1 === y2) {
		return true;
	}
	const dx = x2 - x1;
	const dy = y2 - y1;
	const steps = Math.max(Math.abs(dx), Math.abs(dy));
	const stepX = dx / steps;
	const stepY = dy / steps;
	let x = x1 + 0.5; // We start at the center of the first tile
	let y = y1 + 0.5;
	if (gameMap.getDistance(x1 + y1 * gameMap.width) === -1 && !checkCoastDistance(x, y, stepX, stepY, gameMap)) {
		return false;
	}
	if (gameMap.getDistance(x2 + y2 * gameMap.width) === -1 && !checkCoastDistance(x2 + 0.5, y2 + 0.5, -stepX, -stepY, gameMap)) {
		return false;
	}
	for (let i = 1; i < steps; i++) {
		x += stepX;
		y += stepY;
		const distance = gameMap.getDistance(Math.floor(x) + Math.floor(y) * gameMap.width);
		if (distance >= 0) {
			return false;
		}
		// Prevent clipping through corners
		if (distance === -1) {
			if (dx === 0 || dy === 0) continue;
			if (!checkCoastDistance(x, y, stepX, stepY, gameMap) || !checkCoastDistance(x, y, -stepX, -stepY, gameMap)) { //Check this and next step
				return false;
			}
		}
	}
	return true;
}

/**
 * Checks whether the given step is allowed from the given tile.
 * This function disallows passing closer than half a tile to non-water tiles.
 * @param x The x coordinate of the tile
 * @param y The y coordinate of the tile
 * @param stepX The x direction of the step
 * @param stepY The y direction of the step
 * @param gameMap The game map
 * @internal
 */
function checkCoastDistance(x: number, y: number, stepX: number, stepY: number, gameMap: GameMap): boolean {
	if (Math.abs(stepX) > Math.abs(stepY)) {
		if (gameMap.getDistance(Math.floor(x) + Math.floor(y + stepY - 0.49) * gameMap.width) >= 0) return false;
		if (gameMap.getDistance(Math.floor(x) + Math.floor(y + stepY + 0.49) * gameMap.width) >= 0) return false;
	} else {
		if (gameMap.getDistance(Math.floor(x + stepX - 0.49) + Math.floor(y) * gameMap.width) >= 0) return false;
		if (gameMap.getDistance(Math.floor(x + stepX + 0.49) + Math.floor(y) * gameMap.width) >= 0) return false;
	}
	return true;
}