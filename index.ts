// angular
import { NgModule, ModuleWithProviders, Optional, SkipSelf } from '@angular/core';

// module
import { MetadataLoader, MetadataStaticLoader } from './src/metadata.loader';
import { MetadataService } from './src/metadata.service';

export * from './src/models/page-title-positioning';
export * from './src/models/metadata-settings';
export * from './src/metadata.loader';
export * from './src/metadata.service';

// for AoT compilation
export function metadataFactory(): MetadataLoader {
    return new MetadataStaticLoader();
}

/**
 * Do not specify providers for modules that might be imported by a lazy loaded module.
 */
@NgModule()
export class MetadataModule {
    static forRoot(configuredProvider: any = {
                       provide: MetadataLoader,
                       useFactory: (metadataFactory)
                   }): ModuleWithProviders {
        return {
            ngModule: MetadataModule,
            providers: [
                configuredProvider,
                MetadataService
            ]
        };
    }

    constructor(@Optional() @SkipSelf() parentModule: MetadataModule) {
        if (parentModule)
            throw new Error('MetadataModule already loaded; import in root module only.');
    }
}
