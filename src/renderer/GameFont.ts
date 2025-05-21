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
	private readonly charData: { x: number, y: number, xOffset: number, yOffset: number, xAdvance: number, width: number, height: number }[] = [];
	private readonly image: HTMLImageElement;
	private readonly positionBuffer: WebGLBuffer;
	private readonly charBuffer: WebGLBuffer;
	private readonly blurBuffer: WebGLBuffer;
	private readonly lineHeight: number;

	constructor(context: GameGLContext, image: HTMLImageElement, data: Uint8Array) {
		this.image = image;
		this.context = context;
		this.program = context.requireProgram(msdfTextureVertexShader, msdfTextureFragmentShader, "Font renderer failed to init");
		this.positionBuffer = context.createBuffer();
		this.charBuffer = context.createBuffer();
		this.blurBuffer = context.createBuffer();
		this.vao = context.createVertexArray(this.program, {name: "pos", size: 2, type: WebGL2RenderingContext.FLOAT, buffer: this.positionBuffer}, {name: "char", size: 2, type: WebGL2RenderingContext.FLOAT, buffer: this.charBuffer}, {name: "blur", size: 1, type: WebGL2RenderingContext.FLOAT, buffer: this.blurBuffer});
		this.uniforms = context.loadUniforms(this.program, "texture_data", "offset", "size");
		this.texture = context.createTexture(image.width, image.height, image, {minFilter: WebGL2RenderingContext.LINEAR, magFilter: WebGL2RenderingContext.LINEAR});
		this.lineHeight = this.parseData(data);
	}

	static async fromRaw(context: GameGLContext, image: string, data: string): Promise<GameFont> {
		return new Promise(resolve => {
			const img = new Image();
			img.src = image;
			img.onload = (() => {
				console.log(data.length)
				resolve(new GameFont(context, img, Uint8Array.from(atob(data), c => c.charCodeAt(0))));
			});
		});
	}

	private parseData(data: Uint8Array): number {
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
			this.charData[char] = {x, y, xOffset, yOffset, xAdvance, width, height};
		}
		return reader.readBits(8);
	}

	drawText(data: { string: string, nameX: number, nameY: number, size: number, baselineBottom?: boolean }[]) {
		this.context.bind(this.program, this.vao);

		this.context.bindTexture(this.texture, 0);

		//TODO: calculate factor based on character width
		const parentWidth = this.context.raw.canvas.width;
		const parentHeight = this.context.raw.canvas.height;

		const characterCount = data.reduce((v, d) => v + d.string.length, 0);

		const positions = new Float32Array(characterCount * 12);
		const characters = new Float32Array(characterCount * 12);
		const blur = new Float32Array(characterCount * 6);

		let offset = 0;
		for (const text of data) {
			let {string, nameX, nameY, size, baselineBottom} = text;
			let xOffset = 0;
			let length: number = 0;
			for (let i = 0; i < string.length; i++) {
				const charData = this.charData[string[i].charCodeAt(0)]
				if (!charData) throw new Error(`Char ${string[i]} not found in font data`);
				length += charData.xAdvance;
			}
			const fontSize = Math.min(size / length, 0.4 * size / this.lineHeight);
			nameX += (size - fontSize * length) / 2;
			if (baselineBottom) nameY += size / 2 - fontSize * this.lineHeight;
			for (let i = offset; i < offset + string.length; i++) {
				const charData = this.charData[string.charCodeAt(i - offset)];
				if (!charData) throw new Error(`Char ${string[i - offset]} not found in font data`);

				positions[12 * i] = nameX + (xOffset + charData.xOffset) * fontSize;
				positions[12 * i + 1] = nameY + charData.yOffset * fontSize;
				positions[12 * i + 2] = nameX + (xOffset + charData.xOffset + charData.width) * fontSize;
				positions[12 * i + 3] = nameY + charData.yOffset * fontSize;
				positions[12 * i + 4] = nameX + (xOffset + charData.xOffset + charData.width) * fontSize;
				positions[12 * i + 5] = nameY + (charData.yOffset + charData.height) * fontSize;
				positions[12 * i + 6] = nameX + (xOffset + charData.xOffset) * fontSize;
				positions[12 * i + 7] = nameY + charData.yOffset * fontSize;
				positions[12 * i + 8] = nameX + (xOffset + charData.xOffset) * fontSize;
				positions[12 * i + 9] = nameY + (charData.yOffset + charData.height) * fontSize;
				positions[12 * i + 10] = nameX + (xOffset + charData.xOffset + charData.width) * fontSize;
				positions[12 * i + 11] = nameY + (charData.yOffset + charData.height) * fontSize;
				characters[12 * i] = charData.x / this.image.width;
				characters[12 * i + 1] = charData.y / this.image.height;
				characters[12 * i + 2] = (charData.x + charData.width) / this.image.width;
				characters[12 * i + 3] = charData.y / this.image.height;
				characters[12 * i + 4] = (charData.x + charData.width) / this.image.width;
				characters[12 * i + 5] = (charData.y + charData.height) / this.image.height;
				characters[12 * i + 6] = charData.x / this.image.width;
				characters[12 * i + 7] = charData.y / this.image.height;
				characters[12 * i + 8] = charData.x / this.image.width;
				characters[12 * i + 9] = (charData.y + charData.height) / this.image.height;
				characters[12 * i + 10] = (charData.x + charData.width) / this.image.width;
				characters[12 * i + 11] = (charData.y + charData.height) / this.image.height;
				xOffset += charData.xAdvance;
			}
			blur.fill(1 - mapNavigationHandler.zoom * fontSize / parentHeight * 120, offset * 6, (offset + string.length) * 6);
			offset += string.length;
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