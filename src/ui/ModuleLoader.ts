import {getSetting, registerSettingListener} from "../util/UserSettingManager";

const modules = new Map<string, HTMLDivElement>();
const moduleAdapters = new Map<string, ModuleAdapter>();
let currentModule: string | null = null;

document.documentElement.classList.add("theme-" + getSetting("theme").id);

registerSettingListener("theme", (theme) => {
	document.documentElement.classList.remove("theme-" + getSetting("theme").id);
	document.documentElement.classList.add("theme-" + theme.id);
});

export function openMenu(name: string) {
	const module = modules.get(name);
	if (module) {
		closeMenu();
		moduleAdapters.get(name)!.onOpen();
		module.style.display = "block";
		currentModule = name;
	}
}

export function closeMenu() {
	if (currentModule) {
		modules.get(currentModule)!.style.display = "none";
		currentModule = null;
	}
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function registerModule(name: string, adapter: ModuleAdapter) {
	const element = document.getElementById(name) as HTMLDivElement;
	element.style.display = "none";
	modules.set(name, element);
	moduleAdapters.set(name, adapter ?? {onOpen: () => {}});
}

// The following lines are filled in by the build process
// BUILD_MODULE_REGISTER
// End of module register block

export type ModuleAdapter = {
	onOpen: () => void;
}