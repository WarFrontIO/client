import { Player } from "../../game/player/Player";
import { Game } from "../../game/Game";
import { getSetting, registerSettingListener } from "../../util/UserSettingManager";
import { HSLColor } from "../../util/HSLColor";
import { TerritoryRenderer } from "../layer/TerritoryRenderer";
import { TerritoryManager } from "../../game/TerritoryManager";
import { GameTheme } from "../GameTheme";

/**
 * When a player claims a tile, three types of updates are required:
 * 1. The tile can become a border tile of the player's territory.
 * 2. The tile can become an inner tile of the player's territory.
 * 3. A neighboring tile can become a border tile of the player's territory.
 */
export class TerritoryRenderingManager {
	private readonly territoryQueue: Array<number> = [];
	private readonly playerBorderQueue: Array<number> = [];
	private readonly targetBorderQueue: Array<number> = [];

	private readonly game: Game;
	private readonly territoryRenderer: TerritoryRenderer;
	private territoryManager: TerritoryManager

	constructor(game: Game, territoryRenderer: TerritoryRenderer, territoryManager: TerritoryManager) {
		this.game = game;
		this.territoryRenderer = territoryRenderer;
		this.territoryManager = territoryManager;
	}

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
		this.territoryRenderer.context.clearRect(tile % this.game.map.width, Math.floor(tile / this.game.map.width), 1, 1);
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
		const context = this.territoryRenderer.context;
		context.fillStyle = color.toString();
		if (color.a < 1) {
			for (const tile of tiles) {
				context.clearRect(tile % this.game.map.width, Math.floor(tile / this.game.map.width), 1, 1);
				context.fillRect(tile % this.game.map.width, Math.floor(tile / this.game.map.width), 1, 1);
			}
		} else {
			for (const tile of tiles) {
				context.fillRect(tile % this.game.map.width, Math.floor(tile / this.game.map.width), 1, 1);
			}
		}
	}

	/**
	 * Force a repaint of the territory layer.
	 */
	forceRepaint(theme: GameTheme): void {
		if (!this.game.isPlaying) return;
		this.territoryRenderer.context.clearRect(0, 0, this.game.map.width, this.game.map.height);
		const colorCache: string[] = [];
		for (let i = 0; i < this.game.map.width * this.game.map.height; i++) {
			const owner = this.territoryManager.getOwner(i);
			if (owner !== TerritoryManager.OWNER_NONE && owner !== TerritoryManager.OWNER_NONE - 1) {
				const player = this.game.players.getPlayer(owner);
				const isTerritory = this.territoryManager.isTerritory(i);
				const index = (owner << 1) + (isTerritory ? 1 : 0);
				if (!colorCache[index]) {
					colorCache[index] = isTerritory ? theme.getTerritoryColor(player.baseColor).toString() : theme.getBorderColor(player.baseColor).toString();
				}
				this.territoryRenderer.context.fillStyle = colorCache[index];
				this.territoryRenderer.context.fillRect(i % this.game.map.width, Math.floor(i / this.game.map.width), 1, 1);
			}
		}
	}
}