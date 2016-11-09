// angular
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Routes } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

// module
import { MetadataModule, MetadataSettings, PageTitlePositioning } from '../index';

export const getAttribute = (doc: any, name: string, attribute: string) => {
    let selector = `meta[name="${name}"]`;

    if (name.lastIndexOf('og:', 0) === 0)
        selector = `meta[property="${name}"]`;

    const el = doc.querySelector(selector);

    return !!el ? el.getAttribute(attribute) : undefined;
};

@Component({ template: '<router-outlet></router-outlet>' })
export class TestComponent {}

const testRoutes: Routes = [
    {
        path: '',
        children: [
            {
                path: 'duck',
                component: TestComponent,
                data: {
                    metadata: {
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
                    metadata: {
                        title: 'Toothpaste',
                        override: true, // prevents appending/prepending the application name to the title attribute
                        description: 'Eating toothpaste is considered to be too healthy!',
                        'og:locale' : 'fr-FR',
                        'og:locale:alternate' : 'en-US,tr-TR'
                    }
                }
            },
            {
                path: 'no-data',
                component: TestComponent
            },
            {
                path: 'no-metadata',
                component: TestComponent,
                data: {
                    dummy: 'yummy'
                }
            }
        ],
        data: {
            metadata: {
                title: 'Sweet home',
                description: 'Home, home sweet home... and what?'
            }
        }
    }
];

export const defaultSettings: MetadataSettings = {
    pageTitlePositioning: PageTitlePositioning.PrependPageTitle,
    defaults: {}
};

export const emptySettings: MetadataSettings = {
    pageTitlePositioning: PageTitlePositioning.PrependPageTitle,
    defaults: undefined
};

export const testSettings: MetadataSettings = {
    pageTitlePositioning: PageTitlePositioning.PrependPageTitle,
    pageTitleSeparator: ' - ',
    applicationName: 'Tour of (lazy/busy) heroes',
    applicationUrl: 'http://localhost:3000',
    defaults: {
        title: 'Mighty mighty mouse',
        description: 'Mighty Mouse is an animated superhero mouse character',
        'author': 'Mighty Mouse',
        'publisher': 'a superhero',
        'og:image': 'https://upload.wikimedia.org/wikipedia/commons/f/f8/superraton.jpg',
        'og:type': 'website',
        'og:locale': 'en-US',
        'og:locale:alternate': 'nl-NL,tr-TR'
    }
};

// test module configuration for each test
export const testModuleConfig = (moduleOptions?: any) => {
    // reset the test environment before initializing it.
    TestBed.resetTestEnvironment();

    TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting())
        .configureTestingModule({
            declarations: [
                TestComponent
            ],
            imports: [
                RouterTestingModule.withRoutes(testRoutes),
                MetadataModule.forRoot(moduleOptions)
            ]
        });
};
