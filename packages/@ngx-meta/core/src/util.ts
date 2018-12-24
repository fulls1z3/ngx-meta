import { Observable } from 'rxjs';

export const isPromise = (obj: any): obj is Promise<any> => !!obj && typeof obj.then === 'function';

export const isObservable = (obj: any | Observable<any>): obj is Observable<any> => !!obj && typeof obj.subscribe === 'function';
