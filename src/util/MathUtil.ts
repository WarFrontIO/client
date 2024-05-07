import {gameMap} from "../game/Game";
import {territoryManager} from "../game/TerritoryManager";

/**
 * Call a closure on all neighbors of a tile.
 * @param tile The tile to get the neighbors of.
 * @param closure The closure to call on each neighbor.
 */
export function onNeighbors(tile: number, closure: (tile: number) => void): void {
	let x = tile % gameMap.width;
	let y = Math.floor(tile / gameMap.width);
	if (x > 0) {
		closure(tile - 1);
	}
	if (x < gameMap.width - 1) {
		closure(tile + 1);
	}
	if (y > 0) {
		closure(tile - gameMap.width);
	}
	if (y < gameMap.height - 1) {
		closure(tile + gameMap.width);
	}
}

/**
 * Check if a tile borders a tile owned by a player.
 * @param tile The tile to check.
 * @param player The player to check for.
 * @returns True if the tile borders a tile owned by the player, false otherwise.
 */
export function bordersTile(tile: number, player: number): boolean {
	let x = tile % gameMap.width;
	let y = Math.floor(tile / gameMap.width);
	return (x > 0 && territoryManager.isOwner(tile - 1, player)) ||
		(x < gameMap.width - 1 && territoryManager.isOwner(tile + 1, player)) ||
		(y > 0 && territoryManager.isOwner(tile - gameMap.width, player)) ||
		(y < gameMap.height - 1 && territoryManager.isOwner(tile + gameMap.width, player));
}