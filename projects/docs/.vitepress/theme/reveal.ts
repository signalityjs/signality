import type { Directive } from 'vue';

const ROOT_MARGIN = '0px 0px -8% 0px';

let observer: IntersectionObserver | null = null;

function onIntersect(entries: IntersectionObserverEntry[]): void {
  const fold = window.innerHeight;

  for (const entry of entries) {
    const el = entry.target as HTMLElement;

    if (entry.isIntersecting) {
      observer?.unobserve(el);

      // Only a block that was actually hidden has something to reveal.
      if (el.dataset.reveal === 'pending') {
        el.dataset.reveal = 'in';
      }

      continue;
    }

    if (el.dataset.reveal) {
      continue;
    }

    // First report for this block, which arrives after the first paint. Only
    // what is still below the fold can be hidden unnoticed; anything already
    // painted on screen is left exactly as it is.
    if (entry.boundingClientRect.top < fold) {
      observer?.unobserve(el);
      continue;
    }

    el.dataset.reveal = 'pending';
  }
}

function getObserver(): IntersectionObserver {
  observer ??= new IntersectionObserver(onIntersect, { rootMargin: ROOT_MARGIN });
  return observer;
}

export const vReveal: Directive<HTMLElement, number | undefined> = {
  // set before the element is painted, both here and in the server-rendered
  // markup, so the load animation can start from a hidden state
  created(el) {
    el.dataset.revealLoad = '';
  },

  getSSRProps() {
    return { 'data-reveal-load': '' };
  },

  mounted(el, binding) {
    if (binding.value) {
      el.style.setProperty('--reveal-delay', `${binding.value}ms`);
    }

    if (
      !('IntersectionObserver' in window) ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    getObserver().observe(el);
  },

  unmounted(el) {
    observer?.unobserve(el);
  },
};
