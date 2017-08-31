// libs
import { Observable } from 'rxjs/Observable';
// TODO use Symbol.observable when https://github.com/ReactiveX/rxjs/issues/2415 will be resolved
// import { $$observable as symbolObservable } from 'rxjs/symbol/observable';

export function isPromise(obj: any): obj is Promise<any> {
  return !!obj && typeof obj.then === 'function';
}

export function isObservable(obj: any | Observable<any>): obj is Observable<any> {
  // TODO use Symbol.observable when https://github.com/ReactiveX/rxjs/issues/2415 will be resolved
  // return !!(obj && obj[symbolObservable]);
  return !!obj && typeof obj.subscribe === 'function';
}
