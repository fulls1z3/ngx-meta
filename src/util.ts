// libs
import { Observable } from 'rxjs/Observable';
// TODO use Symbol.observable when https://github.com/ReactiveX/rxjs/issues/2415 will be resolved
import {$$observable as symbolObservable} from 'rxjs/symbol/observable';

/**
 * Determine if the argument is shaped like a Promise
 */
export function isPromise(obj: any): obj is Promise<any> {
  // allow any Promise/A+ compliant thenable.
  // It's up to the caller to ensure that obj.then conforms to the spec
  return !!obj && typeof obj.then === 'function';
}

/**
 * Determine if the argument is an Observable
 */
export function isObservable(obj: any | Observable<any>): obj is Observable<any> {
  // TODO use Symbol.observable when https://github.com/ReactiveX/rxjs/issues/2415 will be resolved
  // return !!(obj && obj[symbolObservable]);
  return !!obj && typeof obj.subscribe === 'function';
}
