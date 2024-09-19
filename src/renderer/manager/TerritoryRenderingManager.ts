import {registerSettingListener} from "../../util/UserSettingManager";
import {HSLColor} from "../../util/HSLColor";
import {territoryRenderer} from "../layer/TerritoryRenderer";
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
class TerritoryRenderingManager {
	/**
	 * Clear the tile at the given index.
	 * @param tile index of the tile
	 */
	clear(tile: number): void {
		territoryRenderer.context.clearRect(tile % gameMap.width, Math.floor(tile / gameMap.width), 1, 1);
	}

	/**
	 * Paint a tile.
	 * @param tiles the tiles to paint
	 * @param color the color to paint the tiles
	 * @internal
	 */
	paintTiles(tiles: number[], color: HSLColor): void {
		const context = territoryRenderer.context;
		context.fillStyle = color.toString();
		if (color.a < 1) {
			for (const tile of tiles) {
				context.clearRect(tile % gameMap.width, Math.floor(tile / gameMap.width), 1, 1);
				context.fillRect(tile % gameMap.width, Math.floor(tile / gameMap.width), 1, 1);
			}
		} else {
			for (const tile of tiles) {
				context.fillRect(tile % gameMap.width, Math.floor(tile / gameMap.width), 1, 1);
			}
		}
	}

	/**
	 * Force a repaint of the territory layer.
	 */
	forceRepaint(this: void, theme: GameTheme): void {
		if (!isPlaying) return;
		territoryRenderer.context.clearRect(0, 0, gameMap.width, gameMap.height);
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
				territoryRenderer.context.fillStyle = colorCache[index];
				territoryRenderer.context.fillRect(i % gameMap.width, Math.floor(i / gameMap.width), 1, 1);
			}
		}
	}
}

export const territoryRenderingManager = new TerritoryRenderingManager();

registerSettingListener("theme", territoryRenderingManager.forceRepaint);