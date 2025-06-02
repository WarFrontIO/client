import type {GameGLContext, WebGLUniforms} from "../../GameGLContext";
import type {DebugRendererLayer} from "./DebugRenderer";
import {mapNavigationHandler} from "../../../game/action/MapNavigationHandler";
import {gameMap} from "../../../game/GameData";
import {getSettingObject} from "../../../util/settings/UserSettingManager";
import {compositeVertexShader, constantColorFragmentShader} from "../../shader/ShaderManager";
import {BaseRendererLayer} from "../BaseRendererLayer";

//@module renderer-debug

export class BoatBotWaypointDebugRenderer extends BaseRendererLayer implements DebugRendererLayer {
	readonly useCache = false;
	private program: WebGLProgram;
	private vao: WebGLVertexArrayObject;
	private uniforms: WebGLUniforms<"offset" | "size" | "color">;
	private positionBuffer: WebGLBuffer;

	setup(context: GameGLContext): void {
		this.program = context.requireProgram(compositeVertexShader, constantColorFragmentShader, "Boat waypoint debug renderer failed to init");
		this.positionBuffer = context.createBuffer();
		this.vao = context.createVertexArray(this.program, {name: "pos", size: 2, type: WebGL2RenderingContext.FLOAT, buffer: this.positionBuffer});
		this.uniforms = context.loadUniforms(this.program, "offset", "size", "color");
	}

	render(context: GameGLContext): void {
		context.bind(this.program, this.vao);

		let lineCount = 0;
		for (const [_, targets] of gameMap.boatTargets) {
			for (const target of targets) {
				lineCount += target.path.length - 1;
			}
		}

		const lines = new Float32Array(lineCount * 2);
		let offset = 0;
		for (const [source, targets] of gameMap.boatTargets) {
			for (const target of targets) {
				if (source > target.tile) continue; // Only draw each edge once
				for (let i = 1; i < target.path.length; i++) {
					lines[offset++] = target.path[i - 1] % gameMap.width + 0.5;
					lines[offset++] = Math.floor(target.path[i - 1] / gameMap.width) + 0.5;
					lines[offset++] = target.path[i] % gameMap.width + 0.5;
					lines[offset++] = Math.floor(target.path[i] / gameMap.width) + 0.5;
				}
			}
		}

		const parentWidth = context.raw.canvas.width;
		const parentHeight = context.raw.canvas.height;

		this.uniforms.set2f("offset", mapNavigationHandler.x / parentWidth, mapNavigationHandler.y / parentHeight);
		this.uniforms.set2f("size", mapNavigationHandler.zoom / parentWidth, mapNavigationHandler.zoom / parentHeight);
		this.uniforms.set4f("color", 1, 0, 0, 0.8);

		context.bufferData(this.positionBuffer, lines, WebGL2RenderingContext.STATIC_DRAW);

		context.drawLines(lineCount / 2);
	}
}

getSettingObject("debug-renderer").option("boat-bot-waypoints", new BoatBotWaypointDebugRenderer(), "Boat Bot Waypoints", false);