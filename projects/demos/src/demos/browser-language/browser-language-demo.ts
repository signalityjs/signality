import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { browserLanguage } from '@signality/core/browser/browser-language';
import { DemoCard, Wrapper } from '../../common';

@Component({
  selector: 'demo-browser-language',
  encapsulation: ViewEncapsulation.ShadowDom,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard],
  template: `
    <ng-demo-wrapper [code]="importCode">
      <div class="language-card">
        <demo-card>
          <div class="language-content">
            <span class="language-label">Browser Language</span>
            <span class="language-value">{{ language() }}</span>
          </div>
        </demo-card>
      </div>
    </ng-demo-wrapper>
  `,
  styles: `
    .language-card {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .language-content {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .language-label {
      font-size: 0.75rem;
      font-weight: 500;
      color: #a1a1aa;
      text-transform: uppercase;
      letter-spacing: 0.025em;
    }

    .language-value {
      font-size: 1.5rem;
      font-weight: 600;
      color: #e4e4e7;
    }
  `,
})
export class BrowserLanguageDemo {
  readonly language = browserLanguage();

  readonly importCode = `import { browserLanguage } from '@signality/core'`;
}
