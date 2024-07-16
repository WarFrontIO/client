import {ModuleAdapter} from "../ModuleLoader";
import {openModule} from "../ModuleLoader";

export default {
	onOpen: () => {
		openModule("GameHud-TopBar");
	}
} as ModuleAdapter;