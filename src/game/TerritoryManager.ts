import { TerritoryRenderingManager } from "../renderer/manager/TerritoryRenderingManager";
import { PlayerNameRenderingManager } from "../renderer/manager/PlayerNameRenderingManager";
import { Game } from "./Game";

export class TerritoryManager {
	tileOwners: Uint16Array;
	static readonly OWNER_NONE = 65535;

	public game: Game;
	public territoryRenderingManager: TerritoryRenderingManager;
	public playerNameRenderingManager: PlayerNameRenderingManager;

	constructor(game: Game, territoryRenderingManager: TerritoryRenderingManager, playerNameRenderingManager: PlayerNameRenderingManager) {
		this.game = game;
		this.territoryRenderingManager = territoryRenderingManager;
		this.playerNameRenderingManager = playerNameRenderingManager;
	}

	/**
	 * Resets the territory manager.
	 * Should only be called when a new game is started.
	 * @internal
	 */
	reset(): void {
		this.tileOwners = new Uint16Array(this.game.map.width * this.game.map.height);
		for (let i = 0; i < this.tileOwners.length; i++) {
			this.tileOwners[i] = this.game.map.getTile(i).isSolid ? TerritoryManager.OWNER_NONE : TerritoryManager.OWNER_NONE - 1;
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
		let x = tile % this.game.map.width;
		let y = Math.floor(tile / this.game.map.width);
		let owner = this.tileOwners[tile];
		return x === 0 || x === this.game.map.width - 1 || y === 0 || y === this.game.map.height - 1 ||
			this.tileOwners[tile - 1] !== owner || this.tileOwners[tile + 1] !== owner ||
			this.tileOwners[tile - this.game.map.width] !== owner || this.tileOwners[tile + this.game.map.width] !== owner;
	}

	/**
	 * Checks if a tile has an owner.
	 * @param tile The tile to check.
	 * @returns True if the tile has an owner, false otherwise.
	 */
	hasOwner(tile: number): boolean {
		return this.tileOwners[tile] !== TerritoryManager.OWNER_NONE;
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
		return this.playerNameRenderingManager.isConsidered(tile);
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
		if (previousOwner !== TerritoryManager.OWNER_NONE) {
			this.game.players.getPlayer(previousOwner).removeTile(tile);
		}
		this.game.players.getPlayer(owner).addTile(tile);
	}

	/**
	 * Clears a tile.
	 * @see TerritoryManager.conquer
	 * @param tile The tile to clear.
	 */
	clear(tile: number): void {
		const owner = this.tileOwners[tile];
		if (owner !== TerritoryManager.OWNER_NONE) {
			this.tileOwners[tile] = TerritoryManager.OWNER_NONE;
			this.game.players.getPlayer(owner).removeTile(tile);
			this.territoryRenderingManager.clear(tile);
		}
	}
}