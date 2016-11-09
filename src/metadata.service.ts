// angular
import { Title, DOCUMENT } from '@angular/platform-browser';
import { Inject, Injectable } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';

// libs
import 'rxjs/add/operator/filter';

// module
import { PageTitlePositioning } from './models/page-title-positioning';
import { MetadataLoader } from './metadata.loader';

@Injectable()
export class MetadataService {
    private readonly metadataSettings: any;
    private readonly isMetadataSet: any;

    constructor(private readonly router: Router,
                @Inject(DOCUMENT) private readonly document: any,
                private readonly titleService: Title,
                private readonly activatedRoute: ActivatedRoute,
                public loader: MetadataLoader) {
        this.metadataSettings = loader.getSettings();
        this.isMetadataSet = {};

        this.router.events
            .filter(event => (event instanceof NavigationEnd))
            .subscribe((routeData: any) => {
                let route = this.activatedRoute;

                while (route.children.length > 0) {
                    route = route.firstChild;

                    if (!!route.snapshot.routeConfig.data) {
                        const metadata = route.snapshot.routeConfig.data['metadata'];

                        if (!!metadata)
                            this.updateMetadata(metadata, routeData.url);
                    }
                }
            });
    }

    setTitle(title: string, override = false): void {
        const ogTitleElement = this.getOrCreateMetaTag('og:title');

        switch (this.metadataSettings.pageTitlePositioning) {
            case PageTitlePositioning.AppendPageTitle:
                title = (!override
                        && !!this.metadataSettings.pageTitleSeparator
                        && !!this.metadataSettings.applicationName
                        ? (this.metadataSettings.applicationName + this.metadataSettings.pageTitleSeparator)
                        : '')
                    + (!!title ? title : (this.metadataSettings.defaults['title'] || ''));
                break;
            case PageTitlePositioning.PrependPageTitle:
                title = (!!title ? title : (this.metadataSettings.defaults['title'] || ''))
                    + (!override
                        && !!this.metadataSettings.pageTitleSeparator
                        && !!this.metadataSettings.applicationName
                        ? (this.metadataSettings.pageTitleSeparator + this.metadataSettings.applicationName)
                        : '');
                break;
            default:
                throw new Error(`Error: Invalid pageTitlePositioning specified [${this.metadataSettings.pageTitlePositioning}]!`);
        }

        if (!title)
            console.warn('WARNING: No "page title" specified.');

        ogTitleElement.setAttribute('content', title);
        this.titleService.setTitle(title);
    }

    setTag(tag: string, value: string): void {
        if (tag === 'title')
            throw new Error(`Error: Attempt to set ${tag} through 'setTag': 'title' is a reserved tag name. `
                + `Please use 'MetadataService.setTitle' instead.`);

        value = !!value
            ? value
            : !!this.metadataSettings.defaults ? this.metadataSettings.defaults[tag] : '';

        const tagElement = this.getOrCreateMetaTag(tag);

        tagElement.setAttribute('content', tag === 'og:locale' ? value.replace(/-/g, '_') : value);
        this.isMetadataSet[tag] = true;

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
            const availableLocales = !!this.metadataSettings.defaults
                ? this.metadataSettings.defaults['og:locale:alternate']
                : '';

            this.updateLocales(value, availableLocales);
            this.isMetadataSet['og:locale:alternate'] = true;
        } else if (tag === 'og:locale:alternate') {
            const ogLocaleElement = this.getOrCreateMetaTag('og:locale');
            const currentLocale = ogLocaleElement.getAttribute('content');

            this.updateLocales(currentLocale, value);
            this.isMetadataSet['og:locale'] = true;
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
            currentLocale = !!this.metadataSettings.defaults
                ? this.metadataSettings.defaults['og:locale']
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

    private updateMetadata(metadata: any, currentUrl: string): void {
        if (metadata.disabled)
            return;

        this.setTitle(metadata.title, metadata.override);

        Object.keys(metadata)
            .forEach(key => {
                let value = metadata[key];

                if (key === 'title' || key === 'override')
                    return;
                else if (key === 'og:locale')
                    value = value.replace(/-/g, '_');
                else if (key === 'og:locale:alternate') {
                    const currentLocale = metadata['og:locale'];
                    this.updateLocales(currentLocale, metadata[key]);

                    return;
                }

                this.setTag(key, value);
            });

        if (!!this.metadataSettings.defaults)
            Object.keys(this.metadataSettings.defaults)
                .forEach(key => {

                    let value = this.metadataSettings.defaults[key];

                    if (key in this.isMetadataSet || key in metadata || key === 'title' || key === 'override')
                        return;
                    else if (key === 'og:locale')
                        value = value.replace(/-/g, '_');
                    else if (key === 'og:locale:alternate') {
                        const currentLocale = metadata['og:locale'];
                        this.updateLocales(currentLocale, this.metadataSettings.defaults[key]);

                        return;
                    }

                    this.setTag(key, value);
                });

        this.setTag('og:url', (this.metadataSettings.applicationUrl || '/')  + currentUrl.replace(/\/$/g, ''));
    }
}
