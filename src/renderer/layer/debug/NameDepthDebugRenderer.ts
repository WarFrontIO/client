import {DebugRendererLayer} from "./DebugRenderer";
import {playerNameRenderingManager} from "../../manager/PlayerNameRenderingManager";
import {gameMap} from "../../../game/GameData";
import {mapNavigationHandler} from "../../../game/action/MapNavigationHandler";
import {getSettingObject} from "../../../util/settings/UserSettingManager";
import {BaseRendererLayer} from "../BaseRendererLayer";
import {GameGLContext, WebGLUniforms} from "../../GameGLContext";
import {linearLookupFragmentShader, mapGridCompositeVertexShader} from "../../shader/ShaderManager";

//@module renderer-debug

export class NameDepthDebugRenderer extends BaseRendererLayer implements DebugRendererLayer {
	readonly useCache = false;
	private program: WebGLProgram;
	private vao: WebGLVertexArrayObject;
	private uniforms: WebGLUniforms<"width" | "scale" | "size" | "offset" | "palette_data" | "length">;
	private palette: WebGLTexture;
	private positionBuffer: WebGLBuffer;
	private depthBuffer: WebGLBuffer;

	setup(context: GameGLContext): void {
		this.program = context.requireProgram(mapGridCompositeVertexShader, linearLookupFragmentShader, "Name depth debug renderer failed to init");
		this.positionBuffer = context.createBuffer();
		this.depthBuffer = context.createBuffer();
		this.vao = context.createVertexArray(this.program, {name: "pos", size: 1, type: WebGL2RenderingContext.UNSIGNED_INT, buffer: this.positionBuffer, asInt: true}, {name: "id", size: 1, type: WebGL2RenderingContext.UNSIGNED_BYTE, buffer: this.depthBuffer, asInt: true});
		this.uniforms = context.loadUniforms(this.program, "width", "scale", "size", "offset", "palette_data", "length");
		this.palette = context.createTexture(2, 1, new Uint8Array([0, 255, 0, 128, 255, 0, 0, 128]), {internalFormat: WebGL2RenderingContext.RGBA, format: WebGL2RenderingContext.RGBA, magFilter: WebGL2RenderingContext.LINEAR});
	}

	render(context: GameGLContext): void {
		context.bind(this.program, this.vao);
		context.bindTexture(this.palette);

		const map = playerNameRenderingManager.getNameDepth();
		const xMin = mapNavigationHandler.getMapX(0);
		const xMax = mapNavigationHandler.getMapX(context.raw.canvas.width);
		const yMin = mapNavigationHandler.getMapY(0);
		const yMax = mapNavigationHandler.getMapY(context.raw.canvas.height);

		const tileData: number[] = [];
		const depthData: number[] = [];
		for (let i = 0; i < gameMap.width * gameMap.height; i++) {
			if (mapNavigationHandler.zoom < 1 || i % gameMap.width + 1 < xMin || i % gameMap.width > xMax || Math.floor(i / gameMap.width) + 1 < yMin || Math.floor(i / gameMap.width) > yMax) {
				continue;
			}
			const depth = map[i];
			if (depth !== 0) {
				tileData.push(i);
				depthData.push(depth);
			}
		}
		const parentWidth = context.raw.canvas.width;
		const parentHeight = context.raw.canvas.height;

		this.uniforms.set1ui("width", gameMap.width);
		this.uniforms.set1f("scale", mapNavigationHandler.zoom);
		this.uniforms.set2f("offset", mapNavigationHandler.x / parentWidth, mapNavigationHandler.y / parentHeight);
		this.uniforms.set2f("size", mapNavigationHandler.zoom / parentWidth, mapNavigationHandler.zoom / parentHeight);
		this.uniforms.set1ui("length", 50);
		this.uniforms.set1i("palette_data", 0);

		context.bufferData(this.positionBuffer, new Uint32Array(tileData), WebGL2RenderingContext.DYNAMIC_DRAW);
		context.bufferData(this.depthBuffer, new Uint8Array(depthData), WebGL2RenderingContext.DYNAMIC_DRAW);

		context.drawPoints(tileData.length);

	}
}

getSettingObject("debug-renderer").option("name-depth", new NameDepthDebugRenderer(), "Name Depth", false);