<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useRoute, inBrowser } from 'vitepress';

interface Header {
  level: number;
  title: string;
  id: string;
}

const route = useRoute();
const headers = ref<Header[]>([]);
const activeId = ref<string>('');
const hasScrolled = ref(false);

function extractHeaders() {
  if (!inBrowser) return;

  // Find the content wrapper and extract h2/h3 headings
  const contentEl = document.querySelector('.vp-doc');

  if (!contentEl) {
    headers.value = [];
    return;
  }

  const headingEls = contentEl.querySelectorAll('h2, h3');
  const result: Header[] = [];

  headingEls.forEach(el => {
    const id = el.id;
    const title =
      el.textContent
        ?.replace(/\u200B/g, '')
        .replace(/\s*#\s*$/, '')
        .trim() || '';
    const level = el.tagName === 'H2' ? 2 : 3;

    if (id && title) {
      result.push({ level, title, id });
    }
  });

  headers.value = result;
}

function onScroll() {
  if (!inBrowser) return;

  hasScrolled.value = window.scrollY > 50;

  if (headers.value.length === 0) return;

  const scrollY = window.scrollY;
  const windowHeight = window.innerHeight;
  const docHeight = document.documentElement.scrollHeight;

  // If at bottom of page, activate last header
  if (scrollY + windowHeight >= docHeight - 10) {
    activeId.value = headers.value[headers.value.length - 1]?.id || '';
    return;
  }

  // Find the header that is currently at or above the top of the viewport
  let currentId = '';
  for (const header of headers.value) {
    const el = document.getElementById(header.id);
    if (el) {
      const rect = el.getBoundingClientRect();
      if (rect.top <= 100) {
        currentId = header.id;
      } else {
        break;
      }
    }
  }

  activeId.value = currentId || headers.value[0]?.id || '';
}

function scrollToHeader(id: string) {
  if (!inBrowser) return;
  const el = document.getElementById(id);
  if (el) {
    const y = el.getBoundingClientRect().top + window.scrollY - 80;

    window.scrollTo({
      top: y,
      behavior: 'smooth'
    });
  }
}

function scrollToTop() {
  if (!inBrowser) return;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Re-extract headers when route changes (client-side only)
watch(
  () => route.path,
  async () => {
    if (!inBrowser) return;
    await nextTick();
    // Small delay to ensure DOM is updated
    setTimeout(() => {
      extractHeaders();
      onScroll();
    }, 100);
  }
);

onMounted(() => {
  extractHeaders();
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
});

onUnmounted(() => {
  if (inBrowser) {
    window.removeEventListener('scroll', onScroll);
  }
});
</script>

<template>
  <aside class="on-this-page">
    <div v-if="headers.length > 0" class="on-this-page-content">
      <div class="on-this-page-title">On this page</div>
      <nav class="on-this-page-nav">
        <a
          v-for="header in headers"
          :key="header.id"
          :href="`#${header.id}`"
          :class="[
            'on-this-page-link',
            { 'on-this-page-link--active': activeId === header.id },
            { 'on-this-page-link--nested': header.level === 3 },
          ]"
          :aria-current="activeId === header.id ? 'location' : undefined"
          @click.prevent.stop="scrollToHeader(header.id)"
        >
          {{ header.title }}
        </a>
      </nav>
      <button v-if="hasScrolled" class="back-to-top" aria-label="Back to top" @click="scrollToTop">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M12 19V5M5 12l7-7 7 7" />
        </svg>
        Back to the top
      </button>
    </div>
  </aside>
</template>

<style>
.on-this-page {
  width: 280px;
  flex-shrink: 0;
  position: sticky;
  top: 2rem;
  max-height: calc(100vh - 4rem);
  overflow-y: auto;
  padding-right: 1.25rem;
}

.on-this-page-content {
  padding: 0.5rem 1rem 0.5rem 0;
}

.on-this-page-title {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #888;
  margin-bottom: 0.75rem;
}

.on-this-page-nav {
  display: flex;
  flex-direction: column;
  border-left: 1px solid #2a2a2e;
}

.on-this-page-link {
  display: block;
  font-size: 0.875rem;
  color: #a0a0a5;
  padding-left: 1rem;
  padding-top: 0.375rem;
  padding-bottom: 0.375rem;
  margin-left: -1px;
  border-left: 2px solid transparent;
  text-decoration: none;
  transition: color 0.15s, border-color 0.15s;
  line-height: 1.5rem;
}

.on-this-page-link:hover {
  color: #e0e0e5;
}

.on-this-page-link--active {
  color: #deb3eb;
  border-left-color: #f5c0f8;
}

.on-this-page-link--nested {
  padding-left: 1.75rem;
  font-size: 0.875rem;
}

.back-to-top {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  margin-top: 0.75rem;
  padding: 0.5rem 0;
  font-size: 0.825rem;
  font-weight: 500;
  color: #888;
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.15s;
}

.back-to-top:hover {
  color: #e0e0e5;
}

.back-to-top svg {
  flex-shrink: 0;
}

.on-this-page::-webkit-scrollbar {
  width: 4px;
}

.on-this-page::-webkit-scrollbar-track {
  background: transparent;
}

.on-this-page::-webkit-scrollbar-thumb {
  background-color: #2a2a2e;
  border-radius: 2px;
}

@media (max-width: 1280px) {
  .on-this-page {
    display: none;
  }
}
</style>
