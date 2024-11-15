import {RendererLayer} from "./layer/RendererLayer";
import {mapRenderer} from "./layer/MapRenderer";
import {windowResizeHandler} from "../event/WindowResizeHandler";
import {backgroundLayer} from "./layer/BackgroundLayer";
import {territoryRenderer} from "./layer/TerritoryRenderer";
import {nameRenderer} from "./layer/NameRenderer";
import {boatRenderer} from "./layer/BoatRenderer";
import {debugRenderer} from "./layer/debug/DebugRenderer";
import {gameStartRegistry} from "../game/Game";
import {InvalidArgumentException} from "../util/Exceptions";

/**
 * Main renderer for anything canvas related in the game.
 * Paints images on multiple layers (in order) to the canvas.
 * @internal
 */
export class GameRenderer {
	private readonly canvas: HTMLCanvasElement;
	private readonly context: CanvasRenderingContext2D;
	private layers: RendererLayer[] = [];

	constructor() {
		this.canvas = document.createElement("canvas");
		this.canvas.id = "gameCanvas";
		this.canvas.style.position = "absolute";
		this.canvas.style.left = "0";
		this.canvas.style.top = "0";
		this.canvas.style.zIndex = "-1";
		this.context = this.canvas.getContext("2d") as CanvasRenderingContext2D;
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
		this.registerLayer(boatRenderer);
		this.registerLayer(debugRenderer);
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

	/**
	 * Start rendering the game.
	 * @throws {InvalidArgumentException} if a game renderer is already running
	 */
	startRendering(): void {
		if (isRendering) {
			throw new InvalidArgumentException("Game renderer is already running");
		}
		isRendering = true;

		this.doRenderTick();
		document.body.appendChild(this.canvas);
	}

	resize(this: void, width: number, height: number): void {
		gameRenderer.canvas.width = Math.ceil(width / window.devicePixelRatio);
		gameRenderer.canvas.height = Math.ceil(height / window.devicePixelRatio);
	}
}

let isRendering = false;
export const gameRenderer = new GameRenderer();

windowResizeHandler.register(gameRenderer.resize);
gameStartRegistry.register(gameRenderer.initGameplayLayers.bind(gameRenderer));