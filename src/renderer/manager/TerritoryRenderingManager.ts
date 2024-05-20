import {Player} from "../../game/player/Player";
import {gameMap} from "../../game/Game";
import {getSetting} from "../../util/UserSettingManager";
import {Color} from "../../util/Color";

class TerritoryRenderingManager {
	private context: CanvasRenderingContext2D;
	private readonly territoryQueue: Array<number> = [];
	private readonly borderQueue: Array<number> = [];

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
	setBorder(tile: number): void {
		this.borderQueue.push(tile);
	}

	/**
	 * Clear the tile at the given index.
	 * @param tile index of the tile
	 */
	clear(tile: number): void {
		this.context.clearRect(tile % gameMap.width, Math.floor(tile / gameMap.width), 1, 1);
	}

	/**
	 * Execute the transaction.
	 * @param player the player to apply the transaction to
	 * @internal
	 */
	applyTransaction(player: Player): void {
		this.paintTiles(this.borderQueue, getSetting("theme").getBorderColor(player.baseColor));
		this.paintTiles(this.territoryQueue, getSetting("theme").getTerritoryColor(player.baseColor));

		this.borderQueue.length = 0;
		this.territoryQueue.length = 0;
	}

	/**
	 * Paint a tile.
	 * @param tiles
	 * @param color
	 */
	private paintTiles(tiles: number[], color: Color): void {
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
	 * Set the rendering context.
	 */
	setContext(context: CanvasRenderingContext2D): void {
		this.context = context;
	}
}

export const territoryRenderingManager = new TerritoryRenderingManager();