---
source: https://github.com/signalityjs/signality/blob/main/projects/core/browser/storage/index.ts
---

# Storage

Signal-based wrapper around [Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API) (localStorage/sessionStorage). Persist and sync state across tabs with automatic type-aware serialization.

<Demo name="storage" />

## Usage

```angular-ts
import { Component } from '@angular/core';
import { storage } from '@signality/core';

@Component({
  template: `
    <input type="number" [(ngModel)]="counter" />
    <p>Stored: {{ counter() }}</p>
  `,
})
export class StorageDemo {
  readonly counter = storage('counter', 0); // [!code highlight]
}
```

## Parameters

| Parameter      | Type                                                                     | Description                                           |
|----------------|--------------------------------------------------------------------------|-------------------------------------------------------|
| `key`          | [`MaybeSignal<string>`](/reference/utility-types#maybesignal-lt-type-gt) | Storage key                                           |
| `initialValue` | `T`                                                                      | Default value if key doesn't exist                    |
| `options`      | `StorageOptions<T>`                                                      | Configuration options (see [Options](#options) below) |

## Options

The `StorageOptions` extends [`CreateSignalOptions<T>`](https://angular.dev/api/core/CreateSignalOptions) and `WithInjector`:

| Option          | Type                                                                 | Default   | Description                                                                                        |
|-----------------|----------------------------------------------------------------------|-----------|----------------------------------------------------------------------------------------------------|
| `type`          | `'local' \| 'session'`                                               | `'local'` | Storage type to use                                                                                |
| `serializer`    | `Serializer<T>`                                                      | Auto      | Custom serializer (see [Serialization](#serialization))                                            |
| `mergeResolver` | `(storedValue: T, initialValue: T) => T`                             | -         | Merge resolver when reading from storage (see [Schema migration](#schema-migration))               |
| `equal`         | [`ValueEqualityFn<T>`](https://angular.dev/api/core/ValueEqualityFn) | -         | Custom equality function ([see more](https://angular.dev/guide/signals#signal-equality-functions)) |
| `injector`      | [`Injector`](https://angular.dev/api/core/Injector)                  | -         | Optional injector for DI context                                                                   |

## Serialization

The utility automatically infers the appropriate serializer from the initial value type:

- `string` → pass-through (no transformation)
- `number` → handles Infinity, -Infinity, NaN
- `boolean` → strict true/false conversion
- `bigint` → string representation
- `Date` → ISO 8601 format
- `Map` → JSON array of entries
- `Set` → JSON array
- `object/array` → JSON serialization

### Built-in serializers

You can explicitly use built-in serializers via the exported `Serializers` object:

```angular-ts
import { storage, Serializers } from '@signality/core';

// Explicitly use a built-in serializer
const counter = storage('count', 0, {
  serializer: Serializers.number,
});

// Available serializers:
// - Serializers.string
// - Serializers.number
// - Serializers.boolean
// - Serializers.bigint
// - Serializers.date
// - Serializers.object
// - Serializers.map
// - Serializers.set
// - Serializers.any
```

### Custom serializers

Create custom serializers for special handling:

```angular-ts
import { storage, type Serializer } from '@signality/core';

const customDateSerializer: Serializer<Date> = {
  write: (date) => date.getTime().toString(),
  read: (str) => new Date(parseInt(str, 10)),
};

const timestamp = storage('timestamp', new Date(), {
  serializer: customDateSerializer,
});
```

## Examples

### Theme preference

```angular-ts
import { Component, effect, inject, DOCUMENT } from '@angular/core';
import { storage } from '@signality/core';

type Theme = 'light' | 'dark' | 'system';

@Component({
  template: `
    <select [(ngModel)]="theme">
      <option value="light">Light</option>
      <option value="dark">Dark</option>
      <option value="system">System</option>
    </select>
  `,
})
export class ThemeSelector {
  readonly docEl = inject(DOCUMENT).documentElement;
  readonly theme = storage<Theme>('theme', 'system');
  
  constructor() {
    effect(() => {
      this.docEl.setAttribute('data-theme', this.theme());
    });
  }
}
```

### Shopping cart with complex types

```angular-ts
import { Component } from '@angular/core';
import { storage } from '@signality/core';

interface CartItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

@Component({
  template: `
    <p>Cart: {{ cart().length }} items</p>
    <button (click)="clearCart()">Clear Cart</button>
  `,
})
export class ShoppingCart {
  readonly cart = storage<CartItem[]>('cart', []);
  
  addItem(item: CartItem) {
    this.cart.update(cart => {
      const existing = cart.find(i => i.id === item.id);
      if (existing) {
        return cart.map(i => 
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...cart, item];
    });
  }
  
  clearCart() {
    this.cart.set([]);
  }
}
```

### Schema migration

Handle schema changes when your data structure evolves:

```angular-ts
interface UserSettings {
  theme: 'light' | 'dark';
  fontSize: number;
  notifications?: boolean; // New field added later
}

const defaultSettings: UserSettings = {
  theme: 'dark',
  fontSize: 14,
  notifications: true, // New default
};

@Component({ /* ... */ })
export class SettingsComponent {
  // Shallow merge: adds new properties from defaults
  // (default behavior for objects)
  readonly settings = storage('settings', defaultSettings);
  
  // Or use custom merge for deep merging
  readonly advancedSettings = storage('advSettings', defaultSettings, {
    mergeResolver: (storedValue, initialValue) => { // [!code highlight]
      // Custom deep merge logic
      return deepMerge(initialValue, storedValue);
    },
  });
}
```

### Reactive key

```angular-ts
import { Component, computed, signal } from '@angular/core';
import { storage } from '@signality/core';

@Component({ /* ... */ })
export class UserPreferences {
  readonly userId = signal('user-123');
  readonly storageKey = computed(() => `prefs:${this.userId()}`); // [!code highlight]
  
  // Storage key changes when userId changes
  readonly preferences = storage(
    this.storageKey,
    { theme: 'light', lang: 'en' }
  );
}
```

### Session storage

```angular-ts
import { Component } from '@angular/core';
import { storage } from '@signality/core';

@Component({ /* ... */ })
export class SessionDemo {
  // Session storage: cleared when tab closes
  readonly formDraft = storage('formDraft', {}, {
    type: 'session', // [!code highlight]
  });
}
```

## SSR Compatibility

On the server, the utility uses an in-memory store that doesn't persist. The initial value is used, and changes are kept in memory during the request.

## Type Definitions

```typescript
interface StorageOptions<T> extends CreateSignalOptions<T>, WithInjector {
  readonly type?: 'local' | 'session';
  readonly serializer?: Serializer<T>;
  readonly mergeResolver?: (storedValue: T, initialValue: T) => T;
}

interface Serializer<T> {
  readonly write: (value: T) => string;
  readonly read: (raw: string) => T;
}

function storage<T>(
  key: MaybeSignal<string>,
  initialValue: T,
  options?: StorageOptions<T>,
): WritableSignal<T>;

const Serializers: {
  readonly string: Serializer<string>;
  readonly number: Serializer<number>;
  readonly boolean: Serializer<boolean>;
  readonly bigint: Serializer<bigint>;
  readonly date: Serializer<Date>;
  readonly object: Serializer<unknown>;
  readonly map: Serializer<Map<unknown, unknown>>;
  readonly set: Serializer<Set<unknown>>;
  readonly any: Serializer<unknown>;
};
```
