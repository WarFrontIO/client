import type {GameGLContext, WebGLUniforms} from "../GameGLContext";
import type {GameTheme} from "../GameTheme";
import {CachedLayer} from "./CachedLayer";
import {mapTransformHandler} from "../../event/MapTransformHandler";
import {gameMap} from "../../game/GameData";
import {TerritoryRenderingManager} from "../manager/TerritoryRenderingManager";
import {getSetting, registerSettingListener} from "../../util/settings/UserSettingManager";
import {registerTransactionExecutor} from "../../game/transaction/TransactionExecutors";
import {TerritoryTransaction} from "../../game/transaction/TerritoryTransaction";
import {borderManager} from "../../game/BorderManager";
import {gameRenderer, rendererContextGameplay, renderingContextInit} from "../GameRenderer";
import {playerManager} from "../../game/player/PlayerManager";
import {mapGridLookupVertexShader, territoryRenderingFragmentShader} from "../shader/ShaderManager";

//@module renderer

/**
 * Territory renderer.
 * Renders territory colors on the map (e.g. player territories).
 * @internal
 */
class TerritoryRenderer extends CachedLayer {
	readonly manager: TerritoryRenderingManager = new TerritoryRenderingManager();
	private program: WebGLProgram;
	private vao: WebGLVertexArrayObject;
	private uniforms: WebGLUniforms<"size" | "palette_data">;
	private palette: WebGLTexture;
	private tileBuffer: WebGLBuffer;
	private updateBuffer: WebGLBuffer;

	setup(context: GameGLContext) {
		super.setup(context);
		this.program = context.requireProgram(mapGridLookupVertexShader, territoryRenderingFragmentShader, "Territory renderer failed to init");
		this.tileBuffer = context.createBuffer();
		this.updateBuffer = context.createBuffer();
		this.vao = context.createVertexArray(this.program, {name: "pos", buffer: this.tileBuffer, size: 1, type: WebGL2RenderingContext.UNSIGNED_INT, asInt: true}, {name: "id", buffer: this.updateBuffer, size: 1, type: WebGL2RenderingContext.UNSIGNED_INT, asInt: true});
		this.uniforms = context.loadUniforms(this.program, "size", "palette_data");
		this.updatePalette(getSetting("theme"));
	}

	init(context: GameGLContext): void {
		super.init(context);
		this.resizeCanvas(gameMap.width, gameMap.height, true);
	}

	updatePalette(theme: GameTheme): void {
		const colors = new Uint8Array(65536 * 2 * 4);
		for (const player of playerManager.getPlayers()) {
			const territoryColor = theme.getTerritoryColor(player.baseColor).toRGB();
			const borderColor = theme.getBorderColor(player.baseColor).toRGB();
			colors[player.id * 4] = territoryColor.r;
			colors[player.id * 4 + 1] = territoryColor.g;
			colors[player.id * 4 + 2] = territoryColor.b;
			colors[player.id * 4 + 3] = territoryColor.a * 255;
			colors[65536 * 4 + player.id * 4] = borderColor.r;
			colors[65536 * 4 + player.id * 4 + 1] = borderColor.g;
			colors[65536 * 4 + player.id * 4 + 2] = borderColor.b;
			colors[65536 * 4 + player.id * 4 + 3] = borderColor.a * 255;
		}
		this.palette = this.context.createTexture(256, 512, colors, {internalFormat: WebGL2RenderingContext.RGBA, format: WebGL2RenderingContext.RGBA});
	}

	render(context: GameGLContext) {
		if (this.manager.tiles.length > 0) {
			this.context.bind(this.program, this.vao, this.framebuffer);
			this.context.stopBlend();
			this.context.viewport(gameMap.width, gameMap.height);
			this.context.bindTexture(this.palette);

			this.uniforms.set2i("size", gameMap.width, gameMap.height);
			this.uniforms.set1i("palette_data", 0);

			this.context.bufferData(this.tileBuffer, new Uint32Array(this.manager.tiles), WebGL2RenderingContext.DYNAMIC_DRAW);
			this.context.bufferData(this.updateBuffer, new Uint32Array(this.manager.updates), WebGL2RenderingContext.DYNAMIC_DRAW);

			this.context.drawPoints(this.manager.tiles.length);

			this.context.startBlend();
			this.context.viewport();
			this.context.resetFramebuffer();
			this.manager.tiles = [];
			this.manager.updates = [];
		}
		super.render(context);
	}

	onMapMove(this: void, x: number, y: number): void {
		territoryRenderer.dx = x;
		territoryRenderer.dy = y;
	}

	onMapScale(this: void, scale: number): void {
		territoryRenderer.scale = scale;
	}
}

export const territoryRenderer = new TerritoryRenderer();

mapTransformHandler.scale.register(territoryRenderer.onMapScale);
mapTransformHandler.move.register(territoryRenderer.onMapMove);
renderingContextInit.register(id => id === rendererContextGameplay && gameRenderer.registerLayer(territoryRenderer, 10));

registerSettingListener("theme", territoryRenderer.manager.forceRepaint.bind(territoryRenderer.manager));

registerTransactionExecutor(TerritoryTransaction, function (this: TerritoryTransaction) {
	//TODO: this needs to be less magical for clearing
	const borders = borderManager.transitionTiles(this.tiles, this.attacker?.id ?? -1, this.defendant?.id ?? -1);
	if (this.attacker) {
		territoryRenderer.manager.paintTiles(borders.territory, this.attacker.id);
		territoryRenderer.manager.paintBorderTiles(borders.attacker, this.attacker.id);
	} else {
		territoryRenderer.manager.clearTiles(this.tiles);
	}

	if (this.defendant) {
		territoryRenderer.manager.paintBorderTiles(borders.defender, this.defendant.id);
	}
});