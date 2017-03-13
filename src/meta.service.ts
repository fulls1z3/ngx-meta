// angular
import { DOCUMENT, Title } from '@angular/platform-browser';
import { Inject, Injectable } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';

// libs
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/concat';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/reduce';
import 'rxjs/add/operator/take';

// module
import { PageTitlePositioning } from './models/page-title-positioning';
import { MetaLoader } from './meta.loader';
import { isObservable } from './util';

@Injectable()
export class MetaService {
  private readonly metaSettings: any;
  private readonly isMetaTagSet: any;
  private useRouteData: boolean;

  constructor(public loader: MetaLoader,
              private readonly router: Router,
              @Inject(DOCUMENT) private readonly document: any,
              private readonly title: Title,
              private readonly activatedRoute: ActivatedRoute) {
    this.metaSettings = loader.getSettings();
    this.isMetaTagSet = {};

    if (!this.metaSettings.defer)
      this.init();
  }

  init(useRouteData: boolean = true): void {
    // don't use route data unless allowed
    if (!useRouteData)
      return;

    this.useRouteData = true;

    this.router.events
      .filter(event => (event instanceof NavigationEnd))
      .subscribe((routeData: any) => {
        this.traverseRoutes(this.activatedRoute, routeData.urlAfterRedirects);
      });
  }

  refresh(): void {
    // don't use route data unless allowed
    if (!this.useRouteData)
      return;

    this.traverseRoutes(this.router.routerState.root, this.router.url);
  }

  setTitle(title: string, override = false, deferred = true): void {
    const title$ = this.getTitleWithPositioning(title, override);

    if (!deferred)
      this.updateTitle(title$);
    else {
      const sub = this.router.events
        .filter(event => (event instanceof NavigationEnd))
        .subscribe(() => {
          this.updateTitle(title$);
        });

      setTimeout(() => {
        sub.unsubscribe();
      }, 1);
    }
  }

  setTag(tag: string, value: string, deferred = true): void {
    if (tag === 'title')
      throw new Error(`Attempt to set ${tag} through 'setTag': 'title' is a reserved tag name. `
        + `Please use 'MetaService.setTitle' instead.`);

    const value$ = (tag !== 'og:locale' && tag !== 'og:locale:alternate')
      ? this.callback(!!value
        ? value
        : (!!this.metaSettings.defaults && this.metaSettings.defaults[tag])
          ? this.metaSettings.defaults[tag]
          : '')
      : Observable.of(!!value
        ? value
        : (!!this.metaSettings.defaults && this.metaSettings.defaults[tag])
          ? this.metaSettings.defaults[tag]
          : '');

    if (!deferred)
      this.updateMetaTag(tag, value$);
    else {
      const sub = this.router.events
        .filter(event => (event instanceof NavigationEnd))
        .subscribe(() => {
          this.updateMetaTag(tag, value$);
        });

      setTimeout(() => {
          sub.unsubscribe();
        },
        1);
    }
  }

  private createMetaTag(name: string): any {
    const el = this.document.createElement('meta');
    el.setAttribute(name.lastIndexOf('og:', 0) === 0 ? 'property' : 'name', name);
    this.document.head.appendChild(el);

    return el;
  }

  private getOrCreateMetaTag(name: string): any {
    let selector = `meta[name="${name}"]`;

    if (name.lastIndexOf('og:', 0) === 0)
      selector = `meta[property="${name}"]`;

    let el = this.document.querySelector(selector);

    if (!el)
      el = this.createMetaTag(name);

    return el;
  }

  private callback(value: string): Observable<string> {
    if (!!this.metaSettings.callback) {
      const value$ = this.metaSettings.callback(value);

      if (!isObservable(value$))
        return Observable.of(value$);

      return value$;
    }

    return Observable.of(value);
  }

  private getTitleWithPositioning(title: string, override: boolean): Observable<string> {
    const defaultTitle$ = (!!this.metaSettings.defaults && !!this.metaSettings.defaults['title'])
      ? this.callback(this.metaSettings.defaults['title'])
      : Observable.of('');

    const title$ = !!title
      ? this.callback(title).concat(defaultTitle$).filter((res: string) => !!res).take(1)
      : defaultTitle$;

    switch (this.metaSettings.pageTitlePositioning) {
      case PageTitlePositioning.AppendPageTitle:
        return ((!override
        && !!this.metaSettings.pageTitleSeparator
        && !!this.metaSettings.applicationName)
          ? this.callback(this.metaSettings.applicationName)
            .map((res: string) => res + this.metaSettings.pageTitleSeparator)
          : Observable.of(''))
          .concat(title$)
          .reduce((acc: string, cur: string) => acc + cur);
      case PageTitlePositioning.PrependPageTitle:
        return title$
          .concat((!override
          && !!this.metaSettings.pageTitleSeparator
          && !!this.metaSettings.applicationName)
            ? this.callback(this.metaSettings.applicationName)
              .map((res: string) => this.metaSettings.pageTitleSeparator + res)
            : Observable.of(''))
          .reduce((acc: string, cur: string) => acc + cur);
      default:
        throw new Error(`Invalid pageTitlePositioning specified [${this.metaSettings.pageTitlePositioning}]!`);
    }
  }

  private updateTitle(title$: Observable<string>): void {
    const ogTitleElement = this.getOrCreateMetaTag('og:title');

    title$.subscribe((res: string) => {
      ogTitleElement.setAttribute('content', res);
      this.title.setTitle(res);
    });
  }

  private updateLocales(currentLocale: string, availableLocales: string): void {
    if (!currentLocale)
      currentLocale = !!this.metaSettings.defaults
        ? this.metaSettings.defaults['og:locale']
        : '';

    if (!!currentLocale && !!this.metaSettings.defaults)
      this.metaSettings.defaults['og:locale'] = currentLocale.replace(/_/g, '-');

    const html = this.document.querySelector('html');
    html.setAttribute('lang', currentLocale);

    const selector = `meta[property="og:locale:alternate"]`;
    let elements = this.document.querySelectorAll(selector);

    // fixes "TypeError: Object doesn't support property or method 'forEach'" issue on IE11
    elements = Array.prototype.slice.call(elements);

    elements.forEach((el: any) => {
      this.document.head.removeChild(el);
    });

    if (!!currentLocale && !!availableLocales) {
      availableLocales.split(',')
        .forEach((locale: string) => {
          if (currentLocale.replace(/-/g, '_') !== locale.replace(/-/g, '_')) {
            const el = this.createMetaTag('og:locale:alternate');
            el.setAttribute('content', locale.replace(/-/g, '_'));
          }
        });
    }
  }

  private updateMetaTag(tag: string, value$: Observable<string>): void {
    const tagElement = this.getOrCreateMetaTag(tag);

    value$.subscribe((res: string) => {
      tagElement.setAttribute('content', tag === 'og:locale' ? res.replace(/-/g, '_') : res);
      this.isMetaTagSet[tag] = true;

      if (tag === 'description') {
        const ogDescriptionElement = this.getOrCreateMetaTag('og:description');
        ogDescriptionElement.setAttribute('content', res);
      } else if (tag === 'author') {
        const ogAuthorElement = this.getOrCreateMetaTag('og:author');
        ogAuthorElement.setAttribute('content', res);
      } else if (tag === 'publisher') {
        const ogPublisherElement = this.getOrCreateMetaTag('og:publisher');
        ogPublisherElement.setAttribute('content', res);
      } else if (tag === 'og:locale') {
        const availableLocales = !!this.metaSettings.defaults
          ? this.metaSettings.defaults['og:locale:alternate']
          : '';

        this.updateLocales(res, availableLocales);
        this.isMetaTagSet['og:locale:alternate'] = true;
      } else if (tag === 'og:locale:alternate') {
        const ogLocaleElement = this.getOrCreateMetaTag('og:locale');
        const currentLocale = ogLocaleElement.getAttribute('content');

        this.updateLocales(currentLocale, res);
        this.isMetaTagSet['og:locale'] = true;
      }
    });
  }

  private updateMetaTags(currentUrl: string, metaSettings?: any): void {
    if (!metaSettings) {
      const fallbackTitle = !!this.metaSettings.defaults
        ? (this.metaSettings.defaults['title'] || this.metaSettings['applicationName'])
        : this.metaSettings['applicationName'];

      this.setTitle(fallbackTitle, true, false);
    } else {
      if (metaSettings.disabled) {
        this.updateMetaTags(currentUrl);
        return;
      }

      this.setTitle(metaSettings.title, metaSettings.override, false);

      Object.keys(metaSettings)
        .forEach(key => {
          let value = metaSettings[key];

          if (key === 'title' || key === 'override')
            return;
          else if (key === 'og:locale')
            value = value.replace(/-/g, '_');
          else if (key === 'og:locale:alternate') {
            const currentLocale = metaSettings['og:locale'];
            this.updateLocales(currentLocale, metaSettings[key]);

            return;
          }

          this.setTag(key, value, false);
        });
    }

    if (!!this.metaSettings.defaults)
      Object.keys(this.metaSettings.defaults)
        .forEach(key => {
          let value = this.metaSettings.defaults[key];

          if ((!!metaSettings && (key in this.isMetaTagSet || key in metaSettings)) || key === 'title' || key === 'override')
            return;
          else if (key === 'og:locale')
            value = value.replace(/-/g, '_');
          else if (key === 'og:locale:alternate') {
            const currentLocale = !!metaSettings ? metaSettings['og:locale'] : undefined;
            this.updateLocales(currentLocale, this.metaSettings.defaults[key]);

            return;
          }

          this.setTag(key, value, false);
        });

    const url = ((this.metaSettings.applicationUrl || '/') + currentUrl)
      .replace(/(https?:\/\/)|(\/)+/g, '$1$2')
      .replace(/\/$/g, '');

    this.setTag('og:url', url || '/', false);
  }

  private traverseRoutes(route: ActivatedRoute, url: string): void {
    while (route.children.length > 0) {
      route = route.firstChild;

      if (!!route.snapshot.routeConfig.data) {
        const metaSettings = route.snapshot.routeConfig.data['meta'];
        this.updateMetaTags(url, metaSettings);
      }
      else
        this.updateMetaTags(url);
    }
  }
}
