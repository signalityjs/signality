# Signality Demos

Interactive demo components for Signality utilities, built as Web Components (Custom Elements) for integration with VitePress documentation.

## Architecture

```
demos/
├── src/
│   ├── demos/           # Demo components
│   │   ├── battery/
│   │   │   └── battery-demo.ts
│   │   └── ...
│   ├── app/             # Dev app for local testing
│   ├── main.ts          # Dev entry point
│   ├── main.elements.ts # Custom Elements entry point
│   └── styles.scss      # Shared styles
├── project.json
└── README.md
```

## Development

Run the dev server to test demos locally:

```bash
pnpm demos:dev
```

## Building Custom Elements

Build all demos as Custom Elements:

```bash
pnpm demos:build
```

This outputs to `projects/docs/public/demos/` for use in VitePress.

## Adding a New Demo

1. Create a new demo component:

```typescript
// src/demos/battery/battery-demo.ts
@Component({
  selector: 'demo-battery',
  encapsulation: ViewEncapsulation.ShadowDom,
  // ...
})
export class BatteryDemo {
  // Use the utility
  readonly battery = battery();
}
```

2. Register in `main.elements.ts`:

```typescript
import { BatteryDemo } from './demos/battery/battery-demo';

const DEMOS = [
  { component: BatteryDemo, name: 'signality-demo-battery' },
  { component: BluetoothDemo, name: 'signality-demo-bluetooth' }, // Add here
];
```

3. Use in markdown documentation:

```markdown
# Battery

<Demo name="battery" />

## Usage

...
```

## Naming Convention

- Component selector: `demo-{utility}` (e.g., `demo-battery`)
- Custom Element name: `signality-demo-{utility}` (e.g., `signality-demo-battery`)

## Styling

Each demo uses `ViewEncapsulation.ShadowDom` for style isolation. Define all styles within the component using the `:host` selector.

Use the design tokens from `styles.scss` for consistency:

```scss
:host {
  --demo-bg: #1a1a2e;
  --demo-surface: #16213e;
  --demo-border: #0f3460;
  --demo-text: #e4e4e7;
  --demo-primary: #6366f1;
}
```

