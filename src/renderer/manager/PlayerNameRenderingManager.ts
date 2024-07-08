import { Player } from "../../game/player/Player";
import { Game } from "../../game/Game";
import { formatTroops } from "../../util/StringFormatter";
import { PriorityQueue } from "../../util/PriorityQueue";
import { TerritoryManager } from "../../game/TerritoryManager";
import { getSetting } from "../../util/UserSettingManager";
import { random } from "../../game/Random";
import { gameTicker } from "../../game/GameTicker";
import { MapNavigationHandler } from "../../game/action/MapNavigationHandler";

export class PlayerNameRenderingManager {
	playerData: PlayerNameRenderingData[] = [];
	private nameDepth: Uint16Array;
	atlasRowLength: number = 0;
	readonly partialElementAtlas: HTMLCanvasElement = document.createElement("canvas")
	partialAtlasContext: CanvasRenderingContext2D;

	/**
	 * Data for the current transaction.
	 * TODO: Move this somewhere else, maybe a proper transaction implementation...
	 */
	private currentPlayerMax: number = 0;
	private currentPlayerPos: number = 0;
	private currentTargetMax: number = 0;
	private currentTargetPos: number = 0;

	private game: Game
	private territoryManager: TerritoryManager
	private mapNavigationHandler: MapNavigationHandler


	constructor(game: Game, territoryManager: TerritoryManager, mapNavigationHandler: MapNavigationHandler) {
		this.game = game
		this.territoryManager = territoryManager;
		this.mapNavigationHandler = mapNavigationHandler
	}

	reset(maxPlayers: number) {
		this.playerData = [];
		this.nameDepth = new Uint16Array(this.game.map.width * this.game.map.height);
		this.atlasRowLength = Math.sqrt(maxPlayers) | 0;
		this.partialElementAtlas.width = this.atlasRowLength * 20;
		this.partialElementAtlas.height = Math.ceil(maxPlayers / this.atlasRowLength) * 20;
		this.partialAtlasContext = this.partialElementAtlas.getContext("2d");
		this.partialAtlasContext.textRendering = "optimizeSpeed";
		this.partialAtlasContext.textAlign = "center";
		this.partialAtlasContext.textBaseline = "bottom";
	}

	/**
	 * Register a player for name rendering.
	 * @param player The player to register.
	 */
	registerPlayer(player: Player): void {
		const canvas = document.createElement("canvas");
		const context = canvas.getContext("2d");
		const troopLength = context.measureText("123.").width / 10;
		this.playerData[player.id] = new PlayerNameRenderingData(this.mapNavigationHandler, player.name, troopLength, player.borderTiles, player.id, this, this.territoryManager, this.game);
	}

	//TODO: Remove this hacky solution, just pass the player instance to the rendering manager
	/**
	 * Finish the registration process.
	 * @param players The players to finish the registration for.
	 */
	finishRegistration(players: Player[]): void {
		this.partialAtlasContext.textBaseline = "top";
		for (const player of players) {
			this.playerData[player.id].updatePartial(player);
		}
	}

	/**
	 * Check if a tile is considered for name rendering.
	 * @param tile The tile to check.
	 * @returns True if the tile is considered, false otherwise.
	 * @internal Use {@link TerritoryManager.isTerritory} instead.
	 */
	isConsidered(tile: number): boolean {
		return this.nameDepth[tile] > 0;
	}

	/**
	 * Update the player name rendering data.
	 * @internal
	 */
	addTile(tile: number): void {
		this.nameDepth[tile] = 65535; // force recalculation
		this.recalculateFrom(tile);
	}

	/**
	 * Update the player name rendering data.
	 * @internal
	 */
	removeTile(tile: number): void {
		let offset = 0;
		let rowMax = Infinity;
		let columnMax = Infinity;
		if (this.currentTargetMax < this.nameDepth[tile - this.game.map.width - 1]) {
			this.currentTargetMax = this.nameDepth[tile - this.game.map.width - 1];
			this.currentTargetPos = tile - this.game.map.width - 1;
		}
		let changed: boolean;
		do {
			changed = false;
			for (let i = 0; i < rowMax; i++) {
				if (this.nameDepth[tile + i] <= offset + i) {
					rowMax = i;
					break;
				}
				this.nameDepth[tile + i] = offset + i;
				changed = true;
			}
			tile += this.game.map.width;
			for (let i = 0; i < columnMax; i++) {
				if (this.nameDepth[tile + i * this.game.map.width] <= offset + i) {
					columnMax = i;
					break;
				}
				this.nameDepth[tile + i * this.game.map.width] = offset + i;
				changed = true;
			}
			tile++;
			offset++;
		} while (changed);
	}

	/**
	 * Execute the transaction.
	 * @param player the player to apply the transaction to
	 * @param target the target player
	 * @internal
	 */
	applyTransaction(player: Player, target: Player): void {
		if (this.currentPlayerMax !== 0) this.playerData[player.id].handleAdd(this.currentPlayerMax, this.currentPlayerPos);
		if (this.currentTargetMax !== 0) this.playerData[target.id].handleRemove(this.nameDepth, this.currentTargetMax, this.currentTargetPos);
		this.currentPlayerMax = 0;
		this.currentPlayerPos = 0;
		this.currentTargetMax = 0;
		this.currentTargetPos = 0;
	}

	/**
	 * Recalculate the name depth map from a specific tile.
	 * Name depth refers to the maximum size a square can be with the bottom-right corner at the tile.
	 * @param tile The tile to recalculate from.
	 * @private
	 */
	private recalculateFrom(tile: number): void {
		let currentOrigin = tile;
		let isColumn = false;
		let changed = true;
		let max = 0;
		let maxPos = 0;

		let currentMax = Infinity;
		let otherMax = Infinity;
		while (true) {
			let current = currentOrigin;
			for (let i = 0; i < currentMax; i++) {
				if (!this.nameDepth[current]) { // Border / unclaimed tile
					currentMax = i;
					break;
				}
				const value = Math.min(this.nameDepth[current - 1], this.nameDepth[current - this.game.map.width], this.nameDepth[current - this.game.map.width - 1]) + 1;
				if (value === this.nameDepth[current]) {
					currentMax = i;
					break;
				}

				if (value > max) {
					max = value;
					maxPos = current;
				}

				changed = true;
				this.nameDepth[current] = value;

				current += isColumn ? this.game.map.width : 1;
			}
			if (isColumn) {
				if (!changed) break;
				changed = false;
				currentOrigin++;
				isColumn = false;
			} else {
				isColumn = true;
				currentOrigin += this.game.map.width;
			}
			[currentMax, otherMax] = [otherMax, currentMax];
		}

		if (max > this.currentPlayerMax) {
			this.currentPlayerMax = max;
			this.currentPlayerPos = maxPos;
		}
	}
}

//TODO: Remove this
export class PlayerNameRenderingData {
	private readonly id: number;
	readonly updateTick: number = 0;
	size: number = 0;
	index: number = 0;
	nameX: number = 0;
	nameY: number = 0;
	private nameLength: number;
	private readonly troopLength: number;
	troopSize: number = 0;
	private readonly borderSet: Set<number>;
	readonly queue: PriorityQueue<[number, number]> = new PriorityQueue((a, b) => a[0] > b[0]);
	private playerNameRenderingManager: PlayerNameRenderingManager
	private territoryManager: TerritoryManager
	private game: Game;
	private mapNavigationHandler: MapNavigationHandler


	constructor(mapNavigationHandler: MapNavigationHandler, name: string, troopLength: number, borderSet: Set<number>, id: number, playerNameRenderingManager: PlayerNameRenderingManager, territoryManager: TerritoryManager, game: Game) {
		this.troopLength = troopLength;
		this.borderSet = borderSet;
		this.id = id;
		this.playerNameRenderingManager = playerNameRenderingManager
		this.territoryManager = territoryManager
		this.game = game;
		this.mapNavigationHandler = mapNavigationHandler
		this.updateTick = random.nextInt(10);
		this.renderName(name);
	}

	/**
	 * Render the player name.
	 * @param name The name of the player.
	 * @private
	 */
	private renderName(name: string): void {
		this.playerNameRenderingManager.partialAtlasContext.fillStyle = "rgb(0, 0, 0)"; //TODO: This needs to be decided by the theme
		this.playerNameRenderingManager.partialAtlasContext.font = "bold " + Math.min(Math.floor(200 / (this.nameLength = this.playerNameRenderingManager.partialAtlasContext.measureText(name).width)), 8) + "px " + getSetting("theme").getFont();
		this.playerNameRenderingManager.partialAtlasContext.fillText(name, this.id % this.playerNameRenderingManager.atlasRowLength * 20 + 10, Math.floor(this.id / this.playerNameRenderingManager.atlasRowLength) * 20 + 10);
	}

	/**
	 * Add a tile to the queue or adjust the current position if applicable.
	 * @param max the maximum size of the square
	 * @param pos the position of the square
	 */
	handleAdd(max: number, pos: number): void {
		if (this.size < max) {
			this.queue.push([this.size, this.index]);
			this.setPosAt(pos, max);
		} else {
			this.queue.push([max, pos]);
		}
	}

	/**
	 * Remove a tile from the queue or adjust the current position if applicable.
	 * @param nameDepth the name depth map
	 * @param max the maximum size of the square
	 * @param pos the position of the square
	 */
	handleRemove(nameDepth: Uint16Array, max: number, pos: number): void {
		this.handleAdd(max, pos);
		if (nameDepth[this.index] === this.size) return;
		this.queue.push([nameDepth[this.index], this.index]);
		while (!this.queue.isEmpty()) {
			const [newMax, newPos] = this.queue.pop();
			if (this.territoryManager.tileOwners[newPos] === this.id) {
				const size = nameDepth[newPos];
				if (size >= newMax) {
					this.setPosAt(newPos, size);
					return;
				}
			}
		}
		this.setPosAt(this.borderSet.values().next().value, 1);
	}

	setPosAt(tile: number, size: number): void {
		this.size = size;
		this.index = tile;
		this.nameX = tile % this.game.map.width;
		this.nameY = Math.floor(tile / this.game.map.width);
	}

	/**
	 * Render the player name.
	 * If the name is small, use the cached partial, otherwise render the name directly.
	 * @param context The context to render the name to.
	 * @param player The player to render the name for.
	 */
	renderPlayer(context: CanvasRenderingContext2D, player: Player): void {
		if (gameTicker.getTickCount() % 10 === this.updateTick) this.updatePartial(player);
		if (this.size * this.mapNavigationHandler.zoom >= 20) {
			context.fillStyle = "rgb(0, 0, 0)"; //TODO: This needs to be decided by the theme
			context.textBaseline = "bottom";
			context.font = "bold " + Math.floor(Math.min(10 / this.nameLength, 0.4) * this.size * this.mapNavigationHandler.zoom) + "px " + getSetting("theme").getFont();
			context.fillText(player.name, Math.floor((this.nameX - this.size / 2 + 1) * this.mapNavigationHandler.zoom + this.mapNavigationHandler.x), Math.floor((this.nameY - this.size / 2 + 1) * this.mapNavigationHandler.zoom + this.mapNavigationHandler.y));
			context.textBaseline = "top";
			context.font = "bold " + Math.floor(1 / Math.max(3, player.getTroops().toString().length) * 3 * this.size / this.troopLength * this.mapNavigationHandler.zoom) + "px " + getSetting("theme").getFont();
			context.fillText(formatTroops(player.getTroops()), Math.floor((this.nameX - this.size / 2 + 1) * this.mapNavigationHandler.zoom + this.mapNavigationHandler.x), Math.floor((this.nameY - this.size / 2 + 1) * this.mapNavigationHandler.zoom + this.mapNavigationHandler.y));
		} else {
			context.drawImage(this.playerNameRenderingManager.partialElementAtlas, (this.id % this.playerNameRenderingManager.atlasRowLength) * 20, Math.floor(this.id / this.playerNameRenderingManager.atlasRowLength) * 20, 20, 20, Math.floor((this.nameX - this.size + 1) * this.mapNavigationHandler.zoom + this.mapNavigationHandler.x), Math.floor((this.nameY - this.size + 1) * this.mapNavigationHandler.zoom + this.mapNavigationHandler.y), Math.floor(this.size * this.mapNavigationHandler.zoom), Math.floor(this.size * this.mapNavigationHandler.zoom));
		}
	}

	/**
	 * Update the partial canvas.
	 * @param player The player to update the partial for.
	 */
	updatePartial(player: Player): void {
		this.playerNameRenderingManager.partialAtlasContext.clearRect(this.id % this.playerNameRenderingManager.atlasRowLength * 20, Math.floor(this.id / this.playerNameRenderingManager.atlasRowLength) * 20 + 10, 20, 10);
		this.playerNameRenderingManager.partialAtlasContext.fillStyle = "rgb(0, 0, 0)"; //TODO: This needs to be decided by the theme
		this.playerNameRenderingManager.partialAtlasContext.font = "bold " + Math.floor(60 / Math.max(3, player.getTroops().toString().length) / this.troopLength) + "px " + getSetting("theme").getFont();
		this.playerNameRenderingManager.partialAtlasContext.fillText(formatTroops(player.getTroops()), this.id % this.playerNameRenderingManager.atlasRowLength * 20 + 10, Math.floor(this.id / this.playerNameRenderingManager.atlasRowLength) * 20 + 10);
	}
}