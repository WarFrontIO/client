import {handleAuthCallback} from "../network/NetworkAuthenticator";
import {showUIElement} from "../ui/UIManager";

//@module ui 1

const paths: Record<string, (params: URLSearchParams, path: string[]) => void> = {
	auth: handleAuthCallback
};

/**
 * Handle the current path.
 */
export function handlePath(): void {
	const path = window.location.pathname.match(/\/([^/]+)/);
	if (path === null || path[1] === undefined || !(path[1] in paths)) {
		window.history.replaceState(null, "", "/");
		showUIElement("MainMenu");
		return;
	}
	try {
		const params = new URLSearchParams(window.location.search);
		paths[path[1]](params, path.slice(2));
	} catch (e) {
		console.error(e);
		window.history.replaceState(null, "", "/");
		showUIElement("MainMenu");
	}
}

handlePath();