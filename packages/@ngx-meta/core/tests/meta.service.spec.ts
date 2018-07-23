// angular
import { fakeAsync,  inject, TestBed } from '@angular/core/testing';
import { Meta, Title } from '@angular/platform-browser';
import { Router } from '@angular/router';

// libs
import { of as observableOf } from 'rxjs';
import { cloneDeep } from 'lodash/fp';

// module
import { MetaLoader, MetaService, MetaStaticLoader, PageTitlePositioning } from '../index';
import { defaultSettings, emptySettings, TestBootstrapComponent, testModuleConfig, testSettings } from './common';

describe('@ngx-meta/core:',
  () => {
    describe('MetaService',
      () => {
        beforeEach(() => {
          const settings = cloneDeep(testSettings);
          const metaFactory = () => new MetaStaticLoader(settings);

          testModuleConfig({
            provide: MetaLoader,
            useFactory: (metaFactory)
          });
        });

        it('is defined',
          inject([MetaService],
            (metaService: MetaService) => {
              expect(MetaService)
                .toBeDefined();
              expect(metaService)
                .toBeDefined();
              expect(metaService instanceof MetaService)
                .toBeTruthy();
            }));
      });

    describe('MetaService',
      () => {
        beforeEach(() => {
          const settings = cloneDeep(testSettings);
          const metaFactory = () => new MetaStaticLoader(settings);

          testModuleConfig({
            provide: MetaLoader,
            useFactory: (metaFactory)
          });
        });

        it('should be able to set meta tags using routes',
          fakeAsync(inject([Meta, Title],
            (meta: Meta, title: Title) => {
              const router = TestBed.get(Router);

              const fixture = TestBed.createComponent(TestBootstrapComponent);
              fixture.detectChanges();

              router.navigate(['/'])
                .then(() => {
                  expect(title.getTitle())
                    .toEqual('Sweet home - Tour of (lazy/busy) heroes');
                  expect(meta.getTag('name="description"').content)
                    .toEqual('Home, home sweet home... and what?');
                  expect(meta.getTag('property="og:url"').content)
                    .toEqual('http://localhost:3000');

                  router.navigate(['/toothpaste'])
                    .then(() => {
                      expect(title.getTitle())
                        .toEqual('Toothpaste');
                      expect(meta.getTag('name="description"').content)
                        .toEqual('Eating toothpaste is considered to be too healthy!');
                      expect(meta.getTag('property="og:url"').content)
                        .toEqual('http://localhost:3000/toothpaste');

                      router.navigate(['/duck'])
                        .then(() => {
                          expect(title.getTitle())
                            .toEqual('Mighty mighty mouse');
                          expect(meta.getTag('name="description"').content)
                            .toEqual('Mighty Mouse is an animated superhero mouse character');
                          expect(meta.getTag('property="og:url"').content)
                            .toEqual('http://localhost:3000/duck');

                          router.navigate(['/no-data'])
                            .then(() => {
                              expect(title.getTitle())
                                .toEqual('Mighty mighty mouse');
                              expect(meta.getTag('name="description"').content)
                                .toEqual('Mighty Mouse is an animated superhero mouse character');
                              expect(meta.getTag('property="og:url"').content)
                                .toEqual('http://localhost:3000/no-data');

                              router.navigate(['/no-meta'])
                                .then(() => {
                                  expect(title.getTitle())
                                    .toEqual('Mighty mighty mouse');
                                  expect(meta.getTag('name="description"').content)
                                    .toEqual('Mighty Mouse is an animated superhero mouse character');
                                  expect(meta.getTag('property="og:url"').content)
                                    .toEqual('http://localhost:3000/no-meta');
                                });
                            });
                        });
                    });
                });
            })));

        it('should be able to set meta tags using routes w/o `meta` property',
          fakeAsync(inject([Meta, Title],
            (meta: Meta, title: Title) => {
              const router = TestBed.get(Router);

              const fixture = TestBed.createComponent(TestBootstrapComponent);
              fixture.detectChanges();

              router.navigate(['/no-data'])
                .then(() => {
                  expect(title.getTitle())
                    .toEqual('Mighty mighty mouse');
                  expect(meta.getTag('name="description"').content)
                    .toEqual('Mighty Mouse is an animated superhero mouse character');
                  expect(meta.getTag('property="og:url"').content)
                    .toEqual('http://localhost:3000/no-data');
                });
            })));

        it('should be able to set meta tags using routes w/o default settings',
          fakeAsync(inject([Meta, Title],
            (meta: Meta, title: Title) => {
              const settings = cloneDeep(emptySettings);
              const metaFactory = () => new MetaStaticLoader(settings);

              testModuleConfig({
                provide: MetaLoader,
                useFactory: (metaFactory)
              });

              const router = TestBed.get(Router);

              const fixture = TestBed.createComponent(TestBootstrapComponent);
              fixture.detectChanges();

              router.navigate(['/'])
                .then(() => {
                  expect(title.getTitle())
                    .toEqual('Sweet home');
                  expect(meta.getTag('name="description"').content)
                    .toEqual('Home, home sweet home... and what?');
                  expect(meta.getTag('property="og:url"').content)
                    .toEqual('/');
                });
            })));

        it('should be able to set meta tags using routes w/o default `title` w/o `meta` property',
          fakeAsync(inject([Meta, Title],
            (meta: Meta, title: Title) => {
              const settings = cloneDeep(defaultSettings);
              settings.applicationName = 'Tour of (lazy/busy) heroes';
              settings.defaults = {
                description: 'Mighty Mouse is an animated superhero mouse character'
              };

              const metaFactory = () => new MetaStaticLoader(settings);

              testModuleConfig({
                provide: MetaLoader,
                useFactory: (metaFactory)
              });

              const router = TestBed.get(Router);

              const fixture = TestBed.createComponent(TestBootstrapComponent);
              fixture.detectChanges();

              router.navigate(['/no-data'])
                .then(() => {
                  expect(title.getTitle())
                    .toEqual('Tour of (lazy/busy) heroes');
                  expect(meta.getTag('name="description"').content)
                    .toEqual('Mighty Mouse is an animated superhero mouse character');
                  expect(meta.getTag('property="og:url"').content)
                    .toEqual('/no-data');
                });
            })));

        it('should be able to set meta tags using routes w/o default settings w/o `meta` property',
          fakeAsync(inject([Meta, Title],
            (meta: Meta, title: Title) => {
              const settings = cloneDeep(emptySettings);
              const metaFactory = () => new MetaStaticLoader(settings);

              testModuleConfig({
                provide: MetaLoader,
                useFactory: (metaFactory)
              });

              const router = TestBed.get(Router);

              const fixture = TestBed.createComponent(TestBootstrapComponent);
              fixture.detectChanges();

              router.navigate(['/no-data'])
                .then(() => {
                  expect(title.getTitle())
                    .toEqual('');
                  expect(meta.getTag('property="og:url"').content)
                    .toEqual('/no-data');
                });
            })));

        it('should be able to set the `title`',
          fakeAsync(inject([MetaService, Title],
            (metaService: MetaService, title: Title) => {
              const router = TestBed.get(Router);

              const fixture = TestBed.createComponent(TestBootstrapComponent);
              fixture.detectChanges();

              router.navigate(['/'])
                .then(() => {
                  metaService.setTitle('');
                  expect(title.getTitle())
                    .toEqual('Mighty mighty mouse - Tour of (lazy/busy) heroes');

                  router.navigate(['/no-data'])
                    .then(() => {
                      metaService.setTitle('Mighty tiny mouse');
                      expect(title.getTitle())
                        .toEqual('Mighty tiny mouse - Tour of (lazy/busy) heroes');

                      router.navigate(['/'])
                        .then(() => {
                          metaService.setTitle('Mighty tiny mouse', true);
                          expect(title.getTitle())
                            .toEqual('Mighty tiny mouse');
                        });
                    });
                });
            })));

        it('should be able to set `title` (appended)',
          fakeAsync(inject([Title],
            (title: Title) => {
              const settings = cloneDeep(testSettings);
              settings.pageTitlePositioning = PageTitlePositioning.AppendPageTitle;

              const metaFactory = () => new MetaStaticLoader(settings);

              testModuleConfig({
                provide: MetaLoader,
                useFactory: (metaFactory)
              });

              const metaService = TestBed.get(MetaService);
              const router = TestBed.get(Router);

              const fixture = TestBed.createComponent(TestBootstrapComponent);
              fixture.detectChanges();

              router.navigate(['/'])
                .then(() => {
                  metaService.setTitle('');
                  expect(title.getTitle())
                    .toEqual('Tour of (lazy/busy) heroes - Mighty mighty mouse');

                  router.navigate(['/no-data'])
                    .then(() => {
                      metaService.setTitle('Mighty tiny mouse');
                      expect(title.getTitle())
                        .toEqual('Tour of (lazy/busy) heroes - Mighty tiny mouse');

                      router.navigate(['/'])
                        .then(() => {
                          metaService.setTitle('Mighty tiny mouse', true);
                          expect(title.getTitle())
                            .toEqual('Mighty tiny mouse');
                        });
                    });
                });
            })));

        it('should be able to set `title` w/o default settings',
          fakeAsync(inject([Title],
            (title: Title) => {
              const settings = cloneDeep(defaultSettings);
              const metaFactory = () => new MetaStaticLoader(settings);

              testModuleConfig({
                provide: MetaLoader,
                useFactory: (metaFactory)
              });

              const metaService = TestBed.get(MetaService);
              const router = TestBed.get(Router);

              const fixture = TestBed.createComponent(TestBootstrapComponent);
              fixture.detectChanges();

              router.navigate(['/'])
                .then(() => {
                  metaService.setTitle('');
                  expect(title.getTitle())
                    .toEqual('');
                });
            })));

        it('should be able to set `title` w/o default settings (appended)',
          fakeAsync(inject([Title],
            (title: Title) => {
              const settings = cloneDeep(defaultSettings);
              settings.pageTitlePositioning = PageTitlePositioning.AppendPageTitle;

              const metaFactory = () => new MetaStaticLoader(settings);

              testModuleConfig({
                provide: MetaLoader,
                useFactory: (metaFactory)
              });

              const metaService = TestBed.get(MetaService);
              const router = TestBed.get(Router);

              const fixture = TestBed.createComponent(TestBootstrapComponent);
              fixture.detectChanges();

              router.navigate(['/'])
                .then(() => {
                  metaService.setTitle('');
                  expect(title.getTitle())
                    .toEqual('');
                });
            })));

        it('should be able to set `title` as blank if you provide an invalid `PageTitlePositioning`',
          inject([Title], (title: Title) => {
            const settings = cloneDeep(testSettings);
            settings.pageTitlePositioning = undefined;

            const metaFactory = () => new MetaStaticLoader(settings);

            testModuleConfig({
              provide: MetaLoader,
              useFactory: (metaFactory)
            });

            const metaService = TestBed.get(MetaService);
            metaService.setTitle('');

            expect(title.getTitle())
              .toEqual('');
          }));

        it('should throw if you attempt to set `title` through `setTag` method',
          inject([MetaService],
            (metaService: MetaService) => {
              expect(() => metaService.setTag('title', ''))
                .toThrowError('Attempt to set title through "setTag": "title" is a reserved tag name. '
                  + 'Please use `MetaService.setTitle` instead.');
            }));

        it('should be able to set meta `description`',
          fakeAsync(inject([MetaService, Meta],
            (metaService: MetaService, meta: Meta) => {
              const router = TestBed.get(Router);

              const fixture = TestBed.createComponent(TestBootstrapComponent);
              fixture.detectChanges();

              router.navigate(['/'])
                .then(() => {
                  metaService.setTag('description', '');
                  expect(meta.getTag('name="description"').content)
                    .toEqual('Mighty Mouse is an animated superhero mouse character');

                  router.navigate(['/no-data'])
                    .then(() => {
                      metaService.setTag('description', 'Mighty Mouse is a cool character');
                      expect(meta.getTag('name="description"').content)
                        .toEqual('Mighty Mouse is a cool character');
                    });
                });
            })));

        it('should be able to set meta `description` w/o default settings',
          fakeAsync(inject([Meta],
            (meta: Meta) => {
              const settings = cloneDeep(emptySettings);
              const metaFactory = () => new MetaStaticLoader(settings);

              testModuleConfig({
                provide: MetaLoader,
                useFactory: (metaFactory)
              });

              const metaService = TestBed.get(MetaService);
              const router = TestBed.get(Router);

              const fixture = TestBed.createComponent(TestBootstrapComponent);
              fixture.detectChanges();

              router.navigate(['/'])
                .then(() => {
                  metaService.setTag('description', '');
                  expect(meta.getTag('name="description"').content)
                    .toEqual('');
                });
            })));

        it('should be able to set meta `author`',
          fakeAsync(inject([MetaService, Meta],
            (metaService: MetaService, meta: Meta) => {
              const router = TestBed.get(Router);

              const fixture = TestBed.createComponent(TestBootstrapComponent);
              fixture.detectChanges();

              router.navigate(['/'])
                .then(() => {
                  metaService.setTag('author', '');
                  expect(meta.getTag('name="author"').content)
                    .toEqual('Mighty Mouse');

                  router.navigate(['/no-data'])
                    .then(() => {
                      metaService.setTag('author', 'Mickey Mouse');
                      expect(meta.getTag('name="author"').content)
                        .toEqual('Mickey Mouse');
                    });
                });
            })));

        it('should be able to set meta `publisher`',
          fakeAsync(inject([MetaService, Meta],
            (metaService: MetaService, meta: Meta) => {
              const router = TestBed.get(Router);

              const fixture = TestBed.createComponent(TestBootstrapComponent);
              fixture.detectChanges();

              router.navigate(['/'])
                .then(() => {
                  metaService.setTag('publisher', '');
                  expect(meta.getTag('name="publisher"').content)
                    .toEqual('a superhero');

                  router.navigate(['/no-data'])
                    .then(() => {
                      metaService.setTag('publisher', 'another superhero');
                      expect(meta.getTag('name="publisher"').content)
                        .toEqual('another superhero');
                    });
                });
            })));

        it('should be able to set `og:locale`',
          fakeAsync(inject([MetaService, Meta],
            (metaService: MetaService, meta: Meta) => {
              const router = TestBed.get(Router);

              const fixture = TestBed.createComponent(TestBootstrapComponent);
              fixture.detectChanges();

              router.navigate(['/'])
                .then(() => {
                  metaService.setTag('og:locale', '');
                  expect(meta.getTag('property="og:locale"').content)
                    .toEqual('en_US');

                  let elements = meta.getTags('property="og:locale:alternate"');

                  expect(elements.length)
                    .toEqual(2);
                  expect(elements[0].content)
                    .toEqual('nl_NL');
                  expect(elements[1].content)
                    .toEqual('tr_TR');

                  router.navigate(['/no-data'])
                    .then(() => {
                      metaService.setTag('og:locale', 'tr-TR');
                      expect(meta.getTag('property="og:locale"').content)
                        .toEqual('tr_TR');

                      elements = meta.getTags('property="og:locale:alternate"');

                      expect(elements.length)
                        .toEqual(2);
                      expect(elements[0].content)
                        .toEqual('en_US');
                      expect(elements[1].content)
                        .toEqual('nl_NL');
                    });
                });
            })));

        it('should be able to set `og:locale:alternate` w/ `og:locale:alternate`',
          fakeAsync(inject([MetaService, Meta],
            (metaService: MetaService, meta: Meta) => {
              const router = TestBed.get(Router);

              const fixture = TestBed.createComponent(TestBootstrapComponent);
              fixture.detectChanges();

              router.navigate(['/'])
                .then(() => {
                  metaService.setTag('og:locale:alternate', '');
                  const elements = meta.getTags('property="og:locale:alternate"');

                  expect(elements.length)
                    .toEqual(2);
                  expect(elements[0].content)
                    .toEqual('nl_NL');
                  expect(elements[1].content)
                    .toEqual('tr_TR');

                  router.navigate(['/no-data'])
                    .then(() => {
                      metaService.setTag('og:locale:alternate', 'tr-TR');
                      expect(meta.getTag('property="og:locale:alternate"').content)
                        .toEqual('tr_TR');
                    });
                });
            })));

        it('should be able to set `og:locale` w/o default settings',
          fakeAsync(inject([Meta],
            (meta: Meta) => {
              const settings = cloneDeep(emptySettings);
              const metaFactory = () => new MetaStaticLoader(settings);

              testModuleConfig({
                provide: MetaLoader,
                useFactory: (metaFactory)
              });

              const router = TestBed.get(Router);
              const metaService = TestBed.get(MetaService);

              const fixture = TestBed.createComponent(TestBootstrapComponent);
              fixture.detectChanges();

              router.navigate(['/'])
                .then(() => {
                  metaService.setTag('og:locale', '');
                  expect(meta.getTag('property="og:locale"').content)
                    .toEqual('');

                  router.navigate(['/no-data'])
                    .then(() => {
                      metaService.setTag('og:locale', 'tr-TR');
                      expect(meta.getTag('property="og:locale"').content)
                        .toEqual('tr_TR');
                    });
                });
            })));

        it('should be able to do not set `og:locale:alternate` as current `og:locale`',
          inject([Meta],
            (meta: Meta) => {
              const settings = cloneDeep(defaultSettings);
              settings.defaults['og:locale'] = 'tr-TR';

              const metaFactory = () => new MetaStaticLoader(settings);

              testModuleConfig({
                provide: MetaLoader,
                useFactory: (metaFactory)
              });

              const metaService = TestBed.get(MetaService);

              expect(meta.getTag('property="og:locale"').content)
                .toEqual('tr_TR');

              metaService.setTag('og:locale:alternate', 'tr-TR');
              expect(meta.getTag('property="og:locale:alternate"'))
                .toBeNull();
            }));

        it('should be able to do not set `og:locale:alternate` using routes w/o default settings & w/o `og:locale`',
          fakeAsync(inject([Meta, Title],
            (meta: Meta, title: Title) => {
              const settings = cloneDeep(defaultSettings);
              settings.defaults['og:locale:alternate'] = 'en-US';

              const metaFactory = () => new MetaStaticLoader(settings);

              testModuleConfig({
                provide: MetaLoader,
                useFactory: (metaFactory)
              });

              const router = TestBed.get(Router);

              const fixture = TestBed.createComponent(TestBootstrapComponent);
              fixture.detectChanges();

              router.navigate(['/'])
                .then(() => {
                  expect(title.getTitle())
                    .toEqual('Sweet home');
                  expect(meta.getTag('name="description"').content)
                    .toEqual('Home, home sweet home... and what?');
                  expect(meta.getTag('property="og:url"').content)
                    .toEqual('/');
                  expect(meta.getTag('property="og:locale:alternate"'))
                    .toBeNull();
                });
            })));

        it('should be able to set any other meta tag',
          fakeAsync(inject([MetaService, Meta],
            (metaService: MetaService, meta: Meta) => {
              const router = TestBed.get(Router);

              const fixture = TestBed.createComponent(TestBootstrapComponent);
              fixture.detectChanges();

              router.navigate(['/'])
                .then(() => {
                  metaService.setTag('og:type', '');
                  expect(meta.getTag('property="og:type"').content)
                    .toEqual('website');

                  router.navigate(['/no-data'])
                    .then(() => {
                      metaService.setTag('og:type', 'blog');
                      expect(meta.getTag('property="og:type"').content)
                        .toEqual('blog');
                    });
                });
            })));

        it('should be able to remove tag',
          fakeAsync(inject([MetaService, Meta],
            (metaService: MetaService, meta: Meta) => {
              const router = TestBed.get(Router);

              const fixture = TestBed.createComponent(TestBootstrapComponent);
              fixture.detectChanges();

              router.navigate(['/'])
                .then(() => {
                  metaService.removeTag('property="og:type"');
                  expect(meta.getTag('property="og:type"'))
                    .toBeNull();
                });
            })));
      });

    describe('MetaService w/callback',
      () => {
        it('should be able to set `title` w/`non-observable` callback',
          fakeAsync(inject([Title],
            (title: Title) => {
              const callback = (value: string) => value === 'Tour of (lazy/busy) heroes' ? '' : value;

              const settings = cloneDeep(testSettings);
              settings['callback'] = (value: string) => callback(value);
              const metaFactory = () => new MetaStaticLoader(settings);

              testModuleConfig({
                provide: MetaLoader,
                useFactory: (metaFactory)
              });

              const metaService = TestBed.get(MetaService);
              const router = TestBed.get(Router);

              const fixture = TestBed.createComponent(TestBootstrapComponent);
              fixture.detectChanges();

              router.navigate(['/'])
                .then(() => {
                  metaService.setTitle('test');
                  expect(title.getTitle())
                    .toEqual('test');
                });
            })));

        it('should be able to set `title` w/`non-observable` callback w/o default settings',
          fakeAsync(inject([Title],
            (title: Title) => {
              const callback = (value: string) => value === 'Tour of (lazy/busy) heroes' ? '' : value;

              const settings = cloneDeep(defaultSettings);
              settings['callback'] = (value: string) => callback(value);
              settings['pageTitleSeparator'] = ' - ';
              settings['applicationName'] = 'Tour of (lazy/busy) heroes';
              settings.defaults['title'] = 'test';
              const metaFactory = () => new MetaStaticLoader(settings);

              testModuleConfig({
                provide: MetaLoader,
                useFactory: (metaFactory)
              });

              const metaService = TestBed.get(MetaService);
              const router = TestBed.get(Router);

              const fixture = TestBed.createComponent(TestBootstrapComponent);
              fixture.detectChanges();

              router.navigate(['/'])
                .then(() => {
                  metaService.setTitle('');
                  expect(title.getTitle())
                    .toEqual('test');
                });
            })));

        it('should be able to set meta tags w/`promise` callback',
          fakeAsync(inject([Title],
            (title: Title) => {
              const callback = (value: string) => Promise.resolve(value);

              const settings = cloneDeep(testSettings);
              settings['callback'] = (value: string) => callback(value);
              const metaFactory = () => new MetaStaticLoader(settings);

              testModuleConfig({
                provide: MetaLoader,
                useFactory: (metaFactory)
              });

              const router = TestBed.get(Router);

              const fixture = TestBed.createComponent(TestBootstrapComponent);
              fixture.detectChanges();

              router.navigate(['/'])
                .then(() => {
                  expect(title.getTitle())
                    .toEqual('Sweet home - Tour of (lazy/busy) heroes');
                });
            })));

        it('should be able to set meta tags w/`observable` callback',
          fakeAsync(inject([Title],
            (title: Title) => {
              const settings = cloneDeep(testSettings);
              settings['callback'] = (value: string) => observableOf(value);
              const metaFactory = () => new MetaStaticLoader(settings);

              testModuleConfig({
                provide: MetaLoader,
                useFactory: (metaFactory)
              });

              const router = TestBed.get(Router);

              const fixture = TestBed.createComponent(TestBootstrapComponent);
              fixture.detectChanges();

              router.navigate(['/'])
                .then(() => {
                  expect(title.getTitle())
                    .toEqual('Sweet home - Tour of (lazy/busy) heroes');
                });
            })));
      });
  });
