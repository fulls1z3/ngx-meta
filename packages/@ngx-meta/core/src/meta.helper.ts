// angular
import { Inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/platform-browser';
import { DomAdapter, getDOM } from '@angular/platform-browser/src/dom/dom_adapter';

// module
import { MetaDefinition } from './models/meta-definition';

@Injectable()
export class MetaHelper {
  private readonly dom: DomAdapter;

  private static parseSelector(definition: MetaDefinition): string {
    const attr = definition.name ? 'name' : 'property';

    return `${attr}="${definition[attr]}"`;
  }

  constructor(@Inject(DOCUMENT) private readonly document: any) {
    this.dom = getDOM();
  }

  getMetaElement(selector: string): any {
    if (!selector)
      return undefined;

    return this.dom.querySelector(this.document, `meta[${selector}]`);
  }

  getOrCreateMetaElement(definition: MetaDefinition, forceCreation = false): any {
    let element: any;

    if (!forceCreation) {
      const selector = MetaHelper.parseSelector(definition);
      element = this.getMetaElement(selector);

      if (!element || !this.hasAttributes(definition, element))
        element = this.getOrCreateMetaElement(definition, true);
    } else {
      element = this.dom.createElement('meta');
      this.setAttributes(definition, element);

      const head = this.dom.getElementsByTagName(this.document, 'head')[0];
      this.dom.appendChild(head, element);
    }

    return element;
  }

  updateMetaElement(definition: MetaDefinition, selector?: string): any {
    if (!definition)
      return undefined;

    selector = selector || MetaHelper.parseSelector(definition);
    const element: any = this.getMetaElement(selector);

    if (element)
      return this.setAttributes(definition, element);

    return this.getOrCreateMetaElement(definition, true);
  }

  getMetaElements(selector: string): Array<any> {
    if (!selector)
      return [];

    const list = this.dom.querySelectorAll(this.document, `meta[${selector}]`);

    return [].slice.call(list);
  }

  removeElement(element: any): void {
    if (element)
      this.dom.remove(element);
  }

  private hasAttributes(definition: MetaDefinition, element: any): boolean {
    return Object.keys(definition).every((key: string) => this.dom.getAttribute(element, key) === definition[key]);
  }

  private setAttributes(definition: MetaDefinition, element: any): any {
    Object.keys(definition).forEach((key: string) => this.dom.setAttribute(element, key, definition[key]));

    return element;
  }
}
