import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { bluetooth } from '@signality/core';
import { DemoCard, DemoNotSupported, Wrapper } from '../../common';

@Component({
  selector: 'demo-bluetooth',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Wrapper, DemoCard, DemoNotSupported],
  templateUrl: './bluetooth-demo.html',
  styleUrl: './bluetooth-demo.scss',
})
export class BluetoothDemo {
  readonly importCode = `import { bluetooth } from '@signality/core'`;

  readonly bt = bluetooth();

  readonly state = computed<'unsupported' | 'idle' | 'connecting' | 'connected' | 'error'>(() => {
    if (!this.bt.isSupported()) return 'unsupported';
    if (this.bt.error()) return 'error';
    if (this.bt.isConnected()) return 'connected';
    if (this.bt.isConnecting()) return 'connecting';
    return 'idle';
  });

  readonly title = computed(() => {
    switch (this.state()) {
      case 'connecting':
        return 'Searching...';
      case 'connected':
        return 'Connected';
      case 'error':
        return 'Connection Failed';
      default:
        return 'Bluetooth';
    }
  });

  readonly subtitle = computed(() => {
    switch (this.state()) {
      case 'connecting':
        return 'Looking for nearby Bluetooth devices';
      case 'connected':
        return this.bt.device()?.name || 'Unknown Device';
      case 'error':
        return '';
      default:
        return 'Discover and connect to nearby devices';
    }
  });

  readonly statusLabel = computed(() => {
    switch (this.state()) {
      case 'connecting':
        return 'Searching…';
      case 'connected':
        return 'Connected';
      case 'error':
        return 'Failed';
      default:
        return 'Idle';
    }
  });

  readonly errorMessage = computed(() => {
    const err = this.bt.error();
    if (!err) return '';
    if (err.message.includes('User cancelled')) return 'Connection cancelled by user';
    if (err.message.includes('not found')) return 'No device found in range';
    return err.message;
  });

  readonly iconOpacity = computed(() => (['idle', 'connecting'].includes(this.state()) ? 1 : 0));
  readonly checkOpacity = computed(() => (this.state() === 'connected' ? 1 : 0));
  readonly errorOpacity = computed(() => (this.state() === 'error' ? 1 : 0));

  async connect(): Promise<void> {
    await this.bt.request();
  }

  disconnect(): void {
    this.bt.disconnect();
  }
}
