import {tileManager} from "../../Loader";
import {territoryManager} from "../TerritoryManager";
import {territoryRenderer} from "../../renderer/layer/TerritoryRenderer";
import {gameMap} from "../Game";

export class Player {
	id: number;
	name: string;
	troops: number = 1000;
	borderTiles: Set<number> = new Set();
	territorySize: number = 0;
	nameUpdateTimer: number = 0;
	territoryMap: Uint16Array = new Uint16Array(gameMap.width * gameMap.height);
	minX: number = Infinity;
	maxX: number = 0;
	minY: number = Infinity;
	maxY: number = 0;
	nameX: number = 0;
	nameY: number = 0;
	nameLength: number = 0;
	troopLength: number = 0;
	nameSize: number = 0;
	troopSize: number = 0;

	constructor(id: number, name: string, r: number, g: number, b: number) {
		this.id = id;
		this.name = name;
		this.territoryR = r;
		this.territoryG = g;
		this.territoryB = b;
		this.borderR = r < 128 ? r + 32 : r - 32;
		this.borderG = g < 128 ? g + 32 : g - 32;
		this.borderB = b < 128 ? b + 32 : b - 32;
		this.nameLength = territoryRenderer.context.measureText(this.name).width / 10;
		this.troopLength = territoryRenderer.context.measureText("123.").width / 10;
	}

	territoryR: number = 0;
	territoryG: number = 0;
	territoryB: number = 0;
	borderR: number = 0;
	borderG: number = 0;
	borderB: number = 0;

	addTile(tile: number): void {
		this.territorySize++;
		if (territoryManager.isBorder(tile)) {
			this.borderTiles.add(tile);
			territoryRenderer.set(tile, this.borderR, this.borderG, this.borderB);
		} else {
			this.territoryMap[tile] = 1;
			territoryRenderer.set(tile, this.territoryR, this.territoryG, this.territoryB);
		}
		for (const neighbor of tileManager.getNeighbors(tile)) {
			if (territoryManager.isOwner(neighbor, this.id) && !territoryManager.isBorder(neighbor) && this.borderTiles.delete(neighbor)) {
				territoryRenderer.set(neighbor, this.territoryR, this.territoryG, this.territoryB);
				this.territoryMap[neighbor] = 1;
			}
		}

		if (tile % gameMap.width < this.minX) this.minX = tile % gameMap.width;
		if (tile % gameMap.width > this.maxX) this.maxX = tile % gameMap.width;
		if (Math.floor(tile / gameMap.width) < this.minY) this.minY = Math.floor(tile / gameMap.width);
		if (Math.floor(tile / gameMap.width) > this.maxY) this.maxY = Math.floor(tile / gameMap.width);
		this.nameUpdateTimer++;
	}

	removeTile(tile: number): void {
		this.territorySize--;
		this.borderTiles.delete(tile);
		this.territoryMap[tile] = 0;
		for (const neighbor of tileManager.getNeighbors(tile)) {
			if (territoryManager.isOwner(neighbor, this.id) && !this.borderTiles.has(neighbor)) {
				this.borderTiles.add(neighbor);
				territoryRenderer.set(neighbor, this.borderR, this.borderG, this.borderB);
				this.territoryMap[neighbor] = 0;
			}
		}

		if (tile % gameMap.width === this.minX || tile % gameMap.width === this.maxX || Math.floor(tile / gameMap.width) === this.minY || Math.floor(tile / gameMap.width) === this.maxY) {
			this.minX = gameMap.width;
			this.maxX = 0;
			this.minY = gameMap.height;
			this.maxY = 0;
			for (const tile of this.borderTiles) {
				if (tile % gameMap.width < this.minX) this.minX = tile % gameMap.width;
				if (tile % gameMap.width > this.maxX) this.maxX = tile % gameMap.width;
				if (Math.floor(tile / gameMap.width) < this.minY) this.minY = Math.floor(tile / gameMap.width);
				if (Math.floor(tile / gameMap.width) > this.maxY) this.maxY = Math.floor(tile / gameMap.width);
			}
		}
		this.nameUpdateTimer++;
	}

	income() {
		this.troops += Math.max(1, Math.floor(this.territorySize / 50) + Math.floor(this.troops / 30));
		this.troops = Math.min(this.territorySize * 100, this.troops);
	}

	update() {
		if (this.territorySize === 0) return;
		if (this.nameUpdateTimer > Math.min(200, this.territorySize / 10)) {
			this.calculateNamePosition();
			this.nameUpdateTimer = 0;
		} else if (this.nameUpdateTimer > 0) {
			this.nameUpdateTimer++;
		}
	}

	calculateNamePosition() {
		const xSize = this.maxX - this.minX + 1;
		const ySize = this.maxY - this.minY + 1;
		let max = 0;
		let maxPos = [0, 0];
		let currentRow = new Array(xSize).fill(0);
		let previousRow = new Array(xSize).fill(0);

		for (let y = 0; y < ySize; y++) {
			for (let x = 0; x < xSize; x++) {
				let entry = this.territoryMap[(y + this.minY) * gameMap.width + x + this.minX];
				if (entry && x) entry = Math.min(currentRow[x - 1], previousRow[x - 1], currentRow[x]) + 1;

				previousRow[x] = currentRow[x];
				currentRow[x] = entry;

				if (entry > max) {
					max = entry;
					maxPos = [x, y];
				}
			}
		}

		this.nameX = this.minX + maxPos[0] - max / 2 + 1;
		this.nameY = this.minY + maxPos[1] - max / 2 + 1;
		this.nameSize = Math.min(1 / this.nameLength, 0.4) * max;
		this.troopSize = Math.min(1 / this.troopLength / Math.max(3, this.troops.toString().length) * 3, 0.4) * max;
	}
}