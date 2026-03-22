# Signality Demos

Interactive demo components for Signality utilities, built as Web Components (Custom Elements) for integration with VitePress documentation.

## Architecture

```
demos/
├── src/
│   ├── demos/           # Demo components (battery, clipboard, etc.)
│   ├── common/          # Shared UI components (card, button, wrapper, etc.)
│   ├── app/             # Dev app for local testing
│   ├── main.ts          # Dev entry point
│   ├── main.elements.ts # Custom Elements entry point
│   └── styles.scss      # Global styles & design tokens
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
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard, DemoButton],
  templateUrl: './battery-demo.html',
  styleUrl: './battery-demo.scss',
})
export class BatteryDemo {
  readonly battery = battery();
}
```

**For utilities that return `*Ref` with `.isSupported()`:**

Check support in the template and show `<demo-not-supported>` when the API is unavailable:

```html
@if (!myUtility.isSupported()) {
<demo-not-supported
  title="API Not Available"
  description="This feature is not supported in this browser."
  [hints]="['Chrome 38+', 'Firefox 101+']"
>
  <!-- icon via ng-content -->
</demo-not-supported>
} @else {
<!-- main demo content -->
}
```

2. Register in `main.elements.ts`:

```typescript
import { BatteryDemo } from './demos/battery/battery-demo';

const DEMOS = [
  { component: BatteryDemo, name: 'signality-demo-battery' },
  { component: ClipboardDemo, name: 'signality-demo-clipboard' }, // Add here
] as const;
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

## Common Components

Shared UI components available in `src/common/`:

- `DemoCard` — card wrapper for demo content
- `DemoButton` — styled button
- `DemoInput` — styled input
- `DemoNotSupported` — "Not supported" message component
- `DemoBadge` — badge component
- `DemoToggle` — toggle component
- `DemoProgress` — progress bar component
- `Wrapper` — layout wrapper with optional copy functionality

Import from `src/common/index.ts`.

