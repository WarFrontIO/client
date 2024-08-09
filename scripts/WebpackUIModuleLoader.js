const HtmlWebpackPlugin = require("html-webpack-plugin");
const {readdirSync, readFileSync} = require("fs");
const {lookup} = require("mrmime");

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
				const css = [readFileSync("resources/base.css", "utf8").replace(/\/\*.*?\*\//gs, "").replace(/\s+/g, " ")];
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
		let file = files[i];

		file = file.replace(/@import [^;]+;/g, "");

		//const resources = file.match(/url\((.*?)\)/g);
		const resources = file.match(/(?<!@font-face\s*{[^{]*src:\s*)url\((.*?)\)/g);
		if (resources) {
			for (const resource of resources) {
				let url = resource.slice(4, -1);
				if (url.startsWith("'") || url.startsWith("\"")) {
					url = url.slice(1, -1);
				}
				if (variables[url]) {
					file = file.replace(resource, `var(--${variables[url]})`);
				} else {
					const name = `res-${Object.keys(variables).length}`;
					variables[url] = name;
					file = file.replace(resource, `var(--${name})`);
				}
			}
		}

		files[i] = file;
	}

	let vars = Object.entries(variables).map(([url, name]) => `--${name}: url(data:${lookup(url)};base64,${readFileSync("./" + url).toString("base64")});`).join(" ");
	let variableCounter = 0;

	for (let i = 0; i < files.length; i++) {
		const root = findBlock(files[i], ":root");
		for (let j = 0; j < root.length; j++) {
			files[i] = files[i].replace(root[j], "");
			const rootVars = root[j].match(/--[^:]+:[^;]+;/g);

			if (rootVars) {
				for (const rootVar of rootVars) {
					const [name, value] = rootVar.split(":");
					root[j] = root[j].replace(rootVar, `--${variableCounter}: ${value}`);
					files[i] = files[i].replace(new RegExp(`var\\(\\s*${name}\\s*\\)`, "g"), `var(--${variableCounter++})`);
				}
			}
			vars += extractInner(root[j]).replace(/\s+/g, " ");
		}
	}

	let globalScope = [];
	for (let i = 0; i < files.length; i++) {
		const simpleAt = findBlock(files[i], "@media").concat(findBlock(files[i], "@supports"));
		for (let j = 0; j < simpleAt.length; j++) {
			files[i] = files[i].replace(simpleAt[j], "");
			globalScope.push(simpleAt[j].replace(extractInner(simpleAt[j]), files[i].match(/\.theme-[^{}\s]+/) + " { " + extractInner(simpleAt[j]) + " }"));
		}

		let identifierRules = [["@keyframes", "animation-name"], ["@counter-style", "list-style"]];
		for (const [identifier, property] of identifierRules) {
			const identifiers = findBlock(files[i], identifier);
			for (let j = 0; j < identifiers.length; j++) {
				files[i] = files[i].replace(identifiers[j], "");
				const name = identifiers[j].match(new RegExp(`${identifier}\\s+([^\\s{]+)`))[1];
				globalScope.push(identifiers[j].replace(name, `a${variableCounter}`));
				files[i] = files[i].replace(new RegExp(`${property}:\\s*${name}`, "g"), `${property}: a${variableCounter++}`);
			}
		}

		const fontFace = findBlock(files[i], "@font-face");
		for (let j = 0; j < fontFace.length; j++) {
			const fontFiles = fontFace[j].match(/url\((.*?)\)/g);
			files[i] = files[i].replace(fontFace[j], "");
			if (fontFiles) {
				for (let k = 0; k < fontFiles.length; k++) {
					let url = fontFiles[k].slice(4, -1);
					if (url.startsWith("'") || url.startsWith("\"")) {
						url = url.slice(1, -1);
					}
					fontFace[j] = fontFace[j].replace(fontFiles[k], `url(data:${lookup(url)};base64,${readFileSync("./" + url).toString("base64")});`);
				}
			}
			globalScope.push(fontFace[j]);
		}
	}

	return `:root { ${vars} } ${globalScope.join(" ")} ${files.join("\n")}`;
}

function findBlock(content, block) {
	let results = [];
	let depth = 0;
	let start = -1;
	for (let i = 0; i < content.length; i++) {
		if (content.slice(i, i + block.length) === block && depth === 1) {
			start = i;
		} else if (content[i] === "{") {
			depth++;
		} else if (content[i] === "}") {
			depth--;
			if (depth === 1 && start !== -1) {
				results.push(content.slice(start, i + 1));
				start = -1;
			}
		}
	}
	return results;
}

function extractInner(block) {
	return block.slice(block.indexOf("{") + 1, block.lastIndexOf("}")).trim();
}

module.exports = WebpackUIModuleLoader;