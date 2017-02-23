// angular
import { getTestBed } from '@angular/core/testing';

// module
import { MetadataLoader, MetadataStaticLoader, MetadataService, MetadataSettings } from '../index';
import { testSettings, defaultSettings, emptySettings, testModuleConfig } from './index.spec';

describe('@nglibs/metadata:',
    () => {
        beforeEach(() => {
            const metadataFactory = () => new MetadataStaticLoader(testSettings);

            testModuleConfig({ provide: MetadataLoader, useFactory: (metadataFactory) });
        });

        describe('MetadataLoader',
            () => {
                it('should be able to return the default metadataSettings',
                    () => {
                        const loader = new MetadataStaticLoader();
                        const loadedApiEndpoint = loader.getSettings();

                        expect(loadedApiEndpoint).toEqual(defaultSettings);
                    });

                it('should be able to provide `MetadataStaticLoader`',
                    () => {
                        const metadataFactory = () => new MetadataStaticLoader(testSettings);

                        testModuleConfig({ provide: MetadataLoader, useFactory: (metadataFactory) });

                        const injector = getTestBed();
                        const metadata = injector.get(MetadataService);

                        expect(MetadataStaticLoader).toBeDefined();
                        expect(metadata.loader).toBeDefined();
                        expect(metadata.loader instanceof MetadataStaticLoader).toBeTruthy();
                    });

                it('should be able to provide any `MetadataLoader`',
                    () => {
                        class CustomLoader implements MetadataLoader {
                            getSettings(): MetadataSettings {
                                return emptySettings;
                            }
                        }

                        testModuleConfig({ provide: MetadataLoader, useClass: CustomLoader });

                        const injector = getTestBed();
                        const metadata = injector.get(MetadataService);

                        expect(CustomLoader).toBeDefined();
                        expect(metadata.loader).toBeDefined();
                        expect(metadata.loader instanceof CustomLoader).toBeTruthy();
                    });
            });
    });
