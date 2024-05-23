import {CachedLayer} from "./CachedLayer";
import {gameMap, isPlaying} from "../../game/Game";
import {MapMoveListener, MapScaleListener, mapTransformHandler} from "../../event/MapTransformHandler";
import {getSetting, registerSettingListener} from "../../util/UserSettingManager";
import {GameTheme} from "../GameTheme";
import {applyPostGenerationShaders} from "../shader/ShaderManager";

/**
 * Map background renderer.
 * All static map tiles (and possibly other static objects) should be rendered here.
 * @internal
 */
class MapRenderer extends CachedLayer implements MapMoveListener, MapScaleListener {
	constructor() {
		super();
		mapTransformHandler.move.register(this);
		mapTransformHandler.scale.register(this);
	}

	invalidateCaches(): void {
		this.resizeCanvas(gameMap.width, gameMap.height);
		this.forceRepaint(getSetting("theme"));
	}

	forceRepaint(theme: GameTheme): void {
		const imageData = this.context.getImageData(0, 0, gameMap.width, gameMap.height);
		const tileColors = [];
		for (let i = 0; i < gameMap.width * gameMap.height; i++) {
			const tile = gameMap.getTile(i);
			if (!tileColors[tile.id]) {
				tileColors[tile.id] = theme.getTileColor(tile);
			}
			//TODO: This does a lot of unnecessary work, consider caching the rgba values of the colors
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

export const mapRenderer = new MapRenderer();

registerSettingListener("theme", (theme) => isPlaying && mapRenderer.forceRepaint(theme));