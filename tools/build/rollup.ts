import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import * as path from 'path';
import * as glob from 'glob';
import * as camelCase from 'camelcase';
import { main as ngc } from '@angular/compiler-cli/src/main';
import * as rollup from 'rollup';
import * as commonJs from 'rollup-plugin-commonjs';
import * as sourceMaps from 'rollup-plugin-sourcemaps';
import * as resolve from 'rollup-plugin-node-resolve';
import * as uglify from 'rollup-plugin-uglify';

import { NODE_MODULES, root } from './helpers';
import { inlineResources } from './inline-resources';

const compilationFolder = root('.temp');
let globals = {
  tslib: 'tslib',
  '@angular/core': 'ng.core'
};

const relativeCopy = (fileGlob: string, from: string, to: string) => {
  return new Promise((res, reject) => {
    glob(fileGlob, {
      cwd: from,
      nodir: true
    }, (err: string, files: Array<any>) => {
      if (err)
        reject(err);

      for (const file of files) {
        if (file.indexOf(NODE_MODULES) >= 0)
          continue;

        const origin = path.join(from, file);
        const destination = path.join(to, file);
        const data = readFileSync(origin, 'utf-8');

        recursiveMkDir(path.dirname(destination));
        writeFileSync(destination, data);
      }

      res();
    });
  });
};

const recursiveMkDir = (dir: string) => {
  if (!existsSync(dir)) {
    recursiveMkDir(path.dirname(dir));
    mkdirSync(dir);
  }
};

import * as buildConfig from './build-config.json';

const build = (group: string, item: string, settings: any) => {
  const paths = {
    src: root(`packages/${group}/${item}`),
    temp: path.join(compilationFolder, `packages/${group}/${item}`),
    es2015: path.join(compilationFolder, `packages/${group}/${item}-es2015`),
    es5: path.join(compilationFolder, `packages/${group}/${item}-es5`),
    dist: root(`dist/${group}/${item}`)
  };

  globals = {
    ...globals,
    ...settings.bundle.globals
  };
  const external = settings.bundle.external
    ? settings.bundle.external.concat(Object.keys(globals))
    : Object.keys(globals);

  return Promise.resolve()
    .then(() => relativeCopy('**/*', paths.src, paths.temp)
      .then(() => inlineResources(paths.temp))
      // tslint:disable-next-line
      .then(() => console.log(`>>> ${group}/${item}: Inlining succeeded`))
    )
    .then(() => ngc(['--project', `${paths.temp}/tsconfig.es2015.json`]))
    .then(exitCode => new Promise((res, reject) => {
      exitCode === 0
        ? res()
        : reject();
    }))
    // tslint:disable-next-line
    .then(() => console.log(`>>> ${group}/${item}: ES2015 compilation succeeded`))
    .then(() => ngc(['--project', `${paths.temp}/tsconfig.es5.json`]))
    .then(exitCode => new Promise((res, reject) => {
      exitCode === 0
        ? res()
        : reject();
    }))
    // tslint:disable-next-line
    .then(() => console.log(`>>> ${group}/${item}: ES5 compilation succeeded`))
    .then(() => Promise.resolve()
      .then(() => relativeCopy('**/*.d.ts', paths.es2015, paths.dist))
      .then(() => relativeCopy('**/*.metadata.json', paths.es2015, paths.dist))
      // tslint:disable-next-line
      .then(() => console.log(`>>> ${group}/${item}: Typings and metadata copy succeeded`))
    )
    .then(() => {
      const es5Entry = path.join(paths.es5, `${settings.angularVersion > 2 ? item : 'index'}.js`);
      const es2015Entry = path.join(paths.es2015, `${settings.angularVersion > 2 ? item : 'index'}.js`);
      const rollupBaseConfig = {
        moduleName: `${camelCase(group.replace(/@/g, ''))}.${camelCase(item)}`,
        sourceMap: true,
        globals,
        external,
        plugins: [
          resolve({
            module: true,
            jsnext: true
          }),
          commonJs({
            include: ['node_modules/rxjs/**']
          }),
          sourceMaps()
        ]
      };

      const umdConfig = {
        ...rollupBaseConfig,
        entry: es5Entry,
        dest: path.join(paths.dist, 'bundles', `${item}.umd.js`),
        format: 'umd'
      };

      const minUmdConfig = {
        ...rollupBaseConfig,
        entry: es5Entry,
        dest: path.join(paths.dist, 'bundles', `${item}.umd.min.js`),
        format: 'umd',
        plugins: rollupBaseConfig.plugins.concat([uglify({})])
      };

      const es5config = {
        ...rollupBaseConfig,
        entry: es5Entry,
        dest: path.join(paths.dist, `${group}/${item}.es5.js`),
        format: 'es'
      };

      const es2015config = {
        ...rollupBaseConfig,
        entry: es2015Entry,
        dest: path.join(paths.dist, `${group}/${item}.js`),
        format: 'es'
      };

      const bundles = [
        umdConfig,
        minUmdConfig,
        es5config,
        es2015config
      ]
        .map(options => rollup.rollup(options)
          .then((bundle: any) => bundle.write(options)));

      return Promise.all(bundles)
        // tslint:disable-next-line
        .then(() => console.log(`>>> ${group}/${item}: All bundles generated successfully`));
    })
    .then(() => Promise.resolve()
      .then(() => relativeCopy('LICENSE', root(), paths.dist))
      .then(() => relativeCopy('package.json', paths.src, paths.dist))
      .then(() => relativeCopy('README.md', paths.src, paths.dist))
      // tslint:disable-next-line
      .then(() => console.log(`>>> ${group}/${item}: Package files copy succeeded`))
      // tslint:disable-next-line
      .then(() => console.log(`\n`))
    )
    .catch(e => {
      console.error(`>>> ${group}/${item}: Build failed, see below for errors\n`);
      console.error(e);
      process.exit(1);
    });
};

const libs = [];

for (const group of Object.keys(buildConfig))
  if (group !== '__once__')
    for (const item of Object.keys(buildConfig[group]))
      libs.push({
        group,
        item,
        settings: buildConfig[group][item]
      });
  else
    libs.push({
      group: '',
      item: Object.keys(buildConfig[group])[0],
      settings: buildConfig[group][Object.keys(buildConfig[group])[0]]
    });

const toSeries = (series: any) => series
  .reduce((promise: Promise<any>, fn: Function) => promise
    .then((res: any) => fn()
      .then(Array.prototype.concat.bind(res))), Promise.resolve([]));

const builds = libs
  .map((lib: any) => () => build(lib.group, lib.item, lib.settings));

toSeries(builds);
