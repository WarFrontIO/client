import {territoryManager} from "../game/TerritoryManager";
import {gameMap} from "../game/GameData";

/**
 * Ray traces on the game map to find the first non-water tile.
 * @param x The x coordinate of the starting point
 * @param y The y coordinate of the starting point
 * @param dx The x direction of the ray
 * @param dy The y direction of the ray
 * @returns The first non-water tile or null if no such tile exists
 */
export function rayTraceWater(x: number, y: number, dx: number, dy: number): number | null {
	const stepX = dx === 0 ? 0 : dx > 0 ? 1 : -1;
	const stepY = dy === 0 ? 0 : dy > 0 ? 1 : -1;
	const tDeltaX = dx === 0 ? 0 : Math.abs(1 / dx);
	const tDeltaY = dy === 0 ? 0 : Math.abs(1 / dy);
	let tMaxX = dx === 0 ? Infinity : tDeltaX / 2; // We start at the center of the first tile
	let tMaxY = dy === 0 ? Infinity : tDeltaY / 2;
	while (territoryManager.isWater(x + y * gameMap.width)) {
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
 * This function does only allow passing through tiles which aren't directly adjacent to territory tiles.
 * @param x1 The x coordinate of the starting point
 * @param y1 The y coordinate of the starting point
 * @param x2 The x coordinate of the ending point
 * @param y2 The y coordinate of the ending point
 * @returns True if there is a line of sight, false otherwise
 */
export function checkLineOfSight(x1: number, y1: number, x2: number, y2: number): boolean {
	if (x1 === x2 && y1 === y2) {
		return true;
	}
	const dx = x2 - x1;
	const dy = y2 - y1;
	const steps = Math.max(Math.abs(dx), Math.abs(dy));
	const stepX = dx / steps;
	const stepY = dy / steps;
	const minDistance = stepX === 0 || stepY === 0 ? 0 : -1; // Prevent clipping through corners
	let x = x1 + 0.5; // We start at the center of the first tile
	let y = y1 + 0.5;
	for (let i = 1; i < steps; i++) {
		x += stepX;
		y += stepY;
		if (gameMap.getDistance(Math.floor(x) + Math.floor(y) * gameMap.width) >= minDistance) {
			return false;
		}
	}
	return true;
}