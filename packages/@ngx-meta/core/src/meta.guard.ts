import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, RouterStateSnapshot } from '@angular/router';

import { MetaService } from './meta.service';

@Injectable()
export class MetaGuard implements CanActivate, CanActivateChild {
  constructor(private readonly meta: MetaService) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const url = state.url;

    const metaSettings = route.hasOwnProperty('data') ? route.data.meta : undefined;

    this.meta.update(url, metaSettings);

    return true;
  }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return this.canActivate(route, state);
  }
}
