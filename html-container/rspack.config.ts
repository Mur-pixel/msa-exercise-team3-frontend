import * as path from "node:path";
import { defineConfig } from "@rspack/cli";
import { rspack } from "@rspack/core";
import * as RefreshPlugin from "@rspack/plugin-react-refresh";
import { ModuleFederationPlugin } from "@module-federation/enhanced/rspack";

import { mfConfig } from "./module-federation.config";

const isDev = process.env.NODE_ENV === "development";
const targets = ["chrome >= 87", "edge >= 88", "firefox >= 78", "safari >= 14"];

export default defineConfig({
  context: __dirname,
  entry: { main: "./src/index.ts" },
  resolve: { extensions: ["...", ".ts", ".tsx", ".jsx"] },

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
      },
      {
        // 💡 정확 매칭: /review 또는 /review/** 만 백엔드로 보냄
        // (그래서 /reviews 는 프론트 라우터가 처리)
        context: (pathname: string) =>
            pathname === "/review" || pathname.startsWith("/review/"),
        target: "http://localhost:7777",
        changeOrigin: true,
      },
      {
        context: ["/auth", "/place"],
        target: "http://localhost:7777",
        changeOrigin: true,
      },
      { context: ["/account"], target: "http://127.0.0.1:7777", changeOrigin: true },
    ],
  },

  output: {
    uniqueName: "html_container",
    publicPath: "http://localhost:5000/",
    crossOriginLoading: "anonymous",
  },

  experiments: { css: true },

  module: {
    rules: [
      {
        test: /\.(png|jpe?g|gif|webp|svg)$/i,
        type: "asset/resource",
        generator: { filename: "assets/[name].[hash][ext]" }
      },
      { test: /\.svg$/, type: "asset" },
      { test: /\.css$/, use: ["postcss-loader"], type: "css" },
      {
        test: /\.(jsx?|tsx?)$/,
        use: [
          {
            loader: "builtin:swc-loader",
            options: {
              jsc: {
                parser: { syntax: "typescript", tsx: true },
                transform: { react: { runtime: "automatic", development: isDev, refresh: isDev } },
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
    new rspack.DefinePlugin({
      "import.meta.env.VITE_API_ORIGIN": JSON.stringify(process.env.VITE_API_ORIGIN || "http://127.0.0.1:7777"),
      "import.meta.env.VITE_KAKAO_START_PATH": JSON.stringify(process.env.VITE_KAKAO_START_PATH || "/account/kakao-authentication/start"),
    }),
    isDev ? new RefreshPlugin() : null,
  ].filter(Boolean),

  optimization: {
    minimizer: [
      new rspack.SwcJsMinimizerRspackPlugin(),
      new rspack.LightningCssMinimizerRspackPlugin({ minimizerOptions: { targets } }),
    ],
  },
  devtool: isDev ? "source-map" : false,
});
