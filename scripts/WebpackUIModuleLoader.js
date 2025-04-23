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
				for (const file of readdirSync("src/ui/element/static")) {
					if (!file.endsWith(".html")) continue;
					data.bodyTags.push({
						tagName: "div",
						attributes: {
							id: file.replace(".html", ""),
							style: "display: none"
						},
						innerHTML: readFileSync("src/ui/element/static/" + file, "utf8").replace(/<ignore>.*?<\/ignore>/gs, "")
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
	let variableCounter = 0;
	const globalRemapped = new Set();

	for (let i = 0; i < files.length; i++) {
		const root = findBlock(files[i], ":root");
		for (let j = 0; j < root.length; j++) {
			files[i] = files[i].replace(root[j], extractInner(root[j]));
		}

		const rootVars = files[i].match(/--[^:)]+/g);

		if (rootVars) {
			for (const rootVar of new Set(rootVars)) {
				if (i === 0) {
					for (let k = 0; k < files.length; k++) {
						files[k] = files[k].replace(new RegExp(`--${variableCounter}(?=\\s*[:)])`, "g"), `--g-${variableCounter}`);
						files[k] = files[k].replace(new RegExp(`${rootVar}(?=\\s*[:)])`, "g"), `--${variableCounter}`);
					}
					globalRemapped.add(`--${variableCounter}`);
					variableCounter++;
				} else if (!globalRemapped.has(rootVar)) {
					files[i] = files[i].replace(new RegExp(`${rootVar}(?=\\s*[:)])`, "g"), `--${variableCounter++}`);
				}
			}
		}
	}

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

		const fontFace = findBlock(files[i], "@font-face", true);
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

function findBlock(content, block, includeGlobal = false) {
	let results = [];
	let depth = 0;
	let start = -1;
	let startDepth = 0;
	for (let i = 0; i < content.length; i++) {
		if (content.slice(i, i + block.length) === block && (depth === 1 || includeGlobal && depth === 0)) {
			start = i;
			startDepth = depth;
		} else if (content[i] === "{") {
			depth++;
		} else if (content[i] === "}") {
			depth--;
			if (depth === startDepth && start !== -1) {
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