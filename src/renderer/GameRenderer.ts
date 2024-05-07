import {RendererLayer} from "./layer/RendererLayer";
import {MapRenderer} from "./layer/MapRenderer";
import {windowResizeHandler, WindowResizeListener} from "../event/WindowResizeHandler";
import {BackgroundLayer} from "./layer/BackgroundLayer";
import {TerritoryRenderer} from "./layer/TerritoryRenderer";
import {NameRenderer} from "./layer/NameRenderer";

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
		this.canvas.style.touchAction = "none";
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
		this.registerLayer(new BackgroundLayer());
		this.registerLayer(new MapRenderer());
		this.registerLayer(new TerritoryRenderer());
		this.registerLayer(new NameRenderer());
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
		this.canvas.width = width;
		this.canvas.height = height;
	}
}