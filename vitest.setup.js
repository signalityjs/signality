import { NgModule, provideZonelessChangeDetection } from '@angular/core';
import { getTestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';

import { applyPolyfills } from './testing/polyfills';

applyPolyfills();

class ZonelessTestModule {}
NgModule({ providers: [provideZonelessChangeDetection()] })(ZonelessTestModule);

getTestBed().initTestEnvironment(
  [BrowserTestingModule, ZonelessTestModule],
  platformBrowserTesting(),
  { teardown: { destroyAfterEach: true } }
);
