const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const HtmlInlineScriptPlugin = require("html-inline-script-webpack-plugin");
const UiModuleLoader = require("./scripts/WebpackUIModuleLoader");
const SourceMapFixer = require("./scripts/SourceMapFixer");

module.exports = {
	entry: {
		main: "./src/Loader.ts"
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
				use: ["menu-loader"],
				include: path.resolve(__dirname, "./src/ui/ModuleLoader.ts")
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
			"menu-loader": path.resolve(__dirname, "./scripts/menu-loader.js"),
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
		historyApiFallback: true
	}
};