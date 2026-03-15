import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { textSelection } from '@signality/core/elements/text-selection';
import { DemoCard, Wrapper } from '../../common';

@Component({
  selector: 'demo-text-selection',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard],
  template: `
    <ng-demo-wrapper [demoPath]="'text-selection/text-selection-demo'" [code]="importCode">
      <demo-card>
        <div class="ts-wrap">
          <!-- Selectable text block -->
          <div class="ts-text-block">
            <p class="ts-text">
              Angular signals bring reactivity to the core. With Signality, you can track browser
              state, user interactions, and DOM changes — all as composable, lazy signals that
              integrate seamlessly with Angular's change detection.
            </p>
          </div>

          <div class="ts-divider"></div>

          <!-- Info rows -->
          <div class="ts-list">
            <div class="ts-row">
              <span class="ts-label">Characters</span>
              <span class="ts-value" [class.ts-value--active]="hasSelection()">
                {{ charCount() }}
              </span>
            </div>

            <div class="ts-divider"></div>

            <div class="ts-row">
              <span class="ts-label">Words</span>
              <span class="ts-value" [class.ts-value--active]="hasSelection()">
                {{ wordCount() }}
              </span>
            </div>

            <div class="ts-divider"></div>

            <div class="ts-row">
              <span class="ts-label">Text</span>
              <span class="ts-value ts-value--text" [class.ts-value--active]="hasSelection()">
                {{ displayText() }}
              </span>
            </div>
          </div>
        </div>
      </demo-card>
    </ng-demo-wrapper>
  `,
  styles: `
    .ts-wrap {
      display: flex;
      flex-direction: column;
    }

    /* ── Selectable text block ── */
    .ts-text-block {
      background: rgba(255, 255, 255, 0.025);
      border-radius: 6px;
      padding: 0.875rem 1rem;
      margin-bottom: 0.75rem;
      user-select: text;
      cursor: text;
    }

    .ts-text {
      margin: 0;
      font-size: 0.8125rem;
      color: #a1a1aa;
      line-height: 1.7;
      font-style: italic;
    }

    /* ── Divider ── */
    .ts-divider {
      height: 1px;
      background: #1f1f22;
    }

    /* ── Info list ── */
    .ts-list {
      display: flex;
      flex-direction: column;
      margin-top: 0.75rem;
    }

    /* ── Row ── */
    .ts-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding: 0.5rem 0;
    }

    .ts-row:first-child { padding-top: 0; }
    .ts-row:last-child  { padding-bottom: 0; }

    /* ── Label ── */
    .ts-label {
      font-size: 0.8125rem;
      font-weight: 400;
      color: #a1a1aa;
      flex-shrink: 0;
    }

    /* ── Value ── */
    .ts-value {
      font-size: 0.8125rem;
      font-weight: 500;
      color: #3f3f46;
      text-align: right;
      transition: color 0.25s ease;
    }

    .ts-value--active {
      color: #e4e4e7;
    }

    .ts-value--text {
      max-width: 60%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  `,
})
export class TextSelectionDemo {
  readonly selection = textSelection();

  readonly importCode = `import { textSelection } from '@signality/core'`;

  readonly hasSelection = computed(() => !!this.selection.text());
  readonly charCount = computed(() => this.selection.text().length);
  readonly wordCount = computed(() => {
    const t = this.selection.text().trim();
    return t ? t.split(/\s+/).length : 0;
  });
  readonly displayText = computed(() => {
    const t = this.selection.text();
    if (!t) return '—';
    return t.length > 36 ? t.slice(0, 36) + '…' : t;
  });
}
