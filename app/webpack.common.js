'use strict'

const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const webpack = require('webpack')
const merge = require('webpack-merge')

const devClientId = 'b1a3601b8940d46bc1e3'
const devClientSecret = '3344c2b0b92df4d1cbf768b50708b27a199f6a14'

const environment = process.env.NODE_ENV || 'development'

const replacements = {
  __OAUTH_CLIENT_ID__: JSON.stringify(process.env.DESKTOP_OAUTH_CLIENT_ID || devClientId),
  __OAUTH_SECRET__: JSON.stringify(process.env.DESKTOP_OAUTH_CLIENT_SECRET || devClientSecret),
  __DARWIN__: process.platform === 'darwin',
  __WIN32__: process.platform === 'win32',
  __DEV__: environment === 'development',
  __RELEASE_ENV__: JSON.stringify(environment),
  'process.platform': JSON.stringify(process.platform),
  'process.env.NODE_ENV': JSON.stringify(environment),
  'process.env.TEST_ENV': JSON.stringify(process.env.TEST_ENV),
}

const outputDir = 'out'

const commonConfig = {
  externals: [ '7zip' ],
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, '..', outputDir),
    libraryTarget: 'commonjs2'
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        include: path.resolve(__dirname, 'src'),
        use: [
          {
            loader: 'awesome-typescript-loader',
            options: {
              useBabel: true,
              useCache: true,
            },
          }
        ],
        exclude: /node_modules/,
      },
      {
        test: /\.node$/,
        use: [
          { loader: 'node-native-loader', options: { name: "[name].[ext]" } }
        ],
      }
    ],
  },
  plugins: [
    new CleanWebpackPlugin([ outputDir ], { verbose: false }),
    // This saves us a bunch of bytes by pruning locales (which we don't use)
    // from moment.
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    new webpack.NoEmitOnErrorsPlugin(),
  ],
  resolve: {
    extensions: [ '.js', '.ts', '.tsx' ],
    modules: [ path.resolve(__dirname, 'node_modules/') ],
  },
  node: {
    __dirname: false,
    __filename: false
  },
}

const mainConfig = merge({}, commonConfig, {
  entry: { main: path.resolve(__dirname, 'src/main-process/main') },
  target: 'electron-main',
  plugins: [
    new webpack.DefinePlugin(Object.assign({ }, replacements, { '__PROCESS_KIND__': JSON.stringify('main') })),
  ]
})

const rendererConfig = merge({}, commonConfig, {
  entry: { renderer: path.resolve(__dirname, 'src/ui/index') },
  target: 'electron-renderer',
  module: {
    rules: [
      {
        test: /\.(jpe?g|png|gif|ico)$/,
        use: ['file?name=[path][name].[ext]']
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      'template': path.join(__dirname, 'static', 'index.html'),
      'chunks': ['renderer']
    }),
    new webpack.DefinePlugin(Object.assign({ }, replacements, { '__PROCESS_KIND__': JSON.stringify('ui') })),
  ],
})

const sharedConfig = merge({}, commonConfig, {
  entry: { shared: path.resolve(__dirname, 'src/shared-process/index') },
  target: 'electron-renderer',
  plugins: [
    new HtmlWebpackPlugin({
      'template': path.join(__dirname, 'static', 'error.html'),
      // without this we overwrite index.html
      'filename': 'error.html',
      // we don't need any scripts to run on this page
      'excludeChunks': [ 'main', 'renderer', 'shared', 'ask-pass' ]
    }),
    new HtmlWebpackPlugin({
      'filename': 'shared.html',
      'chunks': ['shared']
    }),
    new webpack.DefinePlugin(Object.assign({ }, replacements, { '__PROCESS_KIND__': JSON.stringify('shared') })),
  ],
})

const askPassConfig = merge({}, commonConfig, {
  entry: { 'ask-pass': path.resolve(__dirname, 'src/ask-pass/main') },
  target: 'node',
  plugins: [
    new webpack.DefinePlugin(Object.assign({ }, replacements, { '__PROCESS_KIND__': JSON.stringify('askpass') })),
  ]
})

const crashConfig = merge({}, commonConfig, {
  entry: { crash: path.resolve(__dirname, 'src/crash/index') },
  target: 'electron-renderer',
  plugins: [
    new HtmlWebpackPlugin({
      title: 'GitBurn',
      filename: 'crash.html',
      chunks: ['crash']
    }),
    new webpack.DefinePlugin(Object.assign({ }, replacements, { '__PROCESS_KIND__': JSON.stringify('crash') })),
  ],
})

module.exports = {
  main: mainConfig,
  shared: sharedConfig,
  renderer: rendererConfig,
  askPass: askPassConfig,
  crash: crashConfig,
  replacements: replacements,
  externals: commonConfig.externals,
}
