/* eslint-disable @typescript-eslint/no-var-requires */

const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const Dotenv = require('dotenv-webpack');
const BG_IMAGES_DIRNAME = 'bgimages';
const ASSET_PATH = process.env.ASSET_PATH || '/';
const BASENAME = ASSET_PATH.replace(/\/$/, '') || '';
/** HTML <base href>; must end with / when not root (GitLab Pages path_prefix). */
const BASE_HREF = ASSET_PATH === '/' ? '/' : ASSET_PATH.endsWith('/') ? ASSET_PATH : `${ASSET_PATH}/`;
const DESIGN_DIR_EXISTS = fs.existsSync(path.resolve(__dirname, '.design'));
const htmlTemplateParameters = { basePath: BASE_HREF };
module.exports = (env) => {
  return {
    module: {
      rules: [
        {
          test: /\.md$/,
          type: 'asset/source',
        },
        {
          test: /\.(tsx|ts|jsx)?$/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'ts-loader',
              options: {
                transpileOnly: true,
                experimentalWatchApi: true,
              },
            },
          ],
        },
        {
          test: /\.(svg|ttf|eot|woff|woff2)$/,
          type: 'asset/resource',
          // only process modules with this loader
          // if they live under a 'fonts' or 'pficon' directory
          include: [
            path.resolve(__dirname, 'node_modules/patternfly/dist/fonts'),
            path.resolve(__dirname, 'node_modules/@patternfly/react-core/dist/styles/assets/fonts'),
            path.resolve(__dirname, 'node_modules/@patternfly/react-core/dist/styles/assets/pficon'),
            path.resolve(__dirname, 'node_modules/@patternfly/patternfly/assets/fonts'),
            path.resolve(__dirname, 'node_modules/@patternfly/patternfly/assets/pficon'),
          ],
        },
        {
          test: /\.svg$/,
          type: 'asset/inline',
          include: (input) => input.indexOf('background-filter.svg') > 1,
        },
        {
          test: /\.svg$/,
          // only process SVG modules with this loader if they live under a 'bgimages' directory
          // this is primarily useful when applying a CSS background using an SVG
          include: (input) => input.indexOf(BG_IMAGES_DIRNAME) > -1,
          type: 'asset/inline',
        },
        {
          test: /\.svg$/,
          // only process SVG modules with this loader when they don't live under a 'bgimages',
          // 'fonts', or 'pficon' directory, those are handled with other loaders
          include: (input) =>
            input.indexOf(BG_IMAGES_DIRNAME) === -1 &&
            input.indexOf('fonts') === -1 &&
            input.indexOf('background-filter') === -1 &&
            input.indexOf('pficon') === -1,
          use: {
            loader: 'raw-loader',
            options: {},
          },
        },
        {
          test: /\.(jpg|jpeg|png|gif)$/i,
          include: [
            path.resolve(__dirname, 'src'),
            path.resolve(__dirname, 'node_modules/patternfly'),
            path.resolve(__dirname, 'node_modules/@patternfly/patternfly/assets/images'),
            path.resolve(__dirname, 'node_modules/@patternfly/react-styles/css/assets/images'),
            path.resolve(__dirname, 'node_modules/@patternfly/react-core/dist/styles/assets/images'),
            path.resolve(
              __dirname,
              'node_modules/@patternfly/react-core/node_modules/@patternfly/react-styles/css/assets/images'
            ),
            path.resolve(
              __dirname,
              'node_modules/@patternfly/react-table/node_modules/@patternfly/react-styles/css/assets/images'
            ),
            path.resolve(
              __dirname,
              'node_modules/@patternfly/react-inline-edit-extension/node_modules/@patternfly/react-styles/css/assets/images'
            ),
          ],
          // Use 'asset' instead of 'asset/inline' so large images become separate files
          // rather than being base64-inlined into the JS bundle
          type: 'asset',
          parser: {
            dataUrlCondition: {
              maxSize: 8 * 1024, // 8 KB — inline only small images
            },
          },
        },
      ],
    },
    optimization: {
      splitChunks: {
        chunks: 'all',
        maxInitialRequests: 10,
        cacheGroups: {
          patternfly: {
            test: /[\\/]node_modules[\\/]@patternfly[\\/]/,
            name: 'vendor-patternfly',
            priority: 20,
          },
          charts: {
            test: /[\\/]node_modules[\\/](victory|echarts|echarts-for-react|zrender)[\\/]/,
            name: 'vendor-charts',
            priority: 15,
          },
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: 10,
          },
        },
      },
    },
    output: {
      filename: '[name].[contenthash:8].bundle.js',
      path: path.resolve(__dirname, 'dist'),
      publicPath: ASSET_PATH,
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, 'src', 'index.html'),
        templateParameters: htmlTemplateParameters,
      }),
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, 'src', 'index.html'),
        filename: '404.html',
        templateParameters: htmlTemplateParameters,
      }),
      new Dotenv({
        systemvars: true,
        silent: true,
      }),
      new CopyPlugin({
        patterns: [
          { from: './src/favicon.png', to: 'images' },
          { from: './src/lib/tracker.js', to: 'lib' },
          { from: './public/fork-descriptions.json', to: 'fork-descriptions.json', noErrorOnMissing: true },
          { from: './public/forks.json', to: 'forks.json', noErrorOnMissing: true },
          { from: './_headers', noErrorOnMissing: true },
          { from: './.design/personas/*.png', to: 'images/personas/[name][ext]', noErrorOnMissing: true },
        ],
      }),
      new webpack.DefinePlugin({
        'process.env.PUBLIC_PATH': JSON.stringify(BASENAME),
        'process.env.SUMMARIZE_API_URL': JSON.stringify(process.env.SUMMARIZE_API_URL || ''),
        'process.env.HAS_DESIGN_DATA': JSON.stringify(DESIGN_DIR_EXISTS ? 'true' : 'false'),
      }),
    ],
    resolve: {
      extensions: ['.js', '.ts', '.tsx', '.jsx'],
      plugins: [
        new TsconfigPathsPlugin({
          configFile: path.resolve(__dirname, './tsconfig.json'),
        }),
      ],
      symlinks: false,
      cacheWithContext: false,
    },
  };
};
