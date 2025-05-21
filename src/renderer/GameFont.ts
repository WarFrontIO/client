import {GameGLContext, WebGLUniforms} from "./GameGLContext";
import {msdfTextureFragmentShader, msdfTextureVertexShader} from "./shader/ShaderManager";
import {mapNavigationHandler} from "../game/action/MapNavigationHandler";
import {StreamReader} from "../map/codec/src/util/StreamReader";

export class GameFont {
	private readonly context: GameGLContext;
	private readonly program: WebGLProgram;
	private readonly vao: WebGLVertexArrayObject;
	private readonly uniforms: WebGLUniforms<"texture_data" | "offset" | "size">;
	private readonly texture: WebGLTexture;
	private readonly charData: { sx1: number, sy1: number, sx2: number, sy2: number, tx1: number, ty1: number, tx2: number, ty2: number, xAdvance: number }[] = [];
	private readonly positionBuffer: WebGLBuffer;
	private readonly charBuffer: WebGLBuffer;
	private readonly blurBuffer: WebGLBuffer;
	private readonly lineHeight: number;

	constructor(context: GameGLContext, image: HTMLImageElement, data: Uint8Array) {
		this.context = context;
		this.program = context.requireProgram(msdfTextureVertexShader, msdfTextureFragmentShader, "Font renderer failed to init");
		this.positionBuffer = context.createBuffer();
		this.charBuffer = context.createBuffer();
		this.blurBuffer = context.createBuffer();
		this.vao = context.createVertexArray(this.program, {name: "pos", size: 2, type: WebGL2RenderingContext.FLOAT, buffer: this.positionBuffer}, {name: "char", size: 2, type: WebGL2RenderingContext.FLOAT, buffer: this.charBuffer}, {name: "blur", size: 1, type: WebGL2RenderingContext.FLOAT, buffer: this.blurBuffer});
		this.uniforms = context.loadUniforms(this.program, "texture_data", "offset", "size");
		this.texture = context.createTexture(image.width, image.height, image, {minFilter: WebGL2RenderingContext.LINEAR, magFilter: WebGL2RenderingContext.LINEAR});
		this.lineHeight = this.parseData(data, image.width, image.height);
	}

	static async fromRaw(context: GameGLContext, image: string, data: string): Promise<GameFont> {
		return new Promise(resolve => {
			const img = new Image();
			img.src = image;
			img.onload = (() => {
				resolve(new GameFont(context, img, Uint8Array.from(atob(data), c => c.charCodeAt(0))));
			});
		});
	}

	private parseData(data: Uint8Array, textureWidth: number, textureHeight: number): number {
		const reader = new StreamReader(data);
		const charCount = reader.readBits(16);
		for (let i = 0; i < charCount; i++) {
			const char = reader.readBits(16);
			const x = reader.readBits(12);
			const y = reader.readBits(12);
			const xOffset = reader.readBits(8) - 128;
			const yOffset = reader.readBits(8) - 128;
			const xAdvance = reader.readBits(8);
			const width = reader.readBits(8);
			const height = reader.readBits(8);
			this.charData[char] = {
				sx1: x / textureWidth, sy1: y / textureHeight, sx2: (x + width) / textureWidth, sy2: (y + height) / textureHeight,
				tx1: xOffset, ty1: yOffset, tx2: xOffset + width, ty2: yOffset + height,
				xAdvance
			};
		}
		return reader.readBits(8);
	}

	drawText(data: GameTextEntry[]) {
		this.context.bind(this.program, this.vao);

		this.context.bindTexture(this.texture, 0);

		const parentWidth = this.context.raw.canvas.width;
		const parentHeight = this.context.raw.canvas.height;

		const characterCount = data.reduce((v, d) => v + d.string.length, 0);

		const positions = new Float32Array(characterCount * 12);
		const characters = new Float32Array(characterCount * 12);
		const blur = new Float32Array(characterCount * 6);

		let offset = 0;
		for (const entry of data) {
			let xOffset = 0;
			let length: number = 0;
			for (let i = 0; i < entry.string.length; i++) {
				const charData = this.charData[entry.string.charCodeAt(i)]
				if (!charData) throw new Error(`Char ${entry.string[i]} not found in font data`);
				length += charData.xAdvance;
			}
			const fontSize = Math.min(entry.size / length, 0.4 * entry.size / this.lineHeight);
			const x = entry.x + (entry.size - fontSize * length) / 2;
			const y = entry.baselineBottom ? entry.y + entry.size / 2 - fontSize * this.lineHeight : entry.y;
			for (let i = offset; i < offset + entry.string.length; i++) {
				const charData = this.charData[entry.string.charCodeAt(i - offset)];
				positions[12 * i] = x + (xOffset + charData.tx1) * fontSize;
				positions[12 * i + 1] = y + charData.ty1 * fontSize;
				positions[12 * i + 2] = x + (xOffset + charData.tx2) * fontSize;
				positions[12 * i + 3] = y + charData.ty1 * fontSize;
				positions[12 * i + 4] = x + (xOffset + charData.tx2) * fontSize;
				positions[12 * i + 5] = y + charData.ty2 * fontSize;
				positions[12 * i + 6] = x + (xOffset + charData.tx1) * fontSize;
				positions[12 * i + 7] = y + charData.ty1 * fontSize;
				positions[12 * i + 8] = x + (xOffset + charData.tx1) * fontSize;
				positions[12 * i + 9] = y + charData.ty2 * fontSize;
				positions[12 * i + 10] = x + (xOffset + charData.tx2) * fontSize;
				positions[12 * i + 11] = y + charData.ty2 * fontSize;
				characters[12 * i] = charData.sx1;
				characters[12 * i + 1] = charData.sy1;
				characters[12 * i + 2] = charData.sx2;
				characters[12 * i + 3] = charData.sy1;
				characters[12 * i + 4] = charData.sx2;
				characters[12 * i + 5] = charData.sy2;
				characters[12 * i + 6] = charData.sx1;
				characters[12 * i + 7] = charData.sy1;
				characters[12 * i + 8] = charData.sx1;
				characters[12 * i + 9] = charData.sy2;
				characters[12 * i + 10] = charData.sx2;
				characters[12 * i + 11] = charData.sy2;
				xOffset += charData.xAdvance;
			}
			blur.fill(1 - mapNavigationHandler.zoom * fontSize / parentHeight * 120, offset * 6, (offset + entry.string.length) * 6);
			offset += entry.string.length;
		}

		this.uniforms.set2f("offset", mapNavigationHandler.x / parentWidth, mapNavigationHandler.y / parentHeight);
		this.uniforms.set2f("size", mapNavigationHandler.zoom / parentWidth, mapNavigationHandler.zoom / parentHeight);
		this.uniforms.set1i("texture_data", 0);

		this.context.bufferData(this.positionBuffer, positions, WebGL2RenderingContext.STREAM_DRAW);
		this.context.bufferData(this.charBuffer, characters, WebGL2RenderingContext.STREAM_DRAW);
		this.context.bufferData(this.blurBuffer, blur, WebGL2RenderingContext.STREAM_DRAW);

		this.context.drawTriangles(2 * characterCount);
	}
}

/**
 * Sizes are in tiles.
 */
export type GameTextEntry = {
	string: string,
	x: number,
	y: number,
	size: number,
	baselineBottom?: boolean
}