import {RendererLayer} from "./layer/RendererLayer";
import {MapRenderer} from "./layer/MapRenderer";
import {windowResizeHandler, WindowResizeListener} from "../event/WindowResizeHandler";
import {BackgroundLayer} from "./layer/BackgroundLayer";
import {TerritoryRenderer} from "./layer/TerritoryRenderer";
import {NameRenderer} from "./layer/NameRenderer";

export class GameRenderer implements WindowResizeListener {
	canvas: HTMLCanvasElement;
	context: CanvasRenderingContext2D;
	layers: RendererLayer[] = [];

	constructor() {
		this.canvas = document.createElement("canvas");
		this.context = this.canvas.getContext("2d");

		this.doRenderTick();

		window.onload = () => document.body.appendChild(this.canvas);
		windowResizeHandler.register(this);
	}

	updateLayers(): void {
		this.layers = [];
		this.registerLayer(new BackgroundLayer());
		this.registerLayer(new MapRenderer());
		this.registerLayer(new TerritoryRenderer());
		this.registerLayer(new NameRenderer());
	}

	registerLayer(layer: RendererLayer): void {
		this.layers.push(layer);
	}

	doRenderTick(): void {
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