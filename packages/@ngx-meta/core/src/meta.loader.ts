// module
import { PageTitlePositioning } from './models/page-title-positioning';
import { MetaSettings } from './models/meta-settings';

export abstract class MetaLoader {
  abstract get settings(): MetaSettings;
}

export class MetaStaticLoader implements MetaLoader {
  get settings(): MetaSettings {
    return this.providedSettings;
  }

  constructor(private readonly providedSettings: MetaSettings = {
    pageTitlePositioning: PageTitlePositioning.PrependPageTitle,
    defaults: {}
  }) {
  }
}
