import {playerNameRenderingManager} from "../manager/PlayerNameRenderingManager";
import {playerManager} from "../../game/player/PlayerManager";
import {gameRenderer, rendererContextGameplay, renderingContextInit} from "../GameRenderer";
import {BaseRendererLayer} from "./BaseRendererLayer";
import {GameGLContext} from "../GameGLContext";
import {mapFontData} from "../shader/ShaderManager";
import {GameFont, GameTextEntry} from "../GameFont";
import {mapNavigationHandler} from "../../game/action/MapNavigationHandler";
import {formatTroops} from "../../util/StringFormatter";

//@module renderer

class NameRenderer extends BaseRendererLayer {
	private font: GameFont;

	setup(context: GameGLContext) {
		mapFontData(context).then(font => this.font = font).catch(() => {});
	}

	render(context: GameGLContext): void {
		if (!this.font) return;
		const xMin = mapNavigationHandler.getMapX(0);
		const xMax = mapNavigationHandler.getMapX(context.raw.canvas.width);
		const yMin = mapNavigationHandler.getMapY(0);
		const yMax = mapNavigationHandler.getMapY(context.raw.canvas.height);
		const toDraw: GameTextEntry[] = [];
		for (let i = 0; i < playerNameRenderingManager.playerData.length; i++) {
			const player = playerManager.getPlayer(i);
			if (player && player.isAlive()) {
				const data = playerNameRenderingManager.playerData[i];
				if (data.size * mapNavigationHandler.zoom < 1 || data.nameX + data.size + 1 < xMin || data.nameX + 1 > xMax || data.nameY + data.size + 1 < yMin || data.nameY + 1 > yMax) {
					continue;
				}
				toDraw.push({string: player.name, x: data.nameX, y: data.nameY, size: data.size, baselineBottom: true});
				toDraw.push({string: formatTroops(player.getTroops()), x: data.nameX, y: data.nameY + data.size / 2, size: data.size});
			}
		}
		this.font.drawText(toDraw);
	}
}

export const nameRenderer = new NameRenderer();

renderingContextInit.register(id => id === rendererContextGameplay && gameRenderer.registerLayer(nameRenderer, 15));