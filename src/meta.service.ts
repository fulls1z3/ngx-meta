// angular
import { Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

// libs
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import * as _ from 'lodash';

// module
import { PageTitlePositioning } from './models/page-title-positioning';
import { MetaLoader } from './meta.loader';
import { isObservable } from './util';

@Injectable()
export class MetaService {
  private readonly metaSettings: any;
  private readonly isMetaTagSet: any;

  constructor(public loader: MetaLoader,
              private readonly title: Title,
              private readonly meta: Meta) {
    this.metaSettings = loader.getSettings();
    this.isMetaTagSet = {};
  }

  setTitle(title: string, override = false): void {
    const title$ = !!title
      ? this.callback(title)
      : Observable.of('');

    title$.subscribe((res: string) => {
      let fullTitle = '';

      if (!res) {
        const defaultTitle$ = _.has(this.metaSettings, 'defaults.title')
          ? this.callback(this.metaSettings.defaults.title)
          : Observable.of('');

        defaultTitle$.subscribe((defaultTitle: string) => {
          if (!override && this.metaSettings.pageTitleSeparator && this.metaSettings.applicationName) {
            this.callback(this.metaSettings.applicationName).subscribe((applicationName: string) => {
              fullTitle = !!applicationName ? this.getTitleWithPositioning(defaultTitle, applicationName) : defaultTitle;
              this.updateTitle(fullTitle);
            });
          }
          else
            this.updateTitle(defaultTitle);
        });
      } else {
        if (!override && this.metaSettings.pageTitleSeparator && this.metaSettings.applicationName) {
          this.callback(this.metaSettings.applicationName).subscribe((applicationName: string) => {
            fullTitle = !!applicationName ? this.getTitleWithPositioning(res, applicationName) : res;
            this.updateTitle(fullTitle);
          });
        }
        else
          this.updateTitle(res);
      }
    });
  }

  setTag(key: string, value: string): void {
    if (key === 'title')
      throw new Error(`Attempt to set ${key} through 'setTag': 'title' is a reserved tag name. `
        + `Please use 'MetaService.setTitle' instead.`);

    value = value || _.get(this.metaSettings, `defaults.${key}`, '');

    const value$ = (key !== 'og:locale' && key !== 'og:locale:alternate')
      ? this.callback(value)
      : Observable.of(value);

    value$.subscribe((res: string) => {
      this.updateTag(key, res);
    });
  }

  update(currentUrl: string, metaSettings?: any): void {
    if (!metaSettings) {
      const fallbackTitle = _.get(this.metaSettings, 'defaults.title', '') || this.metaSettings['applicationName'];

      this.setTitle(fallbackTitle, true);
    } else {
      if (metaSettings.disabled) {
        this.update(currentUrl);
        return;
      }

      this.setTitle(metaSettings.title, metaSettings.override);

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

          this.setTag(key, value);
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

        this.setTag(key, value);
      });

    const url = ((this.metaSettings.applicationUrl || '/') + currentUrl)
      .replace(/(https?:\/\/)|(\/)+/g, '$1$2')
      .replace(/\/$/g, '');

    this.setTag('og:url', url || '/');
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

  private getTitleWithPositioning(title: string, applicationName: string): string {
    switch (this.metaSettings.pageTitlePositioning) {
      case PageTitlePositioning.AppendPageTitle:
        return applicationName + this.metaSettings.pageTitleSeparator + title;
      case PageTitlePositioning.PrependPageTitle:
        return title + this.metaSettings.pageTitleSeparator + applicationName;
      default:
        throw new Error(`Invalid pageTitlePositioning specified [${this.metaSettings.pageTitlePositioning}]!`);
    }
  }

  private updateTitle(title: string): void {
    this.title.setTitle(title);
    this.meta.updateTag({
      property: 'og:title',
      content: title
    });
  };

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

  private updateTag(key: string, value: string): void {
    if (key.lastIndexOf('og:', 0) === 0)
      this.meta.updateTag({
        property: key,
        content: key === 'og:locale' ? value.replace(/-/g, '_') : value
      });
    else
      this.meta.updateTag({
        name: key,
        content: value
      });

    this.isMetaTagSet[key] = true;

    if (key === 'description') {
      this.meta.updateTag({
        property: 'og:description',
        content: value
      });
    } else if (key === 'author') {
      this.meta.updateTag({
        property: 'og:author',
        content: value
      });
    } else if (key === 'publisher') {
      this.meta.updateTag({
        property: 'og:publisher',
        content: value
      });
    } else if (key === 'og:locale') {
      const availableLocales = _.get(this.metaSettings, 'defaults["og:locale:alternate"]', '');

      this.updateLocales(value, availableLocales);
      this.isMetaTagSet['og:locale:alternate'] = true;
    } else if (key === 'og:locale:alternate') {
      const currentLocale = this.meta.getTag('property="og:locale"').content;

      this.updateLocales(currentLocale, value);
      this.isMetaTagSet['og:locale'] = true;
    }
  }
}
