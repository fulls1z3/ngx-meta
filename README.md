# @nglibs/meta [![Linux build](https://travis-ci.org/nglibs/meta.svg?branch=master)](https://travis-ci.org/nglibs/meta) [![Windows build](https://ci.appveyor.com/api/projects/status/github/nglibs/meta?branch=master&svg=true)](https://ci.appveyor.com/project/nglibs/meta) [![coverage](https://codecov.io/github/nglibs/meta/coverage.svg?branch=master)](https://codecov.io/gh/nglibs/meta) [![npm version](https://badge.fury.io/js/%40nglibs%2Fmeta.svg)](https://www.npmjs.com/package/@nglibs/meta)

> This repository holds the TypeScript source code and distributable bundle of **`@nglibs/meta`**, the dynamic page title &amp; meta tags generator for **Angular**.

**`@nglibs/meta`** updates the **page title** and **meta tags** every time the route changes, based on **Angular** app's route configuration.

#### NOTICE
**`@nglibs/meta`** is the successor of **`ng2-metadata`**, and the current latest version number is **`v0.2.x`**. Releases with version number **`1.X.x`** refer to **`ng2-metadata`**, and are being kept in order to maintain backwards compability - until Angular v4.0 (stable) gets released.

## Table of contents:
- [Prerequisites](#prerequisites)
- [Getting started](#getting-started)
    - [Installation](#installation)
	- [Examples](#examples)
	- [`@nglibs` packages](#nglibs-packages)
	- [Adding `@nglibs/meta` to your project (SystemJS)](#adding-nglibsmeta-to-your-project-systemjs)
	- [Route configuration](#route-configuration)
    - [app.module configuration](#appmodule-configuration)
	- [app.component configuration](#appcomponent-configuration)
- [Settings](#settings)
	- [Setting up `MetaModule` to use `MetaStaticLoader`](#setting-up-metamodule-to-use-metastaticloader)
- [Set meta tags programmatically](#set-meta-tags-programmatically)
- [Credits](#credits)
- [License](#license)

## Prerequisites
Verify that you are running at least `@angular v2.4.0` and `@angular/router v3.4.0`. Older versions are containing outdated dependencies, might produce errors.

You should also upgrade to a minimum version of `TypeScript 2.1.x`.

## Getting started
### Installation
You can install **`@nglibs/meta`** using `npm`
```
npm install @nglibs/meta --save
```

### Examples
- [@nglibs/example-app] is an officially maintained example application showcasing best practices for **[@nglibs]** utilities.

### `@nglibs` packages

- [@nglibs/config]
- [@nglibs/meta]
- [@nglibs/i18n-router]
- [@nglibs/i18n-router-config-loader]

### Adding `@nglibs/meta` to your project (SystemJS)
Add `map` for **`@nglibs/meta`** in your `systemjs.config`
```javascript
'@nglibs/meta': 'node_modules/@nglibs/meta/bundles/meta.umd.min.js'
```

### Route configuration
Add `meta` settings inside the `data` property of routes.

**Note:** meta properties such as `title`, `description`, `author` and `publisher` will be duplicated as `og:title`, `og:description`, `og:author` and `og:publisher`, so there's no need to declare them again in this context.

#### app.routes.ts
```TypeScript
export const routes: Routes = [
  {
    path: 'home',
    component: HomeComponent,
    data: {
      meta: {
        title: 'Sweet home',
        description: 'Home, home sweet home... and what?'
      }
    }
  },
  {
    path: 'duck',
    component: DuckComponent,
    data: {
      meta: {
        title: 'Rubber duckie',
        description: 'Have you seen my rubber duckie?'
      }
    }
  },
  {
    path: 'toothpaste',
    component: ToothpasteComponent,
    data: {
      meta: {
        title: 'Toothpaste',
        override: true, // prevents appending/prepending the application name to the title attribute
        description: 'Eating toothpaste is considered to be too healthy!'
      }
    }
  }
  ...
];
```

### app.module configuration
Import `MetaModule` using the mapping `'@nglibs/meta'` and append `MetaModule.forRoot({...})` within the imports property of **app.module** (*considering the app.module is the core module in Angular application*).

#### app.module.ts
```TypeScript
...
import { MetaModule } from '@nglibs/meta';
...

@NgModule({
  declarations: [
    AppComponent,
    ...
  ],
  imports: [
    ...
    RouterModule.forRoot(routes),
    MetaModule.forRoot()
  ],
  bootstrap: [AppComponent]
})
```

### app.component configuration
Import `MetaService` using the mapping `'@nglibs/meta'` and **inject** it in the constructor of **app.component** (*considering the app.component is the bootstrap component in Angular application*).

#### app.component.ts
```TypeScript
...
import { MetaService } from '@nglibs/meta';
...

@Component({
  ...
})
export class AppComponent {
  ...
  constructor(private readonly meta: MetaService) { }
  ...
}
```

## Settings
You can call the [forRoot] static method using the `MetaStaticLoader`. By default, it is configured to **prepend page titles** after the **application name** (*if any set*). These **default meta settings** are used when a route doesn't contain any `meta` settings in its `data` property.

> You can customize this behavior (*and ofc other settings*) by supplying **meta settings** to `MetaStaticLoader`.

The following example shows the use of an exported function (*instead of an inline function*) for [AoT compilation].

### Setting up `MetaModule` to use `MetaStaticLoader`

#### app.module.ts
```TypeScript
...
import { MetaModule, MetaLoader, MetaStaticLoader, PageTitlePositioning } from '@nglibs/meta';
...

export function metaFactory(): MetaLoader {
  return new MetaStaticLoader({
    pageTitlePositioning: PageTitlePositioning.PrependPageTitle,
    pageTitleSeparator: ' - ',
    applicationName: 'Tour of (lazy/busy) heroes',
    defaults: {
      title: 'Mighty mighty mouse',
      description: 'Mighty Mouse is an animated superhero mouse character',
      'og:image': 'https://upload.wikimedia.org/wikipedia/commons/f/f8/superraton.jpg',
      'og:type': 'website',
      'og:locale': 'en_US',
      'og:locale:alternate': 'en_US,nl_NL,tr_TR'
    }
  });
}

...

@NgModule({
  declarations: [
    AppComponent,
    ...
  ],
  imports: [
    ...
    RouterModule.forRoot(routes),
    MetaModule.forRoot({
      provide: MetaLoader,
      useFactory: (metaFactory)
    })
  ],
  bootstrap: [AppComponent]
})
```

`MetaStaticLoader` has one parameter:

- **settings**: `MetaSettings` : meta settings (*by default, prepend page titles*)

> :+1: Holy cow! **`@nglibs/meta`** will update the **page title** and **meta tags** every time the route changes.

## Set meta tags programmatically
```TypeScript
...
import { Component, OnInit } from '@angular/core';
import { MetaService } from '@nglibs/meta';
...

@Component({
  ...
})
export class ItemComponent implements OnInit {
  ...
  constructor(private readonly meta: MetaService) { }
  ...
  ngOnInit() {
    this.item = //HTTP GET for "item" in the repository
    this.meta.setTitle(`Page for ${this.item.name}`);
    this.meta.setTag('og:image', this.item.imageUrl);
  }
}

```

## Credits
- [ng2-meta](https://github.com/vinaygopinath/ng2-meta): Dynamic meta tags and SEO in Angular2

## License
The MIT License (MIT)

Copyright (c) 2017 [Burak Tasci]

[@nglibs]: https://github.com/nglibs
[@nglibs/example-app]: https://github.com/nglibs/example-app
[@nglibs/config]: https://github.com/nglibs/config
[@nglibs/meta]: https://github.com/nglibs/meta
[@nglibs/i18n-router]: https://github.com/nglibs/i18n-router
[@nglibs/i18n-router-config-loader]: https://github.com/nglibs/i18n-router-config-loader
[forRoot]: https://angular.io/docs/ts/latest/guide/ngmodule.html#!#core-for-root
[AoT compilation]: https://angular.io/docs/ts/latest/cookbook/aot-compiler.html
[Burak Tasci]: http://www.buraktasci.com
