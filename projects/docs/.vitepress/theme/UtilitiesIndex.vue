<script setup lang="ts">
import { computed, ref } from 'vue';
import { data } from '../data/utilities.data';
import { isNew } from '../config/new-items';

const query = ref('');
const activeCategory = ref('All');

const categoryNames = computed(() => {
  return ['All', ...data.categories.map(category => category.name)];
});

const filtered = computed(() => {
  const tokens = query.value.trim().toLowerCase().split(/\s+/).filter(Boolean);

  return data.categories
    .filter(category => {
      return activeCategory.value === 'All' || category.name === activeCategory.value;
    })
    .map(category => ({
      ...category,
      items: category.items.filter(item => {
        return tokens.every(token => item.haystack.includes(token));
      }),
    }))
    .filter(category => category.items.length > 0);
});

const shownCount = computed(() => {
  return filtered.value.reduce((sum, category) => sum + category.items.length, 0);
});

function clearFilters() {
  query.value = '';
  activeCategory.value = 'All';
}
</script>

<template>
  <div class="ui-root">
    <div class="ui-controls">
      <div class="ui-search">
        <svg class="ui-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2" />
          <path d="M20 20L16.5 16.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
        <input
          v-model="query"
          type="search"
          class="ui-search-input"
          placeholder="Search by name or by what it does"
          aria-label="Search utilities"
        />
      </div>

      <div class="ui-pills" role="group" aria-label="Filter by category">
        <button
          v-for="name in categoryNames"
          :key="name"
          type="button"
          class="ui-pill"
          :class="{ 'ui-pill--active': activeCategory === name }"
          @click="activeCategory = name"
        >
          {{ name }}
        </button>
      </div>

      <p class="ui-count" aria-live="polite">
        Showing {{ shownCount }} of {{ data.total }} utilities
      </p>
    </div>

    <section v-for="category in filtered" :key="category.slug" class="ui-category">
      <h2 :id="category.slug" class="ui-category-title">
        {{ category.name }}
        <span class="ui-category-count">{{ category.items.length }}</span>
      </h2>

      <div class="ui-grid">
        <a v-for="item in category.items" :key="item.link" :href="item.link" class="ui-card">
          <span class="ui-card-head">
            <span class="ui-card-name">{{ item.name }}</span>
            <span v-if="isNew(item.link)" class="ui-new-indicator" title="Recently added"></span>
          </span>
          <span class="ui-card-desc">{{ item.description }}</span>
        </a>
      </div>
    </section>

    <div v-if="filtered.length === 0" class="ui-empty">
      <p class="ui-empty-title">Nothing matches "{{ query }}"</p>
      <p class="ui-empty-hint">Try a shorter query, or search by what the utility does, like "resize" or "focus".</p>
      <button type="button" class="ui-empty-reset" @click="clearFilters">Clear search</button>
    </div>
  </div>
</template>

<style scoped>
.ui-root {
  margin-top: 1.5rem;
}

/* --- Controls --- */
.ui-search {
  position: relative;
  display: flex;
  align-items: center;
}

.ui-search-icon {
  position: absolute;
  left: 0.875rem;
  color: #a39fa8;
  pointer-events: none;
}

.ui-search-input {
  width: 100%;
  padding: 0.625rem 1rem 0.625rem 2.5rem;
  background: #161618;
  border: 1px solid #232125;
  border-radius: 8px;
  color: #eee;
  font-size: 0.9375rem;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s ease;
}

.ui-search-input::placeholder {
  color: #8b8794;
}

.ui-search-input:focus {
  border-color: rgba(222, 179, 235, 0.5);
  background: #19191c;
}

.ui-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.875rem;
}

.ui-pill {
  padding: 0.3125rem 0.75rem;
  background: transparent;
  border: 1px solid #232125;
  border-radius: 999px;
  color: #a39fa8;
  font-size: 0.8125rem;
  font-family: inherit;
  cursor: pointer;
  transition: color 0.2s ease, border-color 0.2s ease, background-color 0.2s ease;
}

.ui-pill:hover {
  color: #eee;
  border-color: #39363d;
}

.ui-pill--active {
  color: #eee;
  background: #232127;
  border-color: #4d4653;
}

.ui-count {
  margin: 1rem 0 0;
  color: #8b8794;
  font-size: 0.8125rem;
}

/* --- Categories --- */
.ui-category {
  margin-top: 2.5rem;
}

.ui-category-title {
  display: flex;
  align-items: baseline;
  gap: 0.625rem;
  margin: 0 0 1rem;
  padding: 0;
  border: none;
  color: #eee;
  font-size: 1.25rem;
  font-weight: 600;
}

.ui-category-count {
  color: #8b8794;
  font-size: 0.875rem;
  font-weight: 400;
}

.ui-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

.ui-card {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  padding: 0.875rem 1rem;
  background: #161618;
  border: 1px solid #232125;
  border-radius: 8px;
  text-decoration: none !important;
  transition: border-color 0.2s ease, background-color 0.2s ease;
}

.ui-card:hover {
  background: #19191c;
  border-color: #39363d;
}

.ui-card-head {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.ui-card-name {
  color: #eee;
  font-family: inherit;
  font-size: 0.9375rem;
  font-weight: 600;
  transition: color 0.2s ease;
}

.ui-card:hover .ui-card-name {
  color: #deb3eb;
}

/* Same "new" marker as the docs sidebar: green pulsing dot */
.ui-new-indicator {
  position: relative;
  display: inline-block;
  width: 6px;
  height: 6px;
  flex-shrink: 0;
}

.ui-new-indicator::before,
.ui-new-indicator::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: #22c55e;
}

@media (prefers-reduced-motion: no-preference) {
  .ui-new-indicator::after {
    animation: ui-new-pulse 2s ease-out infinite;
  }
}

@keyframes ui-new-pulse {
  0% {
    transform: scale(1);
    opacity: 0.6;
  }

  100% {
    transform: scale(3);
    opacity: 0;
  }
}

.ui-card-desc {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  color: #a39fa8;
  font-size: 0.8125rem;
  line-height: 1.5;
}

/* --- Empty state --- */
.ui-empty {
  margin-top: 3rem;
  padding: 2.5rem 1.5rem;
  border: 1px dashed #232125;
  border-radius: 10px;
  text-align: center;
}

.ui-empty-title {
  margin: 0;
  color: #eee;
  font-size: 1rem;
  font-weight: 500;
}

.ui-empty-hint {
  margin: 0.5rem 0 0;
  color: #a39fa8;
  font-size: 0.875rem;
}

.ui-empty-reset {
  margin-top: 1.25rem;
  padding: 0.5rem 1rem;
  background: #232127;
  border: 1px solid #39363d;
  border-radius: 8px;
  color: #eee;
  font-size: 0.875rem;
  font-family: inherit;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.ui-empty-reset:hover {
  background: #2b2a30;
}

.ui-empty-reset:active {
  transform: scale(0.98);
}

/* --- Responsive --- */
@media (max-width: 640px) {
  .ui-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
