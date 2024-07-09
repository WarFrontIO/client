import {Player} from "../../game/player/Player";
import {gameMap, isPlaying} from "../../game/Game";
import {getSetting, registerSettingListener} from "../../util/UserSettingManager";
import {HSLColor} from "../../util/HSLColor";
import {territoryRenderer} from "../layer/TerritoryRenderer";
import {playerManager} from "../../game/player/PlayerManager";
import {territoryManager} from "../../map/TerritoryManager";
import {GameTheme} from "../GameTheme";
import {ClearTileEvent, eventDispatcher} from "../../game/GameEvent";
import {playerNameRenderingManager} from "./PlayerNameRenderingManager";

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
	private paintTiles(tiles: number[], color: HSLColor): void {
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
	forceRepaint(theme: GameTheme): void {
		if (!isPlaying) return;
		territoryRenderer.context.clearRect(0, 0, gameMap.width, gameMap.height);
		const colorCache: string[] = [];
		for (let i = 0; i < gameMap.width * gameMap.height; i++) {
			const owner = territoryManager.getOwner(i);
			if (owner !== territoryManager.OWNER_NONE && owner !== territoryManager.OWNER_NONE - 1) {
				const player = playerManager.getPlayer(owner);
				const isTerritory = playerNameRenderingManager.isConsidered(i);
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

eventDispatcher.addClearTileEventListener((event) => territoryRenderingManager.clear(event.tilePos))
registerSettingListener("theme", territoryRenderingManager.forceRepaint);