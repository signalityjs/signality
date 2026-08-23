<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useRoute, useData } from 'vitepress';
import Sidebar from './Sidebar.vue';
import OnThisPage from './OnThisPage.vue';
import PageNav from './PageNav.vue';
import PageMeta from './PageMeta.vue';
import DocHeader from './DocHeader.vue';
import MobileHeader from './MobileHeader.vue';
import LandingHeader from './LandingHeader.vue';
import LandingFooter from './LandingFooter.vue';

const route = useRoute();
const { frontmatter } = useData();
const sidebarOpen = ref(false);

// Check if we're on the landing page
const isLanding = computed(() => frontmatter.value.layout === 'landing');

const pagesWithoutOnThisPage = ['/changelog'];

const showOnThisPage = computed(() => {
  if (isLanding.value) {
    return false;
  }
  return !pagesWithoutOnThisPage.some(path => route.path.includes(path));
});

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value;
};

const closeSidebar = () => {
  sidebarOpen.value = false;
};

// Close sidebar on route change
watch(
  () => route.path,
  () => {
    closeSidebar();
  }
);
</script>

<template>
  <!-- The landing's banner and contentinfo landmarks sit outside
       .layout-container: nested inside <main> they would not be exposed as
       landmarks at all. -->
  <LandingHeader v-if="isLanding" />

  <div class="layout-container">
    <!-- Mobile Header -->
    <MobileHeader :sidebar-open="sidebarOpen" @toggle="toggleSidebar" />

    <!-- Overlay for mobile -->
    <div v-if="sidebarOpen" @click="closeSidebar" class="sidebar-overlay"></div>

    <!-- Sidebar Component -->
    <Sidebar
      :class="{ 'sidebar-open': sidebarOpen, 'sidebar-landing-hidden': isLanding }"
      @navigate="closeSidebar"
    />

    <!-- Main Content Area -->
    <main class="main-content" :class="{ 'landing-content': isLanding }">
      <!-- Landing Page -->
      <template v-if="isLanding">
        <div class="landing-wrapper">
          <Content />
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
    <OnThisPage v-if="showOnThisPage" />
  </div>

  <LandingFooter v-if="isLanding" />
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
  /* `overflow-x: hidden` would make this a scroll container and break the
     landing's sticky header; the landing has no horizontal overflow anyway */
  overflow-x: visible;
}

/* Hide the docs sidebar on the landing page (desktop only; on mobile it
   stays reachable through the burger menu in the mobile header) */
@media (min-width: 769px) {
  .sidebar-landing-hidden {
    display: none;
  }
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
    padding-top: 56px;
  }

  .main-content.landing-content {
    padding-top: 56px;
  }

  .content-wrapper {
    padding: 2rem 1.5rem 2rem;
  }
}

/* Extra small devices */
@media (max-width: 480px) {
  .content-wrapper {
    padding: 2rem 1.5rem 2rem;
  }
}
</style>
