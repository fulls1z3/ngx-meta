// angular
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, RouterStateSnapshot } from '@angular/router';

// module
import { MetaService } from './meta.service';

@Injectable()
export class MetaGuard implements CanActivate, CanActivateChild {
  public constructor(private readonly meta: MetaService) {
  }

  public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const url = state.url;

    const metaSettings = (!!route && !!route.data && !!route.data['meta'])
      ? route.data['meta']
      : undefined;
    this.meta.update(url, metaSettings);

    return true;
  }

  public canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return this.canActivate(route, state);
  }
}
