import {Player} from "../../game/player/Player";
import {formatTroops} from "../../util/StringFormatter";
import {PriorityQueue} from "../../util/PriorityQueue";
import {territoryManager} from "../../game/TerritoryManager";
import {getSetting} from "../../util/settings/UserSettingManager";
import {random} from "../../game/Random";
import {gameTicker} from "../../game/GameTicker";
import {mapNavigationHandler} from "../../game/action/MapNavigationHandler";
import {gameMap} from "../../game/GameData";
import {playerManager} from "../../game/player/PlayerManager";
import {borderManager} from "../../game/BorderManager";

class PlayerNameRenderingManager {
	playerData: PlayerNameRenderingData[] = [];
	private nameDepth: Uint16Array;
	atlasRowLength: number = 0;
	readonly partialElementAtlas: HTMLCanvasElement = document.createElement("canvas")
	partialAtlasContext: CanvasRenderingContext2D;

	reset(maxPlayers: number) {
		this.playerData = [];
		this.nameDepth = new Uint16Array(gameMap.width * gameMap.height);
		this.atlasRowLength = Math.sqrt(maxPlayers) | 0;
		this.partialElementAtlas.width = this.atlasRowLength * 20;
		this.partialElementAtlas.height = Math.ceil(maxPlayers / this.atlasRowLength) * 20;
		this.partialAtlasContext = this.partialElementAtlas.getContext("2d") as CanvasRenderingContext2D;
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
		const context = canvas.getContext("2d") as CanvasRenderingContext2D;
		const troopLength = context.measureText("123.").width / 10;
		this.playerData[player.id] = new PlayerNameRenderingData(player.name, troopLength, borderManager.getBorderTiles(player.id), player.id);
	}

	/**
	 * Get the player name rendering data.
	 * @param player The player to get the data for.
	 * @returns The player name rendering data.
	 */
	getPlayerData(player: Player): PlayerNameRenderingData {
		return this.playerData[player.id];
	}

	//TODO: Remove this hacky solution
	/**
	 * Get the name depth map.
	 * @returns The name depth map.
	 */
	getNameDepth(): Uint16Array {
		return this.nameDepth;
	}

	//TODO: Remove this hacky solution, just pass the player instance to the rendering manager
	/**
	 * Finish the registration process.
	 * @param players The players to finish the registration for.
	 */
	finishRegistration(players: Player[]): void {
		playerNameRenderingManager.partialAtlasContext.textBaseline = "top";
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
	 * @param tile The tile that was added to the territory
	 * @param transaction The transaction that added the tile
	 * @internal
	 */
	addTile(tile: number, transaction: PlayerNameUpdate): void {
		this.nameDepth[tile] = 65535; // force recalculation
		this.recalculateFrom(tile, transaction);
	}

	/**
	 * Update the player name rendering data.
	 * @internal
	 */
	removeTile(tile: number, transaction: PlayerNameUpdate): void {
		let offset = 0;
		let rowMax = Infinity;
		let columnMax = Infinity;
		transaction.setNamePos(tile - gameMap.width - 1, this.nameDepth[tile - gameMap.width - 1]);
		while (true) {
			if (this.nameDepth[tile] <= offset) {
				break;
			}
			this.nameDepth[tile] = offset;
			for (let i = 1; i < rowMax; i++) {
				if (this.nameDepth[tile + i] <= offset + i) {
					rowMax = i;
					break;
				}
				this.nameDepth[tile + i] = offset + i;
			}
			for (let i = 1; i < columnMax; i++) {
				if (this.nameDepth[tile + i * gameMap.width] <= offset + i) {
					columnMax = i;
					break;
				}
				this.nameDepth[tile + i * gameMap.width] = offset + i;
			}
			tile += gameMap.width + 1;
			offset++;
		}
	}

	/**
	 * Recalculate the name depth map from a specific tile.
	 * Name depth refers to the maximum size a square can be with the bottom-right corner at the tile.
	 * @param tile The tile to recalculate from
	 * @param transaction The transaction to update the tiles in
	 * @private
	 */
	private recalculateFrom(tile: number, transaction: PlayerNameUpdate): void {
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
				const value = Math.min(this.nameDepth[current - 1], this.nameDepth[current - gameMap.width], this.nameDepth[current - gameMap.width - 1]) + 1;
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

				current += isColumn ? gameMap.width : 1;
			}
			if (isColumn) {
				if (!changed) break;
				changed = false;
				currentOrigin++;
				isColumn = false;
			} else {
				isColumn = true;
				currentOrigin += gameMap.width;
			}
			[currentMax, otherMax] = [otherMax, currentMax];
		}

		transaction.setNamePos(maxPos, max);
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
	private readonly borderSet: Set<number>;
	readonly queue: PriorityQueue<[number, number]> = new PriorityQueue((a, b) => a[0] > b[0]);

	constructor(name: string, troopLength: number, borderSet: Set<number>, id: number) {
		this.troopLength = troopLength;
		this.borderSet = borderSet;
		this.id = id;
		this.updateTick = random.nextInt(10);
		this.renderName(name);
	}

	/**
	 * Render the player name.
	 * @param name The name of the player.
	 * @private
	 */
	private renderName(name: string): void {
		playerNameRenderingManager.partialAtlasContext.fillStyle = "rgb(0, 0, 0)"; //TODO: This needs to be decided by the theme
		playerNameRenderingManager.partialAtlasContext.font = "bold " + Math.min(Math.floor(200 / (this.nameLength = playerNameRenderingManager.partialAtlasContext.measureText(name).width)), 8).toString() + "px " + getSetting("theme").getFont();
		playerNameRenderingManager.partialAtlasContext.fillText(name, this.id % playerNameRenderingManager.atlasRowLength * 20 + 10, Math.floor(this.id / playerNameRenderingManager.atlasRowLength) * 20 + 10);
	}

	/**
	 * Add a tile to the queue or adjust the current position if applicable.
	 * @param max the maximum size of the square
	 * @param pos the position of the square
	 */
	addPosition(max: number, pos: number): void {
		if (this.size < max) {
			this.queue.push([this.size, this.index]);
			this.setPosAt(pos, max);
		} else {
			this.queue.push([max, pos]);
		}
	}

	/**
	 * Check if the current position is still valid and adjust if necessary.
	 */
	validatePosition(): void {
		const nameDepth = playerNameRenderingManager.getNameDepth();
		if (nameDepth[this.index] === this.size && territoryManager.tileOwners[this.index] === this.id) return;
		if (nameDepth[this.index] !== 0) {
			this.queue.push([nameDepth[this.index], this.index]);
		}
		while (!this.queue.isEmpty()) {
			const [_, newPos] = this.queue.pop();
			if (territoryManager.tileOwners[newPos] === this.id) {
				const size = nameDepth[newPos];
				if (size >= (this.queue.peek()?.[0] ?? 0)) {
					this.setPosAt(newPos, size);
					return;
				} else if (size > 0) {
					this.queue.push([size, newPos]);
				}
			}
		}
		this.setPosAt(this.borderSet.values().next().value as number, 1);
	}

	/**
	 * Set the position of the player name.
	 * @param tile The tile to set the position at.
	 * @param size The size of the player name.
	 * @private
	 */
	private setPosAt(tile: number, size: number): void {
		this.size = size;
		this.index = tile;
		this.nameX = tile % gameMap.width - size + 1;
		this.nameY = Math.floor(tile / gameMap.width) - size + 1;
	}

	/**
	 * Render the player name.
	 * If the name is small, use the cached partial, otherwise render the name directly.
	 * @param context The context to render the name to.
	 * @param player The player to render the name for.
	 */
	renderPlayer(context: CanvasRenderingContext2D, player: Player): void {
		if (gameTicker.getTickCount() % 10 === this.updateTick) this.updatePartial(player);
		if (this.size * mapNavigationHandler.zoom >= 20) {
			context.fillStyle = "rgb(0, 0, 0)"; //TODO: This needs to be decided by the theme
			context.textBaseline = "bottom";
			context.font = "bold " + Math.floor(Math.min(10 / this.nameLength, 0.4) * this.size * mapNavigationHandler.zoom).toString() + "px " + getSetting("theme").getFont();
			context.fillText(player.name, Math.floor((this.nameX - this.size / 2 + 1) * mapNavigationHandler.zoom + mapNavigationHandler.x), Math.floor((this.nameY - this.size / 2 + 1) * mapNavigationHandler.zoom + mapNavigationHandler.y));
			context.textBaseline = "top";
			context.font = "bold " + Math.floor(1 / Math.max(3, player.getTroops().toString().length) * 3 * this.size / this.troopLength * mapNavigationHandler.zoom).toString() + "px " + getSetting("theme").getFont();
			context.fillText(formatTroops(player.getTroops()), Math.floor((this.nameX - this.size / 2 + 1) * mapNavigationHandler.zoom + mapNavigationHandler.x), Math.floor((this.nameY - this.size / 2 + 1) * mapNavigationHandler.zoom + mapNavigationHandler.y));
		} else {
			context.drawImage(playerNameRenderingManager.partialElementAtlas, (this.id % playerNameRenderingManager.atlasRowLength) * 20, Math.floor(this.id / playerNameRenderingManager.atlasRowLength) * 20, 20, 20, Math.floor((this.nameX - this.size + 1) * mapNavigationHandler.zoom + mapNavigationHandler.x), Math.floor((this.nameY - this.size + 1) * mapNavigationHandler.zoom + mapNavigationHandler.y), Math.floor(this.size * mapNavigationHandler.zoom), Math.floor(this.size * mapNavigationHandler.zoom));
		}
	}

	/**
	 * Update the partial canvas.
	 * @param player The player to update the partial for.
	 */
	updatePartial(player: Player): void {
		playerNameRenderingManager.partialAtlasContext.clearRect(this.id % playerNameRenderingManager.atlasRowLength * 20, Math.floor(this.id / playerNameRenderingManager.atlasRowLength) * 20 + 10, 20, 10);
		playerNameRenderingManager.partialAtlasContext.fillStyle = "rgb(0, 0, 0)"; //TODO: This needs to be decided by the theme
		playerNameRenderingManager.partialAtlasContext.font = "bold " + Math.floor(60 / Math.max(3, player.getTroops().toString().length) / this.troopLength).toString() + "px " + getSetting("theme").getFont();
		playerNameRenderingManager.partialAtlasContext.fillText(formatTroops(player.getTroops()), this.id % playerNameRenderingManager.atlasRowLength * 20 + 10, Math.floor(this.id / playerNameRenderingManager.atlasRowLength) * 20 + 10);
	}
}

export const playerNameRenderingManager = new PlayerNameRenderingManager();

export class PlayerNameUpdate {
	private readonly player: number;
	private readonly validate: boolean;
	private namePos: number = 0;
	private namePosSize: number = 0;

	constructor(player: number, validate: boolean) {
		this.player = player;
		this.validate = validate;
	}

	/**
	 * Set the name position.
	 * @param pos The position of the name.
	 * @param size The size of the name.
	 */
	setNamePos(pos: number, size: number): void {
		if (size > this.namePosSize) {
			this.namePos = pos;
			this.namePosSize = size;
		}
	}

	/**
	 * Update the player name rendering data.
	 */
	update(): void {
		const player = playerManager.getPlayer(this.player);
		if (!player) return;
		if (this.namePosSize > 0) {
			playerNameRenderingManager.getPlayerData(player).addPosition(this.namePosSize, this.namePos);
		}
		if (this.validate) {
			playerNameRenderingManager.getPlayerData(player).validatePosition();
		}
	}
}