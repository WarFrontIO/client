import {PostGenerationShader} from "./PostGenerationShader";
import {Color} from "../../util/Color";
import {gameMap} from "../../game/Game";

/**
 * Shader affecting all tiles withing a fixed distance range.
 * Other than {@link DynamicDistanceShader}, this shader always uses the same color.
 */
export class FixedDistanceShader implements PostGenerationShader {
	private readonly color: Color;
	private readonly min: number;
	private readonly max: number;

	/**
	 * Create a new territory outline shader.
	 * @param color the color of the outline.
	 * @param min the minimum distance (inclusive).
	 * @param max the maximum distance (exclusive).
	 */
	constructor(color: Color, min: number, max: number) {
		this.color = color;
		this.min = min;
		this.max = max;
	}

	apply(pixels: Uint8ClampedArray): void {
		const map = gameMap.distanceMap;
		for (let i = 0; i < map.length; i++) {
			if (map[i] < this.max && map[i] >= this.min) {
				this.color.blendWithBuffer(pixels, i * 4);
			}
		}
	}
}