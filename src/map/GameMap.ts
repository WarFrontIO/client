import {TileType as TileTypeBase} from "./codec/MapCodec";

export class GameMap {
	private readonly name: string;
	readonly width: number;
	readonly height: number;
	private readonly tileTypes: TileType[];
	private readonly tiles: Uint16Array;
	readonly tileExpansionCosts: Uint8Array;
	readonly tileExpansionTimes: Uint8Array;
	readonly distanceMap: Int16Array;

	constructor(name: string, width: number, height: number, tileTypes: TileTypeBase[]) {
		this.name = name;
		this.width = width;
		this.height = height;
		this.tiles = new Uint16Array(width * height);
		this.tileExpansionCosts = new Uint8Array(width * height);
		this.tileExpansionTimes = new Uint8Array(width * height);
		this.distanceMap = new Int16Array(width * height);
		this.tileTypes = tileTypes.map((type, id) => ({...type, id}));
	}

	/**
	 * Get the tile at the given index.
	 *
	 * If you want to check if a tile is solid, use {@link getDistance} instead.
	 * @param index The index of the tile.
	 * @returns The tile.
	 */
	getTile(index: number): TileType {
		return this.tileTypes[this.tiles[index]];
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
		this.tileExpansionCosts[index] = this.tileTypes[tile].expansionCost;
		this.tileExpansionTimes[index] = this.tileTypes[tile].expansionTime;
	}

	/**
	 * Get the distance to the nearest non-solid tile if the tile is solid (0 if bordering a non-solid tile).
	 * If the tile is not solid, the distance is negative and the absolute value is the distance to the nearest solid tile (-1 if bordering a solid tile).
	 *
	 * Can also be used to determine whether a tile is solid or not (negative distance = not solid).
	 * @param index The index of the tile.
	 * @returns The distance of the tile.
	 */
	getDistance(index: number): number {
		return this.distanceMap[index];
	}

	/**
	 * Calculate the distance map.
	 * @internal
	 */
	calculateDistanceMap(): void {
		//Calculate rows first
		for (let y = 0; y < this.height; y++) {
			let distance = this.getTile(y * this.width).conquerable ? 2 ** 15 - 1 : -1 * 2 ** 15;
			for (let x = 0; x < this.width; x++) {
				this.distanceMap[y * this.width + x] = distance = this.increaseDistance(y * this.width + x, distance);
			}
			distance = this.getTile((y + 1) * this.width - 1).conquerable ? 2 ** 15 - 1 : -1 * 2 ** 15;
			for (let x = this.width - 1; x >= 0; x--) {
				distance = this.increaseDistance(y * this.width + x, distance);
				if (Math.abs(this.distanceMap[y * this.width + x]) > Math.abs(distance)) {
					this.distanceMap[y * this.width + x] = distance;
				}
			}
		}

		//Calculate columns
		for (let x = 0; x < this.width; x++) {
			let distance1 = this.getTile(x).conquerable ? 2 ** 15 - 1 : -1 * 2 ** 15;
			let distance2 = this.getTile((this.height - 1) * this.width + x).conquerable ? 2 ** 15 - 1 : -1 * 2 ** 15;
			for (let y = 0; y < this.height; y++) {
				distance1 = this.increaseDistance(y * this.width + x, distance1);
				distance2 = this.increaseDistance((this.height - 1 - y) * this.width + x, distance2);
				this.distanceMap[y * this.width + x] = distance1 = Math.abs(this.distanceMap[y * this.width + x]) > Math.abs(distance1) ? distance1 : this.distanceMap[y * this.width + x];
				this.distanceMap[(this.height - 1 - y) * this.width + x] = distance2 = Math.abs(this.distanceMap[(this.height - 1 - y) * this.width + x]) > Math.abs(distance2) ? distance2 : this.distanceMap[(this.height - 1 - y) * this.width + x];
			}
		}
	}

	/**
	 * Increase the distance to the nearest opposite tile by one.
	 * @param index The index of the tile.
	 * @param distance The current distance.
	 * @returns The new distance.
	 * @internal
	 */
	private increaseDistance(index: number, distance: number): number {
		return this.getTile(index).conquerable ? Math.max(distance + 1, 0) : Math.min(distance - 1, -1);
	}
}

export type TileType = TileTypeBase & {id: number};