import type {GameTheme} from "../GameTheme";
import {territoryManager} from "../../game/TerritoryManager";
import {gameMap, isPlaying} from "../../game/GameData";
import {territoryRenderer} from "../layer/TerritoryRenderer";

/**
 * When a player claims a tile, three types of updates are required:
 * 1. The tile can become a border tile of the player's territory.
 * 2. The tile can become an inner tile of the player's territory.
 * 3. A neighboring tile can become a border tile of the player's territory.
 */
export class TerritoryRenderingManager {
	tiles: number[] = [];
	updates: number[] = [];

	/**
	 * Clear the tiles at the given indices.
	 * @param tiles the tiles to clear
	 */
	clearTiles(tiles: number[] | Set<number>): void {
		for (const tile of tiles) {
			this.tiles.push(tile);
			this.updates.push(territoryManager.OWNER_NONE);
		}
	}

	/**
	 * Paint a tile.
	 * @param tiles the tiles to paint
	 * @param player the player to paint the tiles for
	 * @internal
	 */
	paintTiles(tiles: number[], player: number): void {
		for (const tile of tiles) {
			this.tiles.push(tile);
			this.updates.push(player);
		}
	}

	/**
	 * Paint a border tile.
	 * @param tiles the tiles to paint
	 * @param player the player to paint the tiles for
	 * @internal
	 */
	paintBorderTiles(tiles: number[], player: number): void {
		for (const tile of tiles) {
			this.tiles.push(tile);
			this.updates.push(65536 + player);
		}
	}

	/**
	 * Force a repaint of the territory layer.
	 */
	forceRepaint(theme: GameTheme): void {
		if (!isPlaying) return;
		territoryRenderer.updatePalette(theme);
		for (let i = 0; i < gameMap.width * gameMap.height; i++) {
			const owner = territoryManager.getOwner(i);
			if (owner !== territoryManager.OWNER_NONE && owner !== territoryManager.OWNER_NONE - 1) {
				this.tiles.push(i);
				this.updates.push(territoryManager.isTerritory(i) ? owner : 65536 + owner);
			}
		}
	}
}