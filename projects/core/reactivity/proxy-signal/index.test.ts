import { effect, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { proxySignal } from '../proxy-signal';

describe('proxySignal', () => {
  describe('get handler', () => {
    it('returns the source value without handler.get', () => {
      const source = signal(1);
      const proxy = proxySignal(source, {});

      expect(proxy()).toBe(1);
    });

    it('returns transformed value via get handler', () => {
      const source = signal(1);
      const proxy = proxySignal(source, { get: s => s() * 2 });

      expect(proxy()).toBe(2);
    });

    it('reacts to source changes applying the transform', () => {
      const source = signal(1);
      const proxy = proxySignal(source, { get: s => s() * 2 });

      source.set(5);

      expect(proxy()).toBe(10);
    });
  });

  describe('set handler', () => {
    it('passes the value to handler.set and updates source', () => {
      const source = signal(0);
      const proxy = proxySignal(source, { set: (v, s) => s.set(v) });

      proxy.set(5);

      expect(source()).toBe(5);
    });

    it('applies transform in handler.set when using proxy.set', () => {
      const source = signal(0);
      const proxy = proxySignal(source, { set: (v, s) => s.set(v * 2) });

      proxy.set(5);

      expect(source()).toBe(10);
    });

    it('update delegates to handler.set with the computed value', () => {
      const source = signal(3);
      const proxy = proxySignal(source, { set: (v, s) => s.set(v) });

      proxy.update(v => v * 2);

      expect(source()).toBe(6);
    });

    it('set does not track dependencies', () => {
      const source = signal(1);
      const dep = signal(1);
      const proxy = proxySignal(source, { set: (v, s) => s.set(dep() + v) });
      const effectSpy = jest.fn();

      TestBed.runInInjectionContext(() => {
        effect(() => {
          proxy.set(10);
          effectSpy();
        });
      });

      TestBed.tick();
      expect(effectSpy).toHaveBeenCalledTimes(1);

      dep.set(10);
      TestBed.tick();
      expect(effectSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('asReadonly', () => {
    it('applies get handler', () => {
      const source = signal(1);
      const proxy = proxySignal(source, { get: s => s() + 1 });

      expect(proxy.asReadonly()()).toBe(2);
    });

    it('reacts to source changes', () => {
      const source = signal(1);
      const proxy = proxySignal(source, { get: s => s() + 1 });

      source.set(5);

      expect(proxy.asReadonly()()).toBe(6);
    });

    it('returns the same object on every call', () => {
      const source = signal(0);
      const proxy = proxySignal(source, {});

      expect(proxy.asReadonly()).toBe(proxy.asReadonly());
    });
  });

  describe('readonly source', () => {
    it('does not expose set/update when source is readonly', () => {
      const source = signal(0).asReadonly();
      const proxy = proxySignal(source, {});

      expect((proxy as any).set).toBeUndefined();
      expect((proxy as any).update).toBeUndefined();
    });
  });

  describe('nested proxies', () => {
    it('composes get handlers in order', () => {
      const source = signal(1);
      const proxy1 = proxySignal(source, { get: s => s() + 1 });
      const proxy2 = proxySignal(proxy1, { get: s => s() * 2 });

      expect(proxy2()).toBe(4); // (1+1)*2
    });

    it('reacts to source changes through nested get handlers', () => {
      const source = signal(1);
      const proxy1 = proxySignal(source, { get: s => s() + 1 });
      const proxy2 = proxySignal(proxy1, { get: s => s() * 2 });

      source.set(4);

      expect(proxy2()).toBe(10); // (4+1)*2
    });

    it('composes set handlers in order', () => {
      const source = signal(0);
      const proxy1 = proxySignal(source, { set: (v, s) => s.set(v * 2) });
      const proxy2 = proxySignal(proxy1, { set: (v, s) => s.set(v + 1) });

      proxy2.set(3);

      expect(source()).toBe(8); // (3+1)*2
    });
  });

  describe('equal option', () => {
    it('does not update source when equal returns true', () => {
      const source = signal({ x: 1 });
      const proxy = proxySignal(
        source,
        { set: (v, s) => s.set(v) },
        { equal: (a, b) => a.x === b.x }
      );

      const before = source();
      proxy.set({ x: 1 });

      expect(before).toBe(source());
    });

    it('updates source when equal returns false', () => {
      const source = signal({ x: 1 });
      const proxy = proxySignal(
        source,
        { set: (v, s) => s.set(v) },
        { equal: (a, b) => a.x === b.x }
      );

      proxy.set({ x: 2 });

      expect(source().x).toBe(2);
    });
  });
});
