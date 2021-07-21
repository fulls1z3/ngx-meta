import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { Routes } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { MetaGuard, MetaModule, MetaService, MetaSettings, PageTitlePositioning } from '../src';

@Component({ template: '<router-outlet></router-outlet>' })
export class TestBootstrapComponent {
  constructor(private readonly meta: MetaService) {
  }
}

@Component({ template: '' })
export class TestComponent {
}

const testRoutes: Routes = [
  {
    path: '',
    canActivateChild: [MetaGuard],
    children: [
      {
        path: '',
        component: TestBootstrapComponent,
        canActivateChild: [MetaGuard],
        children: [
          {
            path: 'duck',
            component: TestComponent,
            data: {
              meta: {
                disabled: true,
                title: 'Rubber duckie',
                description: 'Have you seen my rubber duckie?'
              }
            }
          },
          {
            path: 'toothpaste',
            component: TestComponent,
            data: {
              meta: {
                title: 'Toothpaste',
                override: true,
                description: 'Eating toothpaste is considered to be too healthy!',
                'og:locale': 'fr-FR',
                'og:locale:alternate': 'en-US,fr-FR,tr-TR'
              }
            }
          },
          {
            path: 'no-data',
            component: TestComponent
          },
          {
            path: 'no-meta',
            component: TestComponent,
            data: {
              dummy: 'yummy'
            }
          }
        ],
        data: {
          meta: {
            title: 'Sweet home',
            description: 'Home, home sweet home... and what?'
          }
        }
      }
    ]
  }
];

export const defaultSettings: MetaSettings = {
  pageTitlePositioning: PageTitlePositioning.PrependPageTitle,
  defaults: {}
};

export const emptySettings: MetaSettings = {
  pageTitlePositioning: PageTitlePositioning.PrependPageTitle
};

export const testSettings: MetaSettings = {
  pageTitlePositioning: PageTitlePositioning.PrependPageTitle,
  pageTitleSeparator: ' - ',
  applicationName: 'Tour of (lazy/busy) heroes',
  applicationUrl: 'http://localhost:3000',
  defaults: {
    title: 'Mighty mighty mouse',
    description: 'Mighty Mouse is an animated superhero mouse character',
    author: 'Mighty Mouse',
    publisher: 'a superhero',
    'og:image': 'https://upload.wikimedia.org/wikipedia/commons/f/f8/superraton.jpg',
    'og:type': 'website',
    'og:locale': 'en-US',
    'og:locale:alternate': 'en-US,nl-NL,tr-TR'
  }
};

export const testModuleConfig = (moduleOptions?: any) => {
  TestBed.resetTestEnvironment();

  TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting()).configureTestingModule({
    imports: [RouterTestingModule.withRoutes(testRoutes), MetaModule.forRoot(moduleOptions)],
    declarations: [TestBootstrapComponent, TestComponent]
  });
};
