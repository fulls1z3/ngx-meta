import { PageTitlePositioning } from "./page-title-positioning";

export interface MetaSettings {
  /**
   * callback function, to use a custom logic on the meta tag contents (http-get, translate, etc.)
   */
  callback?: Function;
  /**
   * represents whether title attributes are positioned before/after the application name
   */
  pageTitlePositioning: PageTitlePositioning;
  /**
   * separator character(s) between the title attribute and application name
   */
  pageTitleSeparator?: string;
  /**
   * application name, used as a prefix/suffix to the title attribute
   */
  applicationName?: string;
  /**
   * application url, used in og:url as a prefix to the current page URL
   */
  applicationUrl?: string;
  /**
   * represents a dictionary of default meta tags and their values
   */
  defaults?: {
    /**
     * default meta title, used when a route does not have its own title attribute
     */
    title?: string;
    /**
     * default meta description, used when a route does not have its own description attribute
     */
    description?: string;
    /**
     * default meta keywords, used when a route does not have its own keywords attribute
     */
    keywords?: string;
    /**
     * represents a key/value pair of default meta tag and its value
     */
    [key: string]: string | undefined;
  };
}
