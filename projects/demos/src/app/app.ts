import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/**
 * Development App
 *
 * Used for local development and testing of demo components.
 * Not used in the Custom Elements build.
 */
@Component({
  selector: 'app-root',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet],
  template: `<router-outlet />`,
  styles: `
    *, :after, :before, ::backdrop {
      box-sizing: border-box;
      border: 0 solid;
      margin: 0;
      padding: 0;
    }

    html {
      color-scheme: dark;
    }

    body {
      margin: 0;
      line-height: 1.5rem;
      color: #EEEEEE;
      background: #0F0F11;
    }

    button, input, select, optgroup, textarea {
      font: inherit;
      font-feature-settings: inherit;
      font-variation-settings: inherit;
      letter-spacing: inherit;
      color: inherit;
      opacity: 1;
      background-color: #0000;
      border-radius: 0;
    }
  `,
})
export class App {}
