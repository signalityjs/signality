---
source: https://github.com/signalityjs/signality/blob/main/projects/core/browser/browser-language/index.ts
---

# BrowserLanguage

Reactive wrapper around the browser's [language preference](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/language). Returns a signal that tracks the current language of the browser UI and updates automatically when the user changes their language preference.

<Demo name="browser-language" />

## Usage

```angular-ts
import { Component, effect } from '@angular/core';
import { browserLanguage } from '@signality/core';

@Component({
  template: `
    <p>Current language: {{ language() }}</p>
  `,
})
export class LanguageDemo {
  readonly language = browserLanguage(); // [!code highlight]
  
  constructor() {
    effect(() => {
      console.log('Language changed to:', this.language());
    });
  }
}
```

::: warning Use InjectionToken for Singleton
For global state tracking like `browserLanguage`, consider using the provided `BROWSER_LANGUAGE` token instead of calling the function directly. This provides a singleton instance that can be shared across your entire application, reducing memory usage and event listener overhead:

```typescript
import { inject } from '@angular/core';
import { BROWSER_LANGUAGE } from '@signality/core';

const language = browserLanguage(); // [!code --]
const language = inject(BROWSER_LANGUAGE); // [!code ++]
```

Learn more about [Token-based utilities](/guide/key-concepts#token-based-utilities).
:::

## Parameters

| Parameter | Type                     | Description                                            |
|-----------|--------------------------|--------------------------------------------------------|
| `options` | `BrowserLanguageOptions` | Optional configuration (see [Options](#options) below) |

## Options

The `BrowserLanguageOptions` extends Angular's [`CreateSignalOptions<string>`](https://angular.dev/api/core/CreateSignalOptions) and `WithInjector`:

| Option         | Type                                                                      | Description                                                                                        |
|----------------|---------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------|
| `initialValue` | `string`                                                                  | Initial value for SSR (default: `''`)                                                              |
| `equal`        | [`ValueEqualityFn<string>`](https://angular.dev/api/core/ValueEqualityFn) | Custom equality function ([see more](https://angular.dev/guide/signals#signal-equality-functions)) |
| `debugName`    | `string`                                                                  | Debug name for the signal (development only)                                                       |
| `injector`     | [`Injector`](https://angular.dev/api/core/Injector)                       | Optional injector for DI context                                                                   |

## Return Value

Returns a `Signal<string>` containing the current browser language in [BCP 47](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/language#browser_compatibility) format. Examples:

- `'en-US'` - English (United States)
- `'fr-FR'` - French (France)
- `'de-DE'` - German (Germany)
- `'es-ES'` - Spanish (Spain)

The signal automatically updates when the user changes their language preference in the browser settings.

## Examples

### Display localized content

```angular-ts
import { Component, computed } from '@angular/core';
import { browserLanguage } from '@signality/core';

@Component({
  template: `
    <p>{{ greeting() }}</p>
  `,
})
export class LocalizedGreeting {
  readonly language = browserLanguage();
  
  readonly greeting = computed(() => {
    const lang = this.language();
    if (lang.startsWith('fr')) {
      return 'Bonjour!';
    } else if (lang.startsWith('de')) {
      return 'Guten Tag!';
    } else if (lang.startsWith('es')) {
      return '¡Hola!';
    }
    return 'Hello!';
  });
}
```

### Format dates based on language

```angular-ts
import { Component, computed, signal } from '@angular/core';
import { browserLanguage } from '@signality/core';

@Component({
  template: `
    <p>{{ formattedDate() }}</p>
  `,
})
export class LocalizedDate {
  readonly language = browserLanguage();
  readonly date = signal(new Date());
  
  readonly formattedDate = computed(() => {
    return new Intl.DateTimeFormat(this.language()).format(this.date());
  });
}
```

## SSR Compatibility

On the server, the signal initializes with the value from `initialValue` option (defaults to `''`). You can provide a custom initial value for SSR:

```angular-ts
import { browserLanguage } from '@signality/core';

const language = browserLanguage({
  initialValue: 'en-US',
});
```

## Type Definitions

```typescript
interface BrowserLanguageOptions extends CreateSignalOptions<string>, 
  WithInjector {
  readonly initialValue?: string;
}

function browserLanguage(options?: BrowserLanguageOptions): Signal<string>;

const BROWSER_LANGUAGE: InjectionToken<Signal<string>>;
```

## Related

- [Online](/browser/online) — Browser online/offline status
- [Network](/browser/network) — Network connection information
