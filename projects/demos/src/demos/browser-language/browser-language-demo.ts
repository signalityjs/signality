import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { browserLanguage } from '@signality/core/browser/browser-language';
import { DemoCard, Wrapper } from '../../common';

@Component({
  selector: 'demo-browser-language',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard],
  template: `
    <ng-demo-wrapper [demoPath]="'browser-language/browser-language-demo'" [code]="importCode">
      <demo-card>
        <div class="bl-rows">
          <div class="bl-row">
            <span class="bl-label">Language</span>
            <span class="bl-value">{{ languageName() }}</span>
          </div>
          <div class="bl-row">
            <span class="bl-label">Region</span>
            <span class="bl-value">{{ regionName() }}</span>
          </div>
          <div class="bl-row bl-row--last">
            <span class="bl-label">Tag</span>
            <span class="bl-value bl-value--tag">{{ language() }}</span>
          </div>
        </div>
      </demo-card>
    </ng-demo-wrapper>
  `,
  styles: `
    .bl-rows {
      display: flex;
      flex-direction: column;
    }

    .bl-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.625rem 0;
      border-bottom: 1px solid #1f1f22;
    }

    .bl-row--last {
      border-bottom: none;
      padding-bottom: 0;
    }

    .bl-row:first-child {
      padding-top: 0;
    }

    .bl-label {
      font-size: 0.8125rem;
      color: #71717a;
    }

    .bl-value {
      font-size: 0.8125rem;
      color: #a1a1aa;
      font-weight: 500;
    }

    .bl-value--tag {
      font-family: 'SF Mono', 'Fira Code', 'Roboto Mono', monospace;
      font-size: 0.75rem;
      color: #71717a;
      font-weight: 400;
    }
  `,
})
export class BrowserLanguageDemo {
  readonly language = browserLanguage();

  readonly importCode = `import { browserLanguage } from '@signality/core'`;

  readonly displayName = computed(() => {
    const lang = this.language();
    try {
      return new Intl.DisplayNames([lang], { type: 'language' }).of(lang) ?? lang;
    } catch {
      return lang;
    }
  });

  readonly languageName = computed(() => {
    const lang = this.language();
    const base = lang.split('-')[0];
    try {
      return new Intl.DisplayNames([lang], { type: 'language' }).of(base) ?? base;
    } catch {
      return base;
    }
  });

  readonly regionName = computed(() => {
    const parts = this.language().split('-');
    const region = parts[1];
    if (!region) return '—';
    const lang = this.language();
    try {
      return new Intl.DisplayNames([lang], { type: 'region' }).of(region) ?? region;
    } catch {
      return region;
    }
  });
}
