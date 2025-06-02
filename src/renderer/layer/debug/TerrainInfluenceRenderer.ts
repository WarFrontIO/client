import type {GameGLContext, WebGLUniforms} from "../../GameGLContext";
import type {DebugRendererLayer} from "./DebugRenderer";
import {gameMap} from "../../../game/GameData";
import {getSettingObject} from "../../../util/settings/UserSettingManager";
import {linearLookupFragmentShader, mapGridLookupVertexShader} from "../../shader/ShaderManager";
import {BaseRendererLayer} from "../BaseRendererLayer";

//@module renderer-debug

export class TerrainInfluenceRenderer extends BaseRendererLayer implements DebugRendererLayer{
	readonly useCache = true;
	private program: WebGLProgram;
	private vao: WebGLVertexArrayObject;
	private uniforms: WebGLUniforms<"size" | "palette_data" | "length">;
	private palette: WebGLTexture;
	private positionBuffer: WebGLBuffer;
	private influenceBuffer: WebGLBuffer;

	/**
	 * Create a new terrain influence renderer
	 * @param simplified Whether to show tiles of the same area in the same color.
	 * @param navigableOnly Whether to only show navigable tiles.
	 */
	constructor(private simplified: boolean, private navigableOnly: boolean) {
		super();
	}

	setup(context: GameGLContext): void {
		this.program = context.requireProgram(mapGridLookupVertexShader, linearLookupFragmentShader, "Terrain influence debug renderer failed to init");
		this.positionBuffer = context.createBuffer();
		this.influenceBuffer = context.createBuffer();
		this.vao = context.createVertexArray(this.program, {name: "pos", size: 1, type: WebGL2RenderingContext.UNSIGNED_INT, buffer: this.positionBuffer, asInt: true}, {name: "id", size: 1, type: WebGL2RenderingContext.UNSIGNED_SHORT, buffer: this.influenceBuffer, asInt: true});
		this.uniforms = context.loadUniforms(this.program, "size", "palette_data", "length");
		this.palette = context.createTexture(3, 1, new Uint8Array([255, 0, 0, 128, 255, 255, 0, 128, 0, 255, 0, 128, 0, 255, 255, 128, 0, 0, 255, 128, 255, 0, 255, 128, 255, 0, 0, 128]), {internalFormat: WebGL2RenderingContext.RGBA, format: WebGL2RenderingContext.RGBA, magFilter: WebGL2RenderingContext.LINEAR});
	}

	render(context: GameGLContext): void {
		context.bind(this.program, this.vao);
		context.bindTexture(this.palette);

		const tiles = [];
		const influence = [];
		const colorMap: number[] = [];
		for (let i = 0; i < gameMap.width * gameMap.height; i++) {
			if (this.navigableOnly && !gameMap.getTile(i).navigable) continue;
			const area = this.simplified ? gameMap.areaMap[gameMap.tileInfluence[i]] : gameMap.tileInfluence[i];
			let color = colorMap[area];
			if (!color) {
				color = Math.floor(Math.random() * 6 * 255);
				colorMap[area] = color;
			}
			tiles.push(i);
			influence.push(color);
		}

		this.uniforms.set2i("size", gameMap.width, gameMap.height);
		this.uniforms.set1ui("length", 6 * 255);
		this.uniforms.set1i("palette_data", 0);

		context.bufferData(this.positionBuffer, new Uint32Array(tiles), WebGL2RenderingContext.DYNAMIC_DRAW);
		context.bufferData(this.influenceBuffer, new Uint16Array(influence), WebGL2RenderingContext.DYNAMIC_DRAW);

		context.drawPoints(gameMap.width * gameMap.height);
	}
}

getSettingObject("debug-renderer").option("tile-influence-simplified", new TerrainInfluenceRenderer(true, false), "Terrain Influence", false);
getSettingObject("debug-renderer").option("tile-influence", new TerrainInfluenceRenderer(false, false), "Terrain Influence (Detailed)", false);