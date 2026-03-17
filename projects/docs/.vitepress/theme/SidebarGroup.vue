<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useData } from 'vitepress';

interface SidebarItem {
  text: string;
  link?: string;
  items?: SidebarItem[];
  collapsed?: boolean;
}

const props = defineProps<{
  item: SidebarItem;
  depth?: number;
}>();

const { page } = useData();
const isCollapsed = ref(props.item.collapsed ?? false);
const depth = computed(() => props.depth ?? 0);
const hasChildren = computed(() => props.item.items && props.item.items.length > 0);
const isLink = computed(() => !!props.item.link);

const isActive = (link: string | undefined) => {
  if (!link) return false;
  const normalized = link.replace(/^\//, '').replace(/\.md$/, '').replace(/\/$/, '');
  const currentPath = page.value.relativePath.replace(/\.md$/, '').replace(/index$/, '');
  return currentPath === normalized || currentPath === normalized + '/index';
};

const isCurrentActive = computed(() => isActive(props.item.link));

const hasActiveChild = computed(() => {
  if (!props.item.items) return false;
  const checkActive = (items: SidebarItem[]): boolean => {
    return items.some(item => {
      if (isActive(item.link)) return true;
      if (item.items) return checkActive(item.items);
      return false;
    });
  };
  return checkActive(props.item.items);
});

const toggle = () => {
  if (hasChildren.value) {
    isCollapsed.value = !isCollapsed.value;
  }
};

const githubStars = ref('0');

onMounted(async () => {
  if (props.item.text !== 'GitHub' && !props.item.items?.some(i => i.text === 'GitHub')) return;
  try {
    const res = await fetch('https://api.github.com/repos/signalityjs/signality');
    if (res.ok) {
      const data = await res.json();
      const count: number = data.stargazers_count;
      githubStars.value = count >= 1000
        ? (count / 1000).toFixed(1).replace(/\.0$/, '') + 'k'
        : String(count);
    }
  } catch {
    // silently ignore
  }
});
</script>

<template>
  <li class="sidebar-item" :class="[`sidebar-item--depth-${depth}`]">
    <template v-if="hasChildren && !isLink">
      <button
        type="button"
        class="sidebar-group-header"
        :class="{ 'sidebar-group-header--active': hasActiveChild }"
        @click="toggle"
      >
        <span class="sidebar-group-text">{{ item.text }}</span>
        <svg
          class="sidebar-chevron"
          :class="{ 'sidebar-chevron--collapsed': isCollapsed }"
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
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>
      <ul v-show="!isCollapsed" class="sidebar-children">
        <SidebarGroup
          v-for="child in item.items"
          :key="child.text + (child.link || '')"
          :item="child"
          :depth="depth + 1"
        />
      </ul>
    </template>

    <!-- Link item -->
    <template v-else-if="isLink">
      <a
        :href="item.link"
        class="sidebar-link"
        :class="{ 'sidebar-link--active': isCurrentActive }"
        :target="item.link?.startsWith('http') ? '_blank' : undefined"
        :rel="item.link?.startsWith('http') ? 'noopener noreferrer' : undefined"
      >
        <span class="sidebar-link-content">
          <!-- Getting Started icon - Book -->
          <svg
            v-if="item.text === 'Getting Started'"
            class="sidebar-icon"
            xmlns="http://www.w3.org/2000/svg"
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
            <path d="M8 8h6"/>
            <path d="M8 12h6"/>
          </svg>
          <!-- Key Concepts icon -->
          <svg
            v-if="item.text === 'Key Concepts'"
            class="sidebar-icon"
            xmlns="http://www.w3.org/2000/svg"
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M12 2v4"/>
            <path d="M12 18v4"/>
            <path d="M4.93 4.93l2.83 2.83"/>
            <path d="M16.24 16.24l2.83 2.83"/>
            <path d="M2 12h4"/>
            <path d="M18 12h4"/>
            <path d="M4.93 19.07l2.83-2.83"/>
            <path d="M16.24 7.76l2.83-2.83"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
          <!-- AI Development icon - Elegant Sparkles -->
          <svg
            v-if="item.text === 'AI Development'"
            class="sidebar-icon"
            xmlns="http://www.w3.org/2000/svg"
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
            <path d="M5 3v4"/>
            <path d="M19 17v4"/>
            <path d="M3 5h4"/>
            <path d="M17 19h4"/>
          </svg>
          <!-- GitHub icon -->
          <svg
            v-if="item.text === 'GitHub'"
            class="sidebar-icon"
            xmlns="http://www.w3.org/2000/svg"
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
            <path d="M9 18c-4.51 2-5-2-7-2"/>
          </svg>
          <!-- Twitter icon -->
          <svg
            v-if="item.text === 'Twitter'"
            class="sidebar-icon"
            xmlns="http://www.w3.org/2000/svg"
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
          </svg>
          {{ item.text }}
          <!-- GitHub stars badge -->
          <span v-if="item.text === 'GitHub'" class="github-stars-badge">
            <svg
              class="github-star-icon"
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            <span class="github-stars-count">{{ githubStars }}</span>
          </span>
        </span>
      </a>
      <!-- Nested items under a link -->
      <ul v-if="hasChildren && !isCollapsed" class="sidebar-children">
        <SidebarGroup
          v-for="child in item.items"
          :key="child.text + (child.link || '')"
          :item="child"
          :depth="depth + 1"
        />
      </ul>
    </template>

    <!-- Text only (no link, no children) -->
    <template v-else>
      <span class="sidebar-text">{{ item.text }}</span>
    </template>
  </li>
</template>

<style>
.sidebar-item {
  list-style: none;
}

.sidebar-item--depth-0 {
  margin-top: 0.75rem;
}

.sidebar-item--depth-0:first-child {
  margin-top: 0;
}

.sidebar-group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0.5rem 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: #e0e0e5;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  transition: color 0.15s;
}

.sidebar-group-header:hover {
  color: #fff;
}

.sidebar-group-header--active {
  color: #deb3eb;
}

.sidebar-group-text {
  flex: 1;
}

.sidebar-chevron {
  flex-shrink: 0;
  color: #666;
  transition: transform 0.2s ease;
}

.sidebar-chevron--collapsed {
  transform: rotate(-90deg);
}

.sidebar-children {
  margin: 0;
  padding: 0;
  padding-left: 0.75rem;
}

.sidebar-item--depth-0 > .sidebar-children {
  padding-left: 0;
}

.sidebar-link {
  display: block;
  padding: 0.375rem 0;
  font-size: 0.875rem;
  color: #a0a0a5;
  text-decoration: none;
  transition: color 0.15s;
}

.sidebar-link:hover {
  color: #e0e0e5;
}

.sidebar-link--active {
  color: #deb3eb !important;
}

.sidebar-link-content {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  width: 100%;
}

.sidebar-icon {
  flex-shrink: 0;
  width: 17px;
  height: 17px;
  color: currentColor;
  transition: color 0.15s;
}

.sidebar-text {
  display: block;
  padding: 0.375rem 0;
  font-size: 0.8125rem;
  color: #666;
}

/* GitHub stars badge */
.github-stars-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  margin-left: auto;
  padding: 0.125rem 0.375rem;
  font-size: 0.6875rem;
  font-weight: 500;
  line-height: 1;
  color: #a0a0a5;
  background: rgba(160, 160, 165, 0.1);
  border: 1px solid rgba(160, 160, 165, 0.2);
  border-radius: 0.375rem;
  transition: all 0.15s;
  flex-shrink: 0;
}

.sidebar-link:hover .github-stars-badge {
  color: #e0e0e5;
  background: rgba(224, 224, 229, 0.15);
  border-color: rgba(224, 224, 229, 0.3);
}

.sidebar-link--active .github-stars-badge {
  color: #deb3eb;
  background: rgba(222, 179, 235, 0.15);
  border-color: rgba(222, 179, 235, 0.3);
}

.github-star-icon {
  flex-shrink: 0;
  width: 12px;
  height: 12px;
  color: currentColor;
}

.github-stars-count {
  line-height: 1;
  white-space: nowrap;
}

/* Nested depth styling */
/* .sidebar-item--depth-1 > .sidebar-link,
.sidebar-item--depth-1 > .sidebar-group-header {
  padding-left: 0.5rem;
}

.sidebar-item--depth-2 > .sidebar-link,
.sidebar-item--depth-2 > .sidebar-group-header {
  padding-left: 1rem;
}

.sidebar-item--depth-3 > .sidebar-link,
.sidebar-item--depth-3 > .sidebar-group-header {
  padding-left: 1.5rem;
} */
</style>
