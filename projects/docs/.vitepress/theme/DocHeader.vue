<script setup lang="ts">
import { computed } from 'vue';
import { useData } from 'vitepress';
import SourceLink from './SourceLink.vue';

const { frontmatter } = useData();

const hasSource = computed(() => !!frontmatter.value.source);
</script>

<template>
  <div v-if="hasSource" class="doc-header">
    <SourceLink />
  </div>
</template>

<style>
.doc-header {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: -2.5rem;
  block-size: 2.5rem;
  position: relative;
  pointer-events: none;
  z-index: 10;
}

@media (max-width: 640px) {
  .doc-header {
    margin-bottom: -2rem;
  }
}
</style>
