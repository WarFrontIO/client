import {boatManager} from "../../game/boat/BoatManager";
import {gameRenderer} from "../GameRenderer";
import {gameStartRegistry} from "../../game/Game";
import {GameGLContext, WebGLUniforms} from "../GameGLContext";
import {BaseRendererLayer} from "./BaseRendererLayer";
import {colorCompositeVertexShader, simpleColorFragmentShader} from "../shader/ShaderManager";
import {mapNavigationHandler} from "../../game/action/MapNavigationHandler";
import {getSetting} from "../../util/settings/UserSettingManager";

//@module renderer

class BoatRenderer extends BaseRendererLayer {
	private program: WebGLProgram;
	private vao: WebGLVertexArrayObject;
	private uniforms: WebGLUniforms<"offset" | "size">;
	private positionBuffer: WebGLBuffer;
	private colorBuffer: WebGLBuffer;

	setup(context: GameGLContext): void {
		this.program = context.requireProgram(colorCompositeVertexShader, simpleColorFragmentShader, "Boat renderer failed to init");
		this.positionBuffer = context.createBuffer();
		this.colorBuffer = context.createBuffer();
		this.vao = context.createVertexArray(this.program, {name: "pos", size: 2, type: WebGL2RenderingContext.FLOAT, buffer: this.positionBuffer}, {name: "color", size: 4, type: WebGL2RenderingContext.UNSIGNED_BYTE, buffer: this.colorBuffer, normalized: true});
		this.uniforms = context.loadUniforms(this.program, "offset", "size");
	}

	render(context: GameGLContext): void {
		context.bind(this.program, this.vao);

		const xMin = mapNavigationHandler.getMapX(0);
		const xMax = mapNavigationHandler.getMapX(context.raw.canvas.width);
		const yMin = mapNavigationHandler.getMapY(0);
		const yMax = mapNavigationHandler.getMapY(context.raw.canvas.height);

		const boats = boatManager.getBoats().filter(boat => boat.getX() + 2 > xMin && boat.getX() - 2 < xMax && boat.getY() + 2 > yMin && boat.getY() - 2 < yMax);
		const boatPositions = new Float32Array(boats.length * 30);
		const boatColors = new Uint8Array(boats.length * 60);

		for (let i = 0; i < boats.length; i++) {
			const player = boats[i].getPlayer();
			const territoryColor = getSetting("theme").getTerritoryColor(player.baseColor).toRGB();
			const borderColor = getSetting("theme").getBorderColor(player.baseColor).withLightness(0.2).toRGB();

			for (let j = 0; j < 15; j++) {
				boatColors[60 * i + 4 * j] = j % 3 ? borderColor.r : territoryColor.r;
				boatColors[60 * i + 4 * j + 1] = j % 3 ? borderColor.g : territoryColor.g;
				boatColors[60 * i + 4 * j + 2] = j % 3 ? borderColor.b : territoryColor.b;
				boatColors[60 * i + 4 * j + 3] = j % 3 ? borderColor.a * 255 : territoryColor.a * 255;
			}

			for (let j = 0; j < 4; j++) {
				boatPositions[30 * i + 6 * j + (j ? -4 : 4)] = -3;
				boatPositions[30 * i + 6 * j + (j ? -3 : 5)] = j % 2 ? 1 : -1;
				boatPositions[30 * i + 6 * j + 11] = j % 2 ? 1.2 : -1.2;
			}

			boatPositions[30 * i + 20] = boatPositions[30 * i + 26] = 1.5;

			const dx = boats[i].getNextX() - boats[i].getX();
			const dy = boats[i].getNextY() - boats[i].getY();
			const angle = Math.atan2(dy, dx);
			const xDir = Math.cos(angle);
			const yDir = Math.sin(angle);
			for (let j = 0; j < 15; j++) {
				const tempX = boatPositions[30 * i + 2 * j];
				boatPositions[30 * i + 2 * j] = boats[i].getX() + xDir * boatPositions[30 * i + 2 * j] - yDir * boatPositions[30 * i + 2 * j + 1];
				boatPositions[30 * i + 2 * j + 1] = boats[i].getY() + yDir * tempX + xDir * boatPositions[30 * i + 2 * j + 1];
			}
		}

		const parentWidth = this.context.raw.canvas.width;
		const parentHeight = this.context.raw.canvas.height;

		this.uniforms.set2f("offset", mapNavigationHandler.x / parentWidth, mapNavigationHandler.y / parentHeight);
		this.uniforms.set2f("size", mapNavigationHandler.zoom / parentWidth, mapNavigationHandler.zoom / parentHeight);

		context.bufferData(this.positionBuffer, boatPositions, WebGL2RenderingContext.STREAM_DRAW);
		context.bufferData(this.colorBuffer, boatColors, WebGL2RenderingContext.STREAM_DRAW);

		context.drawTriangles(boats.length * 5);
	}
}

export const boatRenderer = new BoatRenderer();

gameStartRegistry.register(() => gameRenderer.registerLayer(boatRenderer, 20));