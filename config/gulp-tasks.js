'use strict';

/**
 * Gulp helpers & dependencies
 */
const packages = require('./build-config.json');
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
  bundles: done => {
    for (const group of Object.keys(packages))
      for (const item of Object.keys(packages[group]))
        $.rimraf(`./packages/${group}/${item}/bundles`, done);
  },
  'index.js': done => {
    for (const group of Object.keys(packages))
      for (const item of Object.keys(packages[group]))
        $.rimraf(`./packages/${group}/${item}/index.js`, done);
  },
  'index.d.ts': done => {
    for (const group of Object.keys(packages))
      for (const item of Object.keys(packages[group]))
        $.rimraf(`./packages/${group}/${item}/index.d.ts`, done);
  },
  'index.metadata.json': done => {
    for (const group of Object.keys(packages))
      for (const item of Object.keys(packages[group]))
        $.rimraf(`./packages/${group}/${item}/index.metadata.json`, done);
  },
  'src/*.js': done => {
    for (const group of Object.keys(packages))
      for (const item of Object.keys(packages[group]))
        $.rimraf(`./packages/${group}/${item}/src/**/*.js`, done);
  },
  'src/*.d.ts': done => {
    for (const group of Object.keys(packages))
      for (const item of Object.keys(packages[group]))
        $.rimraf(`./packages/${group}/${item}/src/**/*.d.ts`, done);
  },
  'src/*.metadata.json': done => {
    for (const group of Object.keys(packages))
      for (const item of Object.keys(packages[group]))
        $.rimraf(`./packages/${group}/${item}/src/**/*.metadata.json`, done);
  },
  'tests/*.d.ts': done => {
    for (const group of Object.keys(packages))
      for (const item of Object.keys(packages[group]))
        $.rimraf(`./packages/${group}/${item}/tests/**/*.d.ts`, done);
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
  compile: done => {
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
    const compileOne = (group, item, d) => {
      return gulp.src(`./packages/${group}/${item}/tsconfig.json`)
        .pipe($.exec(`"./packages/${group}/${item}/node_modules/.bin/ngc" -p "./packages/${group}/${item}/tsconfig.json"`, options))
        .pipe($.exec.reporter(reportOptions))
        .on('end', d);
    };

    const subTasks = [];

    for (const group of Object.keys(packages))
      for (const item of Object.keys(packages[group])) {
        const fn = d => compileOne(group, item, d);
        fn.displayName = `compile:ngc:${group}:${item}`;

        subTasks.push(fn);
      }

    return gulp.series(subTasks, d => d())(done);
  },
  lint: done => {
    return gulp.src([
      './**/index.ts',
      './**/src/**/*.ts',
      '!./**/src/**/*.d.ts',
      './**/tests/**/*.ts',
      '!./**/tests/**/*.d.ts',
      '!./**/node_modules/**/*'
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
  webpack: done => {
    const chalk = require('chalk');

    const bundleOne = (group, item, settings, d) => {
      const webpack = require('./webpack.prod.js');

      $.webpack(webpack(group, item, settings))
        .run((err, stats) => {
          if (err) {
            console.log(chalk.red(`Error: ${err}`));
            d();
          } else {
            const statsJson = stats.toJson(),
              warnings = statsJson.warnings,
              errors = statsJson.errors;

            for (const key of Object.keys(warnings))
              console.log(chalk.gray(`Warning: ${warnings[key]}\n`));

            if (warnings.length > 0)
              console.log(chalk.gray(`    (${warnings.length}) warning(s) total.\n`));

            for (const key of Object.keys(errors))
              console.log(chalk.red(`Error: ${errors[key]}\n`));

            if (errors.length > 0)
              console.log(chalk.red(`    (${errors.length}) error(s) total.\n`));

            for (const key of Object.keys(stats.compilation.assets))
              console.log(`Webpack: output ${chalk.green(key)}`);

            console.log(`Webpack: ${chalk.blue(`finished`)}`);

            d();
          }
        });
    };

    const subTasks = [];

    for (const group of Object.keys(packages))
      for (const item of Object.keys(packages[group])) {
        const fn = d => bundleOne(group, item, packages[group][item], d);
        fn.displayName = `bundle:webpack:${group}:${item}`;

        subTasks.push(fn);
      }

    return gulp.series(subTasks, d => d())(done);
  }
};

bundle.webpack.displayName = 'bundle:webpack';

/**
 * Tests
 */
const tests = {
  run: done => {
    const server = require('karma').Server;

    const testOne = (group, item, settings, d) => {
      const webpack = require('./webpack.test.js');

      new server({
        configFile: $$.root(`./packages/${group}/${item}/config/karma.conf.js`),
        webpack: webpack(group, item, settings),
        coverageIstanbulReporter: {
          reports: ['html', 'text-summary'],
          dir: `./coverage/${group}/${item}`,
          fixWebpackSourcePaths: true,
          'report-config': {
            html: {
              subdir: 'html'
            }
          }
        }
      }, () => d()).start();
    };

    const subTasks = [];

    for (const group of Object.keys(packages))
      for (const item of Object.keys(packages[group]))
        if (packages[group][item].runTests) {
          const fn = d => testOne(group, item, packages[group][item], d);
          fn.displayName = `tests:run:${group}:${item}`;

          subTasks.push(fn);
        }

    return gulp.series(subTasks, d => {
      d();
      process.exit(0);
    })(done);
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
    clean['src/*.metadata.json'],
    clean['tests/*.d.ts']
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
 * Task: tslint
 */
gulp.task('tslint',
  gulp.series(
    tasks.ts.lint
  ));
