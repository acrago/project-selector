/* eslint-disable @typescript-eslint/no-var-requires */

const path = require('path');
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const { stylePaths } = require('./stylePaths');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserJSPlugin = require('terser-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');

module.exports = (env = {}) => {
  const skipSourceMap = !!env.nosourcemap;
  const skipMinify = !!env.nominify;

  return merge(common('production'), {
    mode: 'production',
    devtool: skipSourceMap ? false : 'source-map',
    optimization: skipMinify ? { minimize: false } : {
      minimizer: [
        new TerserJSPlugin({}),
        new CssMinimizerPlugin({
          minimizerOptions: {
            preset: ['default', { mergeLonghand: false }],
          },
        }),
      ],
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: '[name].[contenthash:8].css',
        chunkFilename: '[name].bundle.[contenthash:8].css',
      }),
      ...(skipMinify ? [] : [
        new CompressionPlugin({
          algorithm: 'gzip',
          test: /\.(js|css|html|svg)$/,
          threshold: 1024,
          minRatio: 0.8,
        }),
      ]),
    ],
    module: {
      rules: [
        {
          test: /\.css$/,
          include: [...stylePaths],
          use: [MiniCssExtractPlugin.loader, 'css-loader'],
        },
      ],
    },
  });
};
