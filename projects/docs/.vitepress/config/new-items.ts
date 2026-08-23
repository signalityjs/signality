export const NEW_ITEMS = [
  '/browser/battery',
  '/browser/broadcast-channel',
  '/browser/device-posture',
  '/browser/favicon',
  '/browser/fps',
  '/browser/fullscreen',
  '/browser/gamepad',
  '/browser/listener',
  '/browser/permission-state',
  '/browser/window-size',
  '/elements/active-element',
  '/elements/on-click-outside',
  '/elements/on-key',
  '/elements/scroll-position',
  '/observers/resize-observer',
  '/reactivity/throttled',
  '/scheduling/throttle-callback',
];

export function isNew(link: string): boolean {
  return NEW_ITEMS.includes(link);
}
