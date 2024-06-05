/**
 * Represents a layer that can be rendered by the game renderer.
 * Must be registered with the game renderer to work properly.
 * @see GameRenderer#registerLayer
 */
export interface RendererLayer {
	/** @internal Do not call this method directly. */
	render(context: CanvasRenderingContext2D): void;

	/**
	 * Invalidates any caches that the layer might have.
	 * This is called when the layer is initialized from a new game state.
	 */
	invalidateCaches?(): void;
}