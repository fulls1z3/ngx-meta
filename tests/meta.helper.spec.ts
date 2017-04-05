// angular
import { getDOM } from '@angular/platform-browser/src/dom/dom_adapter';

// libs
import * as _ from 'lodash';

// module
import { MetaHelper } from '../src/meta.helper';

describe('@nglibs/meta:',
  () => {
    const doc = getDOM().createHtmlDocument();
    const meta = new MetaHelper(doc);
    let defaultMeta: any;

    beforeEach(() => {
      defaultMeta = getDOM().createElement('meta', doc);

      getDOM().setAttribute(defaultMeta, 'property', 'fb:app_id');
      getDOM().setAttribute(defaultMeta, 'content', '123456789');
      getDOM().appendChild(getDOM().getElementsByTagName(doc, 'head')[0], defaultMeta);
    });

    afterEach(() => {
      getDOM().remove(defaultMeta);
    });

    describe('MetaHelper',
      () => {
        describe('getMetaElement',
          () => {
            it('should return null w/o selector',
              () => {
                const actual = meta.getMetaElement('');
                expect(actual).toBeNull();
              });
          });

        describe('getOrCreateMetaElement',
          () => {
            it('should return meta element matching selector', () => {
              const actual = meta.getOrCreateMetaElement({property: 'fb:app_id'});
              expect(actual).not.toBeNull();
              expect(getDOM().getAttribute(actual, 'content')).toEqual('123456789');
            });

            it('should create and return meta element if it does not exist', () => {
              const actual = meta.getOrCreateMetaElement({
                name: 'fake',
                content: 'fake'
              });
              expect(getDOM().getAttribute(actual, 'content')).toEqual('fake');
            });
          });

        describe('updateMetaElement',
          () => {
            it('should return null w/o definition',
              () => {
                const actual = meta.updateMetaElement(null);
                expect(actual).toBeNull();
              });
          });

        describe('getMetaElements',
          () => {
            it('should return empty array w/o selector',
              () => {
                const actual = meta.getMetaElements('');
                expect(actual).toEqual([]);
              });
          });

        describe('removeElement',
          () => {
            it('should remove nothing w/o element',
              () => {
                const actual = _.cloneDeep(doc);
                meta.removeElement(undefined);
                expect(_.cloneDeep(doc)).toEqual(actual);
              });
          });
      });
  });
