export const NEW_ITEMS = [
  '/reactivity/proxy-signal',
  '/utilities/create-injectable',
];

export function isNew(link: string): boolean {
  return NEW_ITEMS.includes(link);
}
