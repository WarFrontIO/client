import {TileType as TileTypeBase} from "./codec/MapCodec";

export class GameMap {
	private readonly name: string;
	readonly width: number;
	readonly height: number;
	private readonly tileTypes: TileType[];
	private readonly tiles: Uint16Array;
	readonly tileExpansionCosts: Uint8Array;
	readonly tileExpansionTimes: Uint8Array;
	private readonly areaMap: Uint16Array;
	private readonly areaSizes: number[];
	readonly distanceMap: Int16Array;

	constructor(name: string, width: number, height: number, tileTypes: TileTypeBase[]) {
		this.name = name;
		this.width = width;
		this.height = height;
		this.tiles = new Uint16Array(width * height);
		this.tileExpansionCosts = new Uint8Array(width * height);
		this.tileExpansionTimes = new Uint8Array(width * height);
		this.areaMap = new Uint16Array(width * height);
		this.areaSizes = [width * height];
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
	 * Calculate the area map.
	 * @internal
	 */
	calculateAreaMap(): void {
		for (let i = 0; i < this.areaMap.length; i++) {
			if (!this.areaMap[i] && this.getTile(i).isSolid) {
				const stack: number[] = [i];
				let stackPointer = 1;
				let areaSize = 0;
				while (stackPointer > 0) {
					const current = stack[--stackPointer];
					if (this.areaMap[current]) continue;
					this.areaMap[current] = this.areaSizes.length;
					areaSize++;
					if (current % this.width !== 0 && this.getTile(current - 1).isSolid) stack[stackPointer++] = current - 1;
					if (current % this.width !== this.width - 1 && this.getTile(current + 1).isSolid) stack[stackPointer++] = current + 1;
					if (current >= this.width && this.getTile(current - this.width).isSolid) stack[stackPointer++] = current - this.width;
					if (current < this.tiles.length - this.width && this.getTile(current + this.width).isSolid) stack[stackPointer++] = current + this.width;
				}
				this.areaSizes.push(areaSize);
			}
		}
	}

	/**
	 * Calculate the distance map.
	 * @internal
	 */
	calculateDistanceMap(): void {
		const tileInfluence = new Uint32Array(this.width * this.height);
		//Calculate rows first
		for (let y = 0; y < this.height; y++) {
			const context1 = this.initDistanceContext(y * this.width);
			const context2 = this.initDistanceContext((y + 1) * this.width - 1);
			for (let x = 0; x <= this.width / 2 - 1; x++) {
				this.updateDistanceContext(y * this.width + x, context1);
				this.updateDistanceContext((y + 1) * this.width - 1 - x, context2);
				this.applyDistanceContext(y * this.width + x, context1, tileInfluence);
				this.applyDistanceContext((y + 1) * this.width - 1 - x, context2, tileInfluence);
			}
			for (let x = Math.ceil(this.width / 2); x < this.width; x++) {
				this.updateDistanceContext(y * this.width + x, context1);
				this.updateDistanceContext((y + 1) * this.width - 1 - x, context2);
				if (Math.abs(context1.distance) <= Math.abs(this.distanceMap[y * this.width + x])) this.applyDistanceContext(y * this.width + x, context1, tileInfluence);
				if (Math.abs(context2.distance) <= Math.abs(this.distanceMap[(y + 1) * this.width - 1 - x])) this.applyDistanceContext((y + 1) * this.width - 1 - x, context2, tileInfluence);
			}
		}

		//Calculate columns
		for (let x = 0; x < this.width; x++) {
			const context1 = this.initDistanceContext(x);
			const context2 = this.initDistanceContext((this.height - 1) * this.width + x);
			for (let y = 0; y < this.height; y++) {
				this.updateDistanceContext(y * this.width + x, context1);
				this.updateDistanceContext((this.height - 1 - y) * this.width + x, context2);
				if (Math.abs(context1.distance) < Math.abs(this.distanceMap[y * this.width + x])) this.applyDistanceContext(y * this.width + x, context1, tileInfluence);
				else this.restoreDistanceContext(y * this.width + x, context1, tileInfluence);
				if (Math.abs(context2.distance) < Math.abs(this.distanceMap[(this.height - 1 - y) * this.width + x])) this.applyDistanceContext((this.height - 1 - y) * this.width + x, context2, tileInfluence);
				else this.restoreDistanceContext((this.height - 1 - y) * this.width + x, context2, tileInfluence);
			}
		}
	}

	/**
	 * Initialize the distance context for a tile.
	 * @param index The index of the tile
	 * @returns The initialized context
	 * @private
	 */
	private initDistanceContext(index: number): DistanceContext {
		if (this.getTile(index).isSolid) {
			return {distance: 2 ** 15 - 1, bias: 0, lastSolid: index};
		}
		return {distance: -1 * 2 ** 15, bias: 0, lastSolid: index};
	}

	/**
	 * Update the distance to the nearest opposite tile.
	 * @param index The index of the tile
	 * @param context The context of the distance calculation
	 * @private
	 */
	private updateDistanceContext(index: number, context: DistanceContext): void {
		if (this.getTile(index).isSolid) {
			context.distance = Math.max(context.distance + 1, 0);
			context.lastSolid = index;
		} else {
			if (context.distance >= 0) { //Last tile was solid
				context.bias = Math.floor(5 * Math.exp(-this.areaSizes[this.areaMap[context.lastSolid]] / 1000)) + 1;
				context.distance = -1; //Important for coast detection
			} else {
				context.distance = context.distance - context.bias;
			}
		}
	}

	/**
	 * Apply a distance context to a tile.
	 * @param index The index of the tile
	 * @param context The context of the distance calculation
	 * @param tileInfluence The influence of the tile
	 * @private
	 */
	private applyDistanceContext(index: number, context: DistanceContext, tileInfluence: Uint32Array): void {
		this.distanceMap[index] = context.distance;
		tileInfluence[index] = context.lastSolid;
	}

	/**
	 * Restore a distance context.
	 * @param index The index of the tile
	 * @param context The context of the distance calculation
	 * @param tileInfluence The influence of the tile
	 * @private
	 */
	private restoreDistanceContext(index: number, context: DistanceContext, tileInfluence: Uint32Array): void {
		context.distance = this.distanceMap[index];
		context.lastSolid = tileInfluence[index];
		context.bias = Math.floor(5 * Math.exp(-this.areaSizes[this.areaMap[context.lastSolid]] / 1000)) + 1;
	}
}

export type TileType = TileTypeBase & {id: number};
type DistanceContext = {distance: number, bias: number, lastSolid: number};