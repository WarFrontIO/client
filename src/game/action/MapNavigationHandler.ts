import {
	DragEventListener,
	interactionManager,
	MultiTouchEventListener,
	ScrollEventListener
} from "../../event/InteractionManager";
import { GameMap } from "../../map/GameMap";
import { MapTransformHandler } from "../../event/MapTransformHandler";

/**
 * Default map navigation handler.
 * Controls the map position and zoom level.
 * @see MapTransformHandler
 */
export class MapNavigationHandler implements ScrollEventListener, DragEventListener, MultiTouchEventListener {
	x: number = 0;
	y: number = 0;
	zoom: number = 1;

	private gameMap: GameMap
	public mapTransformHandler: MapTransformHandler

	constructor(gameMap: GameMap, mapTransformHandler: MapTransformHandler) {
		this.gameMap = gameMap
		this.mapTransformHandler = mapTransformHandler
	}

	/**
	 * Enables the map navigation handler.
	 * Sets the initial zoom level and position to center the map on the screen.
	 */
	enable() {
		let minXZoom = window.innerWidth / this.gameMap.width, minYZoom = window.innerHeight / this.gameMap.height;
		this.zoom = 0.9 * Math.min(minXZoom, minYZoom);
		this.x = (window.innerWidth - this.gameMap.width * this.zoom) / 2;
		this.y = (window.innerHeight - this.gameMap.height * this.zoom) / 2;
		this.mapTransformHandler.scale.broadcast();
		this.mapTransformHandler.move.broadcast();
		interactionManager.drag.register(this);
		interactionManager.scroll.register(this);
		interactionManager.multitouch.register(this);
	}

	/**
	 * Disables the map navigation handler.
	 */
	disable() {
		interactionManager.drag.unregister(this);
		interactionManager.scroll.unregister(this);
		interactionManager.multitouch.unregister(this);
	}

	onScroll(x: number, y: number, delta: number): void {
		if (delta > 0) {
			this.processZoom(x, y, this.zoom / (1 + delta / 600));
		} else {
			this.processZoom(x, y, this.zoom * (1 - delta / 600));
		}
	}

	private processZoom(x: number, y: number, newZoom: number) {
		if (newZoom < 0.1 || newZoom > 200) return;
		let mapX = this.getMapX(x), mapY = this.getMapY(y);
		this.zoom = newZoom;
		this.x = Math.max(Math.min(-mapX * this.zoom + x, window.innerWidth - 100), 100 - this.gameMap.width * this.zoom);
		this.y = Math.max(Math.min(-mapY * this.zoom + y, window.innerHeight - 100), 100 - this.gameMap.height * this.zoom);
		this.mapTransformHandler.scale.broadcast();
		this.mapTransformHandler.move.broadcast();
	}

	onMultiTouch(oldX: number, oldY: number, newX: number, newY: number, factor: number) {
		factor = Math.max(0.1, Math.min(200, factor * this.zoom)) / this.zoom;
		this.x = Math.max(Math.min(newX - (oldX - this.x) * factor, window.innerWidth - 100), 100 - this.gameMap.width * this.zoom);
		this.y = Math.max(Math.min(newY - (oldY - this.y) * factor, window.innerHeight - 100), 100 - this.gameMap.height * this.zoom);
		this.zoom *= factor;
		this.mapTransformHandler.scale.broadcast();
		this.mapTransformHandler.move.broadcast();
	}

	test(_x: number, _y: number): boolean {
		return true;
	}

	onDragStart(_x: number, _y: number): void {
	}

	onDragEnd(_x: number, _y: number): void {
	}

	onDragMove(_x: number, _y: number, dx: number, dy: number): void {
		this.x = Math.max(Math.min(this.x + dx, window.innerWidth - 100), 100 - this.gameMap.width * this.zoom);
		this.y = Math.max(Math.min(this.y + dy, window.innerHeight - 100), 100 - this.gameMap.height * this.zoom);
		this.mapTransformHandler.move.broadcast();
	}

	/**
	 * Converts screen coordinates to map coordinates.
	 * @param x The x-coordinate on the screen.
	 */
	getMapX(x: number): number {
		return (x - this.x) / this.zoom;
	}

	/**
	 * Converts screen coordinates to map coordinates.
	 * @param y The y-coordinate on the screen.
	 */
	getMapY(y: number): number {
		return (y - this.y) / this.zoom;
	}

	/**
	 * Checks if the given screen coordinates are on the map.
	 * Not to be confused with map coordinates (This method does not convert screen coordinates to map coordinates).
	 * @param x The x-coordinate on the screen.
	 * @param y The y-coordinate on the screen.
	 */
	isOnMap(x: number, y: number): boolean {
		return x >= this.x && x < this.x + this.gameMap.width * this.zoom && y >= this.y && y < this.y + this.gameMap.height * this.zoom;
	}

	/**
	 * Converts screen coordinates to a map tile index.
	 * @param x The x-coordinate on the screen.
	 * @param y The y-coordinate on the screen.
	 */
	getIndex(x: number, y: number): number {
		return Math.floor((y - this.y) / this.zoom) * this.gameMap.width + Math.floor((x - this.x) / this.zoom);
	}
}