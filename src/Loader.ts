import {TileManager} from "./map/TileManager";
import {openMenu} from "./ui/ModuleLoader";

export const tileManager = new TileManager();

window.addEventListener("load", () => {
	openMenu("MainMenu");
});