# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

<a name="4.0.0"></a>
# 4.0.0 (2017-09-06)


### Bug Fixes

* depend on Angular 2.0.0 ([#21](https://github.com/fulls1z3/ngx-meta/issues/21)) ([5d25ef7](https://github.com/fulls1z3/ngx-meta/commit/5d25ef7))
* **core:** new npm package [@nglibs](https://github.com/nglibs)/meta no longer update title programmatically ([#22](https://github.com/fulls1z3/ngx-meta/issues/22), [#24](https://github.com/fulls1z3/ngx-meta/issues/24)) ([44bd20b](https://github.com/fulls1z3/ngx-meta/commit/44bd20b))
* **core:** no page title & meta tags set when route contains no `meta` ([#15](https://github.com/fulls1z3/ngx-meta/issues/15)) ([ec2882f](https://github.com/fulls1z3/ngx-meta/commit/ec2882f))
* **core:** og:locale insists to remain default when [@nglibs](https://github.com/nglibs)/i18n-router is used ([#18](https://github.com/fulls1z3/ngx-meta/issues/18)) ([6a381c3](https://github.com/fulls1z3/ngx-meta/commit/6a381c3))
* **core:** og:url doesn't get rendered correctly using redirectTo ([#17](https://github.com/fulls1z3/ngx-meta/issues/17)) ([2e0a73d](https://github.com/fulls1z3/ngx-meta/commit/2e0a73d))
* **core:** setting og:locale tag without specifying default og:locale throws error ([#23](https://github.com/fulls1z3/ngx-meta/issues/23)) ([545d3c5](https://github.com/fulls1z3/ngx-meta/commit/545d3c5))


### Features

* **core:** add callback function ([#7](https://github.com/fulls1z3/ngx-meta/issues/7)) ([6a11bc7](https://github.com/fulls1z3/ngx-meta/commit/6a11bc7))
* **core:** remove `lodash` dependency ([#40](https://github.com/fulls1z3/ngx-meta/issues/40)) ([a0ef731](https://github.com/fulls1z3/ngx-meta/commit/a0ef731))



# Change Log
All notable changes to this project will be documented in this file.

## Current iteration
### Breaking changes
- **packaging:** merge public API into a single repository

## v0.4.0-rc.2 - 2017-05-09
### Breaking changes
- **packaging:** rename `@nglibs/meta` to `@ngx-meta/core` (closes [#43](https://github.com/fulls1z3/ngx-meta/issues/43))

### Bug fixes
- **core:** add `yarn.lock` to npmignore (closes [#42](https://github.com/fulls1z3/ngx-meta/issues/42))
- **core:** remove dependency  on `lodash` (closes [#40](https://github.com/fulls1z3/ngx-meta/issues/40))

## v0.4.0-rc.1 - 2017-04-08
### Breaking changes
- **core:** set meta tags through `MetaGuard` (closes [#35](https://github.com/fulls1z3/ngx-meta/issue/35))

### Bug fixes
- **core:** updateLocales method does not clear `og:locale:alternate` tags (closes [#33](https://github.com/fulls1z3/ngx-meta/issue/33))
- **core:** observable combining (closes [#36](https://github.com/fulls1z3/ngx-meta/issue/36))
- **core:** support Promises at the `callback` function (closes [#25](https://github.com/fulls1z3/ngx-meta/issue/25))

### Features
- **core:** prevent direct DOM manipulation (closes [#31](https://github.com/fulls1z3/ngx-meta/issue/31))
- **core:** remove `[].slice.call(elements)` (closes [#34](https://github.com/fulls1z3/ngx-meta/issue/34))
- **core:** remove manual & deferred initialization (closes [#37](https://github.com/fulls1z3/ngx-meta/issue/37))

## v0.2.0-rc.4 - 2017-03-14
### Features
- **core:** callback function to use a custom logic on the meta tag contents (http-get, translate, etc.) (closes [#7](https://github.com/fulls1z3/ngx-meta/issue/7))

### Fixed
- **core:** set og:locale properly using `@ngx-i18n-router/core` (closes [#18](https://github.com/fulls1z3/ngx-meta/issue/18))
- **core:** depend on Angular 2.0.0 (closes [#21](https://github.com/fulls1z3/ngx-meta/issues/21))
- **core:** update title programmatically (closes [#22](https://github.com/fulls1z3/ngx-meta/issue/22), [#24](https://github.com/fulls1z3/ngx-meta/issue/24))
- **core:** set og:locale tag without specifying default og:locale throws error (closes [#23](https://github.com/fulls1z3/ngx-meta/issues/23))

## v0.2.0-rc.3 - 2017-02-24
### Fixed
- **core:** set page title & meta tags properly when route contains no `meta` (closes [#15](https://github.com/fulls1z3/ngx-meta/issue/15))
- **core:** re-add generated .js files to npm package (closes [#16](https://github.com/fulls1z3/ngx-meta/issue/16))
- **core:** render og:url properly using redirectTo (closes [#17](https://github.com/fulls1z3/ngx-meta/issue/17))

## v0.2.0-rc.2 - 2017-02-23
### Breaking changes
- **packaging:** rename `@nglibs/metadata` to `@nglibs/meta`
- **packaging:** merge with [fulls1z3/ng2-metadata](https://github.com/fulls1z3/ng2-metadata)

### Bug fixes
- **core:** depend on TypeScript 2.1.x

## v0.2.0-rc.1 - 2017-02-17
### Bug fixes
- **core:** depend on `tslib`

### Features
- **core:** move tests in `tests` folder
