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

                console.log("Injecting HUD elements...");
                for (const file of readdirSync("src/hud/elements")) {
                    if (!file.endsWith(".html")) continue;
                    data.bodyTags.push({
                        tagName: "div",
                        attributes: {
                            id: file.replace(".html", ""),
                            style: "display: none;"
                        },
                        innerHTML: readFileSync("src/hud/elements/" + file, "utf8").replace(/<ignore>.*?<\/ignore>/gs, "")
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
					innerHTML: css.join("\n")
				});

				cb(null, data);
			});
		});
	}
}

module.exports = WebpackUIModuleLoader;