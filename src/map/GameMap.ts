import {TileType} from "./tile/TileType";
import {tileManager} from "../Loader";

export class GameMap {
	private readonly name: string;
	readonly width: number;
	readonly height: number;
	private readonly tiles: Uint16Array;

	constructor(name: string, width: number, height: number) {
		this.name = name;
		this.width = width;
		this.height = height;
		this.tiles = new Uint16Array(width * height);
	}

	getTile(index: number): TileType {
		return tileManager.fromID(this.tiles[index]);
	}

	/**
	 * Manipulates the tile at the given index.
	 *
	 * This method should only be called by map loaders / generators.
	 * @param index The index of the tile.
	 * @param tile The new tile.
	 */
	setTileId(index: number, tile: number): void {
		this.tiles[index] = tile;
	}
}