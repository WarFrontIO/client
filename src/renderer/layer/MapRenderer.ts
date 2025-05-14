import {CachedLayer} from "./CachedLayer";
import {mapTransformHandler} from "../../event/MapTransformHandler";
import {getSetting, registerSettingListener} from "../../util/settings/UserSettingManager";
import {GameTheme} from "../GameTheme";
import {mapRenderingFragmentShader, flippedTextureVertexShader} from "../shader/ShaderManager";
import {gameMap, isPlaying} from "../../game/GameData";
import {gameStartRegistry} from "../../game/Game";
import {gameRenderer} from "../GameRenderer";
import {GameGLContext, WebGLUniforms} from "../GameGLContext";

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

	setup(context: GameGLContext) {
		super.setup(context);
		this.program = context.requireProgram(flippedTextureVertexShader, mapRenderingFragmentShader, "Map renderer failed to init");
		this.vao = context.createVertexArray(this.program, GameGLContext.positionAttribute());
		this.uniforms = context.loadUniforms(this.program, "texture_data", "palette_data");
	}

	init(context: GameGLContext): void {
		super.init(context);
		this.resizeCanvas(gameMap.width, gameMap.height);
		this.forceRepaint(getSetting("theme"));
	}

	forceRepaint(theme: GameTheme): void {
		this.context.bind(this.program, this.vao, this.framebuffer);
		this.context.viewport(gameMap.width, gameMap.height);

		const palette = this.createPalette(theme);
		const mapData = this.context.createTexture(gameMap.width, gameMap.height, gameMap.tiles, {type: WebGL2RenderingContext.UNSIGNED_SHORT_5_6_5});

		this.context.bindTexture(palette, 1);
		this.context.bindTexture(mapData, 0);

		this.uniforms.set1i("palette_data", 1);
		this.uniforms.set1i("texture_data", 0);

		this.context.drawTriangles(2);

		this.context.deleteTexture(palette);
		this.context.deleteTexture(mapData);
		this.context.resetFramebuffer();
		this.context.viewport();
	}

	private createPalette(theme: GameTheme): WebGLTexture {
		const colors = new Uint8Array(2048 * 32 * 3);
		for (const tileType of gameMap.tileTypes) {
			const color = theme.getTileColor(tileType).toRGB();
			colors[tileType.id * 3] = color.r;
			colors[tileType.id * 3 + 1] = color.g;
			colors[tileType.id * 3 + 2] = color.b;
		}
		return this.context.createTexture(2048, 32, colors);
	}

	onMapMove(this: void, x: number, y: number): void {
		mapRenderer.dx = x;
		mapRenderer.dy = y;
	}

	onMapScale(this: void, scale: number): void {
		mapRenderer.scale = scale;
	}
}

export const mapRenderer = new MapRenderer();

mapTransformHandler.scale.register(mapRenderer.onMapScale);
mapTransformHandler.move.register(mapRenderer.onMapMove);
gameStartRegistry.register(() => gameRenderer.registerLayer(mapRenderer));

registerSettingListener("theme", (theme) => isPlaying && mapRenderer.forceRepaint(theme));