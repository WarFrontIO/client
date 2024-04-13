import {EventHandlerRegistry} from "./EventHandlerRegistry";

export const windowResizeHandler = new EventHandlerRegistry<WindowResizeListener>(true, listener => listener.resize(window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio));
window.addEventListener("resize", () => windowResizeHandler.broadcast());

export interface WindowResizeListener {
	resize(width: number, height: number): void;
}