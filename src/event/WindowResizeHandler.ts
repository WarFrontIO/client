import {EventHandlerRegistry} from "./EventHandlerRegistry";

/**
 * Registry for window resize listeners.
 * @see WindowResizeListener
 */
export const windowResizeHandler = new EventHandlerRegistry<WindowResizeListener>(true, listener => listener.resize(window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio));
window.addEventListener("resize", () => windowResizeHandler.broadcast());

/**
 * Listener for window resize events.
 * Window resize listeners are called when the window is resized.
 *
 * Register a listener with the registry above to receive resize events.
 * @see windowResizeHandler
 * @see EventHandlerRegistry.register
 */
export interface WindowResizeListener {
	/**
	 * Called when the window is resized.
	 * @param width The new width of the window in pixels.
	 * @param height The new height of the window in pixels.
	 */
	resize(width: number, height: number): void;
}