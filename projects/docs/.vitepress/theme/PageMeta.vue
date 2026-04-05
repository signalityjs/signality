<script setup lang="ts">
import { computed } from 'vue';
import { useData } from 'vitepress';

const { page, site, frontmatter } = useData();

const editLink = computed(() => {
  if (frontmatter.value.editLinkUrl) {
    return {
      url: frontmatter.value.editLinkUrl,
      text: site.value.themeConfig.editLink?.text || 'Edit this page on GitHub',
    };
  }

  const editLinkConfig = site.value.themeConfig.editLink;
  if (!editLinkConfig || !page.value.relativePath) {
    return null;
  }

  const pattern = editLinkConfig.pattern || '';
  const text = editLinkConfig.text || 'Edit this page';

  const editUrl = pattern.replace(/:path/g, page.value.relativePath);

  return {
    url: editUrl,
    text,
  };
});

const lastUpdated = computed(() => {
  if (!page.value.lastUpdated) {
    return null;
  }

  const date = new Date(page.value.lastUpdated);

  // Format: "Nov 16, 2025, 16:58:37"
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${month} ${day}, ${year}, ${hours}:${minutes}:${seconds}`;
});

const hasMeta = computed(() => editLink.value || lastUpdated.value);
</script>

<template>
  <div v-if="hasMeta" class="page-meta">
    <div class="page-meta-content">
      <a
        v-if="editLink"
        :href="editLink.url"
        target="_blank"
        rel="noopener noreferrer"
        class="page-meta-link"
      >
        {{ editLink.text }}
      </a>

      <span v-if="lastUpdated" class="page-meta-date"> Last updated: {{ lastUpdated }} </span>
    </div>
  </div>
</template>

<style scoped>
.page-meta {
  margin-top: 3rem;
  padding-top: 1.5rem;
  border-top: 1px solid #2a2a2e;
}

.page-meta-content {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  font-size: 0.875rem;
  color: #888;
}

.page-meta-link {
  color: #deb3eb;
  text-decoration: none;
  transition: color 0.2s ease-in-out;
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
}

.page-meta-link:hover {
  color: #c084fc;
}

.page-meta-link::before {
  content: '';
  display: inline-block;
  width: 16px;
  height: 16px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23deb3eb' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7'%3E%3C/path%3E%3Cpath d='M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z'%3E%3C/path%3E%3C/svg%3E");
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}

.page-meta-link:hover::before {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23c084fc' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7'%3E%3C/path%3E%3Cpath d='M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z'%3E%3C/path%3E%3C/svg%3E");
}

.page-meta-date {
  color: #888;
}

@media (max-width: 640px) {
  .page-meta-content {
    flex-direction: column;
    align-items: flex-start;
    font-size: 0.8125rem;
  }
}
</style>
