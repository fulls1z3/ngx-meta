const helpers = require('./helpers');

const contextReplacementPlugin = require('webpack/lib/ContextReplacementPlugin'),
  loaderOptionsPlugin = require('webpack/lib/LoaderOptionsPlugin');

module.exports = (group, item, settings) => {
  return {
    devtool: 'inline-source-map',
    resolve: {
      extensions: ['.ts', '.js'],
      modules: [
        helpers.root(`packages/${group}/${item}/src`),
        helpers.root(`packages/${group}/${item}/node_modules`),
        helpers.root('node_modules')
      ]
    },
    module: {
      rules: [
        {
          enforce: 'pre',
          test: /\.js$/,
          use: 'source-map-loader',
          exclude: [
            // these packages have problems with their sourcemaps
            helpers.root(`packages/${group}/${item}/node_modules/rxjs`),
            helpers.root('node_modules/rxjs'),
            helpers.root(`packages/${group}/${item}/node_modules/@angular`),
            helpers.root('node_modules/@angular'),
          ]
        },
        {
          test: /\.ts$/,
          use: [
            {
              loader: 'awesome-typescript-loader',
              query: {
                // use inline sourcemaps for "karma-remap-coverage" reporter
                sourceMap: false,
                inlineSourceMap: true,
                compilerOptions: {
                  // remove TypeScript helpers to be injected
                  // below by DefinePlugin
                  removeComments: true
                },
                configFileName: helpers.root(`packages/${group}/${item}/tests/tsconfig.json`)
              }
            }
          ],
          exclude: [/\.e2e\.ts$/]
        },
        {
          enforce: 'post',
          test: /\.(js|ts)$/,
          use: 'istanbul-instrumenter-loader?esModules',
          include: helpers.root(`packages/${group}/${item}/src`),
          exclude: [
            /\.(e2e|spec)\.ts$/,
            /node_modules/
          ]
        }
      ]
    },
    plugins: [
      new contextReplacementPlugin(
        // fix the warning in ./~/@angular/core/src/linker/system_js_ng_module_factory_loader.js
        settings.angularVersion === 2
          ? /angular([\\\/])core([\\\/])(esm([\\\/])src|src)([\\\/])linker/
          : /angular([\\\/])core([\\\/])@angular/,
        helpers.root(`packages/${group}/${item}/src`)
      ),
      new loaderOptionsPlugin({
        debug: true,
        options: {}
      })
    ],
    performance: {
      hints: false
    },
    node: {
      global: true,
      crypto: 'empty',
      process: false,
      module: false,
      clearImmediate: false,
      setImmediate: false
    }
  };
};
