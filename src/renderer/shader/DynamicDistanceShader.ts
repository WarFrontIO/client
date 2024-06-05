import {PostGenerationShader} from "./PostGenerationShader";
import {Color} from "../../util/Color";
import {gameMap} from "../../game/Game";

/**
 * Shader affecting all tiles withing a fixed distance range.
 * Other than {@link FixedDistanceShader}, this shader decreases color intensity with distance.
 */
export class DynamicDistanceShader implements PostGenerationShader {
	private readonly color: Color;
	private readonly min: number;
	private readonly max: number;
	private readonly gradient: number;

	/**
	 * Create a new territory outline shader.
	 * @param color the color of the outline.
	 * @param min the minimum distance (inclusive).
	 * @param max the maximum distance (exclusive).
	 * @param gradient the gradient of the color decrease (higher values decrease color intensity faster, sign determines direction).
	 */
	constructor(color: Color, min: number, max: number, gradient: number) {
		this.color = color;
		this.min = min;
		this.max = max;
		this.gradient = gradient;
	}

	apply(pixels: Uint8ClampedArray): void {
		const map = gameMap.distanceMap;
		for (let i = 0; i < map.length; i++) {
			if (map[i] < this.max && map[i] >= this.min) {
				this.color.blendWithBuffer(pixels, i * 4, this.gradient > 0 ? this.gradient * (map[i] - this.min) : 1 + this.gradient * (map[i] - this.min));
			}
		}
	}
}