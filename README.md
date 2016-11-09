# @nglibs/metadata [![Linux build](https://travis-ci.org/nglibs/metadata.svg?branch=master)](https://travis-ci.org/nglibs/metadata) [![Windows build](https://ci.appveyor.com/api/projects/status/github/nglibs/metadata?branch=master&svg=true)](https://ci.appveyor.com/project/nglibs/metadata) [![coverage](https://codecov.io/github/nglibs/metadata/coverage.svg?branch=master)](https://codecov.io/gh/nglibs/metadata) [![npm version](https://badge.fury.io/js/%40nglibs%2Fmetadata.svg)](https://www.npmjs.com/package/@nglibs/metadata)

> This repository holds the TypeScript source code and distributable bundle of **`@nglibs/metadata`**, the dynamic page title &amp; meta tags generator for **Angular**.

**`@nglibs/metadata`** updates the **page title** and **meta tags** every time the route changes, based on **Angular** app's route configuration.

#### NOTICE
**`@nglibs/metadata`** is the successor of **`ng2-metadata`**, and the current latest version number is **`v0.2.x`**. Releases with version number **`1.X.x`** refer to **`ng2-metadata`**, and are being kept in order to maintain backwards compability - until Angular v4.0 (stable) gets released.

## Table of contents:
- [Prerequisites](#prerequisites)
- [Getting started](#getting-started)
    - [Installation](#installation)
	- [Examples](#examples)
	- [@nglibs packages](#nglibs-packages)
	- [Adding @nglibs/metadata to your project (SystemJS)](#adding-nglibsmetadata-to-your-project-systemjs)
	- [Route configuration](#route-configuration)
    - [app.module configuration](#appmodule-configuration)
	- [app.component configuration](#appcomponent-configuration)
- [Settings](#settings)
	- [Set metadata programmatically](#set-metadata-programmatically)
- [Credits](#credits)
- [License](#license)

## Prerequisites
Verify that you are running at least `@angular v2.4.0` and `@angular/router v3.4.0`. Older versions are containing outdated dependencies, might produce errors.

You should also upgrade to a minimum version of `TypeScript 2.1.x`.

## Getting started
### Installation
You can install **`@nglibs/metadata`** using `npm`
```
npm install @nglibs/metadata --save
```

### Examples
- [@nglibs/example-app] is an officially maintained example application showcasing best practices for **[@nglibs]** utilities.

### @nglibs packages

- [@nglibs/config]
- [@nglibs/metadata]
- [@nglibs/i18n-router]
- [@nglibs/i18n-router-config-loader]

### Adding @nglibs/metadata to your project (SystemJS)
Add `map` for **`@nglibs/metadata`** in your `systemjs.config`
```javascript
'@nglibs/metadata': 'node_modules/@nglibs/metadata/bundles/metadata.umd.min.js'
```

### Route configuration
Add metadata inside the `data` property of routes.

**Note:** meta properties such as `title`, `description`, `author` and `publisher` are duplicated as `og:title`, `og:description`, `og:author` and `og:publisher`, so there's no need to declare them again in this context.

```TypeScript
export const routes: Routes = [
  {
    path: 'home',
    component: HomeComponent,
    data: {
      metadata: {
        title: 'Sweet home',
        description: 'Home, home sweet home... and what?'
      }
    }
  },
  {
    path: 'duck',
    component: DuckComponent,
    data: {
      metadata: {
        title: 'Rubber duckie',
        description: 'Have you seen my rubber duckie?'
      }
    }
  },
  {
    path: 'toothpaste',
    component: ToothpasteComponent,
    data: {
      metadata: {
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
Import `MetadataModule` using the mapping `'@nglibs/metadata'` and append `MetadataModule.forRoot({...})` within the imports property of **app.module** (*considering the app.module is the core module in Angular application*).

```TypeScript
...
import { MetadataModule } from '@nglibs/metadata';
...

@NgModule({
  declarations: [
    AppComponent,
    ...
  ],
  imports: [
    ...
    RouterModule.forRoot(routes),
    MetadataModule.forRoot()
  ],
  bootstrap: [AppComponent]
})
```

### app.component configuration
Import `MetadataService` using the mapping `'@nglibs/metadata'` and **inject** it in the constructor of **app.component** (*considering the app.component is the bootstrap component in Angular application*).

```TypeScript
...
import { MetadataService } from '@nglibs/metadata';
...

@Component({
  ...
})
export class AppComponent {
  ...
  constructor(private readonly metadata: MetadataService) { }
  ...
}
```


Holy cow! **`@nglibs/metadata`** will update the **page title** and **meta tags** every time the route changes.

## Settings
You can call the [forRoot] static method using the `MetadataStaticLoader`. By default, it is configured to **`prepend page titles`** after the `application name` (if any set). These **default metadata settings** are used when a route doesn't contain any metadata in its `data` property.

You can customize this behavior (*and ofc other settings*) by supplying metadata settings to `MetadataStaticLoader`.

The following example shows the use of an exported function (*instead of an inline function*) for [AoT compilation].

```TypeScript
...
import { MetadataModule, MetadataLoader, MetadataStaticLoader, PageTitlePositioning } from '@nglibs/metadata';
...

export function metadataFactory() {
  return new MetadataStaticLoader({
    pageTitlePositioning: PageTitlePositioning.PrependPageTitle,
    pageTitleSeparator: ' - ',
    applicationName: 'Tour of (lazy/busy) heroes',
    defaults: {
      title: 'Mighty mighty mouse',
      description: 'Mighty Mouse is an animated superhero mouse character',
      'og:image': 'https://upload.wikimedia.org/wikipedia/commons/f/f8/superraton.jpg',
      'og:type': 'website',
      'og:locale': 'en_US',
      'og:locale:alternate': 'nl_NL,tr_TR'
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
    MetadataModule.forRoot({
      provide: MetadataLoader,
      useFactory: (metadataFactory)
    })
  ],
  bootstrap: [AppComponent]
})
```

### Set metadata programmatically
```TypeScript
...
import { Component, OnInit } from '@angular/core';
import { MetadataService } from '@nglibs/metadata';
...

@Component({
  ...
})
export class ItemComponent implements OnInit {
  ...
  constructor(private readonly metadata: MetadataService) { }
  ...
  ngOnInit() {
    this.item = //HTTP GET for "item" in the repository
    this.metadata.setTitle(`Page for ${this.item.name}`);
    this.metadata.setTag('og:image', this.item.imageUrl);
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
[@nglibs/metadata]: https://github.com/nglibs/metadata
[@nglibs/i18n-router]: https://github.com/nglibs/i18n-router
[@nglibs/i18n-router-config-loader]: https://github.com/nglibs/i18n-router-config-loader
[forRoot]: https://angular.io/docs/ts/latest/guide/ngmodule.html#!#core-for-root
[AoT compilation]: https://angular.io/docs/ts/latest/cookbook/aot-compiler.html
[Burak Tasci]: http://www.buraktasci.com
