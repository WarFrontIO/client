import {areaCalculator} from "../../../map/area/AreaCalculator";
import {DebugRendererLayer} from "./DebugRendererRegistry";
import {mapNavigationHandler} from "../../../game/action/MapNavigationHandler";

export class BoatMeshDebugRenderer implements DebugRendererLayer {
	readonly useCache = false;

	render(context: CanvasRenderingContext2D): void {
		context.strokeStyle = "red";
		context.fillStyle = "orange";
		for (const nodes of areaCalculator.nodeIndex) {
			for (const node of nodes) {
				context.beginPath();
				context.arc((node.x + 0.5) * mapNavigationHandler.zoom + mapNavigationHandler.x, (node.y + 0.5) * mapNavigationHandler.zoom + mapNavigationHandler.y, mapNavigationHandler.zoom / 2, 0, 2 * Math.PI);
				context.fill();
			}
		}
		for (const nodes of areaCalculator.nodeIndex) {
			for (const node of nodes) {
				for (const neighbor of node.edges) {
					if (neighbor.node.x < node.x || (neighbor.node.x === node.x && neighbor.node.y < node.y)) continue; // Only draw each edge once
					context.beginPath();
					context.moveTo((node.x + 0.5) * mapNavigationHandler.zoom + mapNavigationHandler.x, (node.y + 0.5) * mapNavigationHandler.zoom + mapNavigationHandler.y);
					context.lineTo((neighbor.node.x + 0.5) * mapNavigationHandler.zoom + mapNavigationHandler.x, (neighbor.node.y + 0.5) * mapNavigationHandler.zoom + mapNavigationHandler.y);
					context.stroke();
				}
			}
		}
	}
}
