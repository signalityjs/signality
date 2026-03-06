<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue';
import { useRoute, useData } from 'vitepress';
import Sidebar from './Sidebar.vue';
import OnThisPage from './OnThisPage.vue';
import PageNav from './PageNav.vue';
import PageMeta from './PageMeta.vue';
import DocHeader from './DocHeader.vue';
import MobileHeader from './MobileHeader.vue';
import Landing from './Landing.vue';

const route = useRoute();
const { frontmatter } = useData();
const sidebarOpen = ref(false);

// Check if we're on the landing page
const isLanding = computed(() => frontmatter.value.layout === 'landing');

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value;
};

const closeSidebar = () => {
  sidebarOpen.value = false;
};

onMounted(() => {
  // Force dark theme on html element
  document.documentElement.classList.add('dark');
  document.documentElement.setAttribute('data-theme', 'dark');
  document.documentElement.style.colorScheme = 'dark';

  // Remove light theme class if present
  document.documentElement.classList.remove('light');

  // Force dark theme on body
  document.body.classList.add('dark');
  document.body.style.colorScheme = 'dark';

  // Watch for any theme changes and force dark
  const observer = new MutationObserver(() => {
    if (!document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
      document.documentElement.style.colorScheme = 'dark';
    }
    if (document.documentElement.classList.contains('light')) {
      document.documentElement.classList.remove('light');
    }
  });

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class', 'data-theme'],
  });
});

// Close sidebar on route change
watch(
  () => route.path,
  () => {
    closeSidebar();
  }
);
</script>

<template>
  <div class="layout-container">
    <!-- Mobile Header -->
    <MobileHeader :sidebar-open="sidebarOpen" @toggle="toggleSidebar" />

    <!-- Overlay for mobile -->
    <div v-if="sidebarOpen" @click="closeSidebar" class="sidebar-overlay"></div>

    <!-- Sidebar Component -->
    <Sidebar :class="{ 'sidebar-open': sidebarOpen }" @navigate="closeSidebar" />

    <!-- Main Content Area -->
    <main class="main-content" :class="{ 'landing-content': isLanding }">
      <!-- Landing Page -->
      <template v-if="isLanding">
        <div class="landing-wrapper">
          <Landing />
        </div>
      </template>

      <!-- Regular Doc Page -->
      <template v-else>
        <div class="content-wrapper vp-doc">
          <DocHeader />
          <Content />
          <PageMeta />
          <PageNav />
        </div>
      </template>
    </main>

    <!-- Table of Contents (Right) -->
    <OnThisPage v-if="!isLanding" />
  </div>
</template>

<style>
/* ============================================
   LAYOUT CONTAINER
   ============================================ */
.layout-container {
  display: flex;
  min-height: 100vh;
  position: relative;
}

/* ============================================
   OVERLAY (Mobile)
   ============================================ */
.sidebar-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.6);
  z-index: 199;
  backdrop-filter: blur(2px);
}

/* ============================================
   MAIN CONTENT (Center)
   ============================================ */
.main-content {
  flex: 1;
  min-width: 0;
  overflow-x: hidden;
  padding-top: 2rem;
}

.main-content.landing-content {
  padding-top: 0;
}

.content-wrapper {
  max-width: 48rem;
  margin: 0 auto;
  padding: 2rem 1.5rem 3rem;
}

.landing-wrapper {
  width: 100%;
}

/* ============================================
   RESPONSIVE BREAKPOINTS
   ============================================ */

/* Tablet: keep sidebar, adjust content */
@media (max-width: 1280px) {
  .content-wrapper {
    max-width: 100%;
  }
}

/* Mobile: Hide sidebar by default, show mobile header */
@media (max-width: 768px) {
  .sidebar-overlay {
    display: block;
  }

  .main-content {
    width: 100%;
    padding-top: 56px; /* Height of mobile header */
  }

  .main-content.landing-content {
    padding-top: 56px;
  }

  .content-wrapper {
    padding: 2rem 1.5rem 2rem; /* Top: 2rem (32px), Left/Right: 1.5rem (24px) */
  }
}

/* Extra small devices */
@media (max-width: 480px) {
  .content-wrapper {
    padding: 2rem 1.5rem 2rem; /* Top: 2rem (32px), Left/Right: 1.5rem (24px) */
  }
}
</style>
