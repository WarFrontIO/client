import { CachedLayer } from "./CachedLayer";
import { Game } from "../../game/Game";
import { MapMoveListener, MapScaleListener, MapTransformHandler } from "../../event/MapTransformHandler";
import { getSetting, registerSettingListener } from "../../util/UserSettingManager";
import { GameTheme } from "../GameTheme";
import { applyPostGenerationShaders, loadShaders } from "../shader/ShaderManager";
import { HSLColor } from "../../util/HSLColor";
import { RGBColor } from "../../util/RGBColor";

/**
 * Map background renderer.
 * All static map tiles (and possibly other static objects) should be rendered here.
 * @internal
 */
export class MapRenderer extends CachedLayer implements MapMoveListener, MapScaleListener {
	private game: Game

	constructor(game: Game, mapTransformHandler: MapTransformHandler) {
		super();
		this.game = game
		mapTransformHandler.move.register(this);
		mapTransformHandler.scale.register(this);
	}

	invalidateCaches(): void {
		this.resizeCanvas(this.game.map.width, this.game.map.height);
		loadShaders(this.game);
		this.forceRepaint(getSetting("theme"));
	}

	forceRepaint(theme: GameTheme): void {
		const imageData = this.context.getImageData(0, 0, this.game.map.width, this.game.map.height);
		const tileColors: RGBColor[] = [];
		for (let i = 0; i < this.game.map.width * this.game.map.height; i++) {
			const tile = this.game.map.getTile(i);
			if (!tileColors[tile.id]) {
				tileColors[tile.id] = theme.getTileColor(tile).toRGB();
			}
			tileColors[tile.id].writeToBuffer(imageData.data, i * 4);
		}
		applyPostGenerationShaders(imageData.data);
		this.context.putImageData(imageData, 0, 0);
	}

	onMapMove(x: number, y: number): void {
		this.dx = x;
		this.dy = y;
	}

	onMapScale(scale: number): void {
		this.scale = scale;
	}
}

// export const mapRenderer = new MapRenderer();

// registerSettingListener("theme", (theme) => isPlaying && mapRenderer.forceRepaint(theme));