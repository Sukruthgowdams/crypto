const path = require('path');
const webpack = require('webpack');

module.exports = {
    entry: 'C:\\Users\\sukru\\OneDrive\\Desktop\\cryp\\src\\script.js', // Entry point of your application
    output: {
        filename: 'bundle.js', // Output bundle file
        path: path.resolve(__dirname, 'dist'), // Output directory
    },
    resolve: {
        fallback: {
            stream: require.resolve('stream-browserify'), // Polyfill for 'stream'
            crypto: require.resolve('crypto-browserify'), // Polyfill for 'crypto'
            buffer: require.resolve('buffer/'), // Polyfill for 'buffer'
            util: require.resolve('util/'), // Polyfill for 'util'
            assert: require.resolve('assert/'), // Polyfill for 'assert'
            http: require.resolve('stream-http'), // Polyfill for 'http'
            https: require.resolve('https-browserify'), // Polyfill for 'https'
            os: require.resolve('os-browserify/browser'), // Polyfill for 'os'
            url: require.resolve('url/'), // Polyfill for 'url'
        },
    },
    plugins: [
        new webpack.ProvidePlugin({
            process: 'process/browser', // Polyfill for 'process'
            Buffer: ['buffer', 'Buffer'], // Polyfill for 'Buffer'
        }),
    ],
    mode: 'development', // Set to 'production' for production builds
};