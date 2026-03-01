<script setup lang="ts">
import { computed } from 'vue';
import { useData } from 'vitepress';

interface SidebarItem {
  text: string;
  link?: string;
  items?: SidebarItem[];
}

interface SidebarGroup {
  text: string;
  items?: SidebarItem[];
}

interface FlatItem {
  text: string;
  link: string;
}

const { page, site } = useData();

const sidebar = computed<SidebarGroup[]>(() => {
  return site.value.themeConfig.sidebar || [];
});

// Flatten all sidebar items into a single array
const flatItems = computed<FlatItem[]>(() => {
  const result: FlatItem[] = [];

  function flatten(items: SidebarItem[]) {
    for (const item of items) {
      if (item.link) {
        result.push({ text: item.text, link: item.link });
      }
      if (item.items) {
        flatten(item.items);
      }
    }
  }

  for (const group of sidebar.value) {
    // Skip Resources category
    if (group.text === 'Resources') {
      continue;
    }
    if (group.items) {
      flatten(group.items);
    }
  }

  return result;
});

// Find current page index
const currentIndex = computed(() => {
  const currentPath = page.value.relativePath.replace(/\.md$/, '');
  return flatItems.value.findIndex(item => {
    const itemPath = item.link.replace(/^\//, '').replace(/\.md$/, '');
    return itemPath === currentPath;
  });
});

const prevPage = computed<FlatItem | null>(() => {
  if (currentIndex.value > 0) {
    return flatItems.value[currentIndex.value - 1];
  }
  return null;
});

const nextPage = computed<FlatItem | null>(() => {
  if (currentIndex.value >= 0 && currentIndex.value < flatItems.value.length - 1) {
    return flatItems.value[currentIndex.value + 1];
  }
  return null;
});
</script>

<template>
  <nav v-if="prevPage || nextPage" class="page-nav">
    <a v-if="prevPage" :href="prevPage.link" class="page-nav-link page-nav-link--prev">
      <span class="page-nav-label">Previous</span>
      <span class="page-nav-title">{{ prevPage.text }}</span>
    </a>

    <span v-else class="page-nav-spacer"></span>

    <a v-if="nextPage" :href="nextPage.link" class="page-nav-link page-nav-link--next">
      <span class="page-nav-label">Next</span>
      <span class="page-nav-title">{{ nextPage.text }}</span>
    </a>
    <span v-else class="page-nav-spacer"></span>
  </nav>
</template>

<style>
.page-nav {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 3rem;
  padding-top: 1.5rem;
  border-top: 1px solid #2a2a2e;
}

a.page-nav-link {
  display: flex;
  flex-direction: column;
  padding: 0.75rem 1rem;
  border: 1px solid #2a2a2e;
  border-radius: 8px;
  text-decoration: none;
  transition: border-color 0.2s ease-in-out;
  padding-top: 0.625rem;
  min-width: 0;
  flex: 1 1 48%;
  max-width: 48%;

  &:hover {
    border-color: #deb3ec;
    //background-color: rgba(151, 23, 231, 0.05);
  }
}

.page-nav-link .page-nav-link--prev {
  align-items: flex-start;
}

.page-nav-link--next {
  align-items: flex-end;
  margin-left: auto;
}

.page-nav-label {
  font-size: 0.675rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #888;
}

.page-nav-title {
  font-size: 0.9375rem;
  font-weight: 500;
  color: #deb3eb;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.page-nav-spacer {
  flex: 1;
}

@media (max-width: 640px) {
  .page-nav {
    flex-direction: column;
    gap: 0.75rem;
  }

  a.page-nav-link {
    flex: 1 1 100%;
    max-width: 100%;
    width: 100%;
    box-sizing: border-box;
  }

  .page-nav-link--next {
    margin-left: 0;
    align-items: flex-start;
  }

  .page-nav-spacer {
    display: none;
  }
}
</style>
