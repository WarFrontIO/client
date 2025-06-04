import type {Player} from "../../game/player/Player";
import {PriorityQueue} from "../../util/PriorityQueue";
import {territoryManager} from "../../game/TerritoryManager";
import {gameMap} from "../../game/GameData";
import {playerManager} from "../../game/player/PlayerManager";
import {borderManager} from "../../game/BorderManager";
import {gameInitRegistry} from "../../game/Game";
import {registerTransactionExecutor} from "../../game/transaction/TransactionExecutors";
import {TerritoryTransaction} from "../../game/transaction/TerritoryTransaction";

class PlayerNameRenderingManager {
	playerData: PlayerNameRenderingData[] = [];
	private nameDepth: Uint16Array;

	reset(players: Player[]) {
		this.playerData = [];
		this.nameDepth = new Uint16Array(gameMap.width * gameMap.height);

		for (const player of players) {
			this.playerData[player.id] = new PlayerNameRenderingData(borderManager.getBorderTiles(player.id), player.id);
		}
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
	size: number = 0;
	index: number = 0;
	nameX: number = 0;
	nameY: number = 0;
	private readonly borderSet: Set<number>;
	readonly queue: PriorityQueue<[number, number]> = new PriorityQueue((a, b) => a[0] > b[0]);

	constructor(borderSet: Set<number>, id: number) {
		this.borderSet = borderSet;
		this.id = id;
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
}

export const playerNameRenderingManager = new PlayerNameRenderingManager();

gameInitRegistry.register(() => playerNameRenderingManager.reset(playerManager.getPlayers()));

registerTransactionExecutor(TerritoryTransaction, function (this: TerritoryTransaction) {
	const attackerName = new PlayerNameUpdate(this.attacker?.id ?? -1, false);
	const defenderName = new PlayerNameUpdate(this.defendant?.id ?? -1, true);

	if (this.attacker) {
		this.borderData.territory.forEach(tile => playerNameRenderingManager.addTile(tile, attackerName));
		this.borderData.attacker.forEach(tile => playerNameRenderingManager.removeTile(tile, defenderName));
	}
	if (this.defendant) {
		this.borderData.defender.forEach(tile => playerNameRenderingManager.removeTile(tile, defenderName));
	}

	attackerName.update();
	defenderName.update();
});

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