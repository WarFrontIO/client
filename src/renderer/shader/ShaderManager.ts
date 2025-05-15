import {PostGenerationShader} from "./PostGenerationShader";
import {getSetting} from "../../util/settings/UserSettingManager";
import {FixedDistanceShader} from "./FixedDistanceShader";
import {HSLColor} from "../../util/HSLColor";
import {DynamicDistanceShader} from "./DynamicDistanceShader";
import {GameGLContext} from "../GameGLContext";

const shaderList = {
	"territory-outline": {type: "post-generation", build: (args: { color: HSLColor, thickness: number }) => new FixedDistanceShader(args.color, -args.thickness, 0)},
	"territory-inline": {type: "post-generation", build: (args: { color: HSLColor, thickness: number }) => new FixedDistanceShader(args.color, 0, args.thickness)},
	"territory-outline-smooth": {type: "post-generation", build: (args: { color: HSLColor, thickness: number }) => new DynamicDistanceShader(args.color, -args.thickness, 0, 1 / args.thickness)},
	"territory-inline-smooth": {type: "post-generation", build: (args: { color: HSLColor, thickness: number }) => new DynamicDistanceShader(args.color, 0, args.thickness, -1 / args.thickness)},
	"fixed-distance": {type: "post-generation", build: (args: { color: HSLColor, min: number, max: number }) => new FixedDistanceShader(args.color, args.min, args.max)},
	"dynamic-distance": {type: "post-generation", build: (args: { color: HSLColor, min: number, max: number, gradient: number }) => new DynamicDistanceShader(args.color, args.min, args.max, args.gradient)}
} as Record<string, {type: "post-generation", build: (args: unknown) => PostGenerationShader}>;
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

// Shaders are inlined by the build process
export const compositeVertexShader = (ctx: GameGLContext) => ctx.loadVertexShader("CompositeShader.vert");
export const flippedTextureVertexShader = (ctx: GameGLContext) => ctx.loadVertexShader("FlippedTextureShader.vert");
export const mapGridLookupVertexShader = (ctx: GameGLContext) => ctx.loadVertexShader("MapGridLookupShader.vert");

export const simpleTextureFragmentShader = (ctx: GameGLContext) => ctx.loadFragmentShader("SimpleTextureShader.frag");
export const mapRenderingFragmentShader = (ctx: GameGLContext) => ctx.loadFragmentShader("MapRenderingShader.frag");
export const territoryRenderingFragmentShader = (ctx: GameGLContext) => ctx.loadFragmentShader("TerritoryRenderingShader.frag");