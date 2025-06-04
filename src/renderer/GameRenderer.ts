import type {RendererLayer} from "./layer/RendererLayer";
import {windowResizeHandler} from "../event/WindowResizeHandler";
import {gameInitRegistry} from "../game/Game";
import {EventHandlerRegistry} from "../event/EventHandlerRegistry";
import {GameGLContext} from "./GameGLContext";
import {SortedArray} from "../util/SortedArray";

//@module renderer

/**
 * Main renderer for anything canvas related in the game.
 * Paints images on multiple layers (in order) to the canvas.
 * @internal
 */
export class GameRenderer {
	private readonly canvas: HTMLCanvasElement;
	private readonly context: GameGLContext;
	private layers: SortedArray<RendererLayer> = new SortedArray();

	constructor() {
		this.canvas = document.createElement("canvas");
		this.canvas.id = "gameCanvas";
		this.canvas.style.position = "absolute";
		this.canvas.style.left = "0";
		this.canvas.style.top = "0";
		this.canvas.style.zIndex = "-1";
		//TODO: Notify user if webgl is not supported (can't play this game...)
		this.context = new GameGLContext(this.canvas.getContext("webgl2", {premultipliedAlpha: false}) as WebGL2RenderingContext);
		this.context.startBlendNatural();

		this.doRenderTick();

		document.body.appendChild(this.canvas);
	}

	/**
	 * Changes rendering context, allows relevant layers to be added.
	 * Note: Choose large unique ids for third party contexts to avoid conflicts.
	 * @internal
	 */
	switchContext(context: number) {
		this.layers.clear();
		renderingContextInit.broadcast(context, this.context);
	}

	/**
	 * Register a new layer to be rendered.
	 *
	 * This renderer will be rendered on top of all other layers.
	 * Note that you will have to re-register every time the renderer is changed (e.g. when a game is started).
	 *
	 * @param layer the layer to be rendered.
	 * @param zIndex the z-index of the layer. Layers with higher z-index will be rendered on top of layers with lower z-index.
	 */
	registerLayer(layer: RendererLayer, zIndex: number): void {
		try {
			layer.init(this.context);
			this.layers.add(layer, zIndex);
		} catch (e) {
			//TODO: warn user
			console.error(e);
		}
	}

	/**
	 * Tick layers and render them to the canvas.
	 */
	private doRenderTick(): void {
		this.layers.forEach(layer => {
			layer.render(this.context);
		});
		requestAnimationFrame(() => this.doRenderTick());
	}

	resize(this: void, width: number, height: number): void {
		gameRenderer.canvas.width = Math.ceil(width / window.devicePixelRatio);
		gameRenderer.canvas.height = Math.ceil(height / window.devicePixelRatio);
		gameRenderer.context.viewport();
	}
}

export const rendererContextGameplay = 1;

export const gameRenderer = new GameRenderer();
export const renderingContextInit = new EventHandlerRegistry<[number, GameGLContext]>();

windowResizeHandler.register(gameRenderer.resize);
gameInitRegistry.register(() => gameRenderer.switchContext(rendererContextGameplay));