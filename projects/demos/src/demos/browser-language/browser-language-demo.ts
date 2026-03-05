import { ChangeDetectionStrategy, Component } from '@angular/core';
import { browserLanguage } from '@signality/core/browser/browser-language';
import { DemoCard, Wrapper } from '../../common';

@Component({
  selector: 'demo-browser-language',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard],
  template: `
    <ng-demo-wrapper [code]="importCode">
      <div class="demo-lang-card">
        <demo-card>
          <div class="demo-lang-content">
            <span class="demo-lang-label">Browser Language</span>
            <span class="demo-lang-value">{{ language() }}</span>
          </div>
        </demo-card>
      </div>
    </ng-demo-wrapper>
  `,
  styles: `
    .demo-lang-card {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .demo-lang-content {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .demo-lang-label {
      font-size: 0.75rem;
      font-weight: 500;
      color: #a1a1aa;
      text-transform: uppercase;
      letter-spacing: 0.025em;
    }

    .demo-lang-value {
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
