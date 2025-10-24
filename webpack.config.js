const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/app.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js',
    // Use a relative public path so assets are referenced relative to index.html.
    // This avoids issues when the site is served from a subpath (GitHub Pages).
    publicPath: './',
    libraryTarget: 'umd',
    library: 'ClickerGameEngine'
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  devServer: {
    port: 3000,
    hot: true,
    open: true
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
      // Inject scripts at the end of the body and minify when building for production.
      inject: 'body',
      minify: {
        minifyCSS: true,
        minifyJS: true
      }
    })
  ]
};
