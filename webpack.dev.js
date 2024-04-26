const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const HtmlInlineScriptPlugin = require("html-inline-script-webpack-plugin");

module.exports = {
	mode: "development",
	entry: {
		main: "./src/Loader.ts"
	},
	output: {
		publicPath: "/",
		path: path.resolve(__dirname, './out'),
		filename: "[name]-bundle.js"
	},
	resolve: {
		extensions: [".ts"],
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
			}
		]
	},
	resolveLoader: {
		alias: {
			"map-loader": path.resolve(__dirname, "./scripts/map-loader.js")
		}
	},
	plugins: [new HtmlWebpackPlugin({
		template: "./src/template.html"
	}), new HtmlInlineScriptPlugin()]
};