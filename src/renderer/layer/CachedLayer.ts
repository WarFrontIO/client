import type {WebGLUniforms} from "../GameGLContext";
import {GameGLContext} from "../GameGLContext";
import {BaseRendererLayer} from "./BaseRendererLayer";
import {textureCompositeVertexShader, simpleTextureFragmentShader} from "../shader/ShaderManager";

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
	private _uniforms: WebGLUniforms<"offset" | "size" | "texture_data">;
	private _texture: WebGLTexture;
	framebuffer: WebGLFramebuffer;

	setup(context: GameGLContext) {
		this._program = context.requireProgram(textureCompositeVertexShader, simpleTextureFragmentShader, "CachedLayer failed to init");
		this._vao = context.createVertexArray(this._program, GameGLContext.positionAttribute());
		this._uniforms = context.loadUniforms(this._program, "offset", "size", "texture_data");
	}

	/**
	 * Resize the canvas to the given width and height.
	 * @param width width of the canvas
	 * @param height height of the canvas
	 * @param transparent whether the canvas should be transparent or not. If true, the texture will include an alpha channel
	 * @protected
	 */
	protected resizeCanvas(width: number, height: number, transparent: boolean = false) {
		this.width = width;
		this.height = height;
		this.context.deleteTexture(this._texture);
		this._texture = this.context.createTexture(width, height, null, {minFilter: WebGL2RenderingContext.LINEAR, internalFormat: transparent ? WebGL2RenderingContext.RGBA : WebGL2RenderingContext.RGB, format: transparent ? WebGL2RenderingContext.RGBA : WebGL2RenderingContext.RGB});
		this.framebuffer = this.context.createFramebuffer(this._texture);
		this.context.resetFramebuffer();
	}

	render(context: GameGLContext): void {
		context.bind(this._program, this._vao);
		context.bindTexture(this._texture);

		const parentWidth = this.context.raw.canvas.width;
		const parentHeight = this.context.raw.canvas.height;

		this._uniforms.set2f("offset", this.dx / parentWidth, this.dy / parentHeight);
		this._uniforms.set2f("size", this.scale * this.width / parentWidth, this.scale * this.height / parentHeight);
		this._uniforms.set1i("texture_data", 0);

		context.drawTriangles(2);
	}
}