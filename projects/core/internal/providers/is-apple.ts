import { inject, InjectionToken } from '@angular/core';
import { APPLE_REGEX } from '../constants';
import { IS_BROWSER } from './is-browser';

/**
 * @internal
 */
export const IS_APPLE = new InjectionToken<boolean>(ngDevMode ? 'IS_APPLE' : '', {
  providedIn: 'platform',
  factory: () => {
    return inject(IS_BROWSER) ? APPLE_REGEX.test(navigator.userAgent) : false;
  },
});
