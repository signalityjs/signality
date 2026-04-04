---
source: https://github.com/signalityjs/signality/blob/main/projects/core/utilities/generate-id.ts
---

# GenerateId

Creates a unique ID string with optional prefix.

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

## Type Definitions

```typescript
interface GenerateIdOptions extends WithInjector {
  readonly prefix?: string;
}

function generateId(options?: GenerateIdOptions): string;
```
