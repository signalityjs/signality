<script setup lang="ts">
import { computed } from 'vue';
import { useData } from 'vitepress';

const { frontmatter } = useData();

const sourceUrl = computed(() => frontmatter.value.source as string | undefined);
</script>

<template>
  <a
    v-if="sourceUrl"
    :href="sourceUrl"
    target="_blank"
    rel="noopener noreferrer"
    class="source-link"
    title="View source on GitHub"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <polyline points="16 18 22 12 16 6"></polyline>
      <polyline points="8 6 2 12 8 18"></polyline>
    </svg>
  </a>
</template>

<style>
a.source-link {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.8125rem;
  font-weight: 500;
  color: #a0a0a5;
  background: none;
  text-decoration: none;
  pointer-events: auto;

  &:hover {
    color: #deb3eb;
  }
}

.source-link .source-link svg {
  flex-shrink: 0;
}
</style>
