import { MetaSettings } from './models/meta-settings';
import { PageTitlePositioning } from './models/page-title-positioning';

export abstract class MetaLoader {
  abstract get settings(): MetaSettings;
}

export class MetaStaticLoader implements MetaLoader {
  get settings(): MetaSettings {
    return this.providedSettings;
  }

  constructor(
    private readonly providedSettings: MetaSettings = {
      pageTitlePositioning: PageTitlePositioning.PrependPageTitle,
      defaults: {}
    }
  ) {
  }
}
