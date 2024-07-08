import {PostGenerationShader} from "./PostGenerationShader";
import {HSLColor} from "../../util/HSLColor";
import {RGBColor} from "../../util/RGBColor";
import { Game } from "../../game/Game";

/**
 * Shader affecting all tiles withing a fixed distance range.
 * Other than {@link DynamicDistanceShader}, this shader always uses the same color.
 */
export class FixedDistanceShader implements PostGenerationShader {
	private readonly color: RGBColor;
	private readonly min: number;
	private readonly max: number;
	private readonly game: Game;

	/**
	 * Create a new territory outline shader.
	 * @param color the color of the outline.
	 * @param min the minimum distance (inclusive).
	 * @param max the maximum distance (exclusive).
	 */
	constructor(game: Game, color: HSLColor, min: number, max: number) {
		this.color = color.toRGB();
		this.min = min;
		this.max = max;
		this.game = game;
	}

	apply(pixels: Uint8ClampedArray): void {
		const map = this.game.map.distanceMap;
		for (let i = 0; i < map.length; i++) {
			if (map[i] < this.max && map[i] >= this.min) {
				this.color.blendWithBuffer(pixels, i * 4);
			}
		}
	}
}