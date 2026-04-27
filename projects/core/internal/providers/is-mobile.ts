import { inject, InjectionToken } from '@angular/core';
import { MOBILE_REGEX } from '../constants';
import { IS_BROWSER } from './is-browser';

/**
 * @internal
 */
export const IS_MOBILE = new InjectionToken<boolean>(ngDevMode ? 'IS_MOBILE' : '', {
  providedIn: 'platform',
  factory: () => {
    return inject(IS_BROWSER) ? MOBILE_REGEX.test(navigator.userAgent) : false;
  },
});
