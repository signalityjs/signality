import { inject, InjectionToken, PLATFORM_ID } from '@angular/core';
import { isPlatformServer } from '@angular/common';

export const IS_SERVER = new InjectionToken<boolean>(ngDevMode ? 'IS_SERVER' : '', {
  providedIn: 'platform',
  factory: () => isPlatformServer(inject(PLATFORM_ID)),
});
