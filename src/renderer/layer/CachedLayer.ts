import {GameGLContext, WebGLUniforms} from "../GameGLContext";
import {BaseRendererLayer} from "./BaseRendererLayer";
import {compositeVertexShader, simpleTextureFragmentShader} from "../shader/ShaderManager";

/**
 * Caches rendered layer in a texture.
 *
 * Useful for layers that are expensive to render and don't change very often. Make sure to render to the framebuffer.
 * Allows for faster rendering by only rendering the layer once and then reusing the cached image.
 * Can be scaled and moved like any other layer (you might need to listen to map events to update the position).
 */
export abstract class CachedLayer extends BaseRendererLayer {
	private width: number = 0;
	private height: number = 0;
	dx: number = 0;
	dy: number = 0;
	scale: number = 1;

	private _program: WebGLProgram;
	private _vao: WebGLVertexArrayObject;
	private _uniforms: WebGLUniforms<"scale" | "offset" | "size" | "texture_data">;
	private _texture: WebGLTexture;
	framebuffer: WebGLFramebuffer;

	setup(context: GameGLContext) {
		this._program = context.requireProgram(compositeVertexShader, simpleTextureFragmentShader, "CachedLayer failed to init");
		this._vao = context.createVertexArray(this._program, GameGLContext.positionAttribute());
		this._uniforms = context.loadUniforms(this._program, "scale", "offset", "size", "texture_data");
	}

	/**
	 * Resize the canvas to the given width and height.
	 * @param width width of the canvas
	 * @param height height of the canvas
	 * @protected
	 */
	protected resizeCanvas(width: number, height: number) {
		this.width = width;
		this.height = height;
		this.context.deleteTexture(this._texture);
		this._texture = this.context.createTexture(width, height, null, {minFilter: WebGL2RenderingContext.LINEAR});
		this.framebuffer = this.context.createFramebuffer(this._texture);
		this.context.resetFramebuffer();
	}

	render(context: GameGLContext): void {
		context.bind(this._program, this._vao);
		context.bindTexture(this._texture);

		const parentWidth = this.context.raw.canvas.width;
		const parentHeight = this.context.raw.canvas.height;

		this._uniforms.set2f("offset", this.dx / parentWidth, this.dy / parentHeight);
		this._uniforms.set2f("size", parentWidth / this.width, parentHeight / this.height);
		this._uniforms.set1f("scale", this.scale);
		this._uniforms.set1i("texture_data", 0);

		context.drawTriangles(2);
	}
}