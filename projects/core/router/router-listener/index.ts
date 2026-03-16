import { inject } from '@angular/core';
import {
  ActivationEnd,
  ActivationStart,
  ChildActivationEnd,
  ChildActivationStart,
  type Event as RouterEvent,
  GuardsCheckEnd,
  GuardsCheckStart,
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationSkipped,
  NavigationStart,
  ResolveEnd,
  ResolveStart,
  RouteConfigLoadEnd,
  RouteConfigLoadStart,
  Router,
  RoutesRecognized,
  Scroll,
} from '@angular/router';
import { filter } from 'rxjs';
import { setupContext } from '@signality/core/internal';
import type { WithInjector } from '@signality/core/types';

export interface RouterListenerOptions extends WithInjector {
  /** If true, automatically unsubscribe after the first event */
  readonly once?: boolean;
}

export interface RouterListenerRef {
  /** Manually unsubscribe from router events */
  readonly destroy: () => void;
}

export type RouterEventType =
  | 'navigationstart'
  | 'navigationend'
  | 'navigationcancel'
  | 'navigationerror'
  | 'navigationskipped'
  | 'routesrecognized'
  | 'guardscheckstart'
  | 'guardscheckend'
  | 'resolvestart'
  | 'resolveend'
  | 'routeconfigloadstart'
  | 'routeconfigloadend'
  | 'childactivationstart'
  | 'childactivationend'
  | 'activationstart'
  | 'activationend'
  | 'scroll';

/**
 * Event-driven listener for [Angular Router](https://angular.dev/guide/routing) events.
 *
 * @param event - Router event name in lowercase (e.g., 'navigationstart') or array of event names
 * @param handler - Type-safe handler function for the specific event(s)
 * @param options - Optional configuration
 * @returns RouterListenerRef with destroy method for manual unsubscribe
 *
 * @example
 * ```typescript
 * @Component({
 *   template: `
 *     @if (isLoading()) {
 *       <p>Navigation in progress...</p>
 *     }
 *   `
 * })
 * class NavigationDemo {
 *   readonly isLoading = signal(false);
 *
 *   constructor() {
 *     routerListener('navigationstart', event => {
 *       this.isLoading.set(true);
 *     });
 *
 *     routerListener('navigationend', event => {
 *       this.isLoading.set(false);
 *     });
 *   }
 * }
 * ```
 */
export function routerListener(
  event: 'navigationstart',
  handler: (event: NavigationStart) => void,
  options?: RouterListenerOptions
): RouterListenerRef;
export function routerListener(
  event: 'navigationend',
  handler: (event: NavigationEnd) => void,
  options?: RouterListenerOptions
): RouterListenerRef;
export function routerListener(
  event: 'navigationcancel',
  handler: (event: NavigationCancel) => void,
  options?: RouterListenerOptions
): RouterListenerRef;
export function routerListener(
  event: 'navigationerror',
  handler: (event: NavigationError) => void,
  options?: RouterListenerOptions
): RouterListenerRef;
export function routerListener(
  event: 'navigationskipped',
  handler: (event: NavigationSkipped) => void,
  options?: RouterListenerOptions
): RouterListenerRef;
export function routerListener(
  event: 'routesrecognized',
  handler: (event: RoutesRecognized) => void,
  options?: RouterListenerOptions
): RouterListenerRef;
export function routerListener(
  event: 'guardscheckstart',
  handler: (event: GuardsCheckStart) => void,
  options?: RouterListenerOptions
): RouterListenerRef;
export function routerListener(
  event: 'guardscheckend',
  handler: (event: GuardsCheckEnd) => void,
  options?: RouterListenerOptions
): RouterListenerRef;
export function routerListener(
  event: 'resolvestart',
  handler: (event: ResolveStart) => void,
  options?: RouterListenerOptions
): RouterListenerRef;
export function routerListener(
  event: 'resolveend',
  handler: (event: ResolveEnd) => void,
  options?: RouterListenerOptions
): RouterListenerRef;
export function routerListener(
  event: 'routeconfigloadstart',
  handler: (event: RouteConfigLoadStart) => void,
  options?: RouterListenerOptions
): RouterListenerRef;
export function routerListener(
  event: 'routeconfigloadend',
  handler: (event: RouteConfigLoadEnd) => void,
  options?: RouterListenerOptions
): RouterListenerRef;
export function routerListener(
  event: 'childactivationstart',
  handler: (event: ChildActivationStart) => void,
  options?: RouterListenerOptions
): RouterListenerRef;
export function routerListener(
  event: 'childactivationend',
  handler: (event: ChildActivationEnd) => void,
  options?: RouterListenerOptions
): RouterListenerRef;
export function routerListener(
  event: 'activationstart',
  handler: (event: ActivationStart) => void,
  options?: RouterListenerOptions
): RouterListenerRef;
export function routerListener(
  event: 'activationend',
  handler: (event: ActivationEnd) => void,
  options?: RouterListenerOptions
): RouterListenerRef;
export function routerListener(
  event: 'scroll',
  handler: (event: Scroll) => void,
  options?: RouterListenerOptions
): RouterListenerRef;
export function routerListener<T extends readonly [RouterEventType, ...RouterEventType[]]>(
  events: T,
  handler: (event: RouterEventTypeArrayToUnion<T>) => void,
  options?: RouterListenerOptions
): RouterListenerRef;
export function routerListener(
  event: RouterEventType | readonly RouterEventType[],
  handler: (event: any) => void,
  options?: RouterListenerOptions
): RouterListenerRef {
  const { runInContext } = setupContext(options?.injector, routerListener);

  return runInContext(({ onCleanup }) => {
    const router = inject(Router);
    const events = Array.isArray(event) ? event : [event];
    const EventClasses = events.map(
      (e): new (...args: any[]) => RouterEvent => EVENT_CLASSES[e as RouterEventType]
    );

    const subscription = router.events
      .pipe(
        filter((routerEvent: RouterEvent): routerEvent is RouterEvent =>
          EventClasses.some(EventClass => routerEvent instanceof EventClass)
        )
      )
      .subscribe(e => {
        handler(e);

        if (options?.once) {
          subscription.unsubscribe();
        }
      });

    const destroy = subscription.unsubscribe.bind(subscription);

    onCleanup(destroy);

    return { destroy };
  });
}

const EVENT_CLASSES: Record<RouterEventType, new (...args: any[]) => RouterEvent> = {
  navigationstart: NavigationStart,
  navigationend: NavigationEnd,
  navigationcancel: NavigationCancel,
  navigationerror: NavigationError,
  navigationskipped: NavigationSkipped,
  routesrecognized: RoutesRecognized,
  guardscheckstart: GuardsCheckStart,
  guardscheckend: GuardsCheckEnd,
  resolvestart: ResolveStart,
  resolveend: ResolveEnd,
  routeconfigloadstart: RouteConfigLoadStart,
  routeconfigloadend: RouteConfigLoadEnd,
  childactivationstart: ChildActivationStart,
  childactivationend: ChildActivationEnd,
  activationstart: ActivationStart,
  activationend: ActivationEnd,
  scroll: Scroll,
};

type RouterEventTypeMap = {
  navigationstart: NavigationStart;
  navigationend: NavigationEnd;
  navigationcancel: NavigationCancel;
  navigationerror: NavigationError;
  navigationskipped: NavigationSkipped;
  routesrecognized: RoutesRecognized;
  guardscheckstart: GuardsCheckStart;
  guardscheckend: GuardsCheckEnd;
  resolvestart: ResolveStart;
  resolveend: ResolveEnd;
  routeconfigloadstart: RouteConfigLoadStart;
  routeconfigloadend: RouteConfigLoadEnd;
  childactivationstart: ChildActivationStart;
  childactivationend: ChildActivationEnd;
  activationstart: ActivationStart;
  activationend: ActivationEnd;
  scroll: Scroll;
};

type RouterEventTypeToEventType<T extends RouterEventType> = RouterEventTypeMap[T];

type RouterEventTypeArrayToUnion<T extends readonly RouterEventType[]> = T[number] extends infer U
  ? U extends RouterEventType
    ? RouterEventTypeToEventType<U>
    : never
  : never;
