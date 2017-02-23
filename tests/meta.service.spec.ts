// angular
import { Title, DOCUMENT } from '@angular/platform-browser';
import { fakeAsync, getTestBed, inject, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

// module
import { MetaLoader, MetaStaticLoader, MetaService, PageTitlePositioning } from '../index';
import { getAttribute, TestComponent, testSettings, defaultSettings, emptySettings, testModuleConfig } from './index.spec';

describe('@nglibs/meta:',
    () => {
        beforeEach(() => {
            const metaFactory = () => new MetaStaticLoader(testSettings);

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

                it('should be able to set meta using routes',
                    inject([Title, DOCUMENT],
                        fakeAsync((title: Title, doc: any) => {
                            const injector = getTestBed();
                            const meta = injector.get(MetaService);
                            const router = injector.get(Router);

                            expect(meta).toBeDefined();
                            expect(meta.loader).toBeDefined();
                            expect(meta.loader instanceof MetaStaticLoader).toBeTruthy();

                            TestBed.createComponent(TestComponent);

                            // initial navigation
                            router.navigate(['/'])
                                .then(() => {
                                    expect(title.getTitle()).toEqual('Sweet home - Tour of (lazy/busy) heroes');
                                    expect(getAttribute(doc, 'description', 'content')).toEqual('Home, home sweet home... and what?');
                                    expect(getAttribute(doc, 'og:url', 'content')).toEqual('http://localhost:3000');

                                    // override applicationName
                                    router.navigate(['/toothpaste'])
                                        .then(() => {
                                            expect(title.getTitle()).toEqual('Toothpaste');
                                            expect(getAttribute(doc, 'description', 'content'))
                                                .toEqual('Eating toothpaste is considered to be too healthy!');
                                            expect(getAttribute(doc, 'og:url', 'content')).toEqual('http://localhost:3000/toothpaste');

                                            // disable meta
                                            router.navigate(['/duck'])
                                                .then(() => {
                                                    expect(title.getTitle()).toEqual('Sweet home - Tour of (lazy/busy) heroes');
                                                    expect(getAttribute(doc, 'description', 'content'))
                                                        .toEqual('Home, home sweet home... and what?');

                                                    // no-data
                                                    router.navigate(['/no-data'])
                                                        .then(() => {
                                                            expect(title.getTitle()).toEqual('Sweet home - Tour of (lazy/busy) heroes');
                                                            expect(getAttribute(doc, 'description', 'content'))
                                                                .toEqual('Home, home sweet home... and what?');
                                                            expect(getAttribute(doc, 'og:url', 'content'))
                                                                .toEqual('http://localhost:3000/no-data');

                                                            // no-meta
                                                            router.navigate(['/no-meta'])
                                                                .then(() => {
                                                                    expect(title.getTitle())
                                                                        .toEqual('Sweet home - Tour of (lazy/busy) heroes');
                                                                    expect(getAttribute(doc, 'description', 'content'))
                                                                        .toEqual('Home, home sweet home... and what?');
                                                                    expect(getAttribute(doc, 'og:url', 'content'))
                                                                        .toEqual('http://localhost:3000/no-meta');
                                                                });
                                                        });
                                                });
                                        });
                                });
                        })));

                it('should be able to set meta using routes w/o default settings',
                    inject([Title, DOCUMENT],
                        fakeAsync((title: Title, doc: any) => {
                            const metaFactory = () => new MetaStaticLoader(emptySettings);

                            testModuleConfig({ provide: MetaLoader, useFactory: (metaFactory) });

                            const injector = getTestBed();
                            const meta = injector.get(MetaService);
                            const router = injector.get(Router);

                            expect(meta).toBeDefined();
                            expect(meta.loader).toBeDefined();
                            expect(meta.loader instanceof MetaStaticLoader).toBeTruthy();

                            TestBed.createComponent(TestComponent);

                            // initial navigation
                            router.navigate(['/'])
                                .then(() => {
                                    expect(title.getTitle()).toEqual('Sweet home');
                                    expect(getAttribute(doc, 'description', 'content')).toEqual('Home, home sweet home... and what?');
                                    expect(getAttribute(doc, 'og:url', 'content')).toEqual('/');
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
                            const appendedSettings = testSettings;
                            appendedSettings.pageTitlePositioning = PageTitlePositioning.AppendPageTitle;

                            const metaFactory = () => new MetaStaticLoader(appendedSettings);

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
                    inject([MetaService],
                        (meta: MetaService) => {
                            const invalidSettings = testSettings;
                            invalidSettings.pageTitlePositioning = undefined;

                            const metaFactory = () => new MetaStaticLoader(invalidSettings);

                            testModuleConfig({ provide: MetaLoader, useFactory: (metaFactory) });

                            expect(() => meta.setTitle('')).toThrowError('Invalid pageTitlePositioning specified [undefined]!');
                        }));

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
                            const metaFactory = () => new MetaStaticLoader(emptySettings);

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

                            // given og:locale
                            meta.setTag('og:locale', 'tr-TR');
                            expect(getAttribute(doc, 'og:locale', 'content')).toEqual('tr_TR');
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
                            const metaFactory = () => new MetaStaticLoader(emptySettings);

                            testModuleConfig({ provide: MetaLoader, useFactory: (metaFactory) });

                            const injector = getTestBed();
                            const meta = injector.get(MetaService);

                            meta.setTag('og:locale', '');
                            expect(getAttribute(doc, 'og:locale', 'content')).toEqual('');
                        }));

                it('should be able to do not set `og:locale:alternate` as current `og:locale`',
                    inject([MetaService],
                        (meta: MetaService) => {
                            const injector = getTestBed();
                            const doc = injector.get(DOCUMENT);

                            meta.setTag('og:locale:alternate', 'en-US');
                            expect(getAttribute(doc, 'og:locale:alternate', 'content')).toBeUndefined();
                        }));

                it('should be able to do not set `og:locale:alternate` using routes w/o default settings & w/o `og:locale`',
                    inject([Title, DOCUMENT],
                        fakeAsync((title: Title, doc: any) => {
                            const settings = defaultSettings;
                            settings.defaults['og:locale:alternate'] = 'en-US';

                            const metaFactory = () => new MetaStaticLoader(settings);

                            testModuleConfig({ provide: MetaLoader, useFactory: (metaFactory) });

                            const injector = getTestBed();
                            const meta = injector.get(MetaService);
                            const router = injector.get(Router);

                            expect(meta).toBeDefined();
                            expect(meta.loader).toBeDefined();
                            expect(meta.loader instanceof MetaStaticLoader).toBeTruthy();

                            TestBed.createComponent(TestComponent);

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
