// module
import { PageTitlePositioning } from './models/page-title-positioning';
import { MetaSettings } from './models/meta-settings';

export abstract class MetaLoader {
    abstract getSettings(): MetaSettings;
}

export class MetaStaticLoader implements MetaLoader {
    constructor(private readonly settings: MetaSettings = {
                    pageTitlePositioning: PageTitlePositioning.PrependPageTitle,
                    defaults: {}
                }) {}

    getSettings(): MetaSettings {
        return this.settings;
    }
}
