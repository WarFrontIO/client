import {playerManager} from "./player/PlayerManager";
import {playerNameRenderingManager} from "../renderer/manager/PlayerNameRenderingManager";
import {gameMap} from "./GameData";
import {TerritoryTransaction} from "./transaction/TerritoryTransaction";

class TerritoryManager {
	tileOwners: Uint16Array;
	readonly OWNER_NONE = 65535;

	/**
	 * Resets the territory manager.
	 * Should only be called when a new game is started.
	 * @internal
	 */
	reset(): void {
		this.tileOwners = new Uint16Array(gameMap.width * gameMap.height);
		for (let i = 0; i < this.tileOwners.length; i++) {
			this.tileOwners[i] = gameMap.getTile(i).isSolid ? this.OWNER_NONE : this.OWNER_NONE - 1;
		}
	}

	/**
	 * Checks if a tile is a border tile of the territory of its owner.
	 *
	 * A tile is a border tile if it is adjacent to a tile that is not owned by the same player.
	 * Pixels on the edge of the map are also considered border tiles.
	 * @param tile The tile to check.
	 * @returns True if the tile is a border tile, false otherwise.
	 */
	isBorder(tile: number): boolean {
		const x = tile % gameMap.width;
		const y = Math.floor(tile / gameMap.width);
		const owner = this.tileOwners[tile];
		return x === 0 || x === gameMap.width - 1 || y === 0 || y === gameMap.height - 1 ||
			this.tileOwners[tile - 1] !== owner || this.tileOwners[tile + 1] !== owner ||
			this.tileOwners[tile - gameMap.width] !== owner || this.tileOwners[tile + gameMap.width] !== owner;
	}

	/**
	 * Checks if a tile has an owner.
	 * @param tile The tile to check.
	 * @returns True if the tile has an owner, false otherwise.
	 */
	hasOwner(tile: number): boolean {
		return this.tileOwners[tile] !== this.OWNER_NONE;
	}

	/**
	 * Checks if a tile is owned by a specific player.
	 * @param tile The tile to check.
	 * @param owner The player to check against.
	 * @returns True if the tile is owned by the player, false otherwise.
	 */
	isOwner(tile: number, owner: number): boolean {
		return this.tileOwners[tile] === owner;
	}

	/**
	 * Gets the owner of a tile.
	 * @param tile The tile to get the owner of.
	 * @returns The owner of the tile.
	 */
	getOwner(tile: number): number {
		return this.tileOwners[tile];
	}

	/**
	 * Checks if a tile is part of a player's territory excluding the player's border.
	 * @param tile The tile to check.
	 * @returns True if the tile is part of a player's territory, false otherwise.
	 */
	isTerritory(tile: number): boolean {
		return playerNameRenderingManager.isConsidered(tile);
	}

	/**
	 * Checks if a tile is water.
	 * @param tile The tile to check.
	 * @returns True if the tile is water, false otherwise.
	 */
	isWater(tile: number): boolean {
		return this.tileOwners[tile] === this.OWNER_NONE - 1;
	}

	/**
	 * Conquers a tile for a player.
	 *
	 * If the tile is already owned by a player, the player will lose the tile.
	 * Conquered tiles will be passed to the renderer directly.
	 * @param tile The tile to conquer
	 * @param owner The player that will own the tile
	 * @param transaction The transaction to apply the conquering to
	 */
	conquer(tile: number, owner: number, transaction: TerritoryTransaction): void {
		const previousOwner = this.tileOwners[tile];
		this.tileOwners[tile] = owner;
		if (previousOwner !== this.OWNER_NONE) {
			playerManager.getPlayer(previousOwner).removeTile(tile);
		}
		playerManager.getPlayer(owner).addTile(tile);
		transaction.addTile(tile);
	}

	/**
	 * Clears a tile.
	 * @see TerritoryManager.conquer
	 * @param tile The tile to clear
	 * @param transaction The transaction to apply the clearing to, requires to have null as the attacker
	 */
	clear(tile: number, transaction: TerritoryTransaction): void {
		const owner = this.tileOwners[tile];
		if (owner !== this.OWNER_NONE) {
			this.tileOwners[tile] = this.OWNER_NONE;
			playerManager.getPlayer(owner).removeTile(tile);
			transaction.addTile(tile);
		}
	}
}

export const territoryManager = new TerritoryManager();