import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { broadcastChannel } from './index';

describe(broadcastChannel.name, () => {
  let channelName: string;

  const waitForMessage = (time = 50) => new Promise(resolve => setTimeout(resolve, time));

  beforeEach(() => {
    channelName = `test-${Date.now()}-${Math.random()}`;
  });

  it('should start with null data and error', () => {
    const channel = TestBed.runInInjectionContext(() => broadcastChannel<string>(channelName));

    expect(channel.data()).toBeNull();
    expect(channel.error()).toBeNull();
    expect(channel.isClosed()).toBe(false);
  });

  it('should receive messages from another channel', async () => {
    const { receiver, sender } = TestBed.runInInjectionContext(() => ({
      receiver: broadcastChannel<string>(channelName),
      sender: broadcastChannel<string>(channelName),
    }));

    sender.post('Hello');

    await waitForMessage();

    expect(receiver.data()).toBe('Hello');
  });

  it('should not receive messages after closing', async () => {
    const { receiver, sender } = TestBed.runInInjectionContext(() => ({
      receiver: broadcastChannel<string>(channelName),
      sender: broadcastChannel<string>(channelName),
    }));

    receiver.close();

    sender.post('Should not receive');

    await waitForMessage();

    expect(receiver.data()).toBeNull();
  });

  it('should close on component destroy', () => {
    @Component({ template: '' })
    class TestComponent {
      readonly channel = broadcastChannel<string>(channelName);
    }

    const fixture = TestBed.createComponent(TestComponent);
    const channel = fixture.componentInstance.channel;

    expect(channel.isClosed()).toBe(false);

    fixture.destroy();

    expect(channel.isClosed()).toBe(true);
  });
});
