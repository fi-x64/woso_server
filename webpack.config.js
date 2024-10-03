const path = require("path");
const nodeExternals = require("webpack-node-externals");
const webpack = require("webpack"); // only add this if you don't have yet
// replace accordingly './.env' with the path of your .env file
require("dotenv").config({ path: "./.env" });

module.exports = {
  target: "node",
  entry: "./server.js",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
  },
  externals: [nodeExternals()],
  mode: "production",
  plugins: [
    new webpack.DefinePlugin({
      "process.env": JSON.stringify(process.env),
    }),
  ],
};
