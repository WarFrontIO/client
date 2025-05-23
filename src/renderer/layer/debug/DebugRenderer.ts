import {CachedLayer} from "../CachedLayer";
import {mapTransformHandler} from "../../../event/MapTransformHandler";
import {gameMap} from "../../../game/GameData";
import {registerSettingListener} from "../../../util/settings/UserSettingManager";
import {RendererLayer} from "../RendererLayer";
import {GameGLContext} from "../../GameGLContext";
import {gameRenderer, rendererContextGameplay, renderingContextInit} from "../../GameRenderer";

//@module renderer-debug

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
		if (!this.context) return;
		this.mapLayers.length = 0;
		this.liveLayers.length = 0;
		layers.forEach(layer => layer.init(this.context));
		this.context.raw.clearBufferiv(WebGL2RenderingContext.COLOR, 0, [0, 0, 0, 0]);
		this.context.bindFramebuffer(this.framebuffer);
		for (const layer of layers) {
			if (layer.useCache) {
				this.mapLayers.push(layer);
				layer.render(this.context);
			} else {
				this.liveLayers.push(layer);
			}
		}
		this.context.resetFramebuffer();
	}

	render(context: GameGLContext) {
		if (this.mapLayers.length !== 0) super.render(context);
		this.liveLayers.forEach(layer => layer.render(context));
	}

	init(context: GameGLContext): void {
		super.init(context);
		this.resizeCanvas(gameMap.width, gameMap.height, true);
		this.mapLayers.forEach(layer => layer.init(context));
		this.liveLayers.forEach(layer => layer.init(context));
		context.bindFramebuffer(this.framebuffer);
		this.mapLayers.forEach(layer => layer.render(context));
		context.resetFramebuffer();
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
renderingContextInit.register(id => id === rendererContextGameplay && gameRenderer.registerLayer(debugRenderer, 50));

registerSettingListener("debug-renderer", (_, obj) => debugRenderer.updateLayers(obj.getEnabledOptions()));

export type DebugRendererLayer = {
	useCache: boolean;
} & RendererLayer;