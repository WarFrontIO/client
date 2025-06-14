import type {WebGLUniforms} from "../GameGLContext";
import type {GameTheme} from "../GameTheme";
import type {HSLColor} from "../../util/HSLColor";
import {GameGLContext} from "../GameGLContext";
import {CachedLayer} from "./CachedLayer";
import {mapTransformHandler} from "../../event/MapTransformHandler";
import {getSetting, registerSettingListener} from "../../util/settings/UserSettingManager";
import {mapRenderingFragmentShader, simpleTextureVertexShader, distanceMapFragmentShader} from "../shader/ShaderManager";
import {gameMap, isPlaying} from "../../game/GameData";
import {gameRenderer, rendererContextGameplay, renderingContextInit} from "../GameRenderer";

//@module renderer

/**
 * Map background renderer.
 * All static map tiles (and possibly other static objects) should be rendered here.
 * @internal
 */
class MapRenderer extends CachedLayer {
	private program: WebGLProgram;
	private vao: WebGLVertexArrayObject;
	private uniforms: WebGLUniforms<"texture_data" | "palette_data">;
	private details: (() => void)[];

	override setup(context: GameGLContext) {
		super.setup(context);
		this.program = context.requireProgram(simpleTextureVertexShader, mapRenderingFragmentShader, "Map renderer failed to init");
		this.vao = context.createVertexArray(this.program, GameGLContext.positionAttribute());
		this.uniforms = context.loadUniforms(this.program, "texture_data", "palette_data");
	}

	override init(context: GameGLContext): void {
		super.init(context);
		this.resizeCanvas(gameMap.width, gameMap.height);
		this.forceRepaint(getSetting("theme"));
	}

	forceRepaint(theme: GameTheme): void {
		this.initDetails(theme);
		this.context.bind(this.program, this.vao, this.framebuffer);
		this.context.viewport(gameMap.width, gameMap.height);

		const palette = this.createPalette(theme);
		const mapData = this.context.createTexture(gameMap.width, gameMap.height, gameMap.tiles, {type: WebGL2RenderingContext.UNSIGNED_SHORT, internalFormat: WebGL2RenderingContext.R16UI, format: WebGL2RenderingContext.RED_INTEGER});
		const depthData = this.context.createTexture(gameMap.width, gameMap.height, gameMap.distanceMap, {type: WebGL2RenderingContext.SHORT, internalFormat: WebGL2RenderingContext.R16I, format: WebGL2RenderingContext.RED_INTEGER});

		this.context.bindTexture(depthData, 2);
		this.context.bindTexture(palette, 1);
		this.context.bindTexture(mapData, 0);

		this.uniforms.set1i("palette_data", 1);
		this.uniforms.set1i("texture_data", 0);

		this.context.drawTriangles(2);

		this.details.forEach(detail => detail());

		this.context.deleteTexture(palette);
		this.context.deleteTexture(mapData);
		this.context.resetFramebuffer();
		this.context.viewport();
	}

	private createPalette(theme: GameTheme): WebGLTexture {
		const colors = new Uint8Array(2 ** 16 * 3);
		for (const tileType of gameMap.tileTypes) {
			const color = theme.getTileColor(tileType).toRGB();
			colors[tileType.id * 3] = color.r;
			colors[tileType.id * 3 + 1] = color.g;
			colors[tileType.id * 3 + 2] = color.b;
		}
		return this.context.createTexture(2 ** 8, 2 ** 8, colors);
	}

	onMapMove(this: void, x: number, y: number): void {
		mapRenderer.dx = x;
		mapRenderer.dy = y;
	}

	onMapScale(this: void, scale: number): void {
		mapRenderer.scale = scale;
	}

	private initDetails(theme: GameTheme): void {
		this.details = [];
		for (const detailData of theme.getShaderArgs()) {
			const detail = detailList[detailData.name];
			if (!detail) {
				console.warn(`Unknown detail shader ${detailData.name}`);
				continue;
			}
			this.details.push(detail(this.context, detailData.args));
		}
	}
}

const detailList = {
	"territory-outline": (context: GameGLContext, args: { color: HSLColor, thickness: number }) => buildDetail(context, args.color, -args.thickness, 0, 0),
	"territory-inline": (context: GameGLContext, args: { color: HSLColor, thickness: number }) => buildDetail(context, args.color, 0, args.thickness, 0),
	"territory-outline-smooth": (context: GameGLContext, args: { color: HSLColor, thickness: number }) => buildDetail(context, args.color, -args.thickness, 0, 1 / args.thickness),
	"territory-inline-smooth": (context: GameGLContext, args: { color: HSLColor, thickness: number }) => buildDetail(context, args.color, 0, args.thickness, -1 / args.thickness),
	"fixed-distance": (context: GameGLContext, args: { color: HSLColor, min: number, max: number }) => buildDetail(context, args.color, args.min, args.max, 0),
	"dynamic-distance": (context: GameGLContext, args: { color: HSLColor, min: number, max: number, gradient: number }) => buildDetail(context, args.color, args.min, args.max, args.gradient)
} as Record<string, (context: GameGLContext, args: unknown) => () => void>;

function buildDetail(context: GameGLContext, color: HSLColor, min: number, max: number, gradient: number): () => void {
	const program = context.requireProgram(simpleTextureVertexShader, distanceMapFragmentShader, "Map detail failed to init");
	const vao = context.createVertexArray(program, GameGLContext.positionAttribute());
	const uniforms = context.loadUniforms(program, "dist_data", "min", "max", "gradient", "color");
	const rgb = color.toRGB();

	return () => {
		context.bind(program, vao);

		uniforms.set1i("dist_data", 2);
		uniforms.set1i("min", min);
		uniforms.set1i("max", max);
		uniforms.set4f("color", rgb.r / 255, rgb.g / 255, rgb.b / 255, rgb.a);
		uniforms.set1f("gradient", gradient);

		context.drawTriangles(2);
	}
}

export const mapRenderer = new MapRenderer();

mapTransformHandler.scale.register(mapRenderer.onMapScale);
mapTransformHandler.move.register(mapRenderer.onMapMove);
renderingContextInit.register(id => id === rendererContextGameplay && gameRenderer.registerLayer(mapRenderer, 5));

registerSettingListener("theme", (theme) => isPlaying && mapRenderer.forceRepaint(theme));