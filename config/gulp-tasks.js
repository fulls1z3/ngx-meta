'use strict';

/**
 * Gulp helpers & dependencies
 */
const gulp = require('gulp'),
  $ = require('gulp-load-plugins')({
    pattern: [
      'gulp-*',
      'rimraf',
      'webpack'
    ]
  }),
  $$ = require('./helpers');

/**
 * Define tasks
 */
const tasks = {};

/**
 * Clean file(s)
 */
const clean = {
  bundles: function(done) {
    $.rimraf('./bundles', done);
  },
  'index.js': function(done) {
    $.rimraf('./index.js', done);
  },
  'index.d.ts': function(done) {
    $.rimraf('./index.d.ts', done);
  },
  'index.metadata.json': function(done) {
    $.rimraf('./index.metadata.json', done);
  },
  'src/*.js': function(done) {
    $.rimraf('./src/**/*.js', done);
  },
  'src/*.d.ts': function(done) {
    $.rimraf('./src/**/*.d.ts', done);
  },
  'src/*.metadata.json': function(done) {
    $.rimraf('./src/**/*.metadata.json', done);
  }
};

clean.bundles.displayName = 'clean:bundles';
clean['index.js'].displayName = 'clean:./index.js';
clean['index.d.ts'].displayName = 'clean:./index.d.ts';
clean['index.metadata.json'].displayName = 'clean:./index.metadata.json';
clean['src/*.js'].displayName = 'clean:./src/*.js';
clean['src/*.d.ts'].displayName = 'clean:./src/*.js';
clean['src/*.metadata.json'].displayName = 'clean:./src/*.js';

/**
 * AoT compilation
 */
const ts = {
  compile: function(done) {
    const options = {
      continueOnError: false,
      pipeStdout: false,
      customTemplatingThing: 'test'
    };
    const reportOptions = {
      err: true,
      stderr: true,
      stdout: true
    };

    return gulp.src('./tsconfig.json')
      .pipe($.exec('"./node_modules/.bin/ngc" -p "./tsconfig.json"', options))
      .pipe($.exec.reporter(reportOptions))
      .on('end', done);
  },
  lint: function(done) {
    return gulp.src([
      './index.ts',
      './src/**/*.ts',
      '!./src/**/*.d.ts',
      './tests/**/*.ts',
      '!./tests/**/*.d.ts'
    ])
      .pipe($.tslint({formatter: 'verbose'}))
      .pipe($.tslint.report({emitError: false}))
      .on('end', done);
  }
};

ts.compile.displayName = 'compile:ngc';
ts.lint.displayName = 'tslint';

/**
 * Bundle
 */
const bundle = {
  webpack: function(done) {
    const chalk = require('chalk'),
      conf = require('./webpack.prod.js');

    $.webpack(conf)
      .run(function(err, stats) {
        if (err) {
          console.log(chalk.red(`Error: ${err}`));
          done();
        } else {
          const statsJson = stats.toJson(),
            warnings = statsJson.warnings,
            errors = statsJson.errors;

          Object.keys(warnings)
            .forEach(function(key) {
              console.log(chalk.gray(`Warning: ${warnings[key]}\n`));
            });

          if (warnings.length > 0)
            console.log(chalk.gray(`    (${warnings.length}) warning(s) total.\n`));

          Object.keys(errors)
            .forEach(function(key) {
              console.log(chalk.red(`Error: ${errors[key]}\n`));
            });

          if (errors.length > 0)
            console.log(chalk.red(`    (${errors.length}) error(s) total.\n`));

          Object.keys(stats.compilation.assets)
            .forEach(function(key) {
              console.log(`Webpack: output ${chalk.green(key)}`);
            });

          console.log(`Webpack: ${chalk.blue(`finished`)}`);

          done();
        }
      });
  }
};

bundle.webpack.displayName = 'bundle:webpack';

/**
 * Tests
 */
const tests = {
  run: function(done) {
    const server = require('karma').Server;

    new server({
        configFile: $$.root('./karma.conf.js'),
        singleRun: true
      },
      function() {
        done();
        process.exit(0);
      }).start();
  }
};

tests.run.displayName = 'tests:run';

/**
 * Tasks
 */
tasks.clean = clean;
tasks.ts = ts;
tasks.bundle = bundle;
tasks.tests = tests;

/**
 * Task: clean
 */
gulp.task('clean',
  gulp.parallel(
    clean.bundles,
    clean['index.js'],
    clean['index.d.ts'],
    clean['index.metadata.json'],
    clean['src/*.js'],
    clean['src/*.d.ts'],
    clean['src/*.metadata.json']
  ));

/**
 * Task: make
 */
gulp.task('make',
  gulp.series(
    'clean',
    tasks.ts.compile,
    tasks.bundle.webpack
  ));

/**
 * Task: test
 */
gulp.task('test',
  gulp.series(
    tasks.tests.run
  ));

/**
 * Task: review:tslint
 */
gulp.task('review:tslint',
  gulp.series(
    tasks.ts.lint
  ));
