// angular
import { Title, DOCUMENT } from '@angular/platform-browser';
import { fakeAsync, getTestBed, inject, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

// libs
import * as _ from 'lodash';

// module
import { MetaLoader, MetaStaticLoader, MetaService, PageTitlePositioning } from '../index';
import { TestBootstrapComponent, TestComponent, testSettings, defaultSettings, emptySettings, testModuleConfig } from './index.spec';

const getAttribute = (doc: any, name: string, attribute: string) => {
    let selector = `meta[name="${name}"]`;

    if (name.lastIndexOf('og:', 0) === 0)
        selector = `meta[property="${name}"]`;

    const el = doc.querySelector(selector);

    return !!el ? el.getAttribute(attribute) : undefined;
};

describe('@nglibs/meta:',
    () => {
        beforeEach(() => {
            const settings = _.cloneDeep(testSettings);
            const metaFactory = () => new MetaStaticLoader(settings);

            testModuleConfig({ provide: MetaLoader, useFactory: (metaFactory) });
        });

        describe('MetaService',
            () => {
                it('is defined',
                    inject([MetaService],
                        (meta: MetaService) => {
                            expect(MetaService).toBeDefined();
                            expect(meta).toBeDefined();
                            expect(meta instanceof MetaService).toBeTruthy();
                        }));

                it('should be able to set meta tags using routes',
                    fakeAsync(inject([Title, DOCUMENT],
                        (title: Title, doc: any) => {
                            const injector = getTestBed();
                            const router = injector.get(Router);

                            const fixture = TestBed.createComponent(TestBootstrapComponent);
                            fixture.detectChanges();

                            // initial navigation
                            router.navigate(['/'])
                                .then(() => {
                                    expect(title.getTitle()).toEqual('Sweet home - Tour of (lazy/busy) heroes');
                                    expect(getAttribute(doc, 'description', 'content')).toEqual('Home, home sweet home... and what?');
                                    expect(getAttribute(doc, 'og:url', 'content')).toEqual('http://localhost:3000');

                                    // navigate to /toothpaste (override applicationName)
                                    router.navigate(['/toothpaste'])
                                        .then(() => {
                                            expect(title.getTitle()).toEqual('Toothpaste');
                                            expect(getAttribute(doc, 'description', 'content'))
                                                .toEqual('Eating toothpaste is considered to be too healthy!');
                                            expect(getAttribute(doc, 'og:url', 'content')).toEqual('http://localhost:3000/toothpaste');

                                            // navigate to /duck (meta disable)
                                            router.navigate(['/duck'])
                                                .then(() => {
                                                    expect(title.getTitle()).toEqual('Mighty mighty mouse');
                                                    expect(getAttribute(doc, 'description', 'content'))
                                                        .toEqual('Mighty Mouse is an animated superhero mouse character');
                                                    expect(getAttribute(doc, 'og:url', 'content'))
                                                        .toEqual('http://localhost:3000/duck');

                                                    // navigate to /no-data
                                                    router.navigate(['/no-data'])
                                                        .then(() => {
                                                            expect(title.getTitle()).toEqual('Mighty mighty mouse');
                                                            expect(getAttribute(doc, 'description', 'content'))
                                                                .toEqual('Mighty Mouse is an animated superhero mouse character');
                                                            expect(getAttribute(doc, 'og:url', 'content'))
                                                                .toEqual('http://localhost:3000/no-data');

                                                            // navigate to /no-meta
                                                            router.navigate(['/no-meta'])
                                                                .then(() => {
                                                                    expect(title.getTitle()).toEqual('Mighty mighty mouse');
                                                                    expect(getAttribute(doc, 'description', 'content'))
                                                                        .toEqual('Mighty Mouse is an animated superhero mouse character');
                                                                    expect(getAttribute(doc, 'og:url', 'content'))
                                                                        .toEqual('http://localhost:3000/no-meta');
                                                                });
                                                        });
                                                });
                                        });
                                });
                        })));

                it('should be able to set meta tags using routes w/o `meta` property',
                    fakeAsync(inject([Title, DOCUMENT],
                        (title: Title, doc: any) => {
                            const injector = getTestBed();
                            const router = injector.get(Router);

                            const fixture = TestBed.createComponent(TestBootstrapComponent);
                            fixture.detectChanges();

                            // initial navigation
                            router.navigate(['/no-data'])
                                .then(() => {
                                    expect(title.getTitle()).toEqual('Mighty mighty mouse');
                                    expect(getAttribute(doc, 'description', 'content'))
                                        .toEqual('Mighty Mouse is an animated superhero mouse character');
                                    expect(getAttribute(doc, 'og:url', 'content')).toEqual('http://localhost:3000/no-data');
                                });
                        })));

                it('should be able to set meta tags using routes w/o default settings',
                    fakeAsync(inject([Title, DOCUMENT],
                        (title: Title, doc: any) => {
                            const settings = _.cloneDeep(emptySettings);
                            const metaFactory = () => new MetaStaticLoader(settings);

                            testModuleConfig({ provide: MetaLoader, useFactory: (metaFactory) });

                            const injector = getTestBed();
                            const router = injector.get(Router);

                            const fixture = TestBed.createComponent(TestBootstrapComponent);
                            fixture.detectChanges();

                            // initial navigation
                            router.navigate(['/'])
                                .then(() => {
                                    expect(title.getTitle()).toEqual('Sweet home');
                                    expect(getAttribute(doc, 'description', 'content')).toEqual('Home, home sweet home... and what?');
                                    expect(getAttribute(doc, 'og:url', 'content')).toEqual('/');
                                });
                        })));

                it('should be able to set meta tags using routes w/o default `title` w/o `meta` property',
                    fakeAsync(inject([Title, DOCUMENT],
                        (title: Title, doc: any) => {
                            const settings = _.cloneDeep(defaultSettings);
                            settings.applicationName = 'Tour of (lazy/busy) heroes';
                            settings.defaults = {
                                'description': 'Mighty Mouse is an animated superhero mouse character'
                            };

                            const metaFactory = () => new MetaStaticLoader(settings);

                            testModuleConfig({ provide: MetaLoader, useFactory: (metaFactory) });

                            const injector = getTestBed();
                            const router = injector.get(Router);

                            const fixture = TestBed.createComponent(TestBootstrapComponent);
                            fixture.detectChanges();

                            // initial navigation
                            router.navigate(['/no-data'])
                                .then(() => {
                                    expect(title.getTitle()).toEqual('Tour of (lazy/busy) heroes');
                                    expect(getAttribute(doc, 'description', 'content'))
                                        .toEqual('Mighty Mouse is an animated superhero mouse character');
                                    expect(getAttribute(doc, 'og:url', 'content')).toEqual('/no-data');
                                });
                        })));

                it('should be able to set meta tags using routes w/o default settings w/o `meta` property',
                    fakeAsync(inject([Title, DOCUMENT],
                        (title: Title, doc: any) => {
                            const settings = _.cloneDeep(emptySettings);
                            const metaFactory = () => new MetaStaticLoader(settings);

                            testModuleConfig({ provide: MetaLoader, useFactory: (metaFactory) });

                            const injector = getTestBed();
                            const router = injector.get(Router);

                            const fixture = TestBed.createComponent(TestBootstrapComponent);
                            fixture.detectChanges();

                            // initial navigation
                            router.navigate(['/no-data'])
                                .then(() => {
                                    expect(title.getTitle()).toEqual('');
                                    expect(getAttribute(doc, 'og:url', 'content')).toEqual('/no-data');
                                });
                        })));

                it('should be able to set `title`',
                    inject([MetaService, Title],
                        (meta: MetaService, title: Title) => {
                            // default title
                            meta.setTitle('');
                            expect(title.getTitle()).toEqual('Mighty mighty mouse - Tour of (lazy/busy) heroes');

                            // given title
                            meta.setTitle('Mighty tiny mouse');
                            expect(title.getTitle()).toEqual('Mighty tiny mouse - Tour of (lazy/busy) heroes');

                            // override applicationName
                            meta.setTitle('Mighty tiny mouse', true);
                            expect(title.getTitle()).toEqual('Mighty tiny mouse');
                        }));

                it('should be able to set `title` (appended)',
                    inject([Title],
                        (title: Title) => {
                            const settings = _.cloneDeep(testSettings);
                            settings.pageTitlePositioning = PageTitlePositioning.AppendPageTitle;

                            const metaFactory = () => new MetaStaticLoader(settings);

                            testModuleConfig({ provide: MetaLoader, useFactory: (metaFactory) });

                            const injector = getTestBed();
                            const meta = injector.get(MetaService);

                            // default title
                            meta.setTitle('');
                            expect(title.getTitle()).toEqual('Tour of (lazy/busy) heroes - Mighty mighty mouse');

                            // given title
                            meta.setTitle('Mighty tiny mouse');
                            expect(title.getTitle()).toEqual('Tour of (lazy/busy) heroes - Mighty tiny mouse');

                            // override applicationName
                            meta.setTitle('Mighty tiny mouse', true);
                            expect(title.getTitle()).toEqual('Mighty tiny mouse');
                        }));

                it('should be able to set `title` w/o default settings',
                    inject([Title],
                        (title: Title) => {
                            const metaFactory = () => new MetaStaticLoader({
                                pageTitlePositioning: PageTitlePositioning.PrependPageTitle,
                                defaults: {}
                            });

                            testModuleConfig({ provide: MetaLoader, useFactory: (metaFactory) });

                            const injector = getTestBed();
                            const meta = injector.get(MetaService);

                            meta.setTitle('');
                            expect(title.getTitle()).toEqual('');
                        }));

                it('should be able to set `title` w/o default settings (appended)',
                    inject([Title],
                        (title: Title) => {
                            const metaFactory = () => new MetaStaticLoader({
                                pageTitlePositioning: PageTitlePositioning.AppendPageTitle,
                                defaults: {}
                            });

                            testModuleConfig({ provide: MetaLoader, useFactory: (metaFactory) });

                            const injector = getTestBed();
                            const meta = injector.get(MetaService);

                            meta.setTitle('');
                            expect(title.getTitle()).toEqual('');
                        }));

                it('should throw if you provide an invalid `PageTitlePositioning`',
                    () => {
                        const settings = _.cloneDeep(testSettings);
                        settings.pageTitlePositioning = undefined;

                        const metaFactory = () => new MetaStaticLoader(settings);

                        testModuleConfig({ provide: MetaLoader, useFactory: (metaFactory) });

                        const injector = getTestBed();
                        const meta = injector.get(MetaService);

                        expect(() => meta.setTitle('')).toThrowError('Invalid pageTitlePositioning specified [undefined]!');
                    });

                it('should throw if you attempt to set `title` through `setTag` method',
                    inject([MetaService],
                        (meta: MetaService) => {
                            expect(() => meta.setTag('title', ''))
                                .toThrowError(`Attempt to set title through 'setTag': 'title' is a reserved tag name. `
                                    + `Please use 'MetaService.setTitle' instead.`);
                        }));

                it('should be able to set meta `description`',
                    inject([MetaService, DOCUMENT],
                        (meta: MetaService, doc: any) => {
                            // default meta description
                            meta.setTag('description', '');
                            expect(getAttribute(doc, 'description', 'content'))
                                .toEqual('Mighty Mouse is an animated superhero mouse character');

                            // given meta description
                            meta.setTag('description', 'Mighty Mouse is a cool character');
                            expect(getAttribute(doc, 'description', 'content')).toEqual('Mighty Mouse is a cool character');
                        }));

                it('should be able to set meta `description` w/o default settings',
                    inject([DOCUMENT],
                        (doc: any) => {
                            const settings = _.cloneDeep(emptySettings);
                            const metaFactory = () => new MetaStaticLoader(settings);

                            testModuleConfig({ provide: MetaLoader, useFactory: (metaFactory) });

                            const injector = getTestBed();
                            const meta = injector.get(MetaService);

                            meta.setTag('description', '');
                            expect(getAttribute(doc, 'description', 'content')).toEqual('');
                        }));

                it('should be able to set meta `author`',
                    inject([MetaService, DOCUMENT],
                        (meta: MetaService, doc: any) => {
                            // default meta author
                            meta.setTag('author', '');
                            expect(getAttribute(doc, 'author', 'content')).toEqual('Mighty Mouse');

                            // given meta author
                            meta.setTag('author', 'Mickey Mouse');
                            expect(getAttribute(doc, 'author', 'content')).toEqual('Mickey Mouse');
                        }));

                it('should be able to set meta `publisher`',
                    inject([MetaService, DOCUMENT],
                        (meta: MetaService, doc: any) => {
                            // default meta publisher
                            meta.setTag('publisher', '');
                            expect(getAttribute(doc, 'publisher', 'content')).toEqual('a superhero');

                            // given meta publisher
                            meta.setTag('publisher', 'another superhero');
                            expect(getAttribute(doc, 'publisher', 'content')).toEqual('another superhero');
                        }));

                it('should be able to set `og:locale`',
                    inject([MetaService, DOCUMENT],
                        (meta: MetaService, doc: any) => {
                            // default og:locale
                            meta.setTag('og:locale', '');
                            expect(getAttribute(doc, 'og:locale', 'content')).toEqual('en_US');

                            let elements = doc.querySelectorAll('meta[property="og:locale:alternate"]');

                            expect(elements.length).toEqual(2);
                            expect(elements[0].getAttribute('content')).toEqual('nl_NL');
                            expect(elements[1].getAttribute('content')).toEqual('tr_TR');

                            // given og:locale
                            meta.setTag('og:locale', 'tr-TR');
                            expect(getAttribute(doc, 'og:locale', 'content')).toEqual('tr_TR');

                            elements = doc.querySelectorAll('meta[property="og:locale:alternate"]');

                            expect(elements.length).toEqual(2);
                            expect(elements[0].getAttribute('content')).toEqual('en_US');
                            expect(elements[1].getAttribute('content')).toEqual('nl_NL');
                        }));

                it('should be able to set `og:locale:alternate` w/ `og:locale`',
                    inject([MetaService, DOCUMENT],
                        (meta: MetaService, doc: any) => {
                            // default og:locale
                            meta.setTag('og:locale', '');

                            const elements = doc.querySelectorAll('meta[property="og:locale:alternate"]');

                            expect(elements.length).toEqual(2);
                            expect(elements[0].getAttribute('content')).toEqual('nl_NL');
                            expect(elements[1].getAttribute('content')).toEqual('tr_TR');
                        }));

                it('should be able to set `og:locale:alternate` w/ `og:locale:alternate`',
                    inject([MetaService, DOCUMENT],
                        (meta: MetaService, doc: any) => {
                            // default og:locale:alternate
                            meta.setTag('og:locale:alternate', '');

                            const elements = doc.querySelectorAll('meta[property="og:locale:alternate"]');

                            expect(elements.length).toEqual(2);
                            expect(elements[0].getAttribute('content')).toEqual('nl_NL');
                            expect(elements[1].getAttribute('content')).toEqual('tr_TR');

                            // given og:locale:alternate
                            meta.setTag('og:locale:alternate', 'tr-TR');
                            expect(getAttribute(doc, 'og:locale:alternate', 'content')).toEqual('tr_TR');
                        }));

                it('should be able to set `og:locale` w/o default settings',
                    inject([DOCUMENT],
                        (doc: any) => {
                            const settings = _.cloneDeep(emptySettings);
                            const metaFactory = () => new MetaStaticLoader(settings);

                            testModuleConfig({ provide: MetaLoader, useFactory: (metaFactory) });

                            const injector = getTestBed();
                            const meta = injector.get(MetaService);

                            meta.setTag('og:locale', '');
                            expect(getAttribute(doc, 'og:locale', 'content')).toEqual('');
                        }));

                it('should be able to do not set `og:locale:alternate` as current `og:locale`',
                    inject([DOCUMENT],
                        (doc: any) => {
                            const settings = _.cloneDeep(defaultSettings);
                            settings.defaults['og:locale'] = 'en-US';

                            const metaFactory = () => new MetaStaticLoader(settings);

                            testModuleConfig({ provide: MetaLoader, useFactory: (metaFactory) });

                            const injector = getTestBed();
                            const meta = injector.get(MetaService);

                            meta.setTag('og:locale:alternate', 'en-US');
                            expect(getAttribute(doc, 'og:locale:alternate', 'content')).toBeUndefined();
                        }));

                it('should be able to do not set `og:locale:alternate` using routes w/o default settings & w/o `og:locale`',
                    fakeAsync(inject([Title, DOCUMENT],
                        (title: Title, doc: any) => {
                            const settings = _.cloneDeep(defaultSettings);
                            settings.defaults['og:locale:alternate'] = 'en-US';

                            const metaFactory = () => new MetaStaticLoader(settings);

                            testModuleConfig({ provide: MetaLoader, useFactory: (metaFactory) });

                            const injector = getTestBed();
                            const router = injector.get(Router);

                            const fixture = TestBed.createComponent(TestBootstrapComponent);
                            fixture.detectChanges();

                            // initial navigation
                            router.navigate(['/'])
                                .then(() => {
                                    expect(title.getTitle()).toEqual('Sweet home');
                                    expect(getAttribute(doc, 'description', 'content')).toEqual('Home, home sweet home... and what?');
                                    expect(getAttribute(doc, 'og:url', 'content')).toEqual('/');
                                    expect(getAttribute(doc, 'og:locale:alternate', 'content')).toBeUndefined();
                                });
                        })));

                it('should be able to set any other meta tag',
                    inject([MetaService, DOCUMENT],
                        (meta: MetaService, doc: any) => {
                            // default og:type
                            meta.setTag('og:type', '');
                            expect(getAttribute(doc, 'og:type', 'content')).toEqual('website');

                            // given og:type
                            meta.setTag('og:type', 'blog');
                            expect(getAttribute(doc, 'og:type', 'content')).toEqual('blog');
                        }));
            });
    });
