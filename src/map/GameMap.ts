import {TileType as TileTypeBase} from "./codec/MapCodec";
import {PriorityQueue} from "../util/PriorityQueue";

export class GameMap {
	private readonly name: string;
	readonly width: number;
	readonly height: number;
	private readonly tileTypes: TileType[];
	private readonly tiles: Uint16Array;
	readonly tileExpansionCosts: Uint8Array;
	readonly tileExpansionTimes: Uint8Array;
	readonly areaMap: Uint16Array;
	readonly areaSizes: number[];
	readonly tileInfluence: Uint32Array;
	readonly distanceMap: Int16Array;
	readonly boatTargets: { tile: number, distance: number, midPoint: number }[][] = [];

	constructor(name: string, width: number, height: number, tileTypes: TileTypeBase[]) {
		this.name = name;
		this.width = width;
		this.height = height;
		this.tiles = new Uint16Array(width * height);
		this.tileExpansionCosts = new Uint8Array(width * height);
		this.tileExpansionTimes = new Uint8Array(width * height);
		this.areaMap = new Uint16Array(width * height);
		this.areaSizes = [width * height];
		this.tileInfluence = new Uint32Array(width * height);
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
	 * Call a closure on all neighbors of a tile.
	 * @param tile The tile to get the neighbors of
	 * @param closure The closure to call on each neighbor
	 */
	onNeighbors(tile: number, closure: (tile: number) => void): void {
		const x = tile % this.width;
		const y = Math.floor(tile / this.width);
		if (x > 0) closure(tile - 1);
		if (x < this.width - 1) closure(tile + 1);
		if (y > 0) closure(tile - this.width);
		if (y < this.height - 1) closure(tile + this.width);
	}

	/**
	 * Calculate the area map.
	 * @internal
	 */
	calculateAreaMap(): void {
		for (let i = 0; i < this.areaMap.length; i++) {
			if (!this.areaMap[i] && this.getTile(i).conquerable) {
				const stack: number[] = [i];
				let stackPointer = 1;
				let areaSize = 0;
				while (stackPointer > 0) {
					const current = stack[--stackPointer];
					if (this.areaMap[current]) continue;
					this.areaMap[current] = this.areaSizes.length;
					areaSize++;
					if (current % this.width !== 0 && this.getTile(current - 1).conquerable) stack[stackPointer++] = current - 1;
					if (current % this.width !== this.width - 1 && this.getTile(current + 1).conquerable) stack[stackPointer++] = current + 1;
					if (current >= this.width && this.getTile(current - this.width).conquerable) stack[stackPointer++] = current - this.width;
					if (current < this.tiles.length - this.width && this.getTile(current + this.width).conquerable) stack[stackPointer++] = current + this.width;
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
		this.distanceMap.fill(-(2 ** 15));
		const queue = new PriorityQueue<[number, number, number[]]>((a, b) => Math.abs(a[0]) < Math.abs(b[0]));
		const waterCache = new Map<number, number[]>();
		const landCache = new Map<number, number[]>();
		const markerCache = new Map<number, boolean[]>();

		for (let i = 0; i < this.areaMap.length; i++) {
			if (this.getTile(i).navigable) {
				let bias = Infinity, influence = undefined;
				this.onNeighbors(i, neighbor => {
					const neighborBias = this.calculateBias(neighbor);
					if (!this.getTile(neighbor).navigable && neighborBias < bias) {
						bias = neighborBias;
						influence = neighbor;
					}
				});

				if (influence) {
					if (!waterCache.has(this.areaMap[influence])) {
						const cache = [i, influence];
						waterCache.set(this.areaMap[influence], cache);
						queue.push([-1 - bias, -bias, cache]);
					} else {
						const cache = waterCache.get(this.areaMap[influence]) as number[];
						cache.push(i);
						cache.push(influence);
					}
					this.distanceMap[i] = -1;
					this.tileInfluence[i] = influence;
				}
			} else if ((i % this.width !== 0 && this.getTile(i - 1).navigable) || (i % this.width !== this.width - 1 && this.getTile(i + 1).navigable) ||
				(i >= this.width && this.getTile(i - this.width).navigable) || (i < this.tiles.length - this.width && this.getTile(i + this.width).navigable)) {
				if (!landCache.has(this.areaMap[i])) {
					const cache = [i, i];
					landCache.set(this.areaMap[i], cache);
					queue.push([1, 1, cache]);
				} else {
					const cache = landCache.get(this.areaMap[i]) as number[];
					cache.push(i);
					cache.push(i);
				}
				this.distanceMap[i] = 0;
				this.tileInfluence[i] = i;
			}
		}

		while (!queue.isEmpty()) {
			const [distance, bias, array] = queue.pop();
			const newArray: number[] = [];
			const markerAlias = new Map<number, Map<number, [number, number]>>();
			for (let i = 0; i < array.length; i += 2) {
				this.onNeighbors(array[i], neighbor => {
					if (this.distanceMap[neighbor] === -(2 ** 15)) {
						this.distanceMap[neighbor] = distance;
						this.tileInfluence[neighbor] = array[i + 1];
						newArray.push(neighbor);
						newArray.push(array[i + 1]);
					} else if (distance < 0 && array[i + 1] < this.tileInfluence[neighbor] && !markerCache.get(array[i + 1])?.[this.tileInfluence[neighbor]]) {
						const a1 = neighbor % this.width - array[i + 1] % this.width;
						const a2 = Math.floor(neighbor / this.width) - Math.floor(array[i + 1] / this.width);
						const b1 = neighbor % this.width - this.tileInfluence[neighbor] % this.width;
						const b2 = Math.floor(neighbor / this.width) - Math.floor(this.tileInfluence[neighbor] / this.width);
						const angle = Math.acos((a1 * b1 + a2 * b2) / Math.sqrt((a1 ** 2 + a2 ** 2) * (b1 ** 2 + b2 ** 2)));
						//TODO: clean up; remove senseless markers on borders
						// @ts-expect-error - TS doesn't know that the key exists
						if (angle >= Math.PI / 2 && (!markerAlias.get(array[i + 1])?.has(this.tileInfluence[neighbor]) || angle > markerAlias.get(array[i + 1])?.get(this.tileInfluence[neighbor])?.[0])) {
							if (!markerAlias.has(array[i + 1])) markerAlias.set(array[i + 1], new Map());
							// @ts-expect-error - TS doesn't know that the key exists
							markerAlias.get(array[i + 1]).set(this.tileInfluence[neighbor], [angle, neighbor]);
						}
					}
				});
			}
			if (newArray.length > 0) queue.push([distance + bias, bias, newArray]);
		}
	}

	/**
	 * Calculate the bias for the area of the given tile.
	 * @param tile The tile to calculate the bias for
	 * @private
	 */
	private calculateBias(tile: number): number {
		return Math.floor(5 * Math.exp(-this.areaSizes[this.areaMap[tile]] / 1000)) + 1;
	}
}

export type TileType = TileTypeBase & { id: number };