import { ChangeDetectionStrategy, Component } from '@angular/core';
import { permissionState } from '@signality/core';
import { DemoCard, Wrapper } from '../../common';

@Component({
  selector: 'demo-permission-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard],
  templateUrl: './permission-state-demo.html',
  styleUrl: './permission-state-demo.scss',
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
