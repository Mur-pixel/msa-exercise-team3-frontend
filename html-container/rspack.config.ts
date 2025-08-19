import * as path from "node:path";
import { defineConfig } from "@rspack/cli";
import { rspack } from "@rspack/core";
import * as RefreshPlugin from "@rspack/plugin-react-refresh";
import { ModuleFederationPlugin } from "@module-federation/enhanced/rspack";


import { mfConfig } from "./module-federation.config";

const isDev = process.env.NODE_ENV === "development";

// Target browsers, see: https://github.com/browserslist/browserslist
const targets = ["chrome >= 87", "edge >= 88", "firefox >= 78", "safari >= 14"];

export default defineConfig({
  context: __dirname,
  entry: {
    main: "./src/index.ts",
  },
  resolve: {
    extensions: ["...", ".ts", ".tsx", ".jsx"],
  },

  devServer: {
    port: 5000,
    historyApiFallback: true,
    watchFiles: [path.resolve(__dirname, "src")],
    headers: { "Access-Control-Allow-Origin": "*" },
    proxy: [
      {
        context: ["/navapp"],
        target: "http://localhost:5001",
        changeOrigin: true,
        pathRewrite: { "^/navapp": "" },
        // secure: false,                         // (HTTPS 리모트라면 필요)
        // logLevel: "debug",                     // (문제시 디버깅용)
      },
      {
        context: ["/auth", "/account", "/place"],
        target: "http://localhost:7777", // 백엔드 포트
        changeOrigin: true,
        // 백엔드가 '/api' prefix가 **없다면** 주석 해제:
        // pathRewrite: { "^/api": "" },
      },
    ],
  },
  output: {
    // You need to set a unique value that is not equal to other applications
    uniqueName: "html_container",
    // publicPath must be configured if using manifest
    publicPath: "http://localhost:5000/",
    crossOriginLoading: "anonymous",
  },

  experiments: {
    css: true,
  },

  module: {
    rules: [
      {
        test: /\.(png|jpe?g|gif|webp|svg)$/i,
        type: "asset/resource",                // 파일을 출력하고 URL을 반환
        generator: {
          filename: "assets/[name].[hash][ext]" // 출력 경로/이름
        }
      },
      {
        test: /\.svg$/,
        type: "asset",
      },
      {
        test: /\.css$/,
        use: ["postcss-loader"],
        type: "css",
      },
      {
        test: /\.(jsx?|tsx?)$/,
        use: [
          {
            loader: "builtin:swc-loader",
            options: {
              jsc: {
                parser: {
                  syntax: "typescript",
                  tsx: true,
                },
                transform: {
                  react: {
                    runtime: "automatic",
                    development: isDev,
                    refresh: isDev,
                  },
                },
              },
              env: { targets },
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new rspack.HtmlRspackPlugin({ template: "./index.html" }),
    new ModuleFederationPlugin(mfConfig),
    isDev ? new RefreshPlugin() : null,
  ].filter(Boolean),

  optimization: {
    minimizer: [
      new rspack.SwcJsMinimizerRspackPlugin(),
      new rspack.LightningCssMinimizerRspackPlugin({
        minimizerOptions: { targets },
      }),
    ],
  },
  devtool: isDev ? "source-map" : false,
});
