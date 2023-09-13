// Copyright (c) Wictor Wilén. All rights reserved.
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.

const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');
// const ESLintPlugin = require('eslint-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

const path = require('path');
// const fs = require('fs');
const argv = require('yargs').argv;

const debug = argv.debug !== undefined;
// const lint = !(argv['no-linting'] || argv.l === true);

const resolve = {
  extensions: ['.ts', '.tsx', '.js'],
  alias: {},
  fallback: {
    http: require.resolve('stream-http'),
    https: require.resolve('https-browserify'),
    crypto: require.resolve('crypto-browserify'),
    buffer: require.resolve('buffer'),
    url: require.resolve('url'),
    stream: require.resolve('stream-http'),
    util: require.resolve('util'),
  },
};

const config = [
  {
    entry: {
      server: [path.join(__dirname, '/src/server/server.ts')],
    },
    mode: debug ? 'development' : 'production',
    output: {
      path: path.join(__dirname, '/dist'),
      filename: '[name].js',
      devtoolModuleFilenameTemplate: debug ? '[absolute-resource-path]' : '[]',
    },
    externals: [nodeExternals()],
    devtool: debug ? 'source-map' : 'source-map',
    resolve,
    target: 'node',
    node: {
      __dirname: false,
      __filename: false,
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          use: {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
            },
          },
        },
      ],
    },
    plugins: [
      new ForkTsCheckerWebpackPlugin({
        typescript: {
          configFile: './src/server/tsconfig.json',
        },
      }),
    ],
  },
  {
    entry: {
      client: [path.join(__dirname, '/src/client/client.ts')],
    },
    mode: debug ? 'development' : 'production',
    output: {
      path: path.join(__dirname, '/dist/web/scripts'),
      filename: '[name].js',
      libraryTarget: 'umd',
      library: 'vnuaSchedule',
      publicPath: '/scripts/',
    },
    externals: {},
    devtool: debug ? 'source-map' : 'source-map',
    resolve,
    target: 'web',
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          use: {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
            },
          },
        },
      ],
    },
    plugins: [
      new webpack.EnvironmentPlugin({
        PUBLIC_HOSTNAME: undefined,
        TAB_APP_ID: null,
        TAB_APP_URI: null,
      }),
      new ForkTsCheckerWebpackPlugin({
        typescript: {
          configFile: './src/client/tsconfig.json',
        },
      }),
    ],
    devServer: {
      hot: false,
      host: 'localhost',
      port: 9000,
      allowedHosts: 'all',
      client: {
        overlay: {
          warnings: false,
          errors: true,
        },
      },
      devMiddleware: {
        writeToDisk: true,
        stats: {
          all: false,
          colors: true,
          errors: true,
          warnings: true,
          timings: true,
          entrypoints: true,
        },
      },
    },
  },
];

// if (lint !== false) {
//     config[0].plugins.push(new ESLintPlugin({ extensions: ["ts", "tsx"], failOnError: false, lintDirtyModulesOnly: debug }));
//     config[1].plugins.push(new ESLintPlugin({ extensions: ["ts", "tsx"], failOnError: false, lintDirtyModulesOnly: debug }));
// }

module.exports = config;
