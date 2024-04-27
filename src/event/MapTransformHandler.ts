import {EventHandlerRegistry} from "./EventHandlerRegistry";
import {mapNavigationHandler} from "../game/action/MapNavigationHandler";

/**
 * Registry for map transform listeners.
 * @see MapScaleListener
 * @see MapMoveListener
 */
class MapTransformHandler {
	/** Registry for map scale listeners.*/
	scale: EventHandlerRegistry<MapScaleListener> = new EventHandlerRegistry(true, listener => listener.onMapScale(mapNavigationHandler.zoom));
	/** Registry for map move listeners.*/
	move: EventHandlerRegistry<MapMoveListener> = new EventHandlerRegistry(true, listener => listener.onMapMove(mapNavigationHandler.x, mapNavigationHandler.y));
}

/**
 * Listener for map scale events.
 * Map scale listeners are called when the map scale changes.
 *
 * Register a listener with the registry above to receive scale events.
 * @see MapTransformHandler.scale
 * @see EventHandlerRegistry.register
 */
export interface MapScaleListener {
	/**
	 * Called when the map scale changes.
	 * @param scale The new scale of the map.
	 */
	onMapScale(scale: number): void;
}

/**
 * Listener for map move events.
 * Map move listeners are called when the map is moved.
 *
 * Register a listener with the registry above to receive move events.
 * @see MapTransformHandler.move
 * @see EventHandlerRegistry.register
 */
export interface MapMoveListener {
	/**
	 * Called when the map is moved.
	 * @param x The new x-coordinate of the map.
	 * @param y The new y-coordinate of the map.
	 */
	onMapMove(x: number, y: number): void;
}

export const mapTransformHandler = new MapTransformHandler();