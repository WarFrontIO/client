import type {Player} from "./Player";
import {random} from "../Random";
import {territoryManager} from "../TerritoryManager";
import {gameMap} from "../GameData";
import {packetRegistry} from "../../network/PacketManager";
import {SpawnBundlePacket} from "../../network/protocol/packet/game/SpawnBundlePacket";
import {playerManager} from "./PlayerManager";
import {TerritoryTransaction} from "../transaction/TerritoryTransaction";
import {actuallyStartGame} from "../Game";

class SpawnManager {
	spawnPoints: number[];
	spawnData: SpawnData[];
	backupPoints: number[];
	isSelecting: boolean;

	/**
	 * Initialize the spawn manager with the given maximum number of players.
	 *
	 * The spawn points are generated based on the map size and the number of players.
	 * Since the spawn points are generated randomly, the actual number of spawn points may be lower than the maximum number of players.
	 * If this is the case, spawn points will be regenerated with a smaller radius until enough spawn points are available.
	 * @param maxPlayers The maximum number of players.
	 */
	init(maxPlayers: number): number {
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
		return Math.min(this.spawnPoints.length, maxPlayers);
	}

	/**
	 * Build spawn points with the given radius.
	 *
	 * The spawn points are generated using poisson disc sampling.
	 * Algorithm by Robert Bridson (https://www.cs.ubc.ca/~rbridson/docs/bridson-siggraph07-poissondisk.pdf)
	 * Results are filtered to only include spawn points on solid tiles.
	 * @param radius The radius of the spawn points.
	 * @private
	 */
	private buildSpawns(radius: number): number[] {
		const minDistance = radius * radius;
		const cellSize = radius / Math.sqrt(2);
		const rows = Math.ceil(gameMap.height / cellSize);
		const cols = Math.ceil(gameMap.width / cellSize);
		const grid: number[] = new Array<number>(rows * cols).fill(-1);
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
					if (gameMap.getTile(index).conquerable) {
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

	/**
	 * Select a random spawn point for the given player.
	 *
	 * The spawn point is selected from the available spawn points.
	 * If no spawn points are available, the player will be spawned at partially blocked spawn points.
	 * @param player The player to spawn.
	 * @returns The selected spawn point.
	 */
	randomSpawnPoint(player: Player): number {
		const target = this.spawnPoints.length > 0 ? this.spawnPoints : this.backupPoints;
		const index = random.nextInt(target.length);
		const result = target[index];
		target.splice(index, 1);
		const transaction = new TerritoryTransaction(player, null);
		this.getSpawnPixels(result).forEach(pixel => territoryManager.conquer(pixel, player.id, transaction));
		transaction.apply();
		return result;
	}

	/**
	 * Finalize the spawn selection and start the game.
	 * This assigns random spawn points to players who didn't select their spawn yet.
	 */
	finalizeSelection() {
		for (const player of playerManager.getPlayers()) {
			if (player.getTerritorySize() === 0) {
				spawnManager.randomSpawnPoint(player);
			}
		}
		spawnManager.isSelecting = false;
		actuallyStartGame();
	}

	/**
	 * Select a spawn point for the given player based on the selected tile.
	 *
	 * Marks spawn points near the selected tile as blocked, so random spawn points will not be selected near the selected tile.
	 * @param player The player to spawn.
	 * @param tile The selected tile.
	 */
	selectSpawnPoint(player: number, tile: number): boolean {
		const pixels = this.getSpawnPixels(tile);
		if (pixels.length === 0) {
			return false; //Invalid spawn point
		}

		if (this.spawnData[player]) {
			const clearTransaction = new TerritoryTransaction(null, playerManager.getPlayer(player));
			this.spawnData[player].pixels.forEach(pixel => territoryManager.clear(pixel, clearTransaction));
			this.spawnPoints.push(...this.spawnData[player].blockedPoints);
			this.spawnData[player].blockedPoints.forEach(point => this.backupPoints.splice(this.backupPoints.indexOf(point), 1));
			clearTransaction.apply();
		}

		const transaction = new TerritoryTransaction(playerManager.getPlayer(player), null);

		const data = new SpawnData();
		data.blockedPoints = this.spawnPoints.filter(point => Math.abs(point % gameMap.width - tile % gameMap.width) <= 4 && Math.abs(Math.floor(point / gameMap.width) - Math.floor(tile / gameMap.width)) <= 4);
		data.pixels = pixels;
		data.blockedPoints.forEach(point => this.spawnPoints.splice(this.spawnPoints.indexOf(point), 1));
		data.pixels.forEach(pixel => territoryManager.conquer(pixel, player, transaction));
		this.backupPoints.push(...data.blockedPoints);
		this.spawnData[player] = data;

		transaction.apply(); //This intentionally ignores the "target" pixels
		return true;
	}

	/**
	 * Checks whether the given tile is a valid spawning spot.
	 * @param tile The tile to check the spawn point of.
	 * @returns true if the tile is a valid spawn point, false otherwise
	 */
	isValidSpawnPoint(tile: number): boolean {
		return this.getSpawnPixels(tile).length !== 0;
	}

	/**
	 * Get the spawn points near the given tile (within a 5x5 area).
	 * @param tile The tile to get the spawn points for.
	 * @returns The spawn points near the given tile.
	 * @private
	 */
	private getSpawnPixels(tile: number): number[] {
		const result = [];
		for (let dx = -2; dx <= 2; dx++) {
			for (let dy = -2; dy <= 2; dy++) {
				if (Math.abs(dx) === 2 && Math.abs(dy) === 2) {
					continue;
				}
				const index = tile + dx + dy * gameMap.width;
				if (index < 0 || index >= gameMap.width * gameMap.height) {
					continue;
				}
				if (gameMap.getTile(index).conquerable && !territoryManager.hasOwner(index)) {
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

packetRegistry.handle(SpawnBundlePacket, function () {
	for (const spawn of this.spawnPositions) {
		spawnManager.selectSpawnPoint(spawn.player, spawn.position);
	}
	//TODO: Display timer
});