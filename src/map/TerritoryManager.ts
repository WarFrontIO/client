import {gameMap} from "../game/Game";
import {playerManager} from "../game/player/PlayerManager";
import {ClearTileEvent, eventDispatcher, EventDispatcher} from "../game/GameEvent";

class TerritoryManager {
	tileOwners: Uint16Array;
	readonly OWNER_NONE = 65535;
	private dispatcher: EventDispatcher

	constructor(dispatcher: EventDispatcher) {
		this.dispatcher = dispatcher
	}

	init() {
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
		let x = tile % gameMap.width;
		let y = Math.floor(tile / gameMap.width);
		let owner = this.tileOwners[tile];
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
	 * Conquers a tile for a player.
	 *
	 * If the tile is already owned by a player, the player will lose the tile.
	 * Conquered tiles will be passed to the renderer directly.
	 * @param tile The tile to conquer.
	 * @param owner The player that will own the tile.
	 */
	conquer(tile: number, owner: number): void {
		const previousOwner = this.tileOwners[tile];
		this.tileOwners[tile] = owner;
		if (previousOwner !== this.OWNER_NONE) {
			playerManager.getPlayer(previousOwner).removeTile(tile);
		}
		playerManager.getPlayer(owner).addTile(tile);
	}

	/**
	 * Clears a tile.
	 * @see TerritoryManager.conquer
	 * @param tile The tile to clear.
	 */
	clear(tile: number): void {
		const owner = this.tileOwners[tile];
		if (owner !== this.OWNER_NONE) {
			this.tileOwners[tile] = this.OWNER_NONE;
			playerManager.getPlayer(owner).removeTile(tile);
			this.dispatcher.fireClearTileEvent(new ClearTileEvent(tile))
		}
	}

	onNeighbors(tile: number, closure: (tile: number) => void): void {
		let x = tile % gameMap.width;
		let y = Math.floor(tile / gameMap.width);
		if (x > 0) {
			closure(tile - 1);
		}
		if (x < gameMap.width - 1) {
			closure(tile + 1);
		}
		if (y > 0) {
			closure(tile - gameMap.width);
		}
		if (y < gameMap.height - 1) {
			closure(tile + gameMap.width);
		}
	}

	/**
	 * Check if a tile borders a tile owned by a player.
	 * @param tile The tile to check.
	 * @param player The player to check for.
	 * @returns True if the tile borders a tile owned by the player, false otherwise.
	 */
	bordersTile(tile: number, player: number): boolean {
		let x = tile % gameMap.width;
		let y = Math.floor(tile / gameMap.width);
		return (x > 0 && territoryManager.isOwner(tile - 1, player)) ||
			(x < gameMap.width - 1 && territoryManager.isOwner(tile + 1, player)) ||
			(y > 0 && territoryManager.isOwner(tile - gameMap.width, player)) ||
			(y < gameMap.height - 1 && territoryManager.isOwner(tile + gameMap.width, player));
	}
}

export const territoryManager = new TerritoryManager(eventDispatcher);