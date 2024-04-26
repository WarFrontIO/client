import {TileType} from "./tile/TileType";
import {tileManager} from "../Loader";

export class GameMap {
	private name: string;
	width: number;
	height: number;
	private readonly tiles: Uint8Array;

	constructor(name: string, width: number, height: number) {
		this.name = name;
		this.width = width;
		this.height = height;
		this.tiles = new Uint8Array(width * height);
	}

	getTile(x: number, y: number): TileType {
		return tileManager.fromID(this.tiles[y * this.width + x]);
	}

	setTileAt(x: number, y: number, tile: TileType): void {
		this.tiles[y * this.width + x] = tile.id;
	}

	setTileId(index: number, tile: number): void {
		this.tiles[index] = tile;
	}
}