// angular
import { fakeAsync, getTestBed, inject, TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';

// libs
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import * as _ from 'lodash';

// module
import { MetaLoader, MetaService, MetaStaticLoader, PageTitlePositioning } from '../index';
import { MetaHelper } from '../src/meta.helper';
import { defaultSettings, emptySettings, TestBootstrapComponent, testModuleConfig, testSettings } from './index.spec';

describe('@ngx-meta/core:',
  () => {
    describe('MetaService',
      () => {
        beforeEach(() => {
          const settings = _.cloneDeep(testSettings);
          const metaFactory = () => new MetaStaticLoader(settings);

          testModuleConfig({
            provide: MetaLoader,
            useFactory: (metaFactory)
          });
        });

        it('is defined',
          inject([MetaService],
            (metaService: MetaService) => {
              expect(MetaService).toBeDefined();
              expect(metaService).toBeDefined();
              expect(metaService instanceof MetaService).toBeTruthy();
            }));
      });

    describe('MetaService',
      () => {
        beforeEach(() => {
          const settings = _.cloneDeep(testSettings);
          const metaFactory = () => new MetaStaticLoader(settings);

          testModuleConfig({
            provide: MetaLoader,
            useFactory: (metaFactory)
          });
        });

        it('should be able to set meta tags using routes',
          fakeAsync(inject([MetaHelper, Title],
            (meta: MetaHelper, title: Title) => {
              const injector = getTestBed();
              const router = injector.get(Router);

              const fixture = TestBed.createComponent(TestBootstrapComponent);
              fixture.detectChanges();

              // initial navigation
              router.navigate(['/'])
                .then(() => {
                  expect(title.getTitle()).toEqual('Sweet home - Tour of (lazy/busy) heroes');
                  expect(meta.getMetaElement('name="description"').content).toEqual('Home, home sweet home... and what?');
                  expect(meta.getMetaElement('property="og:url"').content).toEqual('http://localhost:3000');

                  // navigate to /toothpaste (override applicationName)
                  router.navigate(['/toothpaste'])
                    .then(() => {
                      expect(title.getTitle()).toEqual('Toothpaste');
                      expect(meta.getMetaElement('name="description"').content)
                        .toEqual('Eating toothpaste is considered to be too healthy!');
                      expect(meta.getMetaElement('property="og:url"').content).toEqual('http://localhost:3000/toothpaste');

                      // navigate to /duck (meta disable)
                      router.navigate(['/duck'])
                        .then(() => {
                          expect(title.getTitle()).toEqual('Mighty mighty mouse');
                          expect(meta.getMetaElement('name="description"').content)
                            .toEqual('Mighty Mouse is an animated superhero mouse character');
                          expect(meta.getMetaElement('property="og:url"').content).toEqual('http://localhost:3000/duck');

                          // navigate to /no-data
                          router.navigate(['/no-data'])
                            .then(() => {
                              expect(title.getTitle()).toEqual('Mighty mighty mouse');
                              expect(meta.getMetaElement('name="description"').content)
                                .toEqual('Mighty Mouse is an animated superhero mouse character');
                              expect(meta.getMetaElement('property="og:url"').content).toEqual('http://localhost:3000/no-data');

                              // navigate to /no-meta
                              router.navigate(['/no-meta'])
                                .then(() => {
                                  expect(title.getTitle()).toEqual('Mighty mighty mouse');
                                  expect(meta.getMetaElement('name="description"').content)
                                    .toEqual('Mighty Mouse is an animated superhero mouse character');
                                  expect(meta.getMetaElement('property="og:url"').content).toEqual('http://localhost:3000/no-meta');
                                });
                            });
                        });
                    });
                });
            })));

        it('should be able to set meta tags using routes w/o `meta` property',
          fakeAsync(inject([MetaHelper, Title],
            (meta: MetaHelper, title: Title) => {
              const injector = getTestBed();
              const router = injector.get(Router);

              const fixture = TestBed.createComponent(TestBootstrapComponent);
              fixture.detectChanges();

              // navigate to /no-data
              router.navigate(['/no-data'])
                .then(() => {
                  expect(title.getTitle()).toEqual('Mighty mighty mouse');
                  expect(meta.getMetaElement('name="description"').content)
                    .toEqual('Mighty Mouse is an animated superhero mouse character');
                  expect(meta.getMetaElement('property="og:url"').content).toEqual('http://localhost:3000/no-data');
                });
            })));

        it('should be able to set meta tags using routes w/o default settings',
          fakeAsync(inject([MetaHelper, Title],
            (meta: MetaHelper, title: Title) => {
              const settings = _.cloneDeep(emptySettings);
              const metaFactory = () => new MetaStaticLoader(settings);

              testModuleConfig({
                provide: MetaLoader,
                useFactory: (metaFactory)
              });

              const injector = getTestBed();
              const router = injector.get(Router);

              const fixture = TestBed.createComponent(TestBootstrapComponent);
              fixture.detectChanges();

              // initial navigation
              router.navigate(['/'])
                .then(() => {
                  expect(title.getTitle()).toEqual('Sweet home');
                  expect(meta.getMetaElement('name="description"').content).toEqual('Home, home sweet home... and what?');
                  expect(meta.getMetaElement('property="og:url"').content).toEqual('/');
                });
            })));

        it('should be able to set meta tags using routes w/o default `title` w/o `meta` property',
          fakeAsync(inject([MetaHelper, Title],
            (meta: MetaHelper, title: Title) => {
              const settings = _.cloneDeep(defaultSettings);
              settings.applicationName = 'Tour of (lazy/busy) heroes';
              settings.defaults = {
                description: 'Mighty Mouse is an animated superhero mouse character'
              };

              const metaFactory = () => new MetaStaticLoader(settings);

              testModuleConfig({
                provide: MetaLoader,
                useFactory: (metaFactory)
              });

              const injector = getTestBed();
              const router = injector.get(Router);

              const fixture = TestBed.createComponent(TestBootstrapComponent);
              fixture.detectChanges();

              // navigate to /no-data
              router.navigate(['/no-data'])
                .then(() => {
                  expect(title.getTitle()).toEqual('Tour of (lazy/busy) heroes');
                  expect(meta.getMetaElement('name="description"').content)
                    .toEqual('Mighty Mouse is an animated superhero mouse character');
                  expect(meta.getMetaElement('property="og:url"').content).toEqual('/no-data');
                });
            })));

        it('should be able to set meta tags using routes w/o default settings w/o `meta` property',
          fakeAsync(inject([MetaHelper, Title],
            (meta: MetaHelper, title: Title) => {
              const settings = _.cloneDeep(emptySettings);
              const metaFactory = () => new MetaStaticLoader(settings);

              testModuleConfig({
                provide: MetaLoader,
                useFactory: (metaFactory)
              });

              const injector = getTestBed();
              const router = injector.get(Router);

              const fixture = TestBed.createComponent(TestBootstrapComponent);
              fixture.detectChanges();

              // navigate to /no-data
              router.navigate(['/no-data'])
                .then(() => {
                  expect(title.getTitle()).toEqual('');
                  expect(meta.getMetaElement('property="og:url"').content).toEqual('/no-data');
                });
            })));

        it('should be able to set the `title`',
          fakeAsync(inject([MetaService, Title],
            (metaService: MetaService, title: Title) => {
              const injector = getTestBed();
              const router = injector.get(Router);

              const fixture = TestBed.createComponent(TestBootstrapComponent);
              fixture.detectChanges();

              // initial navigation
              router.navigate(['/'])
                .then(() => {
                  // default title
                  metaService.setTitle('');
                  expect(title.getTitle()).toEqual('Mighty mighty mouse - Tour of (lazy/busy) heroes');

                  // navigate to /no-data
                  router.navigate(['/no-data'])
                    .then(() => {
                      // given title
                      metaService.setTitle('Mighty tiny mouse');
                      expect(title.getTitle()).toEqual('Mighty tiny mouse - Tour of (lazy/busy) heroes');

                      // navigate to /
                      router.navigate(['/'])
                        .then(() => {
                          // override applicationName
                          metaService.setTitle('Mighty tiny mouse', true);
                          expect(title.getTitle()).toEqual('Mighty tiny mouse');
                        });
                    });
                });
            })));

        it('should be able to set `title` (appended)',
          fakeAsync(inject([Title],
            (title: Title) => {
              const settings = _.cloneDeep(testSettings);
              settings.pageTitlePositioning = PageTitlePositioning.AppendPageTitle;

              const metaFactory = () => new MetaStaticLoader(settings);

              testModuleConfig({
                provide: MetaLoader,
                useFactory: (metaFactory)
              });

              const injector = getTestBed();
              const metaService = injector.get(MetaService);
              const router = injector.get(Router);

              const fixture = TestBed.createComponent(TestBootstrapComponent);
              fixture.detectChanges();

              // initial navigation
              router.navigate(['/'])
                .then(() => {
                  // default title
                  metaService.setTitle('');
                  expect(title.getTitle()).toEqual('Tour of (lazy/busy) heroes - Mighty mighty mouse');

                  // navigate to /no-data
                  router.navigate(['/no-data'])
                    .then(() => {
                      // given title
                      metaService.setTitle('Mighty tiny mouse');
                      expect(title.getTitle()).toEqual('Tour of (lazy/busy) heroes - Mighty tiny mouse');

                      // navigate to /
                      router.navigate(['/'])
                        .then(() => {
                          // override applicationName
                          metaService.setTitle('Mighty tiny mouse', true);
                          expect(title.getTitle()).toEqual('Mighty tiny mouse');
                        });
                    });
                });
            })));

        it('should be able to set `title` w/o default settings',
          fakeAsync(inject([Title],
            (title: Title) => {
              const settings = _.cloneDeep(defaultSettings);
              const metaFactory = () => new MetaStaticLoader(settings);

              testModuleConfig({
                provide: MetaLoader,
                useFactory: (metaFactory)
              });

              const injector = getTestBed();
              const metaService = injector.get(MetaService);
              const router = injector.get(Router);

              const fixture = TestBed.createComponent(TestBootstrapComponent);
              fixture.detectChanges();

              // initial navigation
              router.navigate(['/'])
                .then(() => {
                  // default title
                  metaService.setTitle('');
                  expect(title.getTitle()).toEqual('');
                });
            })));

        it('should be able to set `title` w/o default settings (appended)',
          fakeAsync(inject([Title],
            (title: Title) => {
              const settings = _.cloneDeep(defaultSettings);
              settings.pageTitlePositioning = PageTitlePositioning.AppendPageTitle;

              const metaFactory = () => new MetaStaticLoader(settings);

              testModuleConfig({
                provide: MetaLoader,
                useFactory: (metaFactory)
              });

              const injector = getTestBed();
              const metaService = injector.get(MetaService);
              const router = injector.get(Router);

              const fixture = TestBed.createComponent(TestBootstrapComponent);
              fixture.detectChanges();

              // initial navigation
              router.navigate(['/'])
                .then(() => {
                  // default title
                  metaService.setTitle('');
                  expect(title.getTitle()).toEqual('');
                });
            })));

        it('should throw if you provide an invalid `PageTitlePositioning`',
          () => {
            const settings = _.cloneDeep(testSettings);
            settings.pageTitlePositioning = undefined;

            const metaFactory = () => new MetaStaticLoader(settings);

            testModuleConfig({
              provide: MetaLoader,
              useFactory: (metaFactory)
            });

            const injector = getTestBed();
            const metaService = injector.get(MetaService);

            expect(() => metaService.setTitle('')).toThrowError('Invalid pageTitlePositioning specified [undefined]!');
          });

        it('should throw if you attempt to set `title` through `setTag` method',
          inject([MetaService],
            (metaService: MetaService) => {
              expect(() => metaService.setTag('title', ''))
                .toThrowError(`Attempt to set title through 'setTag': 'title' is a reserved tag name. `
                  + `Please use 'MetaService.setTitle' instead.`);
            }));

        it('should be able to set meta `description`',
          fakeAsync(inject([MetaService, MetaHelper],
            (metaService: MetaService, meta: MetaHelper) => {
              const injector = getTestBed();
              const router = injector.get(Router);

              const fixture = TestBed.createComponent(TestBootstrapComponent);
              fixture.detectChanges();

              // initial navigation
              router.navigate(['/'])
                .then(() => {
                  // default meta description
                  metaService.setTag('description', '');
                  expect(meta.getMetaElement('name="description"').content)
                    .toEqual('Mighty Mouse is an animated superhero mouse character');

                  // navigate to /no-data
                  router.navigate(['/no-data'])
                    .then(() => {
                      // given meta description
                      metaService.setTag('description', 'Mighty Mouse is a cool character');
                      expect(meta.getMetaElement('name="description"').content).toEqual('Mighty Mouse is a cool character');
                    });
                });
            })));

        it('should be able to set meta `description` w/o default settings',
          fakeAsync(inject([MetaHelper],
            (meta: MetaHelper) => {
              const settings = _.cloneDeep(emptySettings);
              const metaFactory = () => new MetaStaticLoader(settings);

              testModuleConfig({
                provide: MetaLoader,
                useFactory: (metaFactory)
              });

              const injector = getTestBed();
              const metaService = injector.get(MetaService);
              const router = injector.get(Router);

              const fixture = TestBed.createComponent(TestBootstrapComponent);
              fixture.detectChanges();

              // initial navigation
              router.navigate(['/'])
                .then(() => {
                  // default meta description
                  metaService.setTag('description', '');
                  expect(meta.getMetaElement('name="description"').content).toEqual('');
                });
            })));

        it('should be able to set meta `author`',
          fakeAsync(inject([MetaService, MetaHelper],
            (metaService: MetaService, meta: MetaHelper) => {
              const injector = getTestBed();
              const router = injector.get(Router);

              const fixture = TestBed.createComponent(TestBootstrapComponent);
              fixture.detectChanges();

              // initial navigation
              router.navigate(['/'])
                .then(() => {
                  // default meta author
                  metaService.setTag('author', '');
                  expect(meta.getMetaElement('name="author"').content).toEqual('Mighty Mouse');

                  // navigate to /no-data
                  router.navigate(['/no-data'])
                    .then(() => {
                      // given meta author
                      metaService.setTag('author', 'Mickey Mouse');
                      expect(meta.getMetaElement('name="author"').content).toEqual('Mickey Mouse');
                    });
                });
            })));

        it('should be able to set meta `publisher`',
          fakeAsync(inject([MetaService, MetaHelper],
            (metaService: MetaService, meta: MetaHelper) => {
              const injector = getTestBed();
              const router = injector.get(Router);

              const fixture = TestBed.createComponent(TestBootstrapComponent);
              fixture.detectChanges();

              // initial navigation
              router.navigate(['/'])
                .then(() => {
                  // default meta publisher
                  metaService.setTag('publisher', '');
                  expect(meta.getMetaElement('name="publisher"').content).toEqual('a superhero');

                  // navigate to /no-data
                  router.navigate(['/no-data'])
                    .then(() => {
                      // given meta publisher
                      metaService.setTag('publisher', 'another superhero');
                      expect(meta.getMetaElement('name="publisher"').content).toEqual('another superhero');
                    });
                });
            })));

        it('should be able to set `og:locale`',
          fakeAsync(inject([MetaService, MetaHelper],
            (metaService: MetaService, meta: MetaHelper) => {
              const injector = getTestBed();
              const router = injector.get(Router);

              const fixture = TestBed.createComponent(TestBootstrapComponent);
              fixture.detectChanges();

              // initial navigation
              router.navigate(['/'])
                .then(() => {
                  // default og:locale
                  metaService.setTag('og:locale', '');
                  expect(meta.getMetaElement('property="og:locale"').content).toEqual('en_US');

                  let elements = meta.getMetaElements('property="og:locale:alternate"');

                  expect(elements.length).toEqual(2);
                  expect(elements[0].content).toEqual('nl_NL');
                  expect(elements[1].content).toEqual('tr_TR');

                  // navigate to /no-data
                  router.navigate(['/no-data'])
                    .then(() => {
                      // given og:locale
                      metaService.setTag('og:locale', 'tr-TR');
                      expect(meta.getMetaElement('property="og:locale"').content).toEqual('tr_TR');

                      elements = meta.getMetaElements('property="og:locale:alternate"');

                      expect(elements.length).toEqual(2);
                      expect(elements[0].content).toEqual('en_US');
                      expect(elements[1].content).toEqual('nl_NL');
                    });
                });
            })));

        it('should be able to set `og:locale:alternate` w/ `og:locale:alternate`',
          fakeAsync(inject([MetaService, MetaHelper],
            (metaService: MetaService, meta: MetaHelper) => {
              const injector = getTestBed();
              const router = injector.get(Router);

              const fixture = TestBed.createComponent(TestBootstrapComponent);
              fixture.detectChanges();

              // initial navigation
              router.navigate(['/'])
                .then(() => {
                  // default og:locale:alternate
                  metaService.setTag('og:locale:alternate', '');
                  const elements = meta.getMetaElements('property="og:locale:alternate"');

                  expect(elements.length).toEqual(2);
                  expect(elements[0].content).toEqual('nl_NL');
                  expect(elements[1].content).toEqual('tr_TR');

                  // navigate to /no-data
                  router.navigate(['/no-data'])
                    .then(() => {
                      // given og:locale:alternate
                      metaService.setTag('og:locale:alternate', 'tr-TR');
                      expect(meta.getMetaElement('property="og:locale:alternate"').content).toEqual('tr_TR');
                    });
                });
            })));

        it('should be able to set `og:locale` w/o default settings',
          fakeAsync(inject([MetaHelper],
            (meta: MetaHelper) => {
              const settings = _.cloneDeep(emptySettings);
              const metaFactory = () => new MetaStaticLoader(settings);

              testModuleConfig({
                provide: MetaLoader,
                useFactory: (metaFactory)
              });

              const injector = getTestBed();
              const router = injector.get(Router);
              const metaService = injector.get(MetaService);

              const fixture = TestBed.createComponent(TestBootstrapComponent);
              fixture.detectChanges();

              // initial navigation
              router.navigate(['/'])
                .then(() => {
                  // default og:locale
                  metaService.setTag('og:locale', '');
                  expect(meta.getMetaElement('property="og:locale"').content).toEqual('');

                  // navigate to /no-data
                  router.navigate(['/no-data'])
                    .then(() => {
                      // given og:locale
                      metaService.setTag('og:locale', 'tr-TR');
                      expect(meta.getMetaElement('property="og:locale"').content).toEqual('tr_TR');
                    });
                });
            })));

        it('should be able to do not set `og:locale:alternate` as current `og:locale`',
          inject([MetaHelper],
            (meta: MetaHelper) => {
              const settings = _.cloneDeep(defaultSettings);
              settings.defaults['og:locale'] = 'tr-TR';

              const metaFactory = () => new MetaStaticLoader(settings);

              testModuleConfig({
                provide: MetaLoader,
                useFactory: (metaFactory)
              });

              const injector = getTestBed();
              const metaService = injector.get(MetaService);

              expect(meta.getMetaElement('property="og:locale"').content).toEqual('tr_TR');

              // given og:locale:alternate
              metaService.setTag('og:locale:alternate', 'tr-TR');
              expect(meta.getMetaElement('property="og:locale:alternate"')).toBeNull();
            }));

        it('should be able to do not set `og:locale:alternate` using routes w/o default settings & w/o `og:locale`',
          fakeAsync(inject([MetaHelper, Title],
            (meta: MetaHelper, title: Title) => {
              const settings = _.cloneDeep(defaultSettings);
              settings.defaults['og:locale:alternate'] = 'en-US';

              const metaFactory = () => new MetaStaticLoader(settings);

              testModuleConfig({
                provide: MetaLoader,
                useFactory: (metaFactory)
              });

              const injector = getTestBed();
              const router = injector.get(Router);

              const fixture = TestBed.createComponent(TestBootstrapComponent);
              fixture.detectChanges();

              // initial navigation
              router.navigate(['/'])
                .then(() => {
                  expect(title.getTitle()).toEqual('Sweet home');
                  expect(meta.getMetaElement('name="description"').content).toEqual('Home, home sweet home... and what?');
                  expect(meta.getMetaElement('property="og:url"').content).toEqual('/');
                  expect(meta.getMetaElement('property="og:locale:alternate"')).toBeNull();
                });
            })));

        it('should be able to set any other meta tag',
          fakeAsync(inject([MetaService, MetaHelper],
            (metaService: MetaService, meta: MetaHelper) => {
              const injector = getTestBed();
              const router = injector.get(Router);

              const fixture = TestBed.createComponent(TestBootstrapComponent);
              fixture.detectChanges();

              // initial navigation
              router.navigate(['/'])
                .then(() => {
                  // default og:type
                  metaService.setTag('og:type', '');
                  expect(meta.getMetaElement('property="og:type"').content).toEqual('website');

                  // navigate to /no-data
                  router.navigate(['/no-data'])
                    .then(() => {
                      // given og:type
                      metaService.setTag('og:type', 'blog');
                      expect(meta.getMetaElement('property="og:type"').content).toEqual('blog');
                    });
                });
            })));
      });

    describe('MetaService w/callback',
      () => {
        it('should be able to set `title` w/`non-observable` callback',
          fakeAsync(inject([Title],
            (title: Title) => {
              const callback = (value: string) => value === 'Tour of (lazy/busy) heroes' ? '' : value;

              const settings = _.cloneDeep(testSettings);
              settings['callback'] = (value: string) => callback(value);
              const metaFactory = () => new MetaStaticLoader(settings);

              testModuleConfig({
                provide: MetaLoader,
                useFactory: (metaFactory)
              });

              const injector = getTestBed();
              const metaService = injector.get(MetaService);
              const router = injector.get(Router);

              const fixture = TestBed.createComponent(TestBootstrapComponent);
              fixture.detectChanges();

              // initial navigation
              router.navigate(['/'])
                .then(() => {
                  // default title
                  metaService.setTitle('test');
                  expect(title.getTitle()).toEqual('test');
                });
            })));

        it('should be able to set `title` w/`non-observable` callback w/o default settings',
          fakeAsync(inject([Title],
            (title: Title) => {
              const callback = (value: string) => value === 'Tour of (lazy/busy) heroes' ? '' : value;

              const settings = _.cloneDeep(defaultSettings);
              settings['callback'] = (value: string) => callback(value);
              settings['pageTitleSeparator'] = ' - ';
              settings['applicationName'] = 'Tour of (lazy/busy) heroes';
              settings.defaults['title'] = 'test';
              const metaFactory = () => new MetaStaticLoader(settings);

              testModuleConfig({
                provide: MetaLoader,
                useFactory: (metaFactory)
              });

              const injector = getTestBed();
              const metaService = injector.get(MetaService);
              const router = injector.get(Router);

              const fixture = TestBed.createComponent(TestBootstrapComponent);
              fixture.detectChanges();

              // initial navigation
              router.navigate(['/'])
                .then(() => {
                  // default title
                  metaService.setTitle('');
                  expect(title.getTitle()).toEqual('test');
                });
            })));

        it('should be able to set meta tags w/`promise` callback',
          fakeAsync(inject([Title],
            (title: Title) => {
              const callback = (value: string) => Promise.resolve(value);

              const settings = _.cloneDeep(testSettings);
              settings['callback'] = (value: string) => callback(value);
              const metaFactory = () => new MetaStaticLoader(settings);

              testModuleConfig({
                provide: MetaLoader,
                useFactory: (metaFactory)
              });

              const injector = getTestBed();
              const router = injector.get(Router);

              const fixture = TestBed.createComponent(TestBootstrapComponent);
              fixture.detectChanges();

              // initial navigation
              router.navigate(['/'])
                .then(() => {
                  expect(title.getTitle()).toEqual('Sweet home - Tour of (lazy/busy) heroes');
                });
            })));

        it('should be able to set meta tags w/`observable` callback',
          fakeAsync(inject([Title],
            (title: Title) => {
              const settings = _.cloneDeep(testSettings);
              settings['callback'] = (value: string) => Observable.of(value);
              const metaFactory = () => new MetaStaticLoader(settings);

              testModuleConfig({
                provide: MetaLoader,
                useFactory: (metaFactory)
              });

              const injector = getTestBed();
              const router = injector.get(Router);

              const fixture = TestBed.createComponent(TestBootstrapComponent);
              fixture.detectChanges();

              // initial navigation
              router.navigate(['/'])
                .then(() => {
                  expect(title.getTitle()).toEqual('Sweet home - Tour of (lazy/busy) heroes');
                });
            })));
      });
  });
