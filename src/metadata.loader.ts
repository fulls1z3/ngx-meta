// module
import { PageTitlePositioning } from './models/page-title-positioning';
import { MetadataSettings } from './models/metadata-settings';

export abstract class MetadataLoader {
    abstract getSettings(): MetadataSettings;
}

export class MetadataStaticLoader implements MetadataLoader {
    constructor(private readonly metadataSettings: MetadataSettings = {
                    pageTitlePositioning: PageTitlePositioning.PrependPageTitle,
                    defaults: {}
                }) {}

    getSettings(): MetadataSettings {
        return this.metadataSettings;
    }
}
