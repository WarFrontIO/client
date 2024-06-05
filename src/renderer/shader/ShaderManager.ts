import {PostGenerationShader} from "./PostGenerationShader";
import {getSetting} from "../../util/UserSettingManager";
import {FixedDistanceShader} from "./FixedDistanceShader";
import {Color} from "../../util/Color";
import {DynamicDistanceShader} from "./DynamicDistanceShader";

const shaderList = {
	"territory-outline": {type: "post-generation", build: (args: { color: Color, thickness: number }) => new FixedDistanceShader(args.color, -args.thickness, 0)},
	"territory-inline": {type: "post-generation", build: (args: { color: Color, thickness: number }) => new FixedDistanceShader(args.color, 0, args.thickness)},
	"territory-outline-smooth": {type: "post-generation", build: (args: { color: Color, thickness: number }) => new DynamicDistanceShader(args.color, -args.thickness, 0, 1 / args.thickness)},
	"territory-inline-smooth": {type: "post-generation", build: (args: { color: Color, thickness: number }) => new DynamicDistanceShader(args.color, 0, args.thickness, -1 / args.thickness)},
	"fixed-distance": {type: "post-generation", build: (args: { color: Color, min: number, max: number }) => new FixedDistanceShader(args.color, args.min, args.max)},
	"dynamic-distance": {type: "post-generation", build: (args: { color: Color, min: number, max: number, gradient: number }) => new DynamicDistanceShader(args.color, args.min, args.max, args.gradient)}
};
const activePostGeneration: PostGenerationShader[] = [];

/**
 * Load all shaders from the current theme.
 */
export function loadShaders(): void {
	for (const shaderData of getSetting("theme").getShaderArgs()) {
		const shader = shaderList[shaderData.name];
		if (!shader) {
			console.error(`Unknown shader: ${shaderData.name}`);
			continue;
		}
		const obj = shader.build(shaderData.args);
		if (shader.type === "post-generation") {
			addPostGenerationShader(obj);
		}
	}
}

/**
 * Add a post-generation shader to the list of active shaders.
 * @param shader The shader to add.
 */
export function addPostGenerationShader(shader: PostGenerationShader): void {
	activePostGeneration.push(shader);
}

/**
 * Apply all active post-generation shaders to the map.
 * @param pixels The pixel data of the map.
 * @internal
 */
export function applyPostGenerationShaders(pixels: Uint8ClampedArray): void {
	for (const shader of activePostGeneration) {
		shader.apply(pixels);
	}
}