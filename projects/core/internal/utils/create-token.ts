import { InjectionToken, type ProviderToken } from '@angular/core';

/**
 * @internal
 */
export function createToken<T>(
  factory: () => T,
  providedIn: ProvidedIn = 'root'
): ProviderToken<T> {
  return new InjectionToken(ngDevMode ? factory.name : '', { factory, providedIn });
}

type ProvidedIn = NonNullable<ConstructorParameters<typeof InjectionToken>[1]>['providedIn'];
