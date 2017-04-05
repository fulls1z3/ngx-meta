// libs
import { Observable } from 'rxjs/Observable';
import { $$observable as symbolObservable } from 'rxjs/symbol/observable';

/**
 * Determine if the argument is an Observable
 */
export function isObservable(obj: any | Observable<any>): obj is Observable<any> {
  return !!(obj && obj[symbolObservable]);
}

/**
 * Timeout decorator
 */
export function timeout(milliseconds: number): Function {
  return function (target: any, key: string, descriptor: any): any {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: Array<any>): any {
      setTimeout(() => {
        originalMethod.apply(this, args);
      }, milliseconds);
    };

    return descriptor;
  };
}
