// module
import { PageTitlePositioning } from './models/page-title-positioning';
import { MetaSettings } from './models/meta-settings';

export abstract class MetaLoader {
  abstract get settings(): MetaSettings;
}

export class MetaStaticLoader implements MetaLoader {
  constructor(private readonly metaSettings: MetaSettings = {
                pageTitlePositioning: PageTitlePositioning.PrependPageTitle,
                defaults: {}
              }) {
  }

  get settings(): MetaSettings {
    return this.metaSettings;
  }
}
