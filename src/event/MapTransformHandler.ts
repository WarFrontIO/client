import {EventHandlerRegistry} from "./EventHandlerRegistry";
import {mapNavigationHandler} from "../game/action/MapNavigationHandler";

class MapTransformHandler {
	scale: EventHandlerRegistry<MapScaleListener> = new EventHandlerRegistry(true, listener => listener.onMapScale(mapNavigationHandler.zoom));
	move: EventHandlerRegistry<MapMoveListener> = new EventHandlerRegistry(true, listener => listener.onMapMove(mapNavigationHandler.x, mapNavigationHandler.y));
}

export interface MapScaleListener {
	onMapScale(scale: number): void;
}

export interface MapMoveListener {
	onMapMove(x: number, y: number): void;
}

export const mapTransformHandler = new MapTransformHandler();