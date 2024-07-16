import {EventHandlerRegistry} from "./EventHandlerRegistry";

/**
 * Registry for window resize listeners.
 * Window resize listeners are called when the window is resized.
 *
 * Format: (width: number, height: number) => void
 * @param width The new width of the window in pixels.
 * @param height The new height of the window in pixels.
 */
export const windowResizeHandler: EventHandlerRegistry<[number, number]> = new EventHandlerRegistry(true, listener => listener(window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio));
window.addEventListener("resize", () => windowResizeHandler.broadcast());