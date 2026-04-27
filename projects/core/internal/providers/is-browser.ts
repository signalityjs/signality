import { inject, InjectionToken, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * @internal
 */
export const IS_BROWSER = new InjectionToken<boolean>(ngDevMode ? 'IS_BROWSER' : '', {
  providedIn: 'platform',
  factory: () => isPlatformBrowser(inject(PLATFORM_ID)),
});
