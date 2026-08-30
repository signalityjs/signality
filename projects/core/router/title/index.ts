import { type WritableSignal } from '@angular/core';
import { pageTitle, PageTitleOptions } from '@signality/core/router/page-title';

/** @deprecated Use `PageTitleOptions` instead. Will be removed in 1.0. */
export type TitleOptions = PageTitleOptions;

/** @deprecated Use `pageTitle()` instead. Will be removed in 1.0. */
export function title(options?: TitleOptions): WritableSignal<string> {
  return pageTitle(options);
}
