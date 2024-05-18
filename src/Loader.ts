import {GameRenderer} from "./renderer/GameRenderer";
import {TileManager} from "./map/TileManager";
import {openMenu} from "./ui/ModuleLoader";
import {GameTheme, getTheme} from "./renderer/GameTheme";

export const tileManager = new TileManager();
export const gameRenderer = new GameRenderer();

window.addEventListener("load", () => {
	openMenu("MainMenu");
});

//TODO: Move this to user settings when implemented
export const theme : GameTheme = getTheme("pastel");
document.documentElement.classList.add("theme-pastel");