/**
 * Webpack helpers & dependencies
 */
const helpers = require('./helpers');

const checkerPlugin = require('awesome-typescript-loader').CheckerPlugin,
  contextReplacementPlugin = require('webpack/lib/ContextReplacementPlugin'),
  loaderOptionsPlugin = require('webpack/lib/LoaderOptionsPlugin'),
  uglifyJsPlugin = require('webpack/lib/optimize/UglifyJsPlugin');

/**
 * Webpack configuration
 *
 * See: http://webpack.github.io/docs/configuration.html#cli
 */
module.exports = (group, item, settings) => {
  return {
    /**
     * The entry point for the bundle
     * Our Angular app
     *
     * See: http://webpack.github.io/docs/configuration.html#entry
     */
    entry: helpers.root(`packages/${group}/${item}/index.ts`),

    /**
     * Options affecting the resolving of modules.
     *
     * See: http://webpack.github.io/docs/configuration.html#resolve
     */
    resolve: {
      extensions: ['.ts', '.js']
    },

    /**
     * Options affecting the output of the compilation.
     *
     * See: http://webpack.github.io/docs/configuration.html#output
     */
    output: {
      /**
       * The output directory as absolute path (required).
       *
       * See: http://webpack.github.io/docs/configuration.html#output-path
       */
      path: helpers.root(`packages/${group}/${item}/bundles`),
      publicPath: '/',

      /**
       * Specifies the name of each output file on disk.
       * IMPORTANT: You must not specify an absolute path here!
       *
       * See: http://webpack.github.io/docs/configuration.html#output-filename
       */
      filename: `${item}.umd.min.js`,

      libraryTarget: 'umd',
      library: group.replace(/@/g, '')
    },

    /**
     * Require those dependencies but don't bundle them
     */
    externals: [/^@angular\//, /^rxjs\//, /^lodash/],

    /**
     * Options affecting the normal modules.
     *
     * See: http://webpack.github.io/docs/configuration.html#module
     */
    module: {
      rules: [
        /**
         * TS linter
         */
        {
          enforce: 'pre',
          test: /\.ts$/,
          use: 'tslint-loader',
          exclude: [helpers.root('node_modules')]
        },

        /**
         * Typescript loader support for .ts and Angular 2 async routes via .async.ts
         * Replace templateUrl and stylesUrl with require()
         *
         * See: https://github.com/s-panferov/awesome-typescript-loader
         */
        {
          test: /\.ts$/,
          use: `awesome-typescript-loader?declaration=false&configFileName=${helpers.root(`packages/${group}/${item}/tsconfig.json`)}`,
          exclude: [/\.(spec|e2e)\.ts$/]
        }
      ]
    },

    /**
     * Add additional plugins to the compiler.
     *
     * See: http://webpack.github.io/docs/configuration.html#plugins
     */
    plugins: [
      /**
       * Plugin: ForkCheckerPlugin
       * Description: Do type checking in a separate process, so webpack don't need to wait.
       *
       * See: https://github.com/s-panferov/awesome-typescript-loader#forkchecker-boolean-defaultfalse
       */
      new checkerPlugin(),

      /**
       * Plugin: ContextReplacementPlugin
       * Description: Provides context to Angular's use of System.import
       *
       * See: https://webpack.github.io/docs/list-of-plugins.html#contextreplacementplugin
       * See: https://github.com/angular/angular/issues/11580
       */
      new contextReplacementPlugin(
        // fix the warning in ./~/@angular/core/src/linker/system_js_ng_module_factory_loader.js
        settings.angularVersion === 2
          ? /angular([\\\/])core([\\\/])(esm([\\\/])src|src)([\\\/])linker/
          : /angular([\\\/])core([\\\/])@angular/,
        helpers.root(`packages/${group}/${item}/src`)
      ),

      /**
       * Plugin LoaderOptionsPlugin (experimental)
       *
       * See: https://gist.github.com/sokra/27b24881210b56bbaff7
       */
      new loaderOptionsPlugin({
        options: {
          tslint: {
            failOnHint: false
          }
        }
      }),

      /**
       * Plugin: UglifyJsPlugin
       * Description: Minimize all JavaScript output of chunks.
       * Loaders are switched into minimizing mode.
       *
       * See: https://webpack.github.io/docs/list-of-plugins.html#uglifyjsplugin
       */
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

    /**
     * Include polyfills or mocks for various node stuff
     * Description: Node configuration
     *
     * See: https://webpack.github.io/docs/configuration.html#node
     */
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
