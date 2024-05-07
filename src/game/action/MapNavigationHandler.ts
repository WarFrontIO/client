import {
	DragEventListener,
	interactionManager,
	PinchEventListener,
	ScrollEventListener
} from "../../event/InteractionManager";
import {gameMap} from "../Game";
import {mapTransformHandler} from "../../event/MapTransformHandler";

/**
 * Default map navigation handler.
 * Controls the map position and zoom level.
 * @see MapTransformHandler
 */
class MapNavigationHandler implements ScrollEventListener, DragEventListener, PinchEventListener {
	x: number = 0;
	y: number = 0;
	zoom: number = 1;
	dragX: number = 0;
	dragY: number = 0;

	/**
	 * Enables the map navigation handler.
	 * Sets the initial zoom level and position to center the map on the screen.
	 */
	enable() {
		let minXZoom = window.innerWidth / gameMap.width, minYZoom = window.innerHeight / gameMap.height;
		this.zoom = 0.9 * Math.min(minXZoom, minYZoom);
		this.x = (window.innerWidth - gameMap.width * this.zoom) / 2;
		this.y = (window.innerHeight - gameMap.height * this.zoom) / 2;
		mapTransformHandler.scale.broadcast();
		mapTransformHandler.move.broadcast();
		interactionManager.drag.register(this);
		interactionManager.scroll.register(this);
		interactionManager.pinch.register(this);
	}

	/**
	 * Disables the map navigation handler.
	 */
	disable() {
		interactionManager.drag.unregister(this);
		interactionManager.scroll.unregister(this);
		interactionManager.pinch.unregister(this);
	}

	onScroll(x: number, y: number, delta: number): void {
		this.processZoom(x, y, this.zoom - Math.max(-1, Math.min(1, delta)) * 0.3 * this.zoom);
	}

	onPinch(x: number, y: number, delta: number) {
		this.processZoom(x, y, this.zoom * delta);
	}

	private processZoom(x: number, y: number, newZoom: number) {
		let mapX = this.getMapX(x), mapY = this.getMapY(y);
		this.zoom = newZoom;
		this.x = Math.max(Math.min(-mapX * this.zoom + x, window.innerWidth - 100), 100 - gameMap.width * this.zoom);
		this.y = Math.max(Math.min(-mapY * this.zoom + y, window.innerHeight - 100), 100 - gameMap.height * this.zoom);
		mapTransformHandler.scale.broadcast();
		mapTransformHandler.move.broadcast();
	}

	test(x: number, y: number): boolean {
		return true;
	}

	onDragStart(x: number, y: number): void {
		this.dragX = x;
		this.dragY = y;
	}

	onDragEnd(x: number, y: number): void {
	}

	onDragMove(x: number, y: number): void {
		this.x = Math.max(Math.min(this.x + x - this.dragX, window.innerWidth - 100), 100 - gameMap.width * this.zoom);
		this.y = Math.max(Math.min(this.y + y - this.dragY, window.innerHeight - 100), 100 - gameMap.height * this.zoom);
		this.dragX = x;
		this.dragY = y;
		mapTransformHandler.move.broadcast();
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
		return x >= this.x && x < this.x + gameMap.width * this.zoom && y >= this.y && y < this.y + gameMap.height * this.zoom;
	}

	/**
	 * Converts screen coordinates to a map tile index.
	 * @param x The x-coordinate on the screen.
	 * @param y The y-coordinate on the screen.
	 */
	getIndex(x: number, y: number): number {
		return Math.floor((y - this.y) / this.zoom) * gameMap.width + Math.floor((x - this.x) / this.zoom);
	}
}

export const mapNavigationHandler = new MapNavigationHandler();