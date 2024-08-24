import {getSetting, registerSettingListener} from "../util/UserSettingManager";

const modules = new Map<string, HTMLDivElement>();
const moduleAdapters = new Map<string, ModuleAdapter>();
let openModules: string[] = [];

document.documentElement.classList.add("theme-" + getSetting("theme").id);

registerSettingListener("theme", (theme) => {
	document.documentElement.classList.remove("theme-" + getSetting("theme").id);
	document.documentElement.classList.add("theme-" + theme.id);
});

export function openModule(name: string) {
	const module = modules.get(name);
	if (module) {
		moduleAdapters.get(name)?.onOpen();
		module.style.display = "block";
		openModules.push(name);
	}
}

export function closeModule(name: string) {
	if (openModules.includes(name)) {
		const module = modules.get(name);
		if (module) {
			module.style.display = "none";
		}
		openModules = openModules.filter(item => item !== name);
	}
}

export function closeAllModules() {
	openModules.forEach(name => {
		const module = modules.get(name);
		if (module) {
			module.style.display = "none";
		}
	});
	openModules = [];
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