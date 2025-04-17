const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  mode: "development",
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js",
    publicPath: "/webintermediate-submission2/",
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      // Tambahkan rule jika kamu punya file lain, seperti gambar, font, dll.
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: "./src/index.html", // Menggunakan template dari src/index.html
      filename: "index.html", // Pastikan output-nya tetap index.html
      inject: true,
    }),
    // Menyalin file statis (manifest.json, sw.js, dll) ke docs/
    new CopyPlugin({
      patterns: [
        { from: "src/manifest.json", to: "manifest.json" },
        { from: "src/sw.js", to: "sw.js" },
        { from: "src/icons", to: "icons" }, // Menyalin folder icons
      ],
    }),
  ],
  devServer: {
    static: path.join(__dirname, "docs"), // Ganti static path ke docs
    compress: true,
    port: 8080,
    open: true,
    hot: true,
    historyApiFallback: true, // Untuk SPA agar navigasi tetap berfungsi
  },
  devtool: "source-map", // Source map untuk debugging
};
