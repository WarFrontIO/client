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