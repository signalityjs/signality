<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { data } from '../data/utilities.data';

const HIGHLIGHTS: Record<string, string[]> = {
  browser: ['storage', 'mediaQuery', 'geolocation'],
  elements: ['onClickOutside', 'elementSize', 'dropzone'],
  observers: ['intersectionObserver', 'resizeObserver'],
  reactivity: ['debounced', 'throttled', 'watcher'],
  scheduling: ['interval', 'debounceCallback', 'throttleCallback'],
  router: ['queryParams', 'routeData', 'title'],
  forms: ['cva'],
  utilities: ['createInjectable', 'toValue', 'generateId'],
  'cdk-interop': ['focusMonitor', 'liveAnnouncer', 'inputModality'],
};

const CATEGORY_ICONS: Record<string, string> = {
  browser:
    '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
  elements:
    '<path d="M21 11V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6"/><path d="m12 12 4 10 1.7-4.3L22 16Z"/>',
  observers:
    '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
  reactivity: '<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>',
  scheduling: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  router:
    '<circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/>',
  forms: '<rect x="2" y="6" width="20" height="12" rx="2"/><path d="M7 10v4"/>',
  utilities:
    '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
  'cdk-interop':
    '<path d="M12 22v-5"/><path d="M9 8V2"/><path d="M15 8V2"/><path d="M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z"/>',
};

const categoryCards = computed(() => {
  return data.categories.map(category => {
    const names = category.items.map(item => item.name);
    const preferred = (HIGHLIGHTS[category.slug] ?? []).filter(name => names.includes(name));

    return {
      ...category,
      // curated lists are used as-is so each card stays on a single line
      sample: preferred.length > 0 ? preferred : names.slice(0, 3),
      icon: CATEGORY_ICONS[category.slug] ?? '',
    };
  });
});

const heroCode = [
  `<span class="tk-k">import</span> { windowSize, mediaQuery, storage } <span class="tk-k">from</span> <span class="tk-s">'@signality/core'</span>;`,
  ``,
  `<span class="tk-f">@Component</span>({ <span class="tk-c">/* ... */</span> })`,
  `<span class="tk-k">export class</span> <span class="tk-t">App</span> {`,
  `  <span class="tk-c">// every one is a signal, cleanup is automatic</span>`,
  `  <span class="tk-k">readonly</span> size = <span class="tk-f">windowSize</span>();`,
  `  <span class="tk-k">readonly</span> mobile = <span class="tk-f">mediaQuery</span>(<span class="tk-s">'(width &lt;= 768px)'</span>);`,
  `  <span class="tk-k">readonly</span> draft = <span class="tk-f">storage</span>(<span class="tk-s">'draft'</span>, <span class="tk-s">''</span>);`,
  `}`,
].join('\n');

const byHandCode = [
  `<span class="tk-k">readonly</span> width = <span class="tk-f">signal</span>(window.innerWidth);`,
  ``,
  `<span class="tk-k">constructor</span>() {`,
  `  <span class="tk-k">const</span> update = () => {`,
  `    <span class="tk-k">this</span>.width.<span class="tk-f">set</span>(window.innerWidth);`,
  `  };`,
  `  window.<span class="tk-f">addEventListener</span>(<span class="tk-s">'resize'</span>, update);`,
  `  <span class="tk-f">inject</span>(DestroyRef).<span class="tk-f">onDestroy</span>(() => {`,
  `    window.<span class="tk-f">removeEventListener</span>(<span class="tk-s">'resize'</span>, update);`,
  `  });`,
  `  <span class="tk-c">// and this still throws during SSR</span>`,
  `}`,
].join('\n');

const withSignalityCode = [
  `<span class="tk-k">readonly</span> size = <span class="tk-f">windowSize</span>();`,
  ``,
  `<span class="tk-c">// size.width() and size.height() are signals:</span>`,
  `<span class="tk-c">// SSR-safe, torn down with the component</span>`,
].join('\n');

// Live signal readout for the hero code panel: real values from the
// same APIs the snippet shows, updating as the visitor resizes the window.
const liveSize = ref('…');
const liveMobile = ref('…');
let stopLiveReadout: (() => void) | undefined;

onMounted(() => {
  const update = () => {
    liveSize.value = `${window.innerWidth} × ${window.innerHeight}`;
    liveMobile.value = String(window.innerWidth <= 768);
  };

  update();
  window.addEventListener('resize', update);
  stopLiveReadout = () => {
    window.removeEventListener('resize', update);
  };
});

const INSTALL_COMMAND = 'npm install @signality/core';
const copied = ref(false);
let copiedTimer: number | undefined;

/**
 * Falls back to a hidden textarea because the async clipboard API is
 * unavailable outside secure contexts, e.g. when the docs are opened
 * over plain http on a LAN address.
 */
function copyViaTextarea(text: string): boolean {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();

  try {
    return document.execCommand('copy');
  } catch {
    return false;
  } finally {
    textarea.remove();
  }
}

async function copyInstallCommand() {
  let ok = false;

  try {
    await navigator.clipboard.writeText(INSTALL_COMMAND);
    ok = true;
  } catch {
    ok = copyViaTextarea(INSTALL_COMMAND);
  }

  if (!ok) {
    return;
  }

  copied.value = true;
  window.clearTimeout(copiedTimer);
  copiedTimer = window.setTimeout(() => {
    copied.value = false;
  }, 2000);
}

onBeforeUnmount(() => {
  stopLiveReadout?.();
  window.clearTimeout(copiedTimer);
});

const features = [
  {
    title: 'Signals in, signals out',
    body: 'Reactive state comes back as signals, ready to compose with computed and effect. No RxJS subscriptions to unwrap.',
  },
  {
    title: 'SSR-safe by default',
    body: 'Browser APIs return safe defaults on the server, then pick up real values in the browser.',
  },
  {
    title: 'Automatic cleanup',
    body: 'Listeners, observers, and timers are disposed with the injection context that created them.',
  },
  {
    title: 'Reactive options',
    body: 'Where configuration can change over time, options take a signal as readily as a plain value.',
  },
  {
    title: 'Tree-shakable',
    body: 'Only the utilities you import end up in your bundle.',
  },
  {
    title: 'Strictly typed',
    body: 'Written in strict TypeScript with full inference, from options to return values.',
  },
];
</script>

<template>
  <div class="l-page">
    <!-- Hero -->
    <section class="l-hero">
      <div class="l-hero-copy">
        <h1 class="l-hero-title"><span class="l-hero-beat">Less code,</span><br />more reactivity</h1>
        <p class="l-hero-deck">
          Think
          <span class="l-deck-brand"><span class="l-deck-chip"><svg
            class="l-deck-icon l-deck-icon--vueuse"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M12.2238 0V8.55717C12.2238 10.9488 10.2851 12.8874 7.89351 12.8874C5.50189 12.8874 3.56323 10.9488 3.56323 8.55717V0H6.62668V8.55717C6.62668 8.89315 6.76015 9.21538 6.99773 9.45295C7.23531 9.69053 7.55753 9.824 7.89351 9.824C8.2295 9.824 8.55172 9.69053 8.7893 9.45295C9.02688 9.21538 9.16034 8.89315 9.16034 8.55717V0H12.2238Z"
              fill="#35495E"
            />
            <path
              d="M15.287 0V8.55717C15.287 12.6406 11.9769 15.9518 7.8935 15.9518C3.81009 15.9518 0.5 12.6406 0.5 8.55711V0H3.56322V8.55717C3.56322 10.9488 5.50205 12.8874 7.8935 12.8874C10.285 12.8874 12.2238 10.9488 12.2238 8.55717V0H15.287Z"
              fill="#41B883"
            />
          </svg></span>VueUse,</span> for
          <span class="l-deck-brand"><span class="l-deck-chip"><svg
            class="l-deck-icon l-deck-icon--angular"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <g clip-path="url(#landing_deck_angular_clip)">
              <path
                d="M15.5625 2.6625L15.0125 11.2375L9.7875 0L15.5625 2.6625ZM11.9375 13.75L8 16L4.0625 13.75L4.8625 11.8125H11.15L11.9375 13.75ZM8 4.2625L10.0625 9.2875H5.9375L8 4.2625ZM0.9875 11.2375L0.4375 2.6625L6.2125 0L0.9875 11.2375Z"
                fill="url(#landing_deck_angular_a)"
              />
              <path
                d="M15.5625 2.6625L15.0125 11.2375L9.7875 0L15.5625 2.6625ZM11.9375 13.75L8 16L4.0625 13.75L4.8625 11.8125H11.15L11.9375 13.75ZM8 4.2625L10.0625 9.2875H5.9375L8 4.2625ZM0.9875 11.2375L0.4375 2.6625L6.2125 0L0.9875 11.2375Z"
                fill="url(#landing_deck_angular_b)"
              />
            </g>
            <defs>
              <linearGradient id="landing_deck_angular_a" x1="1.838" y1="10.4662" x2="13.8731" y2="4.747" gradientUnits="userSpaceOnUse">
                <stop stop-color="#E40035" />
                <stop offset="0.24" stop-color="#F60A48" />
                <stop offset="0.352" stop-color="#F20755" />
                <stop offset="0.494" stop-color="#DC087D" />
                <stop offset="0.745" stop-color="#9717E7" />
                <stop offset="1" stop-color="#6C00F5" />
              </linearGradient>
              <linearGradient id="landing_deck_angular_b" x1="3.59162" y1="1.61612" x2="11.4677" y2="10.6006" gradientUnits="userSpaceOnUse">
                <stop stop-color="#FF31D9" />
                <stop offset="1" stop-color="#FF5BE1" stop-opacity="0" />
              </linearGradient>
              <clipPath id="landing_deck_angular_clip">
                <rect width="16" height="16" fill="white" />
              </clipPath>
            </defs>
          </svg></span>Angular</span> <span class="l-deck-tail">Signals</span>
        </p>
        <p class="l-hero-sub">
          {{ data.total }} composables for browser&nbsp;APIs, DOM&nbsp;elements, and
          reactive&nbsp;state. SSR-ready, type-safe, tree-shakable.
        </p>
        <div class="l-cta-row">
          <a href="/guide/getting-started" class="l-btn l-btn--primary">Get Started</a>
          <a href="/catalog" class="l-btn l-btn--secondary">All Utilities</a>
        </div>
      </div>

      <figure class="l-code-panel l-hero-code">
        <figcaption class="l-code-caption">app.component.ts</figcaption>
        <pre class="l-code"><code v-html="heroCode"></code></pre>
        <div class="l-code-console">
          <span class="l-console-live">
            <i class="l-live-dot" aria-hidden="true"></i>
            live
          </span>
          <span class="l-console-item">size<span class="l-console-value">{{ liveSize }}</span></span>
          <span class="l-console-item">mobile<span class="l-console-value">{{ liveMobile }}</span></span>
          <span class="l-console-hint">resize the window</span>
        </div>
      </figure>
    </section>

    <!-- Before / after -->
    <section class="l-section">
      <h2 class="l-section-title">Skip the boilerplate</h2>
      <p class="l-section-sub">
        Signality wraps imperative platform APIs into signals: listeners attach lazily, tear down
        with the component, and stay inert during server rendering.
      </p>

      <div class="l-compare">
        <figure class="l-code-panel">
          <figcaption class="l-code-caption">By hand</figcaption>
          <pre class="l-code"><code v-html="byHandCode"></code></pre>
        </figure>
        <figure class="l-code-panel l-code-panel--accent">
          <figcaption class="l-code-caption">With Signality</figcaption>
          <pre class="l-code"><code v-html="withSignalityCode"></code></pre>
        </figure>
      </div>
    </section>

    <!-- Categories -->
    <section class="l-section">
      <h2 class="l-section-title">What's inside</h2>
      <p class="l-section-sub">
        {{ data.total }} utilities across {{ data.categories.length }} categories, every one
        documented with a usage example.
      </p>

      <div class="l-categories">
        <a
          v-for="card in categoryCards"
          :key="card.slug"
          :href="`/catalog#${card.slug}`"
          class="l-category-card"
        >
          <span class="l-category-head">
            <span class="l-category-id">
              <span class="l-category-chip" aria-hidden="true">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  v-html="card.icon"
                ></svg>
              </span>
              <span class="l-category-name">{{ card.name }}</span>
            </span>
            <span class="l-category-count">{{ card.items.length }}</span>
          </span>
          <span class="l-category-sample">{{ card.sample.join(', ') }}</span>
        </a>
      </div>

      <div class="l-categories-more">
        <a href="/catalog" class="l-inline-link">Browse the full index</a>
      </div>
    </section>

    <!-- Guarantees -->
    <section class="l-section">
      <h2 class="l-section-title">How they work</h2>
      <div class="l-features">
        <div v-for="feature in features" :key="feature.title" class="l-feature">
          <h3 class="l-feature-title">{{ feature.title }}</h3>
          <p class="l-feature-body">{{ feature.body }}</p>
        </div>
      </div>
    </section>

    <!-- Credits + Install: one structured band, two cells -->
    <section class="l-section l-section--divided">
      <!-- the opening hairline, broken in the middle by the logo bolt -->
      <div class="l-divider" aria-hidden="true">
        <span class="l-divider-line"></span>
        <span class="l-divider-mark">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M13.4 2 4 14.2h6.1L8.6 22 18 9.8h-6.1L13.4 2Z" />
          </svg>
        </span>
        <span class="l-divider-line"></span>
      </div>

      <div class="l-final">
        <div class="l-final-cell">
          <div class="l-credit-badge" aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 1000 1000">
          <path
            d="M735.07,67.05V531.58c0,129.83-105.24,235.07-235.07,235.07S264.93,661.41,264.93,531.58V67.05h166.3V531.58a68.77,68.77,0,1,0,137.54,0V67.05Z"
            fill="#35495e"
          />
          <path
            d="M901.36,67.05V531.58C901.36,753.25,721.67,933,500,933S98.64,753.25,98.64,531.58V67.05H264.93V531.58c0,129.83,105.25,235.07,235.07,235.07S735.07,661.41,735.07,531.58V67.05Z"
            fill="#41b883"
          />
        </svg>
        <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24">
          <defs>
            <linearGradient
              id="landing_heart_gradient"
              x1="0%"
              y1="100%"
              x2="100%"
              y2="0%"
              gradientUnits="objectBoundingBox"
            >
              <stop offset="0" stop-color="#E40035" />
              <stop offset="0.24" stop-color="#F60A48" />
              <stop offset="0.494" stop-color="#DC087D" />
              <stop offset="0.745" stop-color="#9717E7" />
              <stop offset="1" stop-color="#6C00F5" />
            </linearGradient>
          </defs>
          <path
            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
            fill="url(#landing_heart_gradient)"
          />
        </svg>
          </div>
          <h2 class="l-final-title">Built in the open</h2>
          <p class="l-credit-text">
            Signality follows the philosophy of
            <a href="https://vueuse.org" target="_blank" rel="noopener noreferrer" class="l-inline-link">VueUse</a>,
            rebuilt for Angular's signal-based reactivity.
          </p>
          <ContributorsAvatars />
          <p class="l-credit-text l-credit-text--small">
            <a
              href="https://github.com/signalityjs/signality/blob/main/CONTRIBUTING.md"
              target="_blank"
              rel="noopener noreferrer"
              class="l-inline-link"
            >Contributions of all kinds are welcome.</a>
          </p>
        </div>

        <div class="l-final-cell">
          <h2 class="l-final-title">Install</h2>
          <div class="l-install-cmd">
            <code><span class="l-install-prompt">$</span> <span class="l-install-cmd-name">npm</span> <span class="l-install-arg">install @signality/core</span></code>
            <button
              type="button"
              class="l-copy-btn"
              :class="{ 'l-copy-btn--done': copied }"
              :aria-label="copied ? 'Copied to clipboard' : 'Copy install command'"
              @click="copyInstallCommand()"
            >
              <svg
                v-if="!copied"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <rect width="13" height="13" x="9" y="9" rx="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              <svg
                v-else
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </button>
          </div>
          <p class="l-install-alt">Also available via pnpm and yarn.</p>
          <a href="/guide/getting-started" class="l-btn l-btn--primary l-final-cta">Get Started</a>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.l-page {
  min-height: 100dvh;
  background: #0f0f11;
  color: #eee;
  font-family: Inter, system-ui, -apple-system, "Segoe UI", sans-serif;
}

/* --- Shared --- */
.l-section {
  max-width: 72rem;
  margin: 0 auto;
  padding: 4.5rem 1.5rem 0;
}

/* Section opening with a hairline, aligned to the text edges like the hero divider */
.l-section--divided {
  position: relative;
  margin-top: 4.5rem;
}

/* The hairline itself: two segments with the logo bolt wedged between them */
.l-divider {
  position: absolute;
  top: 0;
  left: 1.5rem;
  right: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  transform: translateY(-50%);
  pointer-events: none;
}

/* each segment fades out at the page edge and firms up towards the bolt */
.l-divider-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, rgba(31, 31, 36, 0) 0%, #1f1f24 18%, #322d38 100%);
}

.l-divider-line:last-child {
  background: linear-gradient(270deg, rgba(31, 31, 36, 0) 0%, #1f1f24 18%, #322d38 100%);
}

.l-divider-mark {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* a flat bolt, one step lighter than the hairline it interrupts */
.l-divider-mark svg {
  width: 22px;
  height: 22px;
  color: #4b4553;
}

.l-section-title {
  margin: 0;
  color: #eee;
  font-family: 'Poppins', system-ui, sans-serif;
  font-size: 1.75rem;
  font-weight: 600;
  letter-spacing: -0.02em;
}

.l-section-sub {
  margin: 0.75rem 0 0;
  max-width: 42rem;
  color: #a39fa8;
  font-size: 1rem;
  line-height: 1.6;
}

.l-inline-link {
  color: #deb3eb;
  text-decoration: none;
  border-bottom: 1px solid rgba(222, 179, 235, 0.35);
  transition: border-color 0.2s ease;
}

.l-inline-link:hover {
  border-color: #deb3eb;
}

/* --- Buttons --- */
.l-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.625rem 1.375rem;
  border-radius: 8px;
  font-size: 0.9375rem;
  font-weight: 600;
  text-decoration: none;
  white-space: nowrap;
  transition: transform 0.15s ease, filter 0.15s ease, border-color 0.15s ease,
    background-color 0.15s ease;
}

.l-btn:active {
  transform: scale(0.98);
}

.l-btn--primary {
  background: linear-gradient(120deg, #e40035, #dc087d 55%, #9717e7);
  color: #fff;
}

.l-btn--primary:hover {
  filter: brightness(1.15);
}

.l-btn--secondary {
  border: 1px solid #39363d;
  color: #eee;
}

.l-btn--secondary:hover {
  border-color: #55505c;
  background: #161618;
}

/* --- Hero --- */
.l-hero {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 45fr) minmax(0, 55fr);
  align-items: flex-start;
  gap: 3.5rem;
  max-width: 72rem;
  margin: 0 auto;
  padding: 5rem 1.5rem 4.5rem;
}

/* Hairline between the hero and the content flow, aligned to the text edges */
.l-hero::after {
  content: '';
  position: absolute;
  left: 1.5rem;
  right: 1.5rem;
  bottom: 0;
  height: 1px;
  background: #1f1f24;
}

.l-hero-copy {
  padding-top: 0.5rem;
}

.l-hero-code {
  margin-top: 2.25rem;
  border-color: #2c2930;
}

.l-hero-title {
  margin: 0;
  max-width: 18ch;
  color: #eee;
  font-family: 'Poppins', system-ui, sans-serif;
  font-size: clamp(2.5rem, 3.4vw, 3rem);
  font-weight: 600;
  line-height: 1.1;
  letter-spacing: -0.01em;
  text-wrap: balance;
}

.l-hero-beat {
  color: #8b8794;
}

.l-hero-deck {
  margin: 1rem 0 0;
  color: #e7e3ea;
  font-size: 1.1875rem;
  font-weight: 500;
  letter-spacing: -0.01em;
}

.l-deck-brand {
  white-space: nowrap;
}

.l-deck-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.25em;
  height: 1.25em;
  margin-right: 0.3em;
  background: #1d1c21;
  border: 1px solid #2c2930;
  border-radius: 0.35em;
  vertical-align: -0.03em;
}

.l-deck-icon {
  display: block;
  filter: brightness(1.2) saturate(1.3);
}

/* Sized per logo so both marks read the same weight inside the chip */
.l-deck-icon--vueuse {
  width: calc(0.8em - 2px);
  height: calc(0.8em - 2px);
}

.l-deck-icon--angular {
  width: calc(0.8em - 1px);
  height: calc(0.8em - 1px);
}

.l-hero-sub {
  margin: 1.5rem 0 0;
  max-width: 27rem;
  color: #a39fa8;
  font-size: 1rem;
  line-height: 1.65;
  text-wrap: pretty;
}

.l-cta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 2.5rem;
}

/* --- Code panels --- */
.l-code-panel {
  margin: 0;
  background: #131316;
  border: 1px solid #232125;
  border-radius: 10px;
  overflow: hidden;
}

.l-code-panel--accent .l-code-caption {
  color: #deb3eb;
}

.l-code-caption {
  padding: 0.625rem 1rem;
  border-bottom: 1px solid #1f1f24;
  color: #8b8794;
  font-size: 0.8125rem;
}

.l-code {
  margin: 0;
  padding: 1rem 1.125rem 1.125rem;
  overflow-x: auto;
  font-size: 0.8125rem;
  line-height: 1.7;
  color: #c9d1d9;
}

.l-code code {
  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
  background: transparent;
  padding: 0;
}

.l-code :deep(.tk-k) {
  color: #ff7b72;
}

.l-code :deep(.tk-s) {
  color: #a5d6ff;
}

.l-code :deep(.tk-f) {
  color: #d2a8ff;
}

.l-code :deep(.tk-c) {
  color: #8b949e;
}

.l-code :deep(.tk-t) {
  color: #ffa657;
}

/* --- Live console row (hero panel) --- */
.l-code-console {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1.25rem;
  padding: 0.625rem 1.125rem;
  border-top: 1px solid #1f1f24;
  font-family: inherit;
  font-size: 0.8125rem;
}

.l-console-live {
  display: inline-flex;
  align-items: center;
  gap: 0.4375rem;
  color: #8b8794;
}

.l-live-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #deb3eb;
  box-shadow: 0 0 8px rgba(222, 179, 235, 0.7);
}

@media (prefers-reduced-motion: no-preference) {
  .l-live-dot {
    animation: l-live-pulse 2.4s ease-in-out infinite;
  }
}

@keyframes l-live-pulse {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.35;
  }
}

.l-console-item {
  color: #8b8794;
}

.l-console-value {
  margin-left: 0.375rem;
  color: #deb3eb;
  font-weight: 500;
}

.l-console-hint {
  margin-left: auto;
  color: #8b8794;
}

/* --- Compare --- */
.l-compare {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
  margin-top: 2rem;
}

/* --- Categories --- */
.l-categories {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.875rem;
  margin-top: 2rem;
}

.l-category-card {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.125rem 1.25rem;
  background: #161618;
  border: 1px solid #232125;
  border-radius: 10px;
  text-decoration: none;
  transition: border-color 0.2s ease, background-color 0.2s ease;
}

.l-category-card:hover {
  background: #19191c;
  border-color: #39363d;
}

.l-category-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.l-category-id {
  display: inline-flex;
  align-items: center;
  gap: 0.625rem;
  min-width: 0;
}

.l-category-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
  width: 1.75rem;
  height: 1.75rem;
  background: #1d1c21;
  border: 1px solid #2c2930;
  border-radius: 8px;
  color: #a39fa8;
  transition: color 0.2s ease;
}

.l-category-chip svg {
  width: 15px;
  height: 15px;
}

.l-category-card:hover .l-category-chip {
  color: #deb3eb;
}

.l-category-name {
  color: #eee;
  font-size: 1rem;
  font-weight: 600;
}

.l-category-count {
  color: #8b8794;
  font-size: 0.875rem;
}

.l-category-sample {
  overflow: hidden;
  color: #a39fa8;
  font-size: 0.8125rem;
  line-height: 1.5;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.l-categories-more {
  margin-top: 1.5rem;
  font-size: 0.9375rem;
}

/* --- Features --- */
.l-features {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1px;
  margin-top: 2rem;
  background: #232125;
  border: 1px solid #232125;
  border-radius: 10px;
  overflow: hidden;
}

.l-feature {
  padding: 1.5rem;
  background: #0f0f11;
}

.l-feature-title {
  margin: 0;
  color: #eee;
  font-size: 1rem;
  font-weight: 600;
}

.l-feature-body {
  margin: 0.5rem 0 0;
  color: #a39fa8;
  font-size: 0.875rem;
  line-height: 1.6;
}

/* --- Credits + Install band --- */
.l-final {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1px;
  background: #232125;
  border: 1px solid #232125;
  border-radius: 10px;
  overflow: hidden;
}

.l-final-cell {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 2rem;
  background: #0f0f11;
  /* contributor avatar rings must match this cell's background */
  --avatar-ring: #0f0f11;
}

.l-final-title {
  margin: 0;
  color: #eee;
  font-family: 'Poppins', system-ui, sans-serif;
  font-size: 1.25rem;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.l-credit-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.l-credit-badge svg {
  width: 22px;
  height: 22px;
}

.l-credit-text {
  margin: 0.75rem 0 0;
  max-width: 26rem;
  color: #a39fa8;
  font-size: 0.9375rem;
  line-height: 1.6;
}

.l-credit-text--small {
  margin-top: 1rem;
  font-size: 0.875rem;
}

.l-final-cell:first-child > :nth-child(4) {
  margin-top: 1.25rem;
}

.l-install-cmd {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 1.25rem;
  padding: 0.75rem 0.75rem 0.75rem 1.25rem;
  background: #131316;
  border: 1px solid #232125;
  border-radius: 8px;
  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
  font-size: 0.875rem;
  color: #eee;
}

.l-install-cmd code {
  background: transparent;
  padding: 0;
}

.l-install-prompt {
  color: #8b8794;
  margin-right: 0.5rem;
}

/* token colors lifted from the docs' shiki github-dark rendering of this command */
.l-install-cmd-name {
  color: #b392f0;
}

.l-install-arg {
  color: #9ecbff;
}

.l-copy-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
  width: 1.75rem;
  height: 1.75rem;
  padding: 0;
  background: transparent;
  border: 1px solid #2c2930;
  border-radius: 6px;
  color: #a39fa8;
  cursor: pointer;
  transition: color 0.2s ease, border-color 0.2s ease, background-color 0.2s ease;
}

.l-copy-btn svg {
  width: 14px;
  height: 14px;
}

.l-copy-btn:hover {
  background: #1d1c21;
  border-color: #39363d;
  color: #eee;
}

.l-copy-btn:active {
  transform: scale(0.94);
}

.l-copy-btn--done {
  border-color: rgba(34, 197, 94, 0.4);
  color: #22c55e;
}

.l-install-alt {
  margin: 0.75rem 0 0;
  color: #8b8794;
  font-size: 0.8125rem;
}

.l-final-cta {
  margin-top: auto;
}

@media (max-width: 900px) {
  .l-final {
    grid-template-columns: minmax(0, 1fr);
  }

  .l-final-cta {
    margin-top: 1.5rem;
  }
}

/* --- Responsive --- */
@media (max-width: 1152px) {
  .l-hero {
    grid-template-columns: minmax(0, 1fr);
    gap: 2.5rem;
    padding-top: 3.5rem;
  }

  .l-hero-copy {
    padding-top: 0;
  }

  .l-hero-code {
    margin-top: 0;
  }
}

@media (max-width: 1024px) {
  .l-categories {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 1024px) {
  .l-compare {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (max-width: 900px) {
  .l-features {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .l-code {
    font-size: 0.75rem;
  }
}

/* On narrow phones the deck wraps awkwardly; drop the trailing word */
@media (max-width: 480px) {
  .l-deck-tail {
    display: none;
  }
}

@media (max-width: 768px) {
  .l-hero {
    padding-top: 2.5rem;
    padding-bottom: 2rem;
  }

  .l-section {
    padding-top: 3.5rem;
  }

  /* symmetric compact gaps around the hero divider */
  .l-hero + .l-section {
    padding-top: 2rem;
  }

  /* "resize the window" makes no sense on touch and wraps to a second row */
  .l-console-hint {
    display: none;
  }

  /* keep the divider gaps as compact as the side paddings */
  .l-section--divided {
    margin-top: 1.5rem;
    padding-top: 1.5rem;
  }

  .l-divider {
    gap: 1rem;
  }

  .l-divider-mark svg {
    width: 18px;
    height: 18px;
  }
}

@media (max-width: 640px) {
  .l-categories,
  .l-features {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
