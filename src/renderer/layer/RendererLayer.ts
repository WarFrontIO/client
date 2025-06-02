import type {GameGLContext} from "../GameGLContext";

/**
 * Represents a layer that can be rendered by the game renderer.
 * Must be registered with the game renderer to work properly.
 *
 * These methods are expected to not mutate the following properties:
 * - viewport (reset using {@link GameGLContext.viewport} without params)
 * - framebuffer (reset using {@link GameGLContext.resetFramebuffer})
 * - activeTexture (reset using {@link GameGLContext.resetActiveTexture}), note that {@link GameGLContext.bindTexture} mutates this if unit parameter is provided
 * - blending (reset using {@link GameGLContext.startBlendNatural})
 *
 * @see GameRenderer#registerLayer
 */
export interface RendererLayer {
	/**
	 * Called every frame, applies this layer to the canvas.
	 * @internal Do not call this method directly
	 */
	render(context: GameGLContext): void;

	/**
	 * Called when this layer is registered.
	 * Use this to set up webgl shaders and rendering data.
	 * @internal Do not call this method directly
	 */
	init(context: GameGLContext): void;
}