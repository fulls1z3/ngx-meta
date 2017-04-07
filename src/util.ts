// libs
import { Observable } from 'rxjs/Observable';
import { $$observable as symbolObservable } from 'rxjs/symbol/observable';

/**
 * Determine if the argument is an Observable
 */
export function isObservable(obj: any | Observable<any>): obj is Observable<any> {
  return !!(obj && obj[symbolObservable]);
}
