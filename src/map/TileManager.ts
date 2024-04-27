import {TileType} from "./tile/TileType";
import {WaterTile} from "./tile/WaterTile";
import {GrassTile} from "./tile/GrassTile";
import {UnsupportedDataException} from "../util/exception/UnsupportedDataException";

export class TileManager {
	private tileTypes: TileType[] = [];

	constructor() {
		this.registerTileType(new WaterTile());
		this.registerTileType(new GrassTile());
	}

	/**
	 * Registers a tile type
	 *
	 * Make sure to use the proper tile type ids
	 * Only one tile type can be registered per id
	 * @see TileTypeIds
	 * @param tileType the tile type to register
	 * @throws UnsupportedDataException if a tile type with the same id is already registered
	 */
	registerTileType(tileType: TileType): void {
		if (this.tileTypes[tileType.id] !== undefined) {
			throw new UnsupportedDataException("TileType with id " + tileType.id + " already registered")
		}
		this.tileTypes[tileType.id] = tileType;
	}

	// noinspection JSUnusedGlobalSymbols - util for 3rd party code
	/**
	 * Allows 3rd party code to override a tile type
	 *
	 * Allows mods to overwrite rendering portions of a built-in tile type
	 * Requires non-visual tile data to match the original tile type
	 *
	 * @param tileType the tile type to override
	 * @throws UnsupportedDataException if the tile type is not registered or data does not match
	 */
	overrideTileType(tileType: TileType): void {
		const existingTileType = this.tileTypes[tileType.id];
		if (existingTileType === undefined) {
			throw new UnsupportedDataException("TileType with id " + tileType.id + " not registered")
		}
		if (existingTileType.isSolid !== tileType.isSolid) {
			throw new UnsupportedDataException("TileType with id " + tileType.id + " isSolid does not match")
		}
		this.tileTypes[tileType.id] = tileType;
	}

	/**
	 * Retrieves a tile type by its id
	 *
	 * @param id the id of the tile type
	 * @returns the tile type
	 */
	fromID(id: number): TileType {
		return this.tileTypes[id];
	}
}