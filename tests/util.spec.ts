// libs
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';

// module
import { isObservable } from '../src/util';

describe('@nglibs/meta:', () => {
  describe('isObservable', () => {
    it('should be true for an Observable',
      () => {
        expect(isObservable(Observable.of(true))).toEqual(true);
      });

    it('should be false if the argument is undefined',
      () => {
        expect(isObservable(undefined)).toEqual(false);
      });

    it('should be false if the argument is null',
      () => {
        expect(isObservable(null)).toEqual(false);
      });

    it('should be false if the argument is an object',
      () => {
        expect(isObservable({})).toEqual(false);
      });

    it('should be false if the argument is a function',
      () => {
        expect(isObservable(() => {
        })).toEqual(false);
      });

    it('should be false if the argument is the object with subscribe function',
      () => {
        expect(isObservable({
          subscribe: () => {
          }
        })).toEqual(false);
      });
  });
});
