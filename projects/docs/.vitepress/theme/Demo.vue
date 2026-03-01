<script setup lang="ts">
import { onMounted, ref } from 'vue';

const props = defineProps<{
  name: string;
}>();

const loaded = ref(false);
const error = ref<string | null>(null);

let loadPromise: Promise<void> | null = null;

async function loadDemos() {
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    if (customElements.get(`signality-demo-${props.name}`)) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.type = 'module';
    script.src = '/demos/browser/main.js';

    script.onload = () => {
      customElements.whenDefined(`signality-demo-${props.name}`).then(() => resolve());
    };

    script.onerror = () => reject(new Error('Failed to load demos bundle'));

    document.head.appendChild(script);
  });

  return loadPromise;
}

onMounted(async () => {
  try {
    await loadDemos();
    loaded.value = true;
  } catch (e) {
    error.value = (e as Error).message;
    console.error('[Demo] Failed to load:', e);
  }
});
</script>

<template>
  <div class="demo-wrapper">
    <div v-if="error" class="demo-error">
      <span>⚠️ {{ error }}</span>
    </div>
    <div v-else-if="!loaded" class="demo-loading">
      <span class="demo-spinner"></span>
      <span>Loading demo...</span>
    </div>
    <component v-else :is="`signality-demo-${name}`" />
  </div>
</template>

<style scoped>
.demo-wrapper {
  margin: 1.5rem 0;
  overflow: hidden;
}

.demo-loading,
.demo-error {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 2rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  color: var(--vp-c-text-2);
}

.demo-error {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.3);
  color: #ef4444;
}

.demo-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid var(--vp-c-divider);
  border-top-color: var(--vp-c-brand);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
