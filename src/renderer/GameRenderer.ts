import {RendererLayer} from "./layer/RendererLayer";
import {mapRenderer} from "./layer/MapRenderer";
import {windowResizeHandler, WindowResizeListener} from "../event/WindowResizeHandler";
import {backgroundLayer} from "./layer/BackgroundLayer";
import {territoryRenderer} from "./layer/TerritoryRenderer";
import {nameRenderer} from "./layer/NameRenderer";

/**
 * Main renderer for anything canvas related in the game.
 * Paints images on multiple layers (in order) to the canvas.
 * @internal
 */
export class GameRenderer implements WindowResizeListener {
	private readonly canvas: HTMLCanvasElement;
	private readonly context: CanvasRenderingContext2D;
	private layers: RendererLayer[] = [];

	constructor() {
		this.canvas = document.createElement("canvas");
		this.canvas.style.position = "absolute";
		this.canvas.style.left = "0";
		this.canvas.style.top = "0";
		this.canvas.style.zIndex = "-1";
		this.context = this.canvas.getContext("2d");

		this.doRenderTick();

		window.onload = () => document.body.appendChild(this.canvas);
		windowResizeHandler.register(this);
	}

	/**
	 * Register necessary layers for in-game rendering.
	 * @internal
	 */
	initGameplayLayers(): void {
		this.layers = [];
		this.registerLayer(backgroundLayer);
		this.registerLayer(mapRenderer);
		this.registerLayer(territoryRenderer);
		this.registerLayer(nameRenderer);
	}

	/**
	 * Register a new layer to be rendered.
	 *
	 * This renderer will be rendered on top of all other layers.
	 * Note that you will have to re-register every time the renderer is changed (e.g. when a game is started).
	 *
	 * @param layer the layer to be rendered.
	 */
	registerLayer(layer: RendererLayer): void {
		layer.invalidateCaches?.();
		this.layers.push(layer);
	}

	/**
	 * Tick layers and render them to the canvas.
	 */
	private doRenderTick(): void {
		this.context.imageSmoothingEnabled = false;
		this.layers.forEach(layer => {
			layer.render(this.context);
		});
		requestAnimationFrame(() => this.doRenderTick());
	}

	resize(width: number, height: number): void {
		this.canvas.width = Math.ceil(width / window.devicePixelRatio);
		this.canvas.height = Math.ceil(height / window.devicePixelRatio);
	}
}