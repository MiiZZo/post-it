const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");
const nodeExternals = require('webpack-node-externals');
const Dotenv = require('dotenv-webpack');

const makeConfig = (entry, output, isServer) => {
  const name = isServer ? "server" : "client";
  const target = isServer ? "node" : "web";
  const externals = [];
  const plugins = [
    new Dotenv()
  ];

  if (isServer) {
    externals.push(nodeExternals());
  } else {
    plugins.push(
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, "./src/client/index.html")
      })
    );
  }

  return {
    name,
    target,
    entry,
    output: {
      ...output,
      clean: true
    },
    externals,
    plugins,
    resolve: {
      alias: {
        common: path.resolve(__dirname, "./src/common"),
        client: path.resolve(__dirname, "./src/client")
      },
      extensions: [".js", ".ts", ".tsx"]
    },
    module: {
      rules: [
        {
          test: /.tsx?$/,
          use: ["ts-loader"],
          exclude: /node_modules/
        }
      ]
    }
  }
} 

const serverInputPath = path.resolve(__dirname, "./src/server/index.ts");
const serverOutputPath = path.resolve(__dirname, "./dist/server");

const clientInputPath = path.resolve(__dirname, "./src/client/index.tsx");
const clientOutputPath = path.resolve(__dirname, "./dist/client");

module.exports = [
  makeConfig(serverInputPath, {
    path: serverOutputPath
  }, true),
  makeConfig(clientInputPath, {
    filename: "js/bundle.js",
    path: clientOutputPath
  }, false),
];
