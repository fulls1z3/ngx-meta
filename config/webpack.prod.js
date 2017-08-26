const helpers = require('./helpers');

const checkerPlugin = require('awesome-typescript-loader').CheckerPlugin,
  contextReplacementPlugin = require('webpack/lib/ContextReplacementPlugin'),
  loaderOptionsPlugin = require('webpack/lib/LoaderOptionsPlugin'),
  uglifyJsPlugin = require('webpack/lib/optimize/UglifyJsPlugin');

module.exports = (group, item, settings) => {
  return {
    entry: helpers.root(`packages/${group}/${item}/index.ts`),
    resolve: {
      extensions: ['.ts', '.js']
    },
    output: {
      path: helpers.root(`packages/${group}/${item}/bundles`),
      publicPath: '/',
      filename: `${item}.umd.min.js`,
      libraryTarget: 'umd',
      library: group.replace(/@/g, '')
    },
    externals: [/^@angular\//, /^rxjs\//, /^lodash/],
    module: {
      rules: [
        {
          enforce: 'pre',
          test: /\.ts$/,
          use: 'tslint-loader',
          exclude: [helpers.root('node_modules')]
        },
        {
          test: /\.ts$/,
          use: `awesome-typescript-loader?declaration=false&configFileName=${helpers.root(`packages/${group}/${item}/tsconfig.json`)}`,
          exclude: [/\.(spec|e2e)\.ts$/]
        }
      ]
    },
    plugins: [
      new checkerPlugin(),
      new contextReplacementPlugin(
        // fix the warning in ./~/@angular/core/src/linker/system_js_ng_module_factory_loader.js
        settings.angularVersion === 2
          ? /angular([\\\/])core([\\\/])(esm([\\\/])src|src)([\\\/])linker/
          : /angular([\\\/])core([\\\/])@angular/,
        helpers.root(`packages/${group}/${item}/src`)
      ),
      new loaderOptionsPlugin({
        options: {
          tslint: {
            failOnHint: false
          }
        }
      }),
      new uglifyJsPlugin({
        beautify: false,
        output: {
          comments: false
        },
        mangle: {
          screw_ie8: true
        },
        compress: {
          screw_ie8: true,
          warnings: false,
          conditionals: true,
          unused: true,
          comparisons: true,
          sequences: true,
          dead_code: true,
          evaluate: true,
          if_return: true,
          join_vars: true,
          negate_iife: false // we need this for lazy v8
        }
      })
    ],
    node: {
      global: true,
      crypto: 'empty',
      fs: 'empty',
      process: false,
      module: false,
      clearImmediate: false,
      setImmediate: false
    }
  };
};
