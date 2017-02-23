// angular
import { Title, DOCUMENT } from '@angular/platform-browser';
import { Inject, Injectable } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';

// libs
import 'rxjs/add/operator/filter';

// module
import { PageTitlePositioning } from './models/page-title-positioning';
import { MetaLoader } from './meta.loader';

@Injectable()
export class MetaService {
    private readonly metaSettings: any;
    private readonly isMetaSet: any;

    constructor(public loader: MetaLoader,
                private readonly router: Router,
                @Inject(DOCUMENT) private readonly document: any,
                private readonly titleService: Title,
                private readonly activatedRoute: ActivatedRoute) {
        this.metaSettings = loader.getSettings();
        this.isMetaSet = {};

        this.router.events
            .filter(event => (event instanceof NavigationEnd))
            .subscribe((routeData: any) => {
                let route = this.activatedRoute;

                while (route.children.length > 0) {
                    route = route.firstChild;

                    if (!!route.snapshot.routeConfig.data) {
                        const meta = route.snapshot.routeConfig.data['meta'];

                        if (!!meta)
                            this.updateMeta(meta, routeData.url);
                    }
                }
            });
    }

    setTitle(title: string, override = false): void {
        const ogTitleElement = this.getOrCreateMetaTag('og:title');

        switch (this.metaSettings.pageTitlePositioning) {
            case PageTitlePositioning.AppendPageTitle:
                title = (!override
                        && !!this.metaSettings.pageTitleSeparator
                        && !!this.metaSettings.applicationName
                        ? (this.metaSettings.applicationName + this.metaSettings.pageTitleSeparator)
                        : '')
                    + (!!title ? title : (this.metaSettings.defaults['title'] || ''));
                break;
            case PageTitlePositioning.PrependPageTitle:
                title = (!!title ? title : (this.metaSettings.defaults['title'] || ''))
                    + (!override
                        && !!this.metaSettings.pageTitleSeparator
                        && !!this.metaSettings.applicationName
                        ? (this.metaSettings.pageTitleSeparator + this.metaSettings.applicationName)
                        : '');
                break;
            default:
                throw new Error(`Invalid pageTitlePositioning specified [${this.metaSettings.pageTitlePositioning}]!`);
        }

        if (!title)
            console.warn('WARNING: No "page title" specified.');

        ogTitleElement.setAttribute('content', title);
        this.titleService.setTitle(title);
    }

    setTag(tag: string, value: string): void {
        if (tag === 'title')
            throw new Error(`Attempt to set ${tag} through 'setTag': 'title' is a reserved tag name. `
                + `Please use 'MetaService.setTitle' instead.`);

        value = !!value
            ? value
            : !!this.metaSettings.defaults ? this.metaSettings.defaults[tag] : '';

        const tagElement = this.getOrCreateMetaTag(tag);

        tagElement.setAttribute('content', tag === 'og:locale' ? value.replace(/-/g, '_') : value);
        this.isMetaSet[tag] = true;

        if (tag === 'description') {
            const ogDescriptionElement = this.getOrCreateMetaTag('og:description');
            ogDescriptionElement.setAttribute('content', value);
        } else if (tag === 'author') {
            const ogAuthorElement = this.getOrCreateMetaTag('og:author');
            ogAuthorElement.setAttribute('content', value);
        } else if (tag === 'publisher') {
            const ogPublisherElement = this.getOrCreateMetaTag('og:publisher');
            ogPublisherElement.setAttribute('content', value);
        } else if (tag === 'og:locale') {
            const availableLocales = !!this.metaSettings.defaults
                ? this.metaSettings.defaults['og:locale:alternate']
                : '';

            this.updateLocales(value, availableLocales);
            this.isMetaSet['og:locale:alternate'] = true;
        } else if (tag === 'og:locale:alternate') {
            const ogLocaleElement = this.getOrCreateMetaTag('og:locale');
            const currentLocale = ogLocaleElement.getAttribute('content');

            this.updateLocales(currentLocale, value);
            this.isMetaSet['og:locale'] = true;
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

    private updateLocales(currentLocale: string, availableLocales: any): void {
        if (!currentLocale)
            currentLocale = !!this.metaSettings.defaults
                ? this.metaSettings.defaults['og:locale']
                : '';

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
                    if (currentLocale !== locale) {
                        const el = this.createMetaTag('og:locale:alternate');
                        el.setAttribute('content', locale.replace(/-/g, '_'));
                    }
                });
        }
    }

    private updateMeta(meta: any, currentUrl: string): void {
        if (meta.disabled)
            return;

        this.setTitle(meta.title, meta.override);

        Object.keys(meta)
            .forEach(key => {
                let value = meta[key];

                if (key === 'title' || key === 'override')
                    return;
                else if (key === 'og:locale')
                    value = value.replace(/-/g, '_');
                else if (key === 'og:locale:alternate') {
                    const currentLocale = meta['og:locale'];
                    this.updateLocales(currentLocale, meta[key]);

                    return;
                }

                this.setTag(key, value);
            });

        if (!!this.metaSettings.defaults)
            Object.keys(this.metaSettings.defaults)
                .forEach(key => {

                    let value = this.metaSettings.defaults[key];

                    if (key in this.isMetaSet || key in meta || key === 'title' || key === 'override')
                        return;
                    else if (key === 'og:locale')
                        value = value.replace(/-/g, '_');
                    else if (key === 'og:locale:alternate') {
                        const currentLocale = meta['og:locale'];
                        this.updateLocales(currentLocale, this.metaSettings.defaults[key]);

                        return;
                    }

                    this.setTag(key, value);
                });

        this.setTag('og:url', (this.metaSettings.applicationUrl || '/')  + currentUrl.replace(/\/$/g, ''));
    }
}
