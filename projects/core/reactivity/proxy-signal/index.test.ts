import { effect, signal, type WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { proxySignal, type ProxySignalHandler } from '../proxy-signal';

describe(proxySignal.name, () => {
  describe('get transformation', () => {
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

  describe('set transformation', () => {
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

    it('update does not track dependencies', () => {
      const source = signal(1);
      const dep = signal(1);
      const proxy = proxySignal(source, { set: (v, s) => s.set(dep() + v) });
      const effectSpy = jest.fn();

      TestBed.runInInjectionContext(() => {
        effect(() => {
          proxy.update(() => 10);
          effectSpy();
        });
      });

      TestBed.tick();
      expect(effectSpy).toHaveBeenCalledTimes(1);

      dep.set(10);
      TestBed.tick();
      expect(effectSpy).toHaveBeenCalledTimes(1);
    });

    it('set on proxy with only get handler falls through to source', () => {
      const source = signal(0);
      const proxy = proxySignal(source, { get: s => s() });

      proxy.set(5);

      expect(source()).toBe(5);
    });

    it('update on proxy with only get handler uses transformed value', () => {
      const source = signal(5);
      const proxy = proxySignal(source, { get: s => s() * 2 });

      proxy.update(v => v + 1);

      expect(source()).toBe(11);
    });
  });

  describe('direct source modification', () => {
    it('proxy reflects changes made directly to source', () => {
      const source = signal(1);
      const proxy = proxySignal(source, { get: s => s() * 2 });

      source.set(10);

      expect(proxy()).toBe(20);
    });

    it('proxy reflects update made directly to source', () => {
      const source = signal(1);
      const proxy = proxySignal(source, { get: s => s() * 2 });

      source.update(v => v + 5);

      expect(proxy()).toBe(12);
    });

    it('mutual updates between source and proxy', () => {
      const source = signal(1);
      const proxy = proxySignal(source, {
        get: s => s() * 2,
        set: (v, s) => s.set(v),
      });

      proxy.set(10);
      expect(source()).toBe(10);
      expect(proxy()).toBe(20);

      source.set(20);
      expect(source()).toBe(20);
      expect(proxy()).toBe(40);
    });
  });

  describe('readonly', () => {
    describe('asReadonly view', () => {
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

      it('does not expose set method', () => {
        const source = signal(0);
        const proxy = proxySignal(source, { get: s => s() });

        expect((proxy.asReadonly() as any).set).toBeUndefined();
      });

      it('does not expose update method', () => {
        const source = signal(0);
        const proxy = proxySignal(source, { get: s => s() });

        expect((proxy.asReadonly() as any).update).toBeUndefined();
      });
    });

    describe('with readonly source signal', () => {
      it('does not expose set when source is readonly', () => {
        const source = signal(0).asReadonly();
        const proxy = proxySignal(source, {});

        expect((proxy as any).set).toBeUndefined();
      });

      it('does not expose update when source is readonly', () => {
        const source = signal(0).asReadonly();
        const proxy = proxySignal(source, {});

        expect((proxy as any).update).toBeUndefined();
      });

      it('still applies get handler with readonly source', () => {
        const source = signal(1).asReadonly();
        const proxy = proxySignal(source, { get: s => s() * 2 });

        expect(proxy()).toBe(2);
      });
    });
  });

  describe('effect integration', () => {
    it('re-computes effect when proxy value changes', () => {
      const source = signal(1);
      const proxy = proxySignal(source, { get: s => s() * 2 });
      const effectSpy = jest.fn();

      TestBed.runInInjectionContext(() => {
        effect(() => {
          effectSpy(proxy());
        });
      });

      TestBed.tick();
      expect(effectSpy).toHaveBeenCalledWith(2);

      source.set(5);
      TestBed.tick();
      expect(effectSpy).toHaveBeenCalledWith(10);
    });

    it('effect does not re-run when transformed value is equal via custom equal', () => {
      const source = signal(1);
      const proxy = proxySignal(source, { get: s => s() * 2 }, { equal: (a, b) => a === b });
      const effectSpy = jest.fn();

      TestBed.runInInjectionContext(() => {
        effect(() => {
          effectSpy(proxy());
        });
      });

      TestBed.tick();
      expect(effectSpy).toHaveBeenCalledWith(2);

      source.set(1);
      TestBed.tick();
      expect(effectSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('proxy chaining', () => {
    it('composes get handlers in order', () => {
      const source = signal(1);
      const proxy1 = proxySignal(source, { get: s => s() + 1 });
      const proxy2 = proxySignal(proxy1, { get: s => s() * 2 });

      expect(proxy2()).toBe(4);
    });

    it('reacts to source changes through chained get handlers', () => {
      const source = signal(1);
      const proxy1 = proxySignal(source, { get: s => s() + 1 });
      const proxy2 = proxySignal(proxy1, { get: s => s() * 2 });

      source.set(4);

      expect(proxy2()).toBe(10);
    });

    it('composes set handlers in order', () => {
      const source = signal(0);
      const proxy1 = proxySignal(source, { set: (v, s) => s.set(v * 2) });
      const proxy2 = proxySignal(proxy1, { set: (v, s) => s.set(v + 1) });

      proxy2.set(3);

      expect(source()).toBe(8);
    });

    it('handles three-level nesting', () => {
      const source = signal(1);
      const proxy1 = proxySignal(source, { get: s => s() + 1 });
      const proxy2 = proxySignal(proxy1, { get: s => s() * 2 });
      const proxy3 = proxySignal(proxy2, { get: s => s() - 1 });

      expect(proxy3()).toBe(3);
    });

    it('set propagates through chain to source', () => {
      const source = signal(0);
      const proxy1 = proxySignal(source, { set: (v, s) => s.set(v * 2) });
      const proxy2 = proxySignal(proxy1, { set: (v, s) => s.set(v + 1) });

      proxy2.set(5);

      expect(source()).toBe(12);
    });
  });

  describe('equality comparison', () => {
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

    it('update respects equality check', () => {
      const source = signal(5);
      const proxy = proxySignal(source, { set: (v, s) => s.set(v) }, { equal: (a, b) => a === b });

      const before = source();
      proxy.update(v => v);

      expect(source()).toBe(before);
    });
  });

  describe('transform roundtrip', () => {
    it('update passes transformed value to fn', () => {
      const source = signal(5);
      const proxy = proxySignal(source, {
        get: s => s() * 2,
        set: (v, s) => s.set(v),
      });

      proxy.update(v => v + 1);

      expect(source()).toBe(11);
    });

    it('equal compares transformed values, skips set when externally equal', () => {
      const source = signal('  hello  ');
      const proxy = proxySignal(
        source,
        {
          get: s => s().trim(),
          set: (v, s) => s.set(v),
        },
        { equal: (a, b) => a === b }
      );

      const before = source();
      proxy.set('hello');

      expect(source()).toBe(before);
    });

    it('equal compares transformed values, calls set when externally different', () => {
      const source = signal('  hello  ');
      const proxy = proxySignal(
        source,
        {
          get: s => s().trim(),
          set: (v, s) => s.set(v),
        },
        { equal: (a, b) => a === b }
      );

      proxy.set('world');

      expect(source()).toBe('world');
    });

    it('update uses transformed value and respects equal', () => {
      const source = signal(10);
      const proxy = proxySignal(
        source,
        {
          get: s => s() / 2,
          set: (v, s) => s.set(v),
        },
        { equal: (a, b) => a === b }
      );

      const before = source();
      proxy.update(v => v);

      expect(source()).toBe(before);
    });

    it('mutual signal updates do not cause infinite loop', () => {
      const a = signal(0);
      const b = proxySignal(a, {
        get: s => s() * 2,
        set: (v, s) => s.set(v),
      });

      b.set(5);

      expect(a()).toBe(5);
      expect(b()).toBe(10);
    });

    describe('type coercion (string <-> string[])', () => {
      const csvHandler: ProxySignalHandler<string, string[]> = {
        get: s => s().split(','),
        set: (v: string[], s: WritableSignal<string>) => s.set(v.join(',')),
      };

      it('transforms on read', () => {
        const source = signal('a,b,c');
        const proxy = proxySignal(source, csvHandler);

        expect(proxy()).toEqual(['a', 'b', 'c']);
      });

      it('reverse-transforms on set', () => {
        const source = signal('');
        const proxy = proxySignal(source, csvHandler);

        proxy.set(['x', 'y', 'z']);

        expect(source()).toBe('x,y,z');
      });

      it('stays consistent across reads and writes', () => {
        const source = signal('');
        const proxy = proxySignal(source, csvHandler);

        proxy.set(['a', 'b']);

        expect(proxy()).toEqual(['a', 'b']);
      });

      it('update receives and saves transformed value', () => {
        const source = signal('a,b');
        const proxy = proxySignal(source, csvHandler);

        proxy.update(items => [...items, 'c']);

        expect(source()).toBe('a,b,c');
        expect(proxy()).toEqual(['a', 'b', 'c']);
      });

      it('reflects source changes', () => {
        const source = signal('a,b');
        const proxy = proxySignal(source, csvHandler);

        source.set('x,y,z');

        expect(proxy()).toEqual(['x', 'y', 'z']);
      });

      it('asReadonly applies transform', () => {
        const source = signal('a,b');
        const proxy = proxySignal(source, csvHandler);

        expect(proxy.asReadonly()()).toEqual(['a', 'b']);
      });

      it('asReadonly reflects source changes', () => {
        const source = signal('a,b');
        const proxy = proxySignal(source, csvHandler);

        source.set('x,y');

        expect(proxy.asReadonly()()).toEqual(['x', 'y']);
      });
    });
  });
});
