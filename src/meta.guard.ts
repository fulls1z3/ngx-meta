// angular
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, RouterStateSnapshot } from '@angular/router';

// libs
import * as _ from 'lodash';

// module
import { MetaService } from './meta.service';

@Injectable()
export class MetaGuard implements CanActivate, CanActivateChild {
  public constructor(private readonly meta: MetaService) {
  }

  public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const url = state.url;

    const metaSettings = _.get(route.data, 'meta', undefined);
    this.meta.updateMetaTags(url, metaSettings);

    return true;
  }

  public canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return this.canActivate(route, state);
  }
}
