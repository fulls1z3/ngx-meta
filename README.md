# @nglibs/meta [![Linux build](https://travis-ci.org/nglibs/meta.svg?branch=master)](https://travis-ci.org/nglibs/meta) [![Windows build](https://ci.appveyor.com/api/projects/status/github/nglibs/meta?branch=master&svg=true)](https://ci.appveyor.com/project/nglibs/meta) [![coverage](https://codecov.io/github/nglibs/meta/coverage.svg?branch=master)](https://codecov.io/gh/nglibs/meta) [![npm version](https://badge.fury.io/js/%40nglibs%2Fmeta.svg)](https://www.npmjs.com/package/@nglibs/meta)

> This repository holds the TypeScript source code and distributable bundle of **`@nglibs/meta`**, the dynamic page title &amp; meta tags generator for **Angular**.

**`@nglibs/meta`** updates the **page title** and **meta tags** every time the route changes, based on **Angular** app's route configuration.

#### NOTICE
**`@nglibs/meta`** is the successor of **`ng2-metadata`**, and the actual releases are **`v0.4.x`** and **`v0.2.x`**.

> If you're using `@angular v4.x.x`, use the latest release of `v0.4.x` (*[master] branch*).

> If you're using `@angular v2.x.x`, use the latest release of `v0.2.x` (*[v0.2.x] branch*).

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
	- [Deferred initialization](#deferred-initialization)
	- [Using a `callback` function](#using-a-callback-function)
- [Set meta tags programmatically](#set-meta-tags-programmatically)
- [Credits](#credits)
- [License](#license)

## Prerequisites
This package depends on `@angular v4.0.0`, and the **[master]** branch does no longer support `@angular v2.x.x`.

However, the [v0.2.x] branch keeps ongoing support for `@angular v2.x.x` - depending on `@angular v2.0.0`, and it's highly recommended that you are running at least **`@angular v2.4.0`** and **`@angular/router v3.4.0`**. Older versions contain outdated dependencies, might produce errors.

- If you're using `@angular v4.x.x`, use the latest release of `v0.4.x` (*[master] branch*).
- If you're using `@angular v2.x.x`, use the latest release of `v0.2.x` (*[v0.2.x] branch*).

Also, please ensure that you are using **`Typescript v2.1.6`** or higher.

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
- [@nglibs/universal-express-engine]
- [@nglibs/universal-transfer-state]

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

### Deferred initialization
You can delay the initialization of `MetaService` by setting the **`defer`** property of `MetaStaticLoader` to **`true`**. This will allow you to execute some tasks (*retrieve data, etc.*) before `MetaService` gets initialized.

When your tasks have been executed, simply invoke the `init` method to allow `MetaService` to update **page titles** and **meta tags**.

#### app.module.ts
```TypeScript
...
import { MetaModule, MetaLoader, MetaStaticLoader, PageTitlePositioning } from '@nglibs/meta';
...

export function metaFactory(): MetaLoader {
  return new MetaStaticLoader({
    defer: true,
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

```

#### app.component.ts
```TypeScript
...
import { MetaService } from '@nglibs/meta';
...

@Component({
  ...
})
export class AppComponent implements OnInit {
  ...
  constructor(private readonly meta: MetaService) { }

  ngOnInit(): void {
    someTask.subscribe((res: any) => {
      // some task done
      // some result collected
      if (!!res)
        // invoking the `init` method with false won't allow the use of meta service,
        // would be handy in the case you need to use meta service programmatically
        this.meta.init();
    });
  }
  ...
}
```

### Using a `callback` function
The `MetaStaticLoader` accepts a **`callback`** function to use a custom logic on the meta tag contents (*http-get, [ngx-translate](https://github.com/ngx-translate/core), etc.*).

> Return type of the **`callback`** function must be **`string`** or **`Observable<string>`**.

When a **`callback`** function is supplied, the `MetaService` will try to **retrieve contents** of meta tags (*except `og:locale` and `og:locale:alternate`*) using the specified **`callback`**. You can customize the behavior for missing/empty values, directly from the **`callback`** function itself.

#### app.module.ts
```TypeScript
...
import { MetaModule, MetaLoader, MetaStaticLoader, PageTitlePositioning } from '@nglibs/meta';
import { TranslateService } from '@ngx-translate/core';
...

export function metaFactory(translate: TranslateService): MetaLoader {
  return new MetaStaticLoader({
    defer: true,
    callback: (key: string) => translate.get(key),
    pageTitlePositioning: PageTitlePositioning.PrependPageTitle,
    pageTitleSeparator: ' - ',
    applicationName: 'APP_NAME',
    defaults: {
      title: 'DEFAULT_TITLE',
      description: 'DEFAULT_DESC',
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
      useFactory: (metaFactory),
      deps: [TranslateService]
    })
  ],
  bootstrap: [AppComponent]
})
```

#### app.component.ts
```TypeScript
...
import { MetaService } from '@nglibs/meta';
...

@Component({
  ...
})
export class AppComponent implements OnInit {
  ...
  constructor(private readonly translate: TranslateService,
              private readonly meta: MetaService) { }

  ngOnInit(): void {
    // add available languages & set default language
    this.translate.addLangs(['en', 'tr']);
    this.translate.setDefaultLang(defaultLanguage.code);

    this.meta.init();
    this.meta.setTag('og:locale', 'en-US');

    this.translate.use('en').subscribe(() => {
      // refresh meta tags
      this.meta.refresh();
    });
  }
  ...
}
```

#### home.routes.ts
```TypeScript
import { Routes } from '@angular/router';
import { HomeComponent } from './home.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    data: {
      meta: {
        title: 'PUBLIC.HOME.PAGE_TITLE',
        description: 'PUBLIC.HOME.META_DESC'
      }
    }
  }
];
```

You can find out in-depth examples about the use of **`callback`** function on [@nglibs/example-app], which utilizes **`@nglibs`** utilities & showcasing common patterns and best practices.

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
[master]: https://github.com/nglibs/meta/tree/master
[v0.2.x]: https://github.com/nglibs/meta/tree/v0.2.x
[@nglibs/example-app]: https://github.com/nglibs/example-app
[@nglibs/config]: https://github.com/nglibs/config
[@nglibs/meta]: https://github.com/nglibs/meta
[@nglibs/i18n-router]: https://github.com/nglibs/i18n-router
[@nglibs/i18n-router-config-loader]: https://github.com/nglibs/i18n-router-config-loader
[@nglibs/universal-express-engine]: https://github.com/nglibs/universal-express-engine
[@nglibs/universal-transfer-state]: https://github.com/nglibs/universal-transfer-state
[forRoot]: https://angular.io/docs/ts/latest/guide/ngmodule.html#!#core-for-root
[AoT compilation]: https://angular.io/docs/ts/latest/cookbook/aot-compiler.html
[Burak Tasci]: http://www.buraktasci.com
