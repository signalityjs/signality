/**
 * StorageEvent polyfill for jsdom.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/StorageEvent
 */
export function polyfillStorageEvent(): void {
  const OriginalStorageEvent = globalThis.StorageEvent;

  (globalThis as any).StorageEvent = class StorageEvent extends Event {
    readonly key: string | null;
    readonly newValue: string | null;
    readonly oldValue: string | null;
    readonly storageArea: Storage | null;
    readonly url: string;

    constructor(type: string, params: StorageEventInit = {}) {
      super(type, params);
      this.key = params.key ?? null;
      this.newValue = params.newValue ?? null;
      this.oldValue = params.oldValue ?? null;
      this.url = params.url ?? '';

      // jsdom throws when storageArea is not its internal Storage instance,
      // so we safely fall back to null for any non-conforming value.
      try {
        new OriginalStorageEvent(type, { storageArea: params.storageArea });
        this.storageArea = params.storageArea ?? null;
      } catch {
        this.storageArea = null;
      }
    }
  };
}
