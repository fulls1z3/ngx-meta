import { ModuleWithProviders, NgModule, Optional, SkipSelf } from '@angular/core';

import { MetaGuard } from './meta.guard';
import { MetaLoader, MetaStaticLoader } from './meta.loader';
import { MetaService } from './meta.service';

export const metaFactory = () => new MetaStaticLoader();

@NgModule()
export class MetaModule {
  static forRoot(
    configuredProvider: any = {
      provide: MetaLoader,
      useFactory: metaFactory
    }
  ): ModuleWithProviders {
    return {
      ngModule: MetaModule,
      providers: [configuredProvider, MetaGuard, MetaService]
    };
  }

  constructor(@Optional() @SkipSelf() parentModule?: MetaModule) {
    if (parentModule) {
      throw new Error('MetaModule already loaded; import in root module only.');
    }
  }
}
