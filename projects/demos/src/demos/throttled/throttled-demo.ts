import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { throttled } from '@signality/core/reactivity/throttled';
import { DemoCard, Wrapper } from '../../common';

@Component({
  selector: 'demo-throttled',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard],
  template: `
    <ng-demo-wrapper [demoPath]="'throttled/throttled-demo'" [code]="importCode">
      <demo-card>
        <!-- Mouse zone -->
        <div class="th-zone" (mousemove)="onMouseMove($event)">Move your mouse here</div>

        <!-- Divider -->
        <div class="th-divider"></div>

        <!-- Info rows -->
        <div class="th-rows">
          <div class="th-row">
            <span class="th-label">Immediate</span>
            <span class="th-value">{{ immediateX() }}, {{ immediateY() }}</span>
          </div>
          <div class="th-row">
            <span class="th-label">Throttled</span>
            <span class="th-value th-value--accent">{{ throttledX() }}, {{ throttledY() }}</span>
          </div>
        </div>
      </demo-card>
    </ng-demo-wrapper>
  `,
  styles: `
    /* ── Mouse zone ── */
    .th-zone {
      height: 80px;
      border: 1px dashed #27272a;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8125rem;
      color: #52525b;
      cursor: crosshair;
      user-select: none;
    }

    /* ── Divider ── */
    .th-divider {
      height: 1px;
      background: #1f1f22;
      margin: 0.875rem 0 0;
    }

    /* ── Info rows ── */
    .th-rows {
      display: flex;
      flex-direction: column;
      padding-top: 0.75rem;
    }

    .th-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.375rem 0;
    }

    .th-row + .th-row {
      border-top: 1px solid #1f1f22;
    }

    .th-label {
      font-size: 0.8125rem;
      color: #71717a;
      display: flex;
      align-items: center;
      gap: 0.375rem;
    }

    /* ── Values ── */
    .th-value {
      font-size: 0.8125rem;
      color: #a1a1aa;
      font-variant-numeric: tabular-nums;
    }

    .th-value--accent {
      color: #DEB3EB;
    }
  `,
})
export class ThrottledDemo {
  readonly immediateX = signal(0);
  readonly immediateY = signal(0);
  readonly throttledX = throttled(0, 100);
  readonly throttledY = throttled(0, 100);

  readonly importCode = `import { throttled } from '@signality/core'`;

  onMouseMove(event: MouseEvent): void {
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const x = Math.round(event.clientX - rect.left);
    const y = Math.round(event.clientY - rect.top);

    this.immediateX.set(x);
    this.immediateY.set(y);
    this.throttledX.set(x);
    this.throttledY.set(y);
  }
}
