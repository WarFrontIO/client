import {mapNavigationHandler} from "../game/action/MapNavigationHandler";
import {ManagedEventHandlerRegistry} from "./ManagedEventHandlerRegistry";

/**
 * Registry for map transform listeners.
 */
class MapTransformHandler {
	/**
	 * Registry for map scale listeners.
	 * Map scale listeners are called when the map scale changes.
	 *
	 * Format: (scale: number) => void
	 * @param scale The new scale of the map.
	 */
	scale: ManagedEventHandlerRegistry<[number]> = new ManagedEventHandlerRegistry(listener => listener(mapNavigationHandler.zoom));
	/**
	 * Registry for map move listeners.
	 * Map move listeners are called when the map is moved.
	 *
	 * Format: (x: number, y: number) => void
	 * @param x The new x-coordinate of the map.
	 * @param y The new y-coordinate of the map.
	 */
	move: ManagedEventHandlerRegistry<[number, number]> = new ManagedEventHandlerRegistry(listener => listener(mapNavigationHandler.x, mapNavigationHandler.y));
}

export const mapTransformHandler = new MapTransformHandler();