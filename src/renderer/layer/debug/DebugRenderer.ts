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
		this.mapLayers.length = 0;
		this.liveLayers.length = 0;
		if (this.context) {
			layers.forEach(layer => layer.init(this.context));
			this.context.bindFramebuffer(this.framebuffer);
			this.context.raw.clearBufferfv(WebGL2RenderingContext.COLOR, 0, [0, 0, 0, 0]);
			this.context.viewport(gameMap.width, gameMap.height);
		}
		for (const layer of layers) {
			if (layer.useCache) {
				this.mapLayers.push(layer);
				if (this.context) layer.render(this.context);
			} else {
				this.liveLayers.push(layer);
			}
		}
		if (this.context) {
			this.context.resetFramebuffer();
			this.context.viewport();
		}
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
		this.context.viewport(gameMap.width, gameMap.height);
		this.mapLayers.forEach(layer => layer.render(context));
		context.resetFramebuffer();
		context.viewport();
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