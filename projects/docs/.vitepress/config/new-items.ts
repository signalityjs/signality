export const NEW_ITEMS = [
  '/elements/on-key',
  '/reactivity/proxy-signal',
  '/router/fragment',
  '/utilities/create-injectable',
];

export function isNew(link: string): boolean {
  return NEW_ITEMS.includes(link);
}
