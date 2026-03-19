import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { browserLanguage } from '@signality/core';
import { DemoCard, Wrapper } from '../../common';

@Component({
  selector: 'demo-browser-language',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard],
  templateUrl: './browser-language-demo.html',
  styleUrl: './browser-language-demo.scss',
})
export class BrowserLanguageDemo {
  readonly importCode = `import { browserLanguage } from '@signality/core'`;

  readonly language = browserLanguage();

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
