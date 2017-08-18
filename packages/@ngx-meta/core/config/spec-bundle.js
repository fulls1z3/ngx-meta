Error.stackTraceLimit = Infinity;

require('core-js/es6');
require('core-js/es7/reflect');
require('zone.js/dist/zone');
require('zone.js/dist/long-stack-trace-zone');
require('zone.js/dist/proxy');
require('zone.js/dist/sync-test');
require('zone.js/dist/jasmine-patch');
require('zone.js/dist/async-test');
require('zone.js/dist/fake-async-test');
require('rxjs/Rx');

const testing = require('@angular/core/testing'),
  browser = require('@angular/platform-browser-dynamic/testing');

testing.TestBed.initTestEnvironment(
  browser.BrowserDynamicTestingModule,
  browser.platformBrowserDynamicTesting()
);

const testContext = require.context('../tests', true, /\.spec\.ts/);

function requireAll(requireContext) {
  return requireContext.keys().map(requireContext);
}

requireAll(testContext);
