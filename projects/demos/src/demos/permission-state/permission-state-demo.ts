import { ChangeDetectionStrategy, Component } from '@angular/core';
import { permissionState } from '@signality/core';
import { DemoCard, Wrapper } from '../../common';

@Component({
  selector: 'demo-permission-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard],
  template: `
    <ng-demo-wrapper [demoPath]="'permission-state/permission-state-demo'" [code]="importCode">
      <demo-card>
        <div class="ps-list">
          @for (entry of permissions; track entry.name) {
          <div class="ps-row">
            <span class="ps-dot" [class]="'ps-dot--' + entry.state()"></span>
            <span class="ps-name">{{ entry.name }}</span>
            <span class="ps-value" [class]="'ps-value--' + entry.state()">{{ entry.state() }}</span>
          </div>
          @if (!$last) {
          <div class="ps-divider"></div>
          } }
        </div>
      </demo-card>
    </ng-demo-wrapper>
  `,
  styles: `
    .ps-list {
      display: flex;
      flex-direction: column;
    }

    /* ── Row ── */
    .ps-row {
      display: flex;
      align-items: center;
      gap: 0.625rem;
      padding: 0.625rem 0;
    }

    .ps-row:first-child { padding-top: 0; }
    .ps-row:last-child  { padding-bottom: 0; }

    /* ── Dot ── */
    .ps-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #3f3f46;
      flex-shrink: 0;
      transition: background 0.3s ease, box-shadow 0.3s ease;
    }

    .ps-dot--granted {
      background: #22c55e;
      box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.18);
    }

    .ps-dot--denied {
      background: #ef4444;
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.18);
    }

    /* ── Permission name ── */
    .ps-name {
      font-size: 0.8125rem;
      font-weight: 400;
      color: #a1a1aa;
      flex: 1;
    }

    /* ── State value ── */
    .ps-value {
      font-size: 0.8125rem;
      font-weight: 500;
      color: #52525b;
      text-align: right;
      flex-shrink: 0;
      transition: color 0.3s ease;
    }

    .ps-value--granted { color: #22c55e; }
    .ps-value--denied  { color: #ef4444; }
    .ps-value--prompt  { color: #52525b; }

    /* ── Divider ── */
    .ps-divider {
      height: 1px;
      background: #1f1f22;
    }
  `,
})
export class PermissionStateDemo {
  readonly importCode = `import { permissionState } from '@signality/core'`;

  readonly permissions = [
    { name: 'geolocation', state: permissionState('geolocation') },
    { name: 'camera', state: permissionState('camera') },
    { name: 'microphone', state: permissionState('microphone') },
    { name: 'notifications', state: permissionState('notifications') },
  ];
}
