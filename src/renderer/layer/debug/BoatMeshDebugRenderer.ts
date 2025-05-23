import {areaCalculator} from "../../../map/area/AreaCalculator";
import {DebugRendererLayer} from "./DebugRenderer";
import {mapNavigationHandler} from "../../../game/action/MapNavigationHandler";
import {getSettingObject} from "../../../util/settings/UserSettingManager";
import {GameGLContext, WebGLUniforms} from "../../GameGLContext";
import {BaseRendererLayer} from "../BaseRendererLayer";
import {compositeVertexShader, constantColorFragmentShader} from "../../shader/ShaderManager";

//@module renderer-debug

export class BoatMeshDebugRenderer extends BaseRendererLayer implements DebugRendererLayer {
	readonly useCache = false;
	private program: WebGLProgram;
	private vao: WebGLVertexArrayObject;
	private uniforms: WebGLUniforms<"offset" | "size" | "color">;
	private positionBuffer: WebGLBuffer;
	private edgeCount: number;

	setup(context: GameGLContext): void {
		this.program = context.requireProgram(compositeVertexShader, constantColorFragmentShader, "Boat renderer failed to init");
		this.positionBuffer = context.createBuffer();
		this.vao = context.createVertexArray(this.program, {name: "pos", size: 2, type: WebGL2RenderingContext.FLOAT, buffer: this.positionBuffer});
		this.uniforms = context.loadUniforms(this.program, "offset", "size", "color");
	}

	init(context: GameGLContext) {
		super.init(context);
		let edgeCount = 0;
		for (const nodes of areaCalculator.nodeIndex) {
			for (const node of nodes) {
				edgeCount += node.edges.length; //this includes both ways
			}
		}
		this.edgeCount = edgeCount / 2;

		const edges = new Float32Array(edgeCount * 2);
		let offset = 0;
		for (const nodes of areaCalculator.nodeIndex) {
			for (const node of nodes) {
				for (const neighbor of node.edges) {
					if (neighbor.node.x < node.x || (neighbor.node.x === node.x && neighbor.node.y < node.y)) continue; // Only draw each edge once
					edges[offset++] = node.x + 0.5;
					edges[offset++] = node.y + 0.5;
					edges[offset++] = neighbor.node.x + 0.5;
					edges[offset++] = neighbor.node.y + 0.5;
				}
			}
		}
		context.bufferData(this.positionBuffer, edges, WebGL2RenderingContext.STATIC_DRAW);
	}

	render(context: GameGLContext): void {
		context.bind(this.program, this.vao);

		const parentWidth = context.raw.canvas.width;
		const parentHeight = context.raw.canvas.height;

		this.uniforms.set2f("offset", mapNavigationHandler.x / parentWidth, mapNavigationHandler.y / parentHeight);
		this.uniforms.set2f("size", mapNavigationHandler.zoom / parentWidth, mapNavigationHandler.zoom / parentHeight);
		this.uniforms.set4f("color", 1, 0, 0, 0.8);

		context.drawLines(this.edgeCount);
	}
}

getSettingObject("debug-renderer").option("boat-navigation-mesh", new BoatMeshDebugRenderer(), "Boat Navigation Mesh", false);