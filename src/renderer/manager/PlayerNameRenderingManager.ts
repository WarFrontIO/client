import {Player} from "../../game/player/Player";
import {gameMap} from "../../game/Game";
import {playerManager} from "../../game/player/PlayerManager";
import {formatTroops} from "../../util/StringFormatter";

class PlayerNameRenderingManager {
	playerData: PlayerNameRenderingData[] = [];
	private nameDepth: Uint16Array;

	reset() {
		this.playerData = [];
		this.nameDepth = new Uint16Array(gameMap.width * gameMap.height);
	}

	/**
	 * Register a player for name rendering.
	 * @param player The player to register.
	 */
	registerPlayer(player: Player): void {
		const canvas = document.createElement("canvas");
		const context = canvas.getContext("2d");
		const nameLength = context.measureText(player.name).width / 10;
		const troopLength = context.measureText("123.").width / 10;
		this.playerData[player.id] = new PlayerNameRenderingData(nameLength, troopLength, player.borderTiles);
	}

	/**
	 * Get render data for all player names.
	 * @returns Render data for all player names.
	 * @internal
	 */
	getTextData(): RenderTextData[] {
		const data: RenderTextData[] = [];
		for (let i = 0; i < this.playerData.length; i++) {
			const player = playerManager.getPlayer(i);
			if (player && player.isAlive()) {
				const playerData = this.playerData[i];
				const name = player.name;
				const troopSize = Math.floor(playerData.troopSize / Math.max(3, player.getTroops().toString().length) * 3);
				data.push({
					text: name,
					x: playerData.nameX,
					y: playerData.nameY,
					size: playerData.nameSize,
					baseline: "bottom"
				});
				data.push({
					text: formatTroops(player.getTroops()),
					x: playerData.nameX,
					y: playerData.nameY,
					size: troopSize,
					baseline: "top"
				});
			}
		}
		data.sort((a, b) => a.size - b.size);
		return data;
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
	addTile(tile: number, player: number): void {
		this.nameDepth[tile] = 65535; // force recalculation
		this.recalculateFrom(tile, this.playerData[player]);
	}

	/**
	 * Update the player name rendering data.
	 * @internal
	 */
	removeTile(tile: number, player: number): void {
		const playerData = this.playerData[player];

		let offset = 0;
		let rowMax = Infinity;
		let columnMax = Infinity;
		let max = this.nameDepth[tile - gameMap.width - 1];
		let maxPos = tile - gameMap.width - 1;
		let changed: boolean;
		do {
			changed = false;
			for (let i = 0; i < rowMax; i++) {
				if (this.nameDepth[tile + i] <= offset + i) {
					rowMax = i;
					break;
				}
				this.nameDepth[tile + i] = offset + i;
				if (offset + i > max) {
					max = offset + i;
					maxPos = tile + i;
				}
				changed = true;
			}
			tile += gameMap.width;
			for (let i = 0; i < columnMax; i++) {
				if (this.nameDepth[tile + i * gameMap.width] <= offset + i) {
					columnMax = i;
					break;
				}
				this.nameDepth[tile + i * gameMap.width] = offset + i;
				if (offset + i > max) {
					max = offset + i;
					maxPos = tile + i * gameMap.width;
				}
				changed = true;
			}
			tile++;
			offset++;
		} while (changed);
		playerData.setPosAt(maxPos, max);
	}

	/**
	 * Recalculate the name depth map from a specific tile.
	 * Name depth refers to the maximum size a square can be with the bottom-right corner at the tile.
	 * @param tile The tile to recalculate from.
	 * @param playerData The player's rendering data.
	 * @private
	 */
	private recalculateFrom(tile: number, playerData: PlayerNameRenderingData): void {
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
		playerData.insertStack(max, maxPos);
	}
}

export class PlayerNameRenderingData {
	size: number = 0;
	nameX: number = 0;
	nameY: number = 0;
	private readonly nameLength: number;
	private readonly troopLength: number;
	nameSize: number = 0;
	troopSize: number = 0;
	private readonly borderSet: Set<number>;
	readonly stackMap: boolean[] = [];

	//TODO: Add proper fallback system
	constructor(nameLength: number, troopLength: number, borderSet: Set<number>) {
		this.nameLength = nameLength;
		this.troopLength = troopLength;
		this.borderSet = borderSet;
	}

	/**
	 * Insert a tile into the name rendering stack.
	 * @param value Size of square top-left of the tile.
	 * @param tile The tile to insert.
	 */
	insertStack(value: number, tile: number): void {
		if (value > this.size) {
			this.setPosAt(tile, value);
		}
	}

	setPosAt(tile: number, size: number): void {
		this.size = size;
		this.nameX = tile % gameMap.width - size / 2 + 1;
		this.nameY = Math.floor(tile / gameMap.width) - size / 2 + 1;
		this.nameSize = Math.floor(Math.min(1 / this.nameLength, 0.4) * size * 4);
		this.troopSize = 1 / this.troopLength * size * 4;
	}
}

export type RenderTextData = {
	text: string;
	x: number;
	y: number;
	size: number;
	baseline: CanvasTextBaseline;
}

export const playerNameRenderingManager = new PlayerNameRenderingManager();