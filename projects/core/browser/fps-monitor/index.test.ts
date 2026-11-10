import { createEnvironmentInjector, EnvironmentInjector, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { IS_BROWSER, IS_SERVER } from '@signality/core/internal';
import { FPS, fps } from '@signality/core/browser/fps';
import { FPS_MONITOR, fpsMonitor, type FpsMonitorOptions } from './index';

// One 20ms frame is 50fps; the value is refreshed every 10 frames.
const FRAME_DURATION = 20;
const FRAME_RATE = 1000 / FRAME_DURATION;

describe(fpsMonitor.name, () => {
  let frameCallbacks: FrameRequestCallback[];
  let currentTime: number;
  let requestFrameSpy: jest.SpyInstance;
  let cancelFrameSpy: jest.SpyInstance;

  beforeEach(() => {
    frameCallbacks = [];
    currentTime = 0;

    requestFrameSpy = jest.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => {
      frameCallbacks.push(cb);
      return frameCallbacks.length;
    });
    cancelFrameSpy = jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {
      frameCallbacks = [];
    });
    jest.spyOn(performance, 'now').mockImplementation(() => currentTime);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const renderFrames = (count: number) => {
    for (let i = 0; i < count; i++) {
      const pending = frameCallbacks.shift();
      currentTime += FRAME_DURATION;
      pending?.(currentTime);
    }
  };

  const createMonitor = (options?: FpsMonitorOptions) =>
    TestBed.runInInjectionContext(() => fpsMonitor(options));

  it('should start monitoring immediately by default', () => {
    const monitor = createMonitor();

    expect(monitor.isRunning()).toBe(true);
    expect(monitor.value()).toBe(0);
    expect(requestFrameSpy).toHaveBeenCalledTimes(1);
  });

  it('should report the average frame rate as value', () => {
    const monitor = createMonitor();

    renderFrames(10);

    expect(monitor.value()).toBe(FRAME_RATE);
  });

  it('should not start until start is called when immediate is false', () => {
    const monitor = createMonitor({ immediate: false });

    expect(monitor.isRunning()).toBe(false);
    expect(requestFrameSpy).not.toHaveBeenCalled();

    monitor.start();
    renderFrames(10);

    expect(monitor.isRunning()).toBe(true);
    expect(monitor.value()).toBe(FRAME_RATE);
  });

  it('should stop measuring when stop is called', () => {
    const monitor = createMonitor();

    monitor.stop();
    renderFrames(10);

    expect(monitor.isRunning()).toBe(false);
    expect(cancelFrameSpy).toHaveBeenCalledTimes(1);
    expect(monitor.value()).toBe(0);
  });

  it('should stop monitoring when its injector is destroyed', () => {
    const injector = createEnvironmentInjector([], TestBed.inject(EnvironmentInjector));
    const monitor = fpsMonitor({ injector });

    injector.destroy();

    expect(monitor.isRunning()).toBe(false);
    expect(cancelFrameSpy).toHaveBeenCalledTimes(1);
  });

  it('should return safe defaults on the server', () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: IS_SERVER, useValue: true },
        { provide: IS_BROWSER, useValue: false },
      ],
    });

    const monitor = createMonitor();

    expect(monitor.value()).toBe(0);
    expect(monitor.isRunning()).toBe(false);
    expect(requestFrameSpy).not.toHaveBeenCalled();
  });

  it('should share a single monitor through the FPS_MONITOR token', () => {
    const first = TestBed.runInInjectionContext(() => inject(FPS_MONITOR));
    const second = TestBed.runInInjectionContext(() => inject(FPS_MONITOR));

    renderFrames(10);

    expect(first).toBe(second);
    expect(first.value()).toBe(FRAME_RATE);
  });

  describe('deprecated fps', () => {
    it('should expose fps as an alias of value', () => {
      const monitor = TestBed.runInInjectionContext(() => fps());

      renderFrames(10);

      expect(monitor.fps).toBe(monitor.value);
      expect(monitor.fps()).toBe(FRAME_RATE);
    });

    it('should resolve the FPS token to the FPS_MONITOR singleton', () => {
      const legacy = TestBed.runInInjectionContext(() => inject(FPS));
      const current = TestBed.runInInjectionContext(() => inject(FPS_MONITOR));

      renderFrames(10);

      expect(legacy.value).toBe(current.value);
      expect(legacy.fps).toBe(current.value);
      expect(legacy.fps()).toBe(FRAME_RATE);

      legacy.stop();

      expect(current.isRunning()).toBe(false);
    });
  });
});
