import {GameMap} from "../map/GameMap"
import {ClearTileEvent, EventDispatcher} from "./GameEvent";
import {GameMode} from "./mode/GameMode"
import {PlayerManager} from "./player/PlayerManager"

export class GameState {
    tileOwners: Uint16Array;
    readonly OWNER_NONE = 65535;
    private dispatcher: EventDispatcher

    public map: GameMap
    public mode: GameMode
    public players: PlayerManager

    constructor(map: GameMap, mode: GameMode, players: PlayerManager) {
        this.map = map
        this.mode = mode
        this.players = players
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
        let x = tile % this.map.width;
        let y = Math.floor(tile / this.map.width);
        let owner = this.tileOwners[tile];
        return x === 0 || x === this.map.width - 1 || y === 0 || y === this.map.height - 1 ||
            this.tileOwners[tile - 1] !== owner || this.tileOwners[tile + 1] !== owner ||
            this.tileOwners[tile - this.map.width] !== owner || this.tileOwners[tile + this.map.width] !== owner;
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
            this.players.getPlayer(previousOwner).removeTile(tile);
        }
        this.players.getPlayer(owner).addTile(tile);
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
            this.players.getPlayer(owner).removeTile(tile);
            this.dispatcher.fireClearTileEvent(new ClearTileEvent(tile))
        }
    }
}
