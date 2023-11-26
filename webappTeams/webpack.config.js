// Copyright (c) Wictor Wilén. All rights reserved.
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.

const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

const path = require('path');
const argv = require('yargs').argv;

const debug = argv.debug !== undefined;

const resolve = {
    extensions: ['.ts', '.tsx', '.js'],
    alias: {}
};

const polyfillPlugins = [
    new NodePolyfillPlugin(),
];

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
            // ...polyfillPlugins,
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
                API_URL: null,
                OAUTH_CLIENT_ID: null,
                OAUTH_CLIENT_SECRET: null,
                OAUTH_TENANT_ID: null,
                OAUTH_SCOPES: null,
                OAUTH_AUTHORITY: null,
                GRAPH_API_BASE_URL: null,
            }),
            new ForkTsCheckerWebpackPlugin({
                typescript: {
                    configFile: './src/client/tsconfig.json',
                },
            }),
            ...polyfillPlugins,
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

module.exports = config;
