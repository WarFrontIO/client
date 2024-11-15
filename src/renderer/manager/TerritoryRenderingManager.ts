import {HSLColor} from "../../util/HSLColor";
import {playerManager} from "../../game/player/PlayerManager";
import {territoryManager} from "../../game/TerritoryManager";
import {GameTheme} from "../GameTheme";
import {gameMap, isPlaying} from "../../game/GameData";

/**
 * When a player claims a tile, three types of updates are required:
 * 1. The tile can become a border tile of the player's territory.
 * 2. The tile can become an inner tile of the player's territory.
 * 3. A neighboring tile can become a border tile of the player's territory.
 */
export class TerritoryRenderingManager {
	private context: CanvasRenderingContext2D;

	constructor(context: CanvasRenderingContext2D) {
		this.context = context;
	}

	/**
	 * Clear the tiles at the given indices.
	 * @param tiles the tiles to clear
	 */
	clearTiles(tiles: number[] | Set<number>): void {
		for (const tile of tiles) {
			this.context.clearRect(tile % gameMap.width, Math.floor(tile / gameMap.width), 1, 1);
		}
	}

	/**
	 * Paint a tile.
	 * @param tiles the tiles to paint
	 * @param color the color to paint the tiles
	 * @internal
	 */
	paintTiles(tiles: number[], color: HSLColor): void {
		this.context.fillStyle = color.toString();
		if (color.a < 1) {
			for (const tile of tiles) {
				this.context.clearRect(tile % gameMap.width, Math.floor(tile / gameMap.width), 1, 1);
				this.context.fillRect(tile % gameMap.width, Math.floor(tile / gameMap.width), 1, 1);
			}
		} else {
			for (const tile of tiles) {
				this.context.fillRect(tile % gameMap.width, Math.floor(tile / gameMap.width), 1, 1);
			}
		}
	}

	/**
	 * Force a repaint of the territory layer.
	 */
	forceRepaint(theme: GameTheme): void {
		if (!isPlaying) return;
		this.context.clearRect(0, 0, gameMap.width, gameMap.height);
		const colorCache: string[] = [];
		for (let i = 0; i < gameMap.width * gameMap.height; i++) {
			const owner = territoryManager.getOwner(i);
			if (owner !== territoryManager.OWNER_NONE && owner !== territoryManager.OWNER_NONE - 1) {
				const player = playerManager.getPlayer(owner);
				const isTerritory = territoryManager.isTerritory(i);
				const index = (owner << 1) + (isTerritory ? 1 : 0);
				if (!colorCache[index]) {
					colorCache[index] = isTerritory ? theme.getTerritoryColor(player.baseColor).toString() : theme.getBorderColor(player.baseColor).toString();
				}
				this.context.fillStyle = colorCache[index];
				this.context.fillRect(i % gameMap.width, Math.floor(i / gameMap.width), 1, 1);
			}
		}
	}
}