// angular
import { Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';

// libs
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/concat';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/reduce';
import 'rxjs/add/operator/take';
import * as _ from 'lodash';

// module
import { PageTitlePositioning } from './models/page-title-positioning';
import { MetaLoader } from './meta.loader';
import { isObservable, timeout } from './util';

@Injectable()
export class MetaService {
  private readonly metaSettings: any;
  private readonly isMetaTagSet: any;
  private useRouteData: boolean;

  @timeout(1)
  private static unsubscribe(sub: any): void {
    sub.unsubscribe();
  }

  constructor(public loader: MetaLoader,
              private readonly router: Router,
              private readonly title: Title,
              private readonly meta: Meta,
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

      MetaService.unsubscribe(sub);
    }
  }

  setTag(tag: string, value: string, deferred = true): void {
    if (tag === 'title')
      throw new Error(`Attempt to set ${tag} through 'setTag': 'title' is a reserved tag name. `
        + `Please use 'MetaService.setTitle' instead.`);

    value = value || _.get(this.metaSettings, `defaults.${tag}`, '');

    const value$ = (tag !== 'og:locale' && tag !== 'og:locale:alternate')
      ? this.callback(value)
      : Observable.of(value);

    if (!deferred)
      this.updateMetaTag(tag, value$);
    else {
      const sub = this.router.events
        .filter(event => (event instanceof NavigationEnd))
        .subscribe(() => {
          this.updateMetaTag(tag, value$);
        });

      MetaService.unsubscribe(sub);
    }
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
    const defaultTitle$ = _.has(this.metaSettings, 'defaults.title')
      ? this.callback(this.metaSettings.defaults.title)
      : Observable.of('');

    const title$ = !!title
      ? this.callback(title).concat(defaultTitle$).filter((res: string) => !!res).take(1)
      : defaultTitle$;

    switch (this.metaSettings.pageTitlePositioning) {
      case PageTitlePositioning.AppendPageTitle:
        return ((!override && !!this.metaSettings.pageTitleSeparator  && !!this.metaSettings.applicationName)
          ? this.callback(this.metaSettings.applicationName).map((res: string) => res + this.metaSettings.pageTitleSeparator)
          : Observable.of(''))
          .concat(title$)
          .reduce((acc: string, cur: string) => acc + cur);
      case PageTitlePositioning.PrependPageTitle:
        return title$
          .concat((!override && !!this.metaSettings.pageTitleSeparator && !!this.metaSettings.applicationName)
            ? this.callback(this.metaSettings.applicationName).map((res: string) => this.metaSettings.pageTitleSeparator + res)
            : Observable.of(''))
          .reduce((acc: string, cur: string) => acc + cur);
      default:
        throw new Error(`Invalid pageTitlePositioning specified [${this.metaSettings.pageTitlePositioning}]!`);
    }
  }

  private updateTitle(title$: Observable<string>): void {
    title$.subscribe((res: string) => {
      this.title.setTitle(res);
      this.meta.updateTag({
        property: 'og:title',
        content: res
      });
    });
  }

  private updateLocales(currentLocale: string, availableLocales: string): void {
    currentLocale = currentLocale || _.get(this.metaSettings, 'defaults["og:locale"]', '');

    if (!!currentLocale && !!this.metaSettings.defaults)
      this.metaSettings.defaults['og:locale'] = currentLocale.replace(/_/g, '-');

    // TODO: set HTML lang attribute - https://github.com/nglibs/meta/issues/32
    // const html = this.document.querySelector('html');
    // html.setAttribute('lang', currentLocale);

    let elements = this.meta.getTags(`property="og:locale:alternate"`);

    elements.forEach((element: any) => {
      this.meta.removeTagElement(element);
    });

    if (!!currentLocale && !!availableLocales) {
      availableLocales.split(',')
        .forEach((locale: string) => {
          if (currentLocale.replace(/-/g, '_') !== locale.replace(/-/g, '_')) {
            this.meta.addTag({
              property: 'og:locale:alternate',
              content: locale.replace(/-/g, '_')
            });
          }
        });
    }
  }

  private updateMetaTag(tag: string, value$: Observable<string>): void {
    value$.subscribe((res: string) => {
      if (tag.lastIndexOf('og:', 0) === 0)
        this.meta.updateTag({
          property: tag,
          content: tag === 'og:locale' ? res.replace(/-/g, '_') : res
        });
      else
        this.meta.updateTag({
          name: tag,
          content: res
        });

      this.isMetaTagSet[tag] = true;

      if (tag === 'description') {
        this.meta.updateTag({
          property: 'og:description',
          content: res
        });
      } else if (tag === 'author') {
        this.meta.updateTag({
          property: 'og:author',
          content: res
        });
      } else if (tag === 'publisher') {
        this.meta.updateTag({
          property: 'og:publisher',
          content: res
        });
      } else if (tag === 'og:locale') {
        const availableLocales = _.get(this.metaSettings, 'defaults["og:locale:alternate"]', '');

        this.updateLocales(res, availableLocales);
        this.isMetaTagSet['og:locale:alternate'] = true;
      } else if (tag === 'og:locale:alternate') {
        const currentLocale = this.meta.getTag('property="og:locale"').content;

        this.updateLocales(currentLocale, res);
        this.isMetaTagSet['og:locale'] = true;
      }
    });
  }

  private updateMetaTags(currentUrl: string, metaSettings?: any): void {
    if (!metaSettings) {
      const fallbackTitle = _.get(this.metaSettings, 'defaults.title', '') || this.metaSettings['applicationName'];

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

    Object.keys(_.get(this.metaSettings, 'defaults', {}))
      .forEach(key => {
        let value = this.metaSettings.defaults[key];

        if ((!!metaSettings && (key in this.isMetaTagSet || key in metaSettings)) || key === 'title' || key === 'override')
          return;
        else if (key === 'og:locale')
          value = value.replace(/-/g, '_');
        else if (key === 'og:locale:alternate') {
          const currentLocale = _.get(metaSettings, 'og:locale', undefined);
          this.updateLocales(currentLocale, value);

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

      const metaSettings = _.get(route.snapshot.routeConfig.data, 'meta', undefined);
      this.updateMetaTags(url, metaSettings);
    }
  }
}
