import {DragEventListener, interactionManager, ScrollEventListener} from "../../event/InteractionManager";
import {gameMap} from "../Game";
import {mapTransformHandler} from "../../event/MapTransformHandler";

class MapNavigationHandler implements ScrollEventListener, DragEventListener {
	x: number = 0;
	y: number = 0;
	zoom: number = 1;
	dragX: number = 0;
	dragY: number = 0;

	enable() {
		let minXZoom = window.innerWidth / gameMap.width, minYZoom = window.innerHeight / gameMap.height;
		this.zoom = 0.9 * Math.min(minXZoom, minYZoom);
		this.x = (window.innerWidth - gameMap.width * this.zoom) / 2;
		this.y = (window.innerHeight - gameMap.height * this.zoom) / 2;
		mapTransformHandler.scale.broadcast();
		mapTransformHandler.move.broadcast();
		interactionManager.drag.register(this);
		interactionManager.scroll.register(this);
	}

	disable() {
		interactionManager.drag.unregister(this);
		interactionManager.scroll.unregister(this);
	}

	onScroll(x: number, y: number, delta: number): void {
		let mapX = this.getMapX(x), mapY = this.getMapY(y);
		this.zoom -= Math.max(-1, Math.min(1, delta)) * 0.3 * this.zoom;
		this.zoom = Math.max(0.5, Math.min(1000, this.zoom));
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

	getMapX(x: number): number {
		return (x - this.x) / this.zoom;
	}

	getMapY(y: number): number {
		return (y - this.y) / this.zoom;
	}

	isOnMap(x: number, y: number): boolean {
		return x >= this.x && x < this.x + gameMap.width * this.zoom && y >= this.y && y < this.y + gameMap.height * this.zoom;
	}

	getIndex(x: number, y: number): number {
		return Math.floor((y - this.y) / this.zoom) * gameMap.width + Math.floor((x - this.x) / this.zoom);
	}

	centerOnTile(tile: number, size: number) : void {
		const x = tile % gameMap.width;
		const y = Math.floor(tile / gameMap.width);
		this.zoom = gameMap.width / size;
		mapTransformHandler.scale.broadcast();
		this.x = window.innerWidth / 2 - x * this.zoom;
		this.y = window.innerHeight / 2 - y * this.zoom;
		mapTransformHandler.move.broadcast();
	}
}

export const mapNavigationHandler = new MapNavigationHandler();