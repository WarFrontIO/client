import {CachedLayer} from "../CachedLayer";
import {mapTransformHandler} from "../../../event/MapTransformHandler";
import {gameMap} from "../../../game/GameData";
import {registerSettingListener} from "../../../util/settings/UserSettingManager";
import {RendererLayer} from "../RendererLayer";
import {gameStartRegistry} from "../../../game/Game";

/**
 * Debug renderer.
 * Renders debug information on the map if toggled.
 * @internal
 */
class DebugRenderer extends CachedLayer {
	private readonly mapLayers: RendererLayer[] = [];
	private readonly liveLayers: RendererLayer[] = [];

	/**
	 * Updates the layers to be rendered by the debug renderer.
	 * @param layers layers to be rendered
	 */
	updateLayers(layers: DebugRendererLayer[]): void {
		this.mapLayers.length = 0;
		this.liveLayers.length = 0;
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		for (const layer of layers) {
			if (layer.useCache) {
				this.mapLayers.push(layer);
				layer.render(this.context);
			} else {
				this.liveLayers.push(layer);
			}
		}
	}

	render(context: CanvasRenderingContext2D) {
		super.render(context);
		this.liveLayers.forEach(layer => layer.render(context));
	}

	init(): void {
		this.resizeCanvas(gameMap.width, gameMap.height);
		this.mapLayers.forEach(layer => layer.render(this.context));
	}

	onMapMove(this: void, x: number, y: number): void {
		debugRenderer.dx = x;
		debugRenderer.dy = y;
	}

	onMapScale(this: void, scale: number): void {
		debugRenderer.scale = scale;
	}
}

export const debugRenderer = new DebugRenderer();

mapTransformHandler.scale.register(debugRenderer.onMapScale);
mapTransformHandler.move.register(debugRenderer.onMapMove);
gameStartRegistry.register(debugRenderer.init.bind(debugRenderer));

registerSettingListener("debug-renderer", (_, obj) => debugRenderer.updateLayers(obj.getEnabledOptions()));

export interface DebugRendererLayer extends RendererLayer {
	useCache: boolean;
}