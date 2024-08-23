import {PostGenerationShader} from "./PostGenerationShader";
import {HSLColor} from "../../util/HSLColor";
import {RGBColor} from "../../util/RGBColor";
import {gameMap} from "../../game/GameData";

/**
 * Shader affecting all tiles withing a fixed distance range.
 * Other than {@link DynamicDistanceShader}, this shader always uses the same color.
 */
export class FixedDistanceShader implements PostGenerationShader {
	private readonly color: RGBColor;
	private readonly min: number;
	private readonly max: number;

	/**
	 * Create a new territory outline shader.
	 * @param color the color of the outline.
	 * @param min the minimum distance (inclusive).
	 * @param max the maximum distance (exclusive).
	 */
	constructor(color: HSLColor, min: number, max: number) {
		this.color = color.toRGB();
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