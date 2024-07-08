import { RendererLayer } from "./RendererLayer";
import { PlayerNameRenderingManager } from "../manager/PlayerNameRenderingManager";
import { MapNavigationHandler } from "../../game/action/MapNavigationHandler";
import { Game } from "../../game/Game";

export class NameRenderer implements RendererLayer {

	private game: Game
	private playerNameRenderingManager: PlayerNameRenderingManager
	private mapNavigationHandler: MapNavigationHandler

	constructor(game: Game, playerNameRenderingManager: PlayerNameRenderingManager, mapNavigationHandler: MapNavigationHandler) {
		this.game = game
		this.playerNameRenderingManager = playerNameRenderingManager
		this.mapNavigationHandler = mapNavigationHandler
	}


	render(context: CanvasRenderingContext2D): void {
		context.textRendering = "optimizeSpeed";
		context.textAlign = "center";
		const xMin = this.mapNavigationHandler.getMapX(0);
		const xMax = this.mapNavigationHandler.getMapX(context.canvas.width);
		const yMin = this.mapNavigationHandler.getMapY(0);
		const yMax = this.mapNavigationHandler.getMapY(context.canvas.height);
		for (let i = 0; i < this.playerNameRenderingManager.playerData.length; i++) {
			const player = this.game.players.getPlayer(i);
			if (player && player.isAlive()) {
				const data = this.playerNameRenderingManager.playerData[i];
				if (data.size * this.mapNavigationHandler.zoom < 1 || data.nameX + 1 < xMin || data.nameX - data.size + 1 > xMax || data.nameY + 1 < yMin || data.nameY - data.size + 1 > yMax) {
					continue;
				}
				data.renderPlayer(context, player);
			}
		}
	}
}