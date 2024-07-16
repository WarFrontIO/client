import {CachedLayer} from "./CachedLayer";
import {gameMap, isPlaying} from "../../game/Game";
import {mapTransformHandler} from "../../event/MapTransformHandler";
import {getSetting, registerSettingListener} from "../../util/UserSettingManager";
import {GameTheme} from "../GameTheme";
import {applyPostGenerationShaders, loadShaders} from "../shader/ShaderManager";
import {RGBColor} from "../../util/RGBColor";

/**
 * Map background renderer.
 * All static map tiles (and possibly other static objects) should be rendered here.
 * @internal
 */
class MapRenderer extends CachedLayer {
	invalidateCaches(): void {
		this.resizeCanvas(gameMap.width, gameMap.height);
		loadShaders();
		this.forceRepaint(getSetting("theme"));
	}

	forceRepaint(theme: GameTheme): void {
		const imageData = this.context.getImageData(0, 0, gameMap.width, gameMap.height);
		const tileColors: RGBColor[] = [];
		for (let i = 0; i < gameMap.width * gameMap.height; i++) {
			const tile = gameMap.getTile(i);
			if (!tileColors[tile.id]) {
				tileColors[tile.id] = theme.getTileColor(tile).toRGB();
			}
			tileColors[tile.id].writeToBuffer(imageData.data, i * 4);
		}
		applyPostGenerationShaders(imageData.data);
		this.context.putImageData(imageData, 0, 0);
	}

	onMapMove(this: void, x: number, y: number): void {
		mapRenderer.dx = x;
		mapRenderer.dy = y;
	}

	onMapScale(this: void, scale: number): void {
		mapRenderer.scale = scale;
	}
}

export const mapRenderer = new MapRenderer();

mapTransformHandler.scale.register(mapRenderer.onMapScale);
mapTransformHandler.move.register(mapRenderer.onMapMove);

registerSettingListener("theme", (theme) => isPlaying && mapRenderer.forceRepaint(theme));