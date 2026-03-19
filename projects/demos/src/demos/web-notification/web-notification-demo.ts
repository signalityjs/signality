import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { webNotification } from '@signality/core';
import { DemoCard, Wrapper } from '../../common';

@Component({
  selector: 'demo-web-notification',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard],
  templateUrl: './web-notification-demo.html',
  styleUrl: './web-notification-demo.scss',
})
export class WebNotificationDemo {
  readonly importCode = `import { webNotification } from '@signality/core'`;

  readonly notif = webNotification();

  readonly state = computed<'unsupported' | 'default' | 'granted' | 'denied'>(() => {
    if (!this.notif.isSupported()) return 'unsupported';
    return this.notif.permission();
  });

  readonly title = computed(() => {
    switch (this.state()) {
      case 'unsupported':
        return 'Not Supported';
      case 'default':
        return 'Notifications';
      case 'denied':
        return 'Permission Denied';
      case 'granted':
        return this.notif.notification() ? 'Sent!' : 'Ready';
    }
  });

  readonly subtitle = computed(() => {
    switch (this.state()) {
      case 'unsupported':
        return 'Notifications API not available';
      case 'default':
        return 'Allow to receive browser notifications';
      case 'denied':
        return 'Enable in browser settings to continue';
      case 'granted':
        return this.notif.notification() ? 'Notification delivered' : 'Notifications are enabled';
    }
  });

  readonly statusLabel = computed(() => {
    switch (this.state()) {
      case 'unsupported':
        return 'Not supported';
      case 'default':
        return 'Waiting for permission';
      case 'denied':
        return 'Permission denied';
      case 'granted':
        return this.notif.notification() ? 'Sent' : 'Granted';
    }
  });

  readonly bellOpacity = computed(() =>
    this.state() === 'default' || (this.state() === 'granted' && !this.notif.notification()) ? 1 : 0
  );
  readonly checkOpacity = computed(() => (this.notif.notification() ? 1 : 0));
  readonly deniedOpacity = computed(() => (this.state() === 'denied' ? 1 : 0));
  readonly unsupportedOpacity = computed(() => (this.state() === 'unsupported' ? 1 : 0));

  async requestPermission(): Promise<void> {
    await this.notif.requestPermission();
  }

  send(): void {
    this.notif.show('Hello from Signality!', {
      body: 'Web Notifications API wrapped with Angular signals.',
    });
  }
}
