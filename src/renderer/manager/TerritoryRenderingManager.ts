import {getSetting, registerSettingListener} from "../../util/UserSettingManager";
import {HSLColor} from "../../util/HSLColor";
import {territoryRenderer} from "../layer/TerritoryRenderer";
import {playerManager} from "../../game/player/PlayerManager";
import {territoryManager} from "../../game/TerritoryManager";
import {GameTheme} from "../GameTheme";
import {gameMap, isPlaying} from "../../game/GameData";
import {registerTransactionExecutor} from "../../game/transaction/TransactionExecutors";
import {TerritoryTransaction} from "../../game/transaction/TerritoryTransaction";
import {borderManager} from "../../game/BorderManager";

/**
 * When a player claims a tile, three types of updates are required:
 * 1. The tile can become a border tile of the player's territory.
 * 2. The tile can become an inner tile of the player's territory.
 * 3. A neighboring tile can become a border tile of the player's territory.
 */
export class TerritoryRenderingManager {
	/**
	 * Clear the tiles at the given indices.
	 * @param tiles the tiles to clear
	 */
	clearTiles(tiles: number[] | Set<number>): void {
		for (const tile of tiles) {
			territoryRenderer.context.clearRect(tile % gameMap.width, Math.floor(tile / gameMap.width), 1, 1);
		}
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

registerTransactionExecutor(TerritoryTransaction, function (this: TerritoryTransaction) {
	//TODO: this needs to be less magical for clearing
	const borders = borderManager.transitionTiles(this.tiles, this.attacker?.id ?? -1, this.defendant?.id ?? -1);
	if (this.attacker) {
		territoryRenderingManager.paintTiles(borders.territory, getSetting("theme").getTerritoryColor(this.attacker.baseColor));
		territoryRenderingManager.paintTiles(borders.attacker, getSetting("theme").getBorderColor(this.attacker.baseColor));
	} else {
		territoryRenderingManager.clearTiles(this.tiles);
	}

	if (this.defendant) {
		territoryRenderingManager.paintTiles(borders.defender, getSetting("theme").getBorderColor(this.defendant.baseColor));
	}
});