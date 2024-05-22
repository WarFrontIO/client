const HtmlWebpackPlugin = require("html-webpack-plugin");
const {readdirSync, readFileSync} = require("fs");

class WebpackUIModuleLoader {
	// noinspection JSUnusedGlobalSymbols
	apply(compiler) {
		compiler.hooks.compilation.tap("UiModuleLoader", (compilation) => {
			HtmlWebpackPlugin.getHooks(compilation).alterAssetTagGroups.tapAsync("UiModuleLoader", (data, cb) => {
				console.log("Injecting UI modules...");
				if (!data.bodyTags) data.bodyTags = [];
				for (const file of readdirSync("src/ui/modules")) {
					if (!file.endsWith(".html")) continue;
					data.bodyTags.push({
						tagName: "div",
						attributes: {
							id: file.replace(".html", "")
						},
						innerHTML: readFileSync("src/ui/modules/" + file, "utf8").replace(/<ignore>.*?<\/ignore>/gs, "")
					});
				}

				//Inject CSS files
				const css = [];
				for (const file of readdirSync("resources/themes")) {
					if (!file.endsWith(".css")) continue;
					const content = readFileSync("resources/themes/" + file, "utf8").replace(/\/\*.*?\*\//gs, "").replace(/\s+/g, " ");
					css.push(`.theme-${file.replace(".css", "")} { ${content} }`);
				}

				if (!data.headTags) data.headTags = [];
				data.headTags.push({
					tagName: "style",
					attributes: {
						type: "text/css"
					},
					innerHTML: processCssFiles(css)
				});

				cb(null, data);
			});
		});
	}
}

function processCssFiles(files) {
	const variables = {};
	for (let i = 0; i < files.length; i++) {
		const file = files[i];
		const resources = file.match(/url\((.*?)\)/g);
		if (resources) {
			for (const resource of resources) {
				let url = resource.slice(4, -1);
				if (url.startsWith("'") || url.startsWith("\"")) {
					url = url.slice(1, -1);
				}
				if (variables[url]) {
					files[i] = files[i].replace(resource, `var(--${variables[url]})`);
				} else {
					const name = `res-${Object.keys(variables).length}`;
					variables[url] = name;
					files[i] = files[i].replace(resource, `var(--${name})`);
				}
			}
		}
	}

	const css = files.join("\n");
	const vars = Object.entries(variables).map(([url, name]) => `--${name}: url(data:image/png;base64,${readFileSync("./" + url).toString("base64")});`).join(" ");
	return `:root { ${vars} } ${css}`;
}

module.exports = WebpackUIModuleLoader;