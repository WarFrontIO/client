import type {GameGLContext, WebGLUniforms} from "../../GameGLContext";
import type {DebugRendererLayer} from "./DebugRenderer";
import {gameMap} from "../../../game/GameData";
import {getSettingObject} from "../../../util/settings/UserSettingManager";
import {linearLookupFragmentShader, mapGridLookupVertexShader} from "../../shader/ShaderManager";
import {BaseRendererLayer} from "../BaseRendererLayer";

//@module renderer-debug

export class TerrainDepthRenderer extends BaseRendererLayer implements DebugRendererLayer {
	readonly useCache = true;
	private program: WebGLProgram;
	private vao: WebGLVertexArrayObject;
	private uniforms: WebGLUniforms<"size" | "palette_data" | "length">;
	private palette: WebGLTexture;
	private positionBuffer: WebGLBuffer;
	private depthBuffer: WebGLBuffer;

	setup(context: GameGLContext): void {
		this.program = context.requireProgram(mapGridLookupVertexShader, linearLookupFragmentShader, "Name depth debug renderer failed to init");
		this.positionBuffer = context.createBuffer();
		this.depthBuffer = context.createBuffer();
		this.vao = context.createVertexArray(this.program, {name: "pos", size: 1, type: WebGL2RenderingContext.UNSIGNED_INT, buffer: this.positionBuffer, asInt: true}, {name: "id", size: 1, type: WebGL2RenderingContext.UNSIGNED_SHORT, buffer: this.depthBuffer, asInt: true});
		this.uniforms = context.loadUniforms(this.program, "size", "palette_data", "length");
		this.palette = context.createTexture(3, 1, new Uint8Array([0, 0, 0, 128, 0, 255, 0, 128, 0, 0, 255, 128, 255, 0, 255, 128]), {internalFormat: WebGL2RenderingContext.RGBA, format: WebGL2RenderingContext.RGBA, magFilter: WebGL2RenderingContext.LINEAR});
	}

	init(context: GameGLContext) {
		super.init(context);

		const tiles = new Uint32Array(gameMap.width * gameMap.height);
		for (let i = 0; i < gameMap.width * gameMap.height; i++) {
			tiles[i] = i;
		}

		context.bufferData(this.positionBuffer, tiles, WebGL2RenderingContext.DYNAMIC_DRAW);
	}

	render(context: GameGLContext): void {
		context.bind(this.program, this.vao);
		context.bindTexture(this.palette);

		this.uniforms.set2i("size", gameMap.width, gameMap.height);
		this.uniforms.set1ui("length", 100);
		this.uniforms.set1i("palette_data", 0);

		context.bufferData(this.depthBuffer, Uint16Array.from(gameMap.distanceMap, v => Math.max(0, v + 50)), WebGL2RenderingContext.DYNAMIC_DRAW);

		context.drawPoints(gameMap.width * gameMap.height);
	}
}

getSettingObject("debug-renderer").option("terrain-depth", new TerrainDepthRenderer(), "Terrain Depth", false);