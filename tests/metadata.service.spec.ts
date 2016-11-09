// angular
import { Title, DOCUMENT } from '@angular/platform-browser';
import { fakeAsync, getTestBed, inject, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

// module
import { MetadataLoader, MetadataStaticLoader, MetadataService, PageTitlePositioning } from '../index';
import { getAttribute, TestComponent, testSettings, defaultSettings, emptySettings, testModuleConfig } from './index.spec';

describe('@nglibs/metadata:',
    () => {
        beforeEach(() => {
            function metadataFactory(): MetadataLoader {
                return new MetadataStaticLoader(testSettings);
            }

            testModuleConfig({ provide: MetadataLoader, useFactory: (metadataFactory) });
        });

        describe('MetadataService',
            () => {
                it('is defined',
                    inject([MetadataService],
                        (metadata: MetadataService) => {
                            expect(MetadataService).toBeDefined();
                            expect(metadata).toBeDefined();
                            expect(metadata instanceof MetadataService).toBeTruthy();
                        }));

                it('should be able to set metadata using routes',
                    inject([Title, DOCUMENT],
                        fakeAsync((title: Title, doc: any) => {
                            const injector = getTestBed();
                            const metadata = injector.get(MetadataService);
                            const router = injector.get(Router);

                            expect(metadata).toBeDefined();
                            expect(metadata.loader).toBeDefined();
                            expect(metadata.loader instanceof MetadataStaticLoader).toBeTruthy();

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

                                            // disable metadata
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

                                                            // no-metadata
                                                            router.navigate(['/no-metadata'])
                                                                .then(() => {
                                                                    expect(title.getTitle())
                                                                        .toEqual('Sweet home - Tour of (lazy/busy) heroes');
                                                                    expect(getAttribute(doc, 'description', 'content'))
                                                                        .toEqual('Home, home sweet home... and what?');
                                                                    expect(getAttribute(doc, 'og:url', 'content'))
                                                                        .toEqual('http://localhost:3000/no-metadata');
                                                                });
                                                        });
                                                });
                                        });
                                });
                        })));

                it('should be able to set metadata using routes w/o default settings',
                    inject([Title, DOCUMENT],
                        fakeAsync((title: Title, doc: any) => {
                            function metadataFactory(): MetadataLoader {
                                return new MetadataStaticLoader(emptySettings);
                            }

                            testModuleConfig({ provide: MetadataLoader, useFactory: (metadataFactory) });

                            const injector = getTestBed();
                            const metadata = injector.get(MetadataService);
                            const router = injector.get(Router);

                            expect(metadata).toBeDefined();
                            expect(metadata.loader).toBeDefined();
                            expect(metadata.loader instanceof MetadataStaticLoader).toBeTruthy();

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
                    inject([MetadataService, Title],
                        (metadata: MetadataService, title: Title) => {
                            // default title
                            metadata.setTitle('');
                            expect(title.getTitle()).toEqual('Mighty mighty mouse - Tour of (lazy/busy) heroes');

                            // given title
                            metadata.setTitle('Mighty tiny mouse');
                            expect(title.getTitle()).toEqual('Mighty tiny mouse - Tour of (lazy/busy) heroes');

                            // override applicationName
                            metadata.setTitle('Mighty tiny mouse', true);
                            expect(title.getTitle()).toEqual('Mighty tiny mouse');
                        }));

                it('should be able to set `title` (appended)',
                    inject([Title],
                        (title: Title) => {
                            const appendedSettings = testSettings;
                            appendedSettings.pageTitlePositioning = PageTitlePositioning.AppendPageTitle;

                            function metadataFactory(): MetadataLoader {
                                return new MetadataStaticLoader(appendedSettings);
                            }

                            testModuleConfig({ provide: MetadataLoader, useFactory: (metadataFactory) });

                            const injector = getTestBed();
                            const metadata = injector.get(MetadataService);

                            // default title
                            metadata.setTitle('');
                            expect(title.getTitle()).toEqual('Tour of (lazy/busy) heroes - Mighty mighty mouse');

                            // given title
                            metadata.setTitle('Mighty tiny mouse');
                            expect(title.getTitle()).toEqual('Tour of (lazy/busy) heroes - Mighty tiny mouse');

                            // override applicationName
                            metadata.setTitle('Mighty tiny mouse', true);
                            expect(title.getTitle()).toEqual('Mighty tiny mouse');
                        }));

                it('should be able to set `title` w/o default settings',
                    inject([Title],
                        (title: Title) => {
                            function metadataFactory(): MetadataLoader {
                                return new MetadataStaticLoader({
                                    pageTitlePositioning: PageTitlePositioning.PrependPageTitle,
                                    defaults: {}
                                });
                            }

                            testModuleConfig({ provide: MetadataLoader, useFactory: (metadataFactory) });

                            const injector = getTestBed();
                            const metadata = injector.get(MetadataService);

                            metadata.setTitle('');
                            expect(title.getTitle()).toEqual('');
                        }));

                it('should be able to set `title` w/o default settings (appended)',
                    inject([Title],
                        (title: Title) => {
                            function metadataFactory(): MetadataLoader {
                                return new MetadataStaticLoader({
                                    pageTitlePositioning: PageTitlePositioning.AppendPageTitle,
                                    defaults: {}
                                });
                            }

                            testModuleConfig({ provide: MetadataLoader, useFactory: (metadataFactory) });

                            const injector = getTestBed();
                            const metadata = injector.get(MetadataService);

                            metadata.setTitle('');
                            expect(title.getTitle()).toEqual('');
                        }));

                it('should throw if you provide an invalid `PageTitlePositioning`',
                    inject([MetadataService],
                        (metadata: MetadataService) => {
                            const invalidSettings = testSettings;
                            invalidSettings.pageTitlePositioning = undefined;

                            function metadataFactory(): MetadataLoader {
                                return new MetadataStaticLoader(invalidSettings);
                            }

                            testModuleConfig({ provide: MetadataLoader, useFactory: (metadataFactory) });

                            expect(() => {
                                    metadata.setTitle('');
                                })
                                .toThrowError('Error: Invalid pageTitlePositioning specified [undefined]!');
                        }));

                it('should throw if you attempt to set `title` through `setTag` method',
                    inject([MetadataService],
                        (metadata: MetadataService) => {
                            expect(() => {
                                    metadata.setTag('title', '');
                                })
                                .toThrowError(`Error: Attempt to set title through 'setTag': 'title' is a reserved tag name. `
                                    + `Please use 'MetadataService.setTitle' instead.`);
                        }));

                it('should be able to set meta `description`',
                    inject([MetadataService, DOCUMENT],
                        (metadata: MetadataService, doc: any) => {
                            // default meta description
                            metadata.setTag('description', '');
                            expect(getAttribute(doc, 'description', 'content'))
                                .toEqual('Mighty Mouse is an animated superhero mouse character');

                            // given meta description
                            metadata.setTag('description', 'Mighty Mouse is a cool character');
                            expect(getAttribute(doc, 'description', 'content')).toEqual('Mighty Mouse is a cool character');
                        }));

                it('should be able to set meta `description` w/o default settings',
                    inject([DOCUMENT],
                        (doc: any) => {
                            function metadataFactory(): MetadataLoader {
                                return new MetadataStaticLoader(emptySettings);
                            }

                            testModuleConfig({ provide: MetadataLoader, useFactory: (metadataFactory) });

                            const injector = getTestBed();
                            const metadata = injector.get(MetadataService);

                            metadata.setTag('description', '');
                            expect(getAttribute(doc, 'description', 'content')).toEqual('');
                        }));

                it('should be able to set meta `author`',
                    inject([MetadataService, DOCUMENT],
                        (metadata: MetadataService, doc: any) => {
                            // default meta author
                            metadata.setTag('author', '');
                            expect(getAttribute(doc, 'author', 'content')).toEqual('Mighty Mouse');

                            // given meta author
                            metadata.setTag('author', 'Mickey Mouse');
                            expect(getAttribute(doc, 'author', 'content')).toEqual('Mickey Mouse');
                        }));

                it('should be able to set meta `publisher`',
                    inject([MetadataService, DOCUMENT],
                        (metadata: MetadataService, doc: any) => {
                            // default meta publisher
                            metadata.setTag('publisher', '');
                            expect(getAttribute(doc, 'publisher', 'content')).toEqual('a superhero');

                            // given meta publisher
                            metadata.setTag('publisher', 'another superhero');
                            expect(getAttribute(doc, 'publisher', 'content')).toEqual('another superhero');
                        }));

                it('should be able to set `og:locale`',
                    inject([MetadataService, DOCUMENT],
                        (metadata: MetadataService, doc: any) => {
                            // default og:locale
                            metadata.setTag('og:locale', '');
                            expect(getAttribute(doc, 'og:locale', 'content')).toEqual('en_US');

                            // given og:locale
                            metadata.setTag('og:locale', 'tr-TR');
                            expect(getAttribute(doc, 'og:locale', 'content')).toEqual('tr_TR');
                        }));

                it('should be able to set `og:locale:alternate` w/ `og:locale`',
                    inject([MetadataService, DOCUMENT],
                        (metadata: MetadataService, doc: any) => {
                            // default og:locale
                            metadata.setTag('og:locale', '');

                            const elements = doc.querySelectorAll('meta[property="og:locale:alternate"]');

                            expect(elements.length).toEqual(2);
                            expect(elements[0].getAttribute('content')).toEqual('nl_NL');
                            expect(elements[1].getAttribute('content')).toEqual('tr_TR');
                        }));

                it('should be able to set `og:locale:alternate` w/ `og:locale:alternate`',
                    inject([MetadataService, DOCUMENT],
                        (metadata: MetadataService, doc: any) => {
                            // default og:locale:alternate
                            metadata.setTag('og:locale:alternate', '');

                            const elements = doc.querySelectorAll('meta[property="og:locale:alternate"]');

                            expect(elements.length).toEqual(2);
                            expect(elements[0].getAttribute('content')).toEqual('nl_NL');
                            expect(elements[1].getAttribute('content')).toEqual('tr_TR');

                            // given og:locale:alternate
                            metadata.setTag('og:locale:alternate', 'tr-TR');
                            expect(getAttribute(doc, 'og:locale:alternate', 'content')).toEqual('tr_TR');
                        }));

                it('should be able to set `og:locale` w/o default settings',
                    inject([DOCUMENT],
                        (doc: any) => {
                            function metadataFactory(): MetadataLoader {
                                return new MetadataStaticLoader(emptySettings);
                            }

                            testModuleConfig({ provide: MetadataLoader, useFactory: (metadataFactory) });

                            const injector = getTestBed();
                            const metadata = injector.get(MetadataService);

                            metadata.setTag('og:locale', '');
                            expect(getAttribute(doc, 'og:locale', 'content')).toEqual('');
                        }));

                it('should be able to do not set `og:locale:alternate` as current `og:locale`',
                    inject([MetadataService],
                        (metadata: MetadataService) => {
                            const injector = getTestBed();
                            const doc = injector.get(DOCUMENT);

                            metadata.setTag('og:locale:alternate', 'en-US');
                            expect(getAttribute(doc, 'og:locale:alternate', 'content')).toBeUndefined();
                        }));

                it('should be able to do not set `og:locale:alternate` using routes w/o default settings & w/o `og:locale`',
                    inject([Title, DOCUMENT],
                        fakeAsync((title: Title, doc: any) => {
                            const settings = defaultSettings;
                            settings.defaults['og:locale:alternate'] = 'en-US';

                            function metadataFactory(): MetadataLoader {
                                return new MetadataStaticLoader(settings);
                            }

                            testModuleConfig({ provide: MetadataLoader, useFactory: (metadataFactory) });

                            const injector = getTestBed();
                            const metadata = injector.get(MetadataService);
                            const router = injector.get(Router);

                            expect(metadata).toBeDefined();
                            expect(metadata.loader).toBeDefined();
                            expect(metadata.loader instanceof MetadataStaticLoader).toBeTruthy();

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
                    inject([MetadataService, DOCUMENT],
                        (metadata: MetadataService, doc: any) => {
                            // default og:type
                            metadata.setTag('og:type', '');
                            expect(getAttribute(doc, 'og:type', 'content')).toEqual('website');

                            // given og:type
                            metadata.setTag('og:type', 'blog');
                            expect(getAttribute(doc, 'og:type', 'content')).toEqual('blog');
                        }));
            });
    });
