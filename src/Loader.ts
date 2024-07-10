import {GameRenderer} from "./renderer/GameRenderer";
import {TileManager} from "./map/TileManager";
import {openModule} from "./ui/ModuleLoader";

export const tileManager = new TileManager();
export const gameRenderer = new GameRenderer();

window.addEventListener("load", () => {
	openModule("MainMenu");
});