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
