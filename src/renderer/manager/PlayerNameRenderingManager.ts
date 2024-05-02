import {Player} from "../../game/player/Player";
import {territoryRenderer} from "../layer/TerritoryRenderer";
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
		const nameLength = territoryRenderer.context.measureText(player.name).width / 10;
		const troopLength = territoryRenderer.context.measureText("123.").width / 10;
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
	 * Update the player name rendering data.
	 * @internal
	 */
	addTile(tile: number, player: number): void {
		this.nameDepth[tile] = 65535; // force recalculation
		this.recalculateFrom(tile, false, this.playerData[player]);
	}

	/**
	 * Update the player name rendering data.
	 * @internal
	 */
	removeTile(tile: number, player: number): void {
		this.nameDepth[tile] = 0;
		this.recalculateFrom(tile, true, this.playerData[player]);
	}

	/**
	 * Recalculate the name depth map from a specific tile.
	 * Name depth refers to the maximum size a square can be with the bottom-right corner at the tile.
	 * @param tile The tile to recalculate from.
	 * @param isRemoval Whether the recalculation is due to a tile removal.
	 * @param playerData The player's rendering data.
	 * @private
	 */
	private recalculateFrom(tile: number, isRemoval: boolean, playerData: PlayerNameRenderingData): void {
		let currentOrigin = tile;
		let isColumn = false;
		let changed = true;
		let max = 0;
		let maxPos = 0;
		while (true) {
			let current = currentOrigin;
			if (isRemoval && currentOrigin === tile) {
				current++;
			}
			while (true) {
				if (!this.nameDepth[current]) break; // Border / unclaimed tile
				const value = Math.min(this.nameDepth[current - 1], this.nameDepth[current - gameMap.width], this.nameDepth[current - gameMap.width - 1]) + 1;
				if (value === this.nameDepth[current]) break;

				if (isRemoval) {
					if (playerData.stackMap[current]) {
						playerData.removeStack(current);
					}
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
		}

		if (isRemoval && playerData.stackMap[tile]) {
			playerData.removeStack(tile);
			if (this.nameDepth[tile - gameMap.width - 1] && this.nameDepth[tile - gameMap.width - 1] > max) {
				max = this.nameDepth[tile - gameMap.width - 1];
				maxPos = tile - gameMap.width - 1;
			}
		}
		playerData.insertStack(max, maxPos);
	}
}

export class PlayerNameRenderingData {
	nameX: number = 0;
	nameY: number = 0;
	private readonly nameLength: number;
	private readonly troopLength: number;
	nameSize: number = 0;
	troopSize: number = 0;
	private readonly positionStack: number[] = [];
	private readonly valueStack: number[] = [];
	private readonly borderSet: Set<number>;
	readonly stackMap: boolean[] = [];

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
		if (value > this.valueStack[this.valueStack.length - 1] || this.positionStack.length < 5) {
			if (this.stackMap[tile]) {
				this.removeStack(tile);
			}
			const index = this.valueStack.findIndex(v => v < value);
			if (index === -1) {
				this.positionStack.push(tile);
				this.valueStack.push(value);
			} else {
				this.positionStack.splice(index, 0, tile);
				this.valueStack.splice(index, 0, value);
				if (this.positionStack.length > 5) {
					this.positionStack.pop();
					this.valueStack.pop();
				}
			}
			this.stackMap[tile] = true;
			this.updateStack();
		}
	}

	/**
	 * Remove a tile from the name rendering stack.
	 * @param tile The tile to remove.
	 */
	removeStack(tile: number): void {
		const index = this.positionStack.indexOf(tile);
		if (index !== -1) {
			this.positionStack.splice(index, 1);
			this.valueStack.splice(index, 1);
		}
		delete this.stackMap[tile];
		this.updateStack();
	}

	private updateStack(): void {
		if (this.positionStack.length === 0) {
			this.setPosAt(this.borderSet.values().next().value, 1);
			return;
		}

		this.setPosAt(this.positionStack[0], this.valueStack[0]);
	}

	private setPosAt(tile: number, size: number): void {
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