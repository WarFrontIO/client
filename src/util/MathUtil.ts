import {territoryManager} from "../game/TerritoryManager";
import {gameMap} from "../game/GameData";

/**
 * Check if a tile borders a tile owned by a player.
 * @param tile The tile to check.
 * @param player The player to check for.
 * @returns True if the tile borders a tile owned by the player, false otherwise.
 */
export function bordersTile(tile: number, player: number): boolean {
	const x = tile % gameMap.width;
	const y = Math.floor(tile / gameMap.width);
	return (x > 0 && territoryManager.isOwner(tile - 1, player)) ||
		(x < gameMap.width - 1 && territoryManager.isOwner(tile + 1, player)) ||
		(y > 0 && territoryManager.isOwner(tile - gameMap.width, player)) ||
		(y < gameMap.height - 1 && territoryManager.isOwner(tile + gameMap.width, player));
}