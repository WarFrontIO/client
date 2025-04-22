const fs = require("fs");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const HtmlInlineScriptPlugin = require("html-inline-script-webpack-plugin");
const UiModuleLoader = require("./scripts/WebpackUIModuleLoader");
const SourceMapFixer = require("./scripts/SourceMapFixer");
const Watchpack = require("watchpack");

function findModules(dir) {
	const modules = [];
	for (const file of fs.readdirSync(dir)) {
		const filePath = path.join(dir, file);
		if (fs.statSync(filePath).isDirectory()) {
			modules.push(...findModules(filePath));
		} else {
			if (file.endsWith(".ts")) {
				const content = fs.readFileSync(filePath, "utf8");
				const match = content.match(/\/\/[^\S\r\n]*@module (.+)(?: (-?\d+))?/)
				if (!match) continue;
				modules.push({path: path.relative("./", filePath).replace(/\\/g, "/").replace(/\.ts$/, ""), priority: match[2] || 0});
			}
		}
	}
	return modules;
}

fs.writeFileSync("./build/Loader.js", `window.addEventListener("load", () => {${findModules("./src").sort((a, b) => b.priority - a.priority)
	.map(file => `require("../${file.path}");`).join("")}});`);

module.exports = {
	entry: {
		main: "./build/Loader.js"
	},
	devtool: "source-map",
	output: {
		publicPath: "/",
		path: path.resolve(__dirname, './out'),
		filename: "[name]-bundle.js",
		sourceMapFilename: "[name].js.map"
	},
	resolve: {
		extensions: [".ts", ".js"],
	},
	module: {
		rules: [
			{
				test: /\.ts$/,
				use: ["ts-loader"]
			},
			{
				test: /\.ts$/,
				use: ["map-loader"],
				include: path.resolve(__dirname, "./src/map/MapRegistry.ts")
			},
			{
				test: /\.ts$/,
				use: ["theme-loader"],
				include: path.resolve(__dirname, "./src/renderer/GameTheme.ts")
			}
		]
	},
	resolveLoader: {
		alias: {
			"map-loader": path.resolve(__dirname, "./scripts/map-loader.js"),
			"theme-loader": path.resolve(__dirname, "./scripts/theme-loader.js")
		}
	},
	plugins: [new HtmlWebpackPlugin({
		template: "./src/template.html",
		cache: false
	}), new HtmlInlineScriptPlugin(), new UiModuleLoader(), new SourceMapFixer()],
	devServer: {
		hot: false,
		static: false,
		historyApiFallback: true,
		setupMiddlewares: (middlewares, devServer) => {
			const watcher = new Watchpack({aggregateTimeout: 1000});
			watcher.watch({directories: ["resources", "src/ui/element/static"], startTime: Date.now()});
			let forceNext = false;
			watcher.on("change", (file) => {
				const goal = path.resolve(__dirname, file.startsWith("resources\\maps") ? "src\\map\\MapRegistry.ts" : "src\\renderer\\GameTheme.ts");
				const watcher = devServer.compiler.watchFileSystem.watcher.fileWatchers.get(goal).watcher;
				if (watcher) {
					watcher.directoryWatcher.setFileTime(goal, Date.now());
					devServer.compiler.watchFileSystem.watcher.emit("change", goal, Date.now(), "dependency");
					devServer.compiler.watchFileSystem.watcher.emit("aggregated", new Set([goal]), new Set());
					forceNext = true;
				}
			});
			devServer.compiler.hooks.done.tap("extended-watcher", () => {
				if (forceNext && devServer.webSocketServer) {
					devServer.sendMessage(devServer.webSocketServer.clients, "static-changed", "index.html");
					forceNext = false;
				}
			});
			devServer.staticWatchers.push(watcher);
			return middlewares;
		},
	}
};