import {RendererLayer} from "./RendererLayer";
import {GameGLContext} from "../GameGLContext";

export abstract class BaseRendererLayer implements RendererLayer {
	protected context: GameGLContext;
	protected initialized: boolean = false;

	/**
	 * Set up this layer, other than {@link init}, this method is only called once in its lifetime
	 */
	abstract setup(context: GameGLContext): void;
	abstract render(context: GameGLContext): void;

	init(context: GameGLContext) {
		if (!this.initialized) {
			this.initialized = true;
			this.context = context;
			this.setup(context);
		}
	}
}