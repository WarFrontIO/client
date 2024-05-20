import {Player} from "../../game/player/Player";
import {gameMap} from "../../game/Game";
import {getSetting} from "../../util/UserSettingManager";
import {Color} from "../../util/Color";
import {territoryRenderer} from "../layer/TerritoryRenderer";

/**
 * When a player claims a tile, three types of updates are required:
 * 1. The tile can become a border tile of the player's territory.
 * 2. The tile can become an inner tile of the player's territory.
 * 3. A neighboring tile can become a border tile of the player's territory.
 */
class TerritoryRenderingManager {
	private readonly territoryQueue: Array<number> = [];
	private readonly playerBorderQueue: Array<number> = [];
	private readonly targetBorderQueue: Array<number> = [];

	/**
	 * Add a tile to the territory update queue.
	 * @param tile index of the tile
	 */
	setTerritory(tile: number): void {
		this.territoryQueue.push(tile);
	}

	/**
	 * Add a border to the territory update queue.
	 * @param tile index of the tile
	 */
	setPlayerBorder(tile: number): void {
		this.playerBorderQueue.push(tile);
	}

	/**
	 * Add a border to the territory update queue.
	 * @param tile index of the tile
	 */
	setTargetBorder(tile: number): void {
		this.targetBorderQueue.push(tile);
	}

	/**
	 * Clear the tile at the given index.
	 * @param tile index of the tile
	 */
	clear(tile: number): void {
		territoryRenderer.context.clearRect(tile % gameMap.width, Math.floor(tile / gameMap.width), 1, 1);
	}

	/**
	 * Execute the transaction.
	 * @param player the player to apply the transaction to
	 * @param target the target player
	 * @internal
	 */
	applyTransaction(player: Player, target: Player): void {
		this.paintTiles(this.targetBorderQueue, getSetting("theme").getBorderColor(target.baseColor));
		this.paintTiles(this.playerBorderQueue, getSetting("theme").getBorderColor(player.baseColor));
		this.paintTiles(this.territoryQueue, getSetting("theme").getTerritoryColor(player.baseColor));

		this.targetBorderQueue.length = 0;
		this.playerBorderQueue.length = 0;
		this.territoryQueue.length = 0;
	}

	/**
	 * Paint a tile.
	 * @param tiles the tiles to paint
	 * @param color the color to paint the tiles
	 */
	private paintTiles(tiles: number[], color: Color): void {
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
}

export const territoryRenderingManager = new TerritoryRenderingManager();