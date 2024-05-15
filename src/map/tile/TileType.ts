import {Color} from "../../util/Color";

/**
 * Tile types are used to define the properties of a tile.
 * They are used to render the map and to determine the behavior of the tile.
 *
 * Tile types are immutable and should be created once and then reused.
 * Subclasses mustn't have any mutable state.
 */
export abstract class TileType {
	abstract readonly baseColor: Color;
	abstract readonly id: number;
	abstract readonly isSolid: boolean;

	//TODO: This is a placeholder for now
	// tile types should be able to render sprites or other graphics when zoomed in enough
	abstract render(context: CanvasRenderingContext2D, x: number, y: number): void;
}