import {TerritoryManager} from "../game/TerritoryManager";

/**
 * Call a closure on all neighbors of a tile.
 * @param tile The tile to get the neighbors of.
 * @param closure The closure to call on each neighbor.
 */
export function onNeighbors(tile: number, closure: (tile: number) => void, mapWidth: number, mapHeight: number): void {
	let x = tile % mapWidth;
	let y = Math.floor(tile / mapWidth);
	if (x > 0) {
		closure(tile - 1);
	}
	if (x < mapWidth - 1) {
		closure(tile + 1);
	}
	if (y > 0) {
		closure(tile - mapWidth);
	}
	if (y < mapHeight - 1) {
		closure(tile + mapWidth);
	}
}

/**
 * Check if a tile borders a tile owned by a player.
 * @param tile The tile to check.
 * @param player The player to check for.
 * @returns True if the tile borders a tile owned by the player, false otherwise.
 */
export function bordersTile(territoryManager: TerritoryManager, tile: number, player: number, mapWidth: number, mapHeight: number): boolean {
	let x = tile % mapWidth;
	let y = Math.floor(tile / mapWidth);
	return (x > 0 && territoryManager.isOwner(tile - 1, player)) ||
		(x < mapWidth - 1 && territoryManager.isOwner(tile + 1, player)) ||
		(y > 0 && territoryManager.isOwner(tile - mapWidth, player)) ||
		(y < mapHeight - 1 && territoryManager.isOwner(tile + mapWidth, player));
}