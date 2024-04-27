import {Player} from "../../game/player/Player";
import {territoryRenderer} from "../layer/TerritoryRenderer";
import {gameMap} from "../../game/Game";
import {playerManager} from "../../game/player/PlayerManager";
import {formatTroops} from "../../util/StringFormatter";

class PlayerNameRenderingManager {
	playerData: PlayerNameRenderingData[] = [];

	reset() {
		this.playerData = [];
	}

	/**
	 * Register a player for name rendering.
	 * @param player The player to register.
	 */
	registerPlayer(player: Player): PlayerNameRenderingData {
		const nameLength = territoryRenderer.context.measureText(player.name).width / 10;
		const troopLength = territoryRenderer.context.measureText("123.").width / 10;
		const data = new PlayerNameRenderingData(nameLength, troopLength);
		this.playerData[player.id] = data;
		return data;
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
			if (player) {
				player.update();
				const playerData = this.playerData[i];
				const name = player.name;
				const troopSize = Math.floor(playerData.troopSize / Math.max(3, player.troops.toString().length) * 3);
				data.push({
					text: name,
					x: playerData.nameX,
					y: playerData.nameY,
					size: playerData.nameSize,
					baseline: "bottom"
				});
				data.push({
					text: formatTroops(player.troops),
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
}

export class PlayerNameRenderingData {
	private minX: number = Infinity;
	private maxX: number = 0;
	private minY: number = Infinity;
	private maxY: number = 0;
	nameX: number = 0;
	nameY: number = 0;
	private readonly nameLength: number;
	private readonly troopLength: number;
	nameSize: number = 0;
	troopSize: number = 0;

	constructor(nameLength: number, troopLength: number) {
		this.nameLength = nameLength;
		this.troopLength = troopLength;
	}

	/**
	 * Update the bounds of the player's territory.
	 * @param x The x coordinate of the new tile.
	 * @param y The y coordinate of the new tile.
	 */
	updateBounds(x: number, y: number): void {
		this.minX = Math.min(this.minX, x);
		this.maxX = Math.max(this.maxX, x);
		this.minY = Math.min(this.minY, y);
		this.maxY = Math.max(this.maxY, y);
	}

	/**
	 * Recalculate the player bounds if necessary.
	 * @param x The x coordinate of the removed tile.
	 * @param y The y coordinate of the removed tile.
	 * @param all All border tiles of the player.
	 */
	removeBounds(x: number, y: number, all: Set<number>): void {
		if (x === this.minX || x === this.maxX || y === this.minY || y === this.maxY) {
			this.minX = Infinity;
			this.maxX = 0;
			this.minY = Infinity;
			this.maxY = 0;
			for (const tile of all) {
				const x = tile % gameMap.width;
				const y = Math.floor(tile / gameMap.width);
				if (x < this.minX) this.minX = x;
				if (x > this.maxX) this.maxX = x;
				if (y < this.minY) this.minY = y;
				if (y > this.maxY) this.maxY = y;
			}
		}
	}

	/**
	 * Update the position of the player's name and troop count.
	 *
	 * Calculates the largest square of the player's territory and places the name in the center.
	 * @param territoryMap Bitmap of the player's territory.
	 * @param borderTiles All border tiles of the player.
	 */
	updateNamePosition(territoryMap: Uint8Array, borderTiles: Set<number>): void {
		const xSize = this.maxX - this.minX + 1;
		const ySize = this.maxY - this.minY + 1;
		let max = 0;
		let maxPos = [0, 0];
		let currentRow = new Uint16Array(xSize);
		let previousRow = new Uint16Array(xSize);

		for (let y = 0; y < ySize; y++) {
			for (let x = 0; x < xSize; x++) {
				let entry = territoryMap[(y + this.minY) * gameMap.width + x + this.minX];
				if (entry && x) entry = Math.min(currentRow[x - 1], previousRow[x - 1], currentRow[x]) + 1;

				previousRow[x] = currentRow[x];
				currentRow[x] = entry;

				if (entry > max) {
					max = entry;
					maxPos = [x, y];
				}
			}
		}

		// If the player has no territory, place the name on a random border tile
		if (max === 0) {
			max = 1;
			const pos = borderTiles.values().next().value;
			maxPos = [pos % gameMap.width - this.minX, Math.floor(pos / gameMap.width) - this.minY];
		}

		this.nameX = this.minX + maxPos[0] - max / 2 + 1;
		this.nameY = this.minY + maxPos[1] - max / 2 + 1;
		this.nameSize = Math.floor(Math.min(1 / this.nameLength, 0.4) * max * 4);
		this.troopSize = 1 / this.troopLength * max * 4;
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