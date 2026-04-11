---
source: https://github.com/signalityjs/signality/blob/main/projects/core/utilities/generate-id.ts
---

# GenerateId

Creates a unique ID string with optional prefix.

<Demo name="generate-id" />

## Usage

```angular-ts
import { Component, input } from '@angular/core';
import { generateId } from '@signality/core';

@Component({
  template: `
    <label [for]="inputId()">Label</label>
    <input [id]="inputId()" />
  `
})
export class TextField {
  readonly inputId = input(generateId()); // [!code highlight]
}
```

## Parameters

| Parameter | Type                | Description            |
|-----------|---------------------|------------------------|
| `options` | `GenerateIdOptions` | Optional configuration |

## Options

| Option     | Type       | Default | Description                      |
|------------|------------|---------|----------------------------------|
| `prefix`   | `string`   | `'app'` | Prefix for the generated ID      |
| `injector` | `Injector` | -       | Optional injector for DI context |

## Return Value

Returns a string ID with optional prefix, e.g., `"app-12345"` or `"user-12345"`.

## Examples

### Using outside of the injection context

By default, `generateId()` must be called within the [injection context](https://angular.dev/guide/di/dependency-injection-context) (e.g., as a field initializer). To invoke it outside — such as in an event handler — pass an [`Injector`](https://angular.dev/api/core/Injector) instance explicitly as an argument.

```angular-ts
import { Component, inject, INJECTOR } from '@angular/core';
import { generateId } from '@signality/core';

@Component({ ... })
export class MyComponent {
  readonly injector = inject(INJECTOR); // [!code ++]
  
  generateId(): void {
    const id = generateId({ injector: this.injector }); // [!code highlight]
  }
}
```

## Type Definitions

```typescript
interface GenerateIdOptions extends WithInjector {
  readonly prefix?: string;
}

function generateId(options?: GenerateIdOptions): string;
```
