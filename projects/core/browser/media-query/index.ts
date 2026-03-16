import { type CreateSignalOptions, effect, type Signal, signal } from '@angular/core';
import { constSignal, setupContext, toValue, type Union } from '@signality/core/internal';
import type { MaybeSignal, WithInjector } from '@signality/core/types';
import { listener } from '@signality/core/browser/listener';

export interface MediaQueryOptions extends CreateSignalOptions<boolean>, WithInjector {
  /**
   * Initial value for SSR.
   * @default false
   */
  readonly initialValue?: boolean;
}

/**
 * Reactive wrapper around the [Window.matchMedia](https://developer.mozilla.org/en-US/docs/Web/API/Window/matchMedia) method.
 *
 * @param query - CSS media query string (can be a signal)
 * @param options - Optional configuration
 * @returns A signal that is true when the media query matches
 *
 * @example
 * ```typescript
 * @Component({
 *   template: `
 *     @if (prefersDark()) {
 *       <p>Dark mode is preferred</p>
 *     } @else {
 *       <p>Light mode is preferred</p>
 *     }
 *   `
 * })
 * class ThemeDemo {
 *   readonly prefersDark = mediaQuery('(prefers-color-scheme: dark)');
 * }
 * ```
 */
export function mediaQuery(
  query: MaybeSignal<Union<MediaQueryFeature, string>>,
  options?: MediaQueryOptions
): Signal<boolean> {
  const { runInContext } = setupContext(options?.injector, mediaQuery);

  return runInContext(({ isServer, injector }) => {
    if (isServer) {
      return constSignal(!!options?.initialValue);
    }

    const matches = signal(!!options?.initialValue, options);

    effect(onCleanup => {
      const queryString = toValue(query);

      if (!queryString) {
        matches.set(false);
        return;
      }

      const mediaQueryList = window.matchMedia(queryString);

      matches.set(mediaQueryList.matches);

      const changeListener = listener(
        mediaQueryList,
        'change',
        (e: MediaQueryListEvent) => matches.set(e.matches),
        { injector }
      );

      onCleanup(changeListener.destroy);
    });

    return matches.asReadonly();
  });
}

type MediaQueryFeature =
  | `(any-hover: ${'none' | 'hover'})`
  | `(any-pointer: ${'none' | 'coarse' | 'fine'})`
  | `(aspect-ratio: ${string})`
  | `(color: ${string})`
  | `(color-gamut: ${'srgb' | 'p3' | 'rec2020'})`
  | `(color-index: ${string})`
  | `(device-aspect-ratio: ${string})`
  | `(device-height: ${string})`
  | `(device-posture: ${'flat' | 'folded' | 'continuous'})`
  | `(device-width: ${string})`
  | `(display-mode: ${
      | 'fullscreen'
      | 'standalone'
      | 'minimal-ui'
      | 'browser'
      | 'picture-in-picture'
      | 'window-controls-overlay'})`
  | `(dynamic-range: ${'standard' | 'high'})`
  | `(forced-colors: ${'none' | 'active'})`
  | `(grid: ${'0' | '1'})`
  | `(height: ${string})`
  | `(hover: ${'none' | 'hover'})`
  | `(inverted-colors: ${'none' | 'inverted'})`
  | `(monochrome: ${string})`
  | `(orientation: ${'portrait' | 'landscape'})`
  | `(overflow-block: ${'none' | 'scroll' | 'optional-paged' | 'paged'})`
  | `(overflow-inline: ${'none' | 'scroll'})`
  | `(pointer: ${'none' | 'coarse' | 'fine'})`
  | `(prefers-color-scheme: ${'light' | 'dark' | 'no-preference'})`
  | `(prefers-contrast: ${'no-preference' | 'more' | 'less' | 'custom'})`
  | `(prefers-reduced-data: ${'no-preference' | 'reduce'})`
  | `(prefers-reduced-motion: ${'no-preference' | 'reduce'})`
  | `(prefers-reduced-transparency: ${'no-preference' | 'reduce'})`
  | `(resolution: ${string})`
  | `(scan: ${'progressive' | 'interlace'})`
  | `(scripting: ${'none' | 'initial-only' | 'enabled'})`
  | `(shape: ${'rect' | 'round'})`
  | `(update: ${'none' | 'slow' | 'fast'})`
  | `(video-dynamic-range: ${'standard' | 'high'})`
  | `(width: ${string})`
  | `(min-width: ${string})`
  | `(max-width: ${string})`
  | `(min-height: ${string})`
  | `(max-height: ${string})`
  | `(min-aspect-ratio: ${string})`
  | `(max-aspect-ratio: ${string})`
  | `(min-resolution: ${string})`
  | `(max-resolution: ${string})`
  | `(min-color: ${string})`
  | `(max-color: ${string})`
  | `(min-color-index: ${string})`
  | `(max-color-index: ${string})`
  | `(min-monochrome: ${string})`
  | `(max-monochrome: ${string})`;
