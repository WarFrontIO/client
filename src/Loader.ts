import {GameRenderer} from "./renderer/GameRenderer";
import {TileManager} from "./map/TileManager";
import {openMenu} from "./ui/ModuleLoader";

export const tileManager = new TileManager();
export const gameRenderer = new GameRenderer();

window.addEventListener("load", () => {
	openMenu("MainMenu");
});