import {AssertionFailedException, IllegalStateException, InvalidArgumentException} from "../util/Exceptions";

export class GameGLContext {
	readonly raw: WebGL2RenderingContext;

	constructor(ctx: WebGL2RenderingContext) {
		this.raw = ctx;
	}

	/**
	 * Loads vertex shader from source.
	 * @param source The source code of the shader
	 * @returns The shader object, or null if it failed to load
	 */
	loadVertexShader(source: string): WebGLShader | null {
		return this.loadShader(source, true);
	}

	/**
	 * Loads fragment shader from source.
	 * @param source The source code of the shader
	 * @returns The shader object, or null if it failed to load
	 */
	loadFragmentShader(source: string): WebGLShader | null {
		return this.loadShader(source);
	}

	private loadShader(source: string, isVertex: boolean = false): WebGLShader | null {
		const shader = this.raw.createShader(isVertex ? this.raw.VERTEX_SHADER : this.raw.FRAGMENT_SHADER);
		if (!shader) {
			console.warn(`Could not create ${(isVertex ? "vertex" : "fragment")} shader`);
			return null;
		}

		this.raw.shaderSource(shader, source);
		this.raw.compileShader(shader);

		if (!this.raw.getShaderParameter(shader, this.raw.COMPILE_STATUS)) {
			console.warn(`Could not compile ${(isVertex ? "vertex" : "fragment")} shader`);
			console.log(source);
			console.warn(this.raw.getShaderInfoLog(shader));
			this.raw.deleteShader(shader);
			return null;
		}
		return shader;
	}

	/**
	 * Creates a program with the given shaders.
	 * @param vertexShader The vertex shader to use
	 * @param fragmentShader The fragment shader to use
	 * @param errorMessage The error message to throw if the program fails to load
	 */
	requireProgram(vertexShader: (ctx: this) => WebGLShader | null, fragmentShader: (ctx: this) => WebGLShader | null, errorMessage: string): WebGLProgram {
		const program = this.createProgram(vertexShader, fragmentShader);
		if (!program) throw new IllegalStateException(errorMessage);
		return program;
	}

	/**
	 * Creates a program with the given shaders.
	 * @param vertexShader The vertex shader to use
	 * @param fragmentShader The fragment shader to use
	 * @returns The program object, or null if it failed to load
	 */
	createProgram(vertexShader: (ctx: this) => WebGLShader | null, fragmentShader: (ctx: this) => WebGLShader | null): WebGLProgram | null {
		const vertexShaderObj = vertexShader(this);
		const fragmentShaderObj = fragmentShader(this);
		if (!vertexShaderObj || !fragmentShaderObj) {
			console.warn("Cannot create a program with missing shaders");
			return null;
		}

		const program = this.raw.createProgram();
		if (!program) {
			console.warn("Program creation failed (unknown reason).");
			return null;
		}

		this.raw.attachShader(program, vertexShaderObj);
		this.raw.attachShader(program, fragmentShaderObj);
		this.raw.linkProgram(program);

		if (!this.raw.getProgramParameter(program, this.raw.LINK_STATUS)) {
			console.warn(`Could not link program`);
			console.warn(this.raw.getProgramInfoLog(program));
			this.raw.deleteProgram(program);
			return null;
		}
		return program;
	}

	/**
	 * Creates a texture with the given options.
	 * @param width The width of the texture
	 * @param height The height of the texture
	 * @param arr Initial texture data, make sure this fits the type and format passed to options
	 * @param options Various settings for texture setup {@link TextureOptions}
	 */
	createTexture(width: number, height: number, arr: ArrayBufferView | null = null, options: TextureOptions = {}): WebGLTexture {
		const texture = this.raw.createTexture();
		if (!texture) throw new AssertionFailedException("Could not create a texture");
		this.raw.bindTexture(this.raw.TEXTURE_2D, texture);
		this.raw.texImage2D(this.raw.TEXTURE_2D, 0, options.internalFormat ?? this.raw.RGB, width, height, 0, options.format ?? this.raw.RGB, options.type ?? this.raw.UNSIGNED_BYTE, arr);

		this.raw.texParameteri(this.raw.TEXTURE_2D, this.raw.TEXTURE_MIN_FILTER, options.minFilter ?? this.raw.NEAREST);
		this.raw.texParameteri(this.raw.TEXTURE_2D, this.raw.TEXTURE_MAG_FILTER, options.magFilter ?? this.raw.NEAREST);
		this.raw.texParameteri(this.raw.TEXTURE_2D, this.raw.TEXTURE_WRAP_S, options.wrapS ?? this.raw.CLAMP_TO_EDGE);
		this.raw.texParameteri(this.raw.TEXTURE_2D, this.raw.TEXTURE_WRAP_T, options.wrapT ?? this.raw.CLAMP_TO_EDGE);
		return texture;
	}

	/**
	 * Creates a framebuffer with the given texture.
	 * @param texture The texture to use for the framebuffer
	 */
	createFramebuffer(texture: WebGLTexture): WebGLFramebuffer {
		const framebuffer = this.raw.createFramebuffer();
		if (!framebuffer) throw new AssertionFailedException("Could not create a framebuffer");
		this.raw.bindFramebuffer(this.raw.FRAMEBUFFER, framebuffer);
		this.raw.framebufferTexture2D(this.raw.FRAMEBUFFER, this.raw.COLOR_ATTACHMENT0, this.raw.TEXTURE_2D, texture, 0);
		return framebuffer;
	}

	/**
	 * Deletes the given texture and framebuffer.
	 * @param texture The texture to delete
	 * @param framebuffer The framebuffer to delete
	 */
	deleteTexture(texture: WebGLTexture, framebuffer: WebGLFramebuffer | null = null) {
		this.raw.deleteTexture(texture);
		if (framebuffer) this.raw.deleteFramebuffer(framebuffer);
	}

	/**
	 * Helper to create position attribute.
	 * If nothing is specified, this will use triangle positions for a square with positions [0,1]
	 */
	static positionAttribute(): AttributeOptions;
	static positionAttribute(data: ArrayBufferView, type: GLenum, usage: GLenum): AttributeOptions;
	static positionAttribute(data: ArrayBufferView | null = null, type: GLenum = WebGL2RenderingContext.BYTE, usage: GLenum = WebGL2RenderingContext.STREAM_DRAW): AttributeOptions {
		return {
			name: "pos",
			size: 2,
			type,
			data: data ?? new Int8Array([
				0, 0, 1, 0, 1, 1, //lower triangle
				0, 0, 0, 1, 1, 1, //upper triangle
			]),
			usage
		};
	}

	/**
	 * Creates a vertex array with the given options.
	 * @param program The program to use, only required if attributes are set
	 * @param attributes Array of attributes to set up {@link AttributeOptions}
	 */
	createVertexArray(program: WebGLProgram | null = null, ...attributes: AttributeOptions[]): WebGLVertexArrayObject {
		const vertexArray = this.raw.createVertexArray();
		if (!vertexArray) throw new AssertionFailedException("Could not create a vertex array");
		this.raw.bindVertexArray(vertexArray);

		if (attributes) {
			if (!program) throw new InvalidArgumentException("Program must be specified if arguments are set");
			for (const attribute of attributes) {
				const location = this.raw.getAttribLocation(program, attribute.name);
				if (location === -1) throw new InvalidArgumentException(`Attribute ${attribute.name} not found in program`);
				this.raw.enableVertexAttribArray(location);

				if (attribute.data) {
					if (!attribute.usage) throw new InvalidArgumentException("Usage must be specified if data is set");
					this.raw.bindBuffer(this.raw.ARRAY_BUFFER, attribute.buffer ?? this.createBuffer());
					this.raw.bufferData(this.raw.ARRAY_BUFFER, attribute.data, attribute.usage);
				} else if (attribute.buffer) {
					this.raw.bindBuffer(this.raw.ARRAY_BUFFER, attribute.buffer);
				} // We otherwise expect the buffer to be already bound

				if (attribute.asInt) {
					this.raw.vertexAttribIPointer(location, attribute.size, attribute.type, attribute.stride ?? 0, attribute.offset ?? 0);
				} else {
					this.raw.vertexAttribPointer(location, attribute.size, attribute.type, attribute.normalized ?? false, attribute.stride ?? 0, attribute.offset ?? 0);
				}
			}
		}
		return vertexArray;
	}

	/**
	 * Creates a buffer to use when passing attribute data.
	 */
	createBuffer(): WebGLBuffer {
		const buffer = this.raw.createBuffer();
		if (!buffer) throw new AssertionFailedException("Could not create a buffer");
		return buffer;
	}

	/**
	 * Sets the data of the given buffer.
	 * @param buffer The buffer to set the data of
	 * @param data The data to set
	 * @param usage The usage of the data. Recommendations: {@link WebGL2RenderingContext.STREAM_DRAW} {@link WebGL2RenderingContext.STATIC_DRAW} {@link WebGL2RenderingContext.DYNAMIC_DRAW}
	 */
	bufferData(buffer: WebGLBuffer, data: ArrayBufferView, usage: GLenum) {
		this.raw.bindBuffer(this.raw.ARRAY_BUFFER, buffer);
		this.raw.bufferData(this.raw.ARRAY_BUFFER, data, usage);
	}

	/**
	 * Deletes the given buffer.
	 * @param buffer The buffer to delete
	 */
	deleteBuffer(buffer: WebGLBuffer) {
		this.raw.deleteBuffer(buffer);
	}

	/**
	 * Binds everything needed to prepare rendering.
	 * @param program The program to use
	 * @param vertexArray The vertex array to use
	 * @param framebuffer The framebuffer to use, if not specified rendering to already bound framebuffer
	 */
	bind(program: WebGLProgram, vertexArray: WebGLVertexArrayObject | null, framebuffer: WebGLFramebuffer | null = null) {
		this.raw.useProgram(program);
		this.raw.bindVertexArray(vertexArray);
		if (framebuffer) this.raw.bindFramebuffer(this.raw.FRAMEBUFFER, framebuffer);
	}

	/**
	 * Unbinds the framebuffer.
	 * Call this to render to the canvas again.
	 */
	resetFramebuffer() {
		this.raw.bindFramebuffer(this.raw.FRAMEBUFFER, null);
	}

	/**
	 * Sets the viewport.
	 * @param width The width of the viewport
	 * @param height The height of the viewport
	 */
	viewport(width: number | null = null, height: number | null = null) {
		this.raw.viewport(0, 0, width ?? this.raw.canvas.width, height ?? this.raw.canvas.height);
	}

	/**
	 * Binds the given texture.
	 * @param texture The texture to bind
	 * @param unit Texture unit to use, if not specified active one is used (only specify offset)
	 */
	bindTexture(texture: WebGLTexture, unit: number | null = null) {
		if (unit !== null) this.raw.activeTexture(this.raw.TEXTURE0 + unit);
		this.raw.bindTexture(this.raw.TEXTURE_2D, texture);
	}

	/**
	 * Resets the active texture unit.
	 */
	resetActiveTexture() {
		this.raw.activeTexture(this.raw.TEXTURE0);
	}

	/**
	 * Loads the given uniforms and returns an object with their positions.
	 * @param program The program to load the uniforms of
	 * @param uniforms The names of the uniforms to load
	 */
	loadUniforms<T extends string>(program: WebGLProgram, ...uniforms: T[]): WebGLUniforms<T> {
		const uniformMap = new Map<string, WebGLUniformLocation>();
		for (const uniform of uniforms) {
			const location = this.raw.getUniformLocation(program, uniform);
			if (!location) throw new InvalidArgumentException(`Uniform ${uniform} not found in program`);
			uniformMap.set(uniform, location);
		}

		return new Proxy({}, {
			get: (_, prop: string) => {
				if (!prop.startsWith("set") && !prop.startsWith("matrix")) return undefined;
				return (...args: unknown[]) => {
					const uniform = args[0] as T;
					if (!uniformMap.has(uniform)) throw new InvalidArgumentException(`Unknown uniform ${uniform}`);
					const location = uniformMap.get(uniform);
					const propName = prop.replace("set", "uniform").replace("matrix", "uniformMatrix");
					if (!(propName in this.raw)) throw new AssertionFailedException(`Unknown uniform function ${propName}`);
					(this.raw as unknown as Record<string, (...args: unknown[]) => void>)[propName](location, ...args.slice(1));
				};
			}
		}) as WebGLUniforms<T>;
	}

	/**
	 * Draw without blending.
	 */
	stopBlend() {
		this.raw.disable(this.raw.BLEND);
	}

	/**
	 * Draw with blending.
	 * @param src The source blend factor
	 * @param dst The destination blend factor
	 */
	startBlend(src: GLenum | null = null, dst: GLenum | null = null) {
		this.raw.enable(this.raw.BLEND);
		if (src && dst) this.raw.blendFunc(src, dst);
	}

	/**
	 * Draws the given number of triangles starting at the given index.
	 * @param count The number of triangles to draw. NOT the number of vertices
	 * @param start The index to start drawing from
	 */
	drawTriangles(count: GLsizei, start: GLint = 0) {
		this.raw.drawArrays(this.raw.TRIANGLES, start, count * 3);
	}

	/**
	 * Draws the given number of points starting at the given index.
	 * @param count The number of points to draw
	 * @param start The index to start drawing from
	 */
	drawPoints(count: number, start: GLint = 0) {
		this.raw.drawArrays(this.raw.POINTS, start, count);
	}
}

type TextureOptions = {
	/**
	 * The internal format to use for the texture. Must be compatible with format and type.
	 *
	 * Default: {@link WebGL2RenderingContext.RGB}
	 * @see https://registry.khronos.org/webgl/specs/latest/2.0/#TEXTURE_TYPES_FORMATS_FROM_DOM_ELEMENTS_TABLE
	 */
	internalFormat?: GLint,
	/**
	 * The texture format to use. Must be compatible with internalFormat and type.
	 *
	 * Default: {@link WebGL2RenderingContext.RGB}
	 * @see https://registry.khronos.org/webgl/specs/latest/2.0/#TEXTURE_TYPES_FORMATS_FROM_DOM_ELEMENTS_TABLE
	 */
	format?: GLenum,
	/**
	 * The type of input data provided. Must be compatible with internalFormat and type.
	 *
	 * Default: Default: {@link WebGL2RenderingContext.UNSIGNED_BYTE}
	 * @see https://registry.khronos.org/webgl/specs/latest/2.0/#TEXTURE_PIXELS_TYPE_TABLE
	 * @see https://registry.khronos.org/webgl/specs/latest/2.0/#TEXTURE_TYPES_FORMATS_FROM_DOM_ELEMENTS_TABLE
	 */
	type?: GLenum,
	/**
	 * Filter to use when minimizing the texture, one of {@link WebGL2RenderingContext.LINEAR} {@link WebGL2RenderingContext.NEAREST}
	 *
	 * Default: {@link WebGL2RenderingContext.NEAREST}
	 */
	minFilter?: GLint,
	/**
	 * Filter to use when magnifying the texture, one of {@link WebGL2RenderingContext.LINEAR} {@link WebGL2RenderingContext.NEAREST}
	 *
	 * Default: {@link WebGL2RenderingContext.NEAREST}
	 */
	magFilter?: GLint,
	/**
	 * Wrapping mode of the texture in x-direction, one of {@link WebGL2RenderingContext.REPEAT} {@link WebGL2RenderingContext.CLAMP_TO_EDGE} {@link WebGL2RenderingContext.MIRRORED_REPEAT}
	 *
	 * Default: {@link WebGL2RenderingContext.CLAMP_TO_EDGE}
	 */
	wrapS?: GLint,
	/**
	 * Wrapping mode of the texture in y-direction, one of {@link WebGL2RenderingContext.REPEAT} {@link WebGL2RenderingContext.CLAMP_TO_EDGE} {@link WebGL2RenderingContext.MIRRORED_REPEAT}
	 *
	 * Default: {@link WebGL2RenderingContext.CLAMP_TO_EDGE}
	 */
	wrapT?: GLint,
};

type AttributeOptions = {
	/**
	 * The name of the attribute.
	 */
	name: string;
	/**
	 * Number of components to use, 1-4.
	 */
	size: GLint,
	/**
	 * The data type of the component.
	 */
	type: GLenum,
	/**
	 * Whether to normalize the given values to [-1,1] or [0,1] if unsigned.
	 */
	normalized?: GLboolean,
	/**
	 * Offset in bytes between each attribute entry.
	 */
	stride?: GLsizei,
	/**
	 * Offset in bytes for the first component.
	 */
	offset?: GLintptr,
	/**
	 * Initial data for the buffer
	 */
	data?: ArrayBufferView,
	/**
	 * The buffer to use, use this if data is supposed to change or only used temporarily.
	 * If this is NOT specified, the buffer cannot be deleted (ONLY INITIALIZE THIS ATTRIBUTE ONCE IF THIS IS THE CASE).
	 */
	buffer?: WebGLBuffer,
	/**
	 * Expected usage of the attribute. Required if data is set. Recommendations:
	 *
	 * {@link WebGL2RenderingContext.STREAM_DRAW} when content does not change and is only used a few times.
	 * {@link WebGL2RenderingContext.STATIC_DRAW} when content does not change but is used frequently.
	 * {@link WebGL2RenderingContext.DYNAMIC_DRAW} when content changes (only use this if buffer is specified).
	 */
	usage?: GLenum,
	/**
	 * Whether to use integer values.
	 *
	 * Default: false
	 */
	asInt?: boolean,
};

export type WebGLUniforms<T extends string> = {
	[K in `set${1 | 2 | 3 | 4}${"i" | "ui" | "f"}`]: (uniform: T, ...args: K extends `set${infer U extends number}${"i" | "ui" | "f"}` ? Tuple<number, U> : never) => void
} & {
	[K in `set${1 | 2 | 3 | 4}${"i" | "ui" | "f"}v`]: (uniform: T, data: K extends `set${1 | 2 | 3 | 4}${infer U}v` ? U extends "i" ? Int32List : U extends "ui" ? Uint32List : U extends "f" ? Float32List : never : never, srcOffset?: number, srcLength?: GLuint) => void
} & Omit<{
	[K in `matrix${2 | 3 | 4}x${2 | 3 | 4}fv` | `matrix${2 | 3 | 4}fv`]: (uniform: T, transpose: GLboolean, data: Float32List, srcOffset?: number, srcLength?: GLuint) => void
}, "matrix2x2fv" | "matrix3x3fv" | "matrix4x4fv">;

type Tuple<K, N extends number, R extends K[] = []> = R["length"] extends N ? R : Tuple<K, N, [...R, K]>;