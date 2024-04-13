import {random} from "../Random";
import {gameMap, isLocalGame, startGameCycle} from "../Game";
import {territoryManager} from "../TerritoryManager";
import {Player} from "./Player";

class SpawnManager {
	spawnPoints: number[];
	spawnData: SpawnData[];
	backupPoints: number[];
	isSelecting: boolean;

	init(maxPlayers: number): void {
		//generate spawn points with decreasing radius until all players can spawn
		let radius = Math.max(5, Math.sqrt(gameMap.width * gameMap.height / maxPlayers / 1.1 / Math.sqrt(2)));
		while (radius >= 5) {
			this.spawnPoints = this.buildSpawns(radius);
			if (this.spawnPoints.length >= maxPlayers) {
				break;
			}
			radius *= 0.9;
		}

		this.spawnData = [];
		this.backupPoints = [];
		this.isSelecting = true;
	}

	private buildSpawns(radius: number): number[] {
		// Use poisson disc sampling to generate spawn points
		// Algorithm by Robert Bridson (https://www.cs.ubc.ca/~rbridson/docs/bridson-siggraph07-poissondisk.pdf)
		const minDistance = radius * radius;
		const cellSize = radius / Math.sqrt(2);
		const rows = Math.ceil(gameMap.height / cellSize);
		const cols = Math.ceil(gameMap.width / cellSize);
		const grid = new Array(rows * cols).fill(-1);
		const active = [], points = [];
		const initialX = random.nextInt(gameMap.width), initialY = random.nextInt(gameMap.height);
		const initial = initialX + initialY * gameMap.width;
		active.push(initial);
		points.push(initial);
		grid[Math.floor(initialX / cellSize) + Math.floor(initialY / cellSize) * cols] = initial;
		while (active.length > 0) {
			const index = random.nextInt(active.length);
			const point = active[index];
			const px = point % gameMap.width;
			const py = Math.floor(point / gameMap.width);
			let found = false;
			for (let tries = 0; tries < 30; tries++) {
				const angle = random.next() * 2 * Math.PI;
				const distance = (random.next() + 1) * radius;
				const x = Math.floor(px + Math.cos(angle) * distance);
				const y = Math.floor(py + Math.sin(angle) * distance);
				const cellX = Math.floor(x / cellSize);
				const cellY = Math.floor(y / cellSize);
				if (x < 0 || x >= gameMap.width || y < 0 || y >= gameMap.height || grid[cellX + cellY * cols] !== -1) {
					continue;
				}
				let valid = true;
				for (let i = -1; i <= 1; i++) {
					for (let j = -1; j <= 1; j++) {
						if (cellX + i < 0 || cellX + i >= cols || cellY + j < 0 || cellY + j >= rows) {
							continue;
						}
						if (grid[cellX + i + (cellY + j) * cols] !== -1) {
							const other = grid[cellX + i + (cellY + j) * cols];
							const ox = other % gameMap.width - x;
							const oy = Math.floor(other / gameMap.width) - y;
							if (ox * ox + oy * oy < minDistance) {
								valid = false;
								break;
							}
						}
					}
					if (!valid) {
						break;
					}
				}
				if (valid) {
					found = true;
					const index = x + y * gameMap.width;
					active.push(index);
					if (gameMap.getTile(x, y).isSolid) {
						points.push(index);
					}
					grid[Math.floor(x / cellSize) + Math.floor(y / cellSize) * cols] = index;
					break;
				}
			}
			if (!found) {
				active.splice(index, 1);
			}
		}

		return points;
	}

	randomSpawnPoint(player: Player): number {
		const target = this.spawnPoints.length > 0 ? this.spawnPoints : this.backupPoints;
		const index = random.nextInt(target.length);
		const result = target[index];
		target.splice(index, 1);
		this.getSpawnPixels(result).forEach(pixel => territoryManager.conquer(pixel, player.id));
		return result;
	}

	selectSpawnPoint(player: Player, tile: number): void {
		if (this.spawnData[player.id]) {
			this.spawnData[player.id].pixels.forEach(pixel => territoryManager.clear(pixel));
			this.spawnPoints.push(...this.spawnData[player.id].blockedPoints);
			this.spawnData[player.id].blockedPoints.forEach(point => this.backupPoints.splice(this.backupPoints.indexOf(point), 1));
		}
		const data = new SpawnData();
		data.blockedPoints = this.spawnPoints.filter(point => Math.abs(point % gameMap.width - tile % gameMap.width) <= 4 && Math.abs(Math.floor(point / gameMap.width) - Math.floor(tile / gameMap.width)) <= 4);
		data.pixels = this.getSpawnPixels(tile);
		data.blockedPoints.forEach(point => this.spawnPoints.splice(this.spawnPoints.indexOf(point), 1));
		data.pixels.forEach(pixel => territoryManager.conquer(pixel, player.id));
		this.backupPoints.push(...data.blockedPoints);
		this.spawnData[player.id] = data;

		if (isLocalGame) {
			this.isSelecting = false;
			startGameCycle();
		}
	}

	private getSpawnPixels(tile: number): number[] {
		let result = [];
		const x = tile % gameMap.width;
		const y = Math.floor(tile / gameMap.width);
		for (let dx = -2; dx <= 2; dx++) {
			for (let dy = -2; dy <= 2; dy++) {
				if (Math.abs(dx) === 2 && Math.abs(dy) === 2) {
					continue;
				}
				const nx = x + dx;
				const ny = y + dy;
				if (nx < 0 || nx >= gameMap.width || ny < 0 || ny >= gameMap.height) {
					continue;
				}
				const index = nx + ny * gameMap.width;
				if (gameMap.getTile(nx, ny).isSolid && !territoryManager.hasOwner(index)) {
					result.push(index);
				}
			}
		}
		return result;
	}
}

class SpawnData {
	blockedPoints: number[];
	pixels: number[];
}

export const spawnManager = new SpawnManager();