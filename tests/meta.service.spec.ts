// angular
import { Meta, Title } from '@angular/platform-browser';
import { fakeAsync, getTestBed, inject, TestBed, tick } from '@angular/core/testing';
import { Router } from '@angular/router';

// libs
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import * as _ from 'lodash';

// module
import { MetaLoader, MetaStaticLoader, MetaService, PageTitlePositioning } from '../index';
import { TestBootstrapComponent, testSettings, defaultSettings, emptySettings, testModuleConfig } from './index.spec';

describe('@nglibs/meta:',
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

    describe('MetaService w/deferred initialization',
      () => {
        beforeEach(() => {
          const settings = _.cloneDeep(testSettings);
          settings['defer'] = true;
          const metaFactory = () => new MetaStaticLoader(settings);

          testModuleConfig({
            provide: MetaLoader,
            useFactory: (metaFactory)
          });
        });

        it('should not set meta tags w/o default initialization',
          inject([MetaService, Title],
            (metaService: MetaService, title: Title) => {
              metaService.init(false);
              expect(title.getTitle()).toEqual('');

              metaService.refresh();
              expect(title.getTitle()).toEqual('');
            }));
      });

    describe('MetaService w/immediate initialization',
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
          fakeAsync(inject([Meta, Title],
            (meta: Meta, title: Title) => {
              const injector = getTestBed();
              const router = injector.get(Router);

              const fixture = TestBed.createComponent(TestBootstrapComponent);
              fixture.detectChanges();

              // initial navigation
              router.navigate(['/'])
                .then(() => {
                  expect(title.getTitle()).toEqual('Sweet home - Tour of (lazy/busy) heroes');
                  expect(meta.getTag('name="description"').content).toEqual('Home, home sweet home... and what?');
                  expect(meta.getTag('property="og:url"').content).toEqual('http://localhost:3000');

                  // navigate to /toothpaste (override applicationName)
                  router.navigate(['/toothpaste'])
                    .then(() => {
                      expect(title.getTitle()).toEqual('Toothpaste');
                      expect(meta.getTag('name="description"').content).toEqual('Eating toothpaste is considered to be too healthy!');
                      expect(meta.getTag('property="og:url"').content).toEqual('http://localhost:3000/toothpaste');

                      // navigate to /duck (meta disable)
                      router.navigate(['/duck'])
                        .then(() => {
                          expect(title.getTitle()).toEqual('Mighty mighty mouse');
                          expect(meta.getTag('name="description"').content)
                            .toEqual('Mighty Mouse is an animated superhero mouse character');
                          expect(meta.getTag('property="og:url"').content).toEqual('http://localhost:3000/duck');

                          // navigate to /no-data
                          router.navigate(['/no-data'])
                            .then(() => {
                              expect(title.getTitle()).toEqual('Mighty mighty mouse');
                              expect(meta.getTag('name="description"').content)
                                .toEqual('Mighty Mouse is an animated superhero mouse character');
                              expect(meta.getTag('property="og:url"').content).toEqual('http://localhost:3000/no-data');

                              // navigate to /no-meta
                              router.navigate(['/no-meta'])
                                .then(() => {
                                  expect(title.getTitle()).toEqual('Mighty mighty mouse');
                                  expect(meta.getTag('name="description"').content)
                                    .toEqual('Mighty Mouse is an animated superhero mouse character');
                                  expect(meta.getTag('property="og:url"').content).toEqual('http://localhost:3000/no-meta');
                                });
                            });
                        });
                    });
                });
            })));

        it('should be able to set meta tags using routes w/o `meta` property',
          fakeAsync(inject([Meta, Title],
            (meta: Meta, title: Title) => {
              const injector = getTestBed();
              const router = injector.get(Router);

              const fixture = TestBed.createComponent(TestBootstrapComponent);
              fixture.detectChanges();

              // navigate to /no-data
              router.navigate(['/no-data'])
                .then(() => {
                  expect(title.getTitle()).toEqual('Mighty mighty mouse');
                  expect(meta.getTag('name="description"').content).toEqual('Mighty Mouse is an animated superhero mouse character');
                  expect(meta.getTag('property="og:url"').content).toEqual('http://localhost:3000/no-data');
                });
            })));

        it('should be able to set meta tags using routes w/o default settings',
          fakeAsync(inject([Meta, Title],
            (meta: Meta, title: Title) => {
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
                  expect(meta.getTag('name="description"').content).toEqual('Home, home sweet home... and what?');
                  expect(meta.getTag('property="og:url"').content).toEqual('/');
                });
            })));

        it('should be able to set meta tags using routes w/o default `title` w/o `meta` property',
          fakeAsync(inject([Meta, Title],
            (meta: Meta, title: Title) => {
              const settings = _.cloneDeep(defaultSettings);
              settings.applicationName = 'Tour of (lazy/busy) heroes';
              settings.defaults = {
                'description': 'Mighty Mouse is an animated superhero mouse character'
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
                  expect(meta.getTag('name="description"').content).toEqual('Mighty Mouse is an animated superhero mouse character');
                  expect(meta.getTag('property="og:url"').content).toEqual('/no-data');
                });
            })));

        it('should be able to set meta tags using routes w/o default settings w/o `meta` property',
          fakeAsync(inject([Meta, Title],
            (meta: Meta, title: Title) => {
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
                  expect(meta.getTag('property="og:url"').content).toEqual('/no-data');
                });
            })));

        it('should be able to set the `title`',
          fakeAsync(inject([MetaService, Title],
            (metaService: MetaService, title: Title) => {
              const injector = getTestBed();
              const router = injector.get(Router);

              const fixture = TestBed.createComponent(TestBootstrapComponent);
              fixture.detectChanges();

              // default title
              metaService.setTitle('');

              // initial navigation
              router.navigate(['/'])
                .then(() => {
                  tick(2);
                  expect(title.getTitle()).toEqual('Mighty mighty mouse - Tour of (lazy/busy) heroes');

                  // given title
                  metaService.setTitle('Mighty tiny mouse');

                  // navigate to /no-data
                  router.navigate(['/no-data'])
                    .then(() => {
                      tick(2);
                      expect(title.getTitle()).toEqual('Mighty tiny mouse - Tour of (lazy/busy) heroes');

                      // override applicationName
                      metaService.setTitle('Mighty tiny mouse', true);

                      // navigate to /
                      router.navigate(['/'])
                        .then(() => {
                          tick(2);
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

              // default title
              metaService.setTitle('');

              // initial navigation
              router.navigate(['/'])
                .then(() => {
                  tick(2);
                  expect(title.getTitle()).toEqual('Tour of (lazy/busy) heroes - Mighty mighty mouse');

                  // given title
                  metaService.setTitle('Mighty tiny mouse');

                  // navigate to /no-data
                  router.navigate(['/no-data'])
                    .then(() => {
                      tick(2);
                      expect(title.getTitle()).toEqual('Tour of (lazy/busy) heroes - Mighty tiny mouse');

                      // override applicationName
                      metaService.setTitle('Mighty tiny mouse', true);

                      // navigate to /
                      router.navigate(['/'])
                        .then(() => {
                          tick(2);
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

              // default title
              metaService.setTitle('');

              // initial navigation
              router.navigate(['/'])
                .then(() => {
                  tick(2);
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

              // default title
              metaService.setTitle('');

              // initial navigation
              router.navigate(['/'])
                .then(() => {
                  tick(2);
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
          fakeAsync(inject([MetaService, Meta],
            (metaService: MetaService, meta: Meta) => {
              const injector = getTestBed();
              const router = injector.get(Router);

              const fixture = TestBed.createComponent(TestBootstrapComponent);
              fixture.detectChanges();

              // default meta description
              metaService.setTag('description', '');

              // initial navigation
              router.navigate(['/'])
                .then(() => {
                  tick(2);
                  expect(meta.getTag('name="description"').content).toEqual('Mighty Mouse is an animated superhero mouse character');

                  // given meta description
                  metaService.setTag('description', 'Mighty Mouse is a cool character');

                  // navigate to /no-data
                  router.navigate(['/no-data'])
                    .then(() => {
                      tick(2);
                      expect(meta.getTag('name="description"').content).toEqual('Mighty Mouse is a cool character');
                    });
                });
            })));

        it('should be able to set meta `description` w/o default settings',
          fakeAsync(inject([Meta],
            (meta: Meta) => {
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

              // default meta description
              metaService.setTag('description', '');

              // initial navigation
              router.navigate(['/'])
                .then(() => {
                  tick(2);
                  expect(meta.getTag('name="description"').content).toEqual('');
                });
            })));

        it('should be able to set meta `author`',
          fakeAsync(inject([MetaService, Meta],
            (metaService: MetaService, meta: Meta) => {
              const injector = getTestBed();
              const router = injector.get(Router);

              const fixture = TestBed.createComponent(TestBootstrapComponent);
              fixture.detectChanges();

              // default meta author
              metaService.setTag('author', '');

              // initial navigation
              router.navigate(['/'])
                .then(() => {
                  tick(2);
                  expect(meta.getTag('name="author"').content).toEqual('Mighty Mouse');

                  // given meta author
                  metaService.setTag('author', 'Mickey Mouse');

                  // navigate to /no-data
                  router.navigate(['/no-data'])
                    .then(() => {
                      tick(2);
                      expect(meta.getTag('name="author"').content).toEqual('Mickey Mouse');
                    });
                });
            })));

        it('should be able to set meta `publisher`',
          fakeAsync(inject([MetaService, Meta],
            (metaService: MetaService, meta: Meta) => {
              const injector = getTestBed();
              const router = injector.get(Router);

              const fixture = TestBed.createComponent(TestBootstrapComponent);
              fixture.detectChanges();

              // default meta publisher
              metaService.setTag('publisher', '');

              // initial navigation
              router.navigate(['/'])
                .then(() => {
                  tick(2);
                  expect(meta.getTag('name="publisher"').content).toEqual('a superhero');

                  // given meta publisher
                  metaService.setTag('publisher', 'another superhero');

                  // navigate to /no-data
                  router.navigate(['/no-data'])
                    .then(() => {
                      tick(2);
                      expect(meta.getTag('name="publisher"').content).toEqual('another superhero');
                    });
                });
            })));

        it('should be able to set `og:locale`',
          fakeAsync(inject([MetaService, Meta],
            (metaService: MetaService, meta: Meta) => {
              const injector = getTestBed();
              const router = injector.get(Router);

              const fixture = TestBed.createComponent(TestBootstrapComponent);
              fixture.detectChanges();

              // default og:locale
              metaService.setTag('og:locale', '');

              // initial navigation
              router.navigate(['/'])
                .then(() => {
                  tick(2);
                  expect(meta.getTag('property="og:locale"').content).toEqual('en_US');

                  let elements = meta.getTags('property="og:locale:alternate"');

                  expect(elements.length).toEqual(2);
                  expect(elements[0].content).toEqual('nl_NL');
                  expect(elements[1].content).toEqual('tr_TR');

                  // given og:locale
                  metaService.setTag('og:locale', 'tr-TR');

                  // navigate to /no-data
                  router.navigate(['/no-data'])
                    .then(() => {
                      tick(2);
                      expect(meta.getTag('property="og:locale"').content).toEqual('tr_TR');

                      elements = meta.getTags('property="og:locale:alternate"');

                      expect(elements.length).toEqual(2);
                      expect(elements[0].content).toEqual('en_US');
                      expect(elements[1].content).toEqual('nl_NL');
                    });
                });
            })));

        it('should be able to set `og:locale:alternate` w/ `og:locale:alternate`',
          fakeAsync(inject([MetaService, Meta],
            (metaService: MetaService, meta: Meta) => {
              const injector = getTestBed();
              const router = injector.get(Router);

              const fixture = TestBed.createComponent(TestBootstrapComponent);
              fixture.detectChanges();

              // default og:locale:alternate
              metaService.setTag('og:locale:alternate', '');

              // initial navigation
              router.navigate(['/'])
                .then(() => {
                  tick(2);
                  const elements = meta.getTags('property="og:locale:alternate"');

                  expect(elements.length).toEqual(2);
                  expect(elements[0].content).toEqual('nl_NL');
                  expect(elements[1].content).toEqual('tr_TR');

                  // given og:locale:alternate
                  metaService.setTag('og:locale:alternate', 'tr-TR');

                  // navigate to /no-data
                  router.navigate(['/no-data'])
                    .then(() => {
                      tick(2);
                      expect(meta.getTag('property="og:locale:alternate"').content).toEqual('tr_TR');
                    });
                });
            })));

        it('should be able to set `og:locale` w/o default settings',
          fakeAsync(inject([Meta],
            (meta: Meta) => {
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

              // default og:locale
              metaService.setTag('og:locale', '');

              // initial navigation
              router.navigate(['/'])
                .then(() => {
                  tick(2);
                  expect(meta.getTag('property="og:locale"').content).toEqual('');

                  // given og:locale
                  metaService.setTag('og:locale', 'tr-TR');

                  // navigate to /no-data
                  router.navigate(['/no-data'])
                    .then(() => {
                      tick(2);
                      expect(meta.getTag('property="og:locale"').content).toEqual('tr_TR');
                    });
                });
            })));

        it('should be able to do not set `og:locale:alternate` as current `og:locale`',
          inject([Meta],
            (meta: Meta) => {
              const settings = _.cloneDeep(defaultSettings);
              settings.defaults['og:locale'] = 'tr-TR';

              const metaFactory = () => new MetaStaticLoader(settings);

              testModuleConfig({
                provide: MetaLoader,
                useFactory: (metaFactory)
              });

              const injector = getTestBed();
              const metaService = injector.get(MetaService);

              expect(meta.getTag('property="og:locale"').content).toEqual('tr_TR');

              // given og:locale:alternate
              metaService.setTag('og:locale:alternate', 'tr-TR');
              expect(meta.getTag('property="og:locale:alternate"')).toBeNull();
            }));

        it('should be able to do not set `og:locale:alternate` using routes w/o default settings & w/o `og:locale`',
          fakeAsync(inject([Meta, Title],
            (meta: Meta, title: Title) => {
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
                  expect(meta.getTag('name="description"').content).toEqual('Home, home sweet home... and what?');
                  expect(meta.getTag('property="og:url"').content).toEqual('/');
                  expect(meta.getTag('property="og:locale:alternate"')).toBeNull();
                });
            })));

        it('should be able to set any other meta tag',
          fakeAsync(inject([MetaService, Meta],
            (metaService: MetaService, meta: Meta) => {
              const injector = getTestBed();
              const router = injector.get(Router);

              const fixture = TestBed.createComponent(TestBootstrapComponent);
              fixture.detectChanges();

              // default og:type
              metaService.setTag('og:type', '');

              // initial navigation
              router.navigate(['/'])
                .then(() => {
                  tick(2);
                  expect(meta.getTag('property="og:type"').content).toEqual('website');

                  // given og:type
                  metaService.setTag('og:type', 'blog');

                  // navigate to /no-data
                  router.navigate(['/no-data'])
                    .then(() => {
                      tick(2);
                      expect(meta.getTag('property="og:type"').content).toEqual('blog');
                    });
                });
            })));
      });

    describe('MetaService w/callback',
      () => {
        it('should be able to set meta tags w/`non-observable` callback',
          fakeAsync(inject([Title],
            (title: Title) => {
              let refresh = false;
              const callback = (value: string) => refresh ? 'refreshed' : value;

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

              metaService.init();

              const fixture = TestBed.createComponent(TestBootstrapComponent);
              fixture.detectChanges();

              // initial navigation
              router.navigate(['/'])
                .then(() => {
                  tick(2);
                  expect(title.getTitle()).toEqual('Sweet home - Tour of (lazy/busy) heroes');

                  refresh = true;
                  metaService.refresh();
                  expect(title.getTitle()).toEqual('refreshed - refreshed');
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
              const metaService = injector.get(MetaService);
              const router = injector.get(Router);

              metaService.init();

              const fixture = TestBed.createComponent(TestBootstrapComponent);
              fixture.detectChanges();

              // initial navigation
              router.navigate(['/'])
                .then(() => {
                  tick(2);
                  expect(title.getTitle()).toEqual('Sweet home - Tour of (lazy/busy) heroes');
                });
            })));
      });
  });
