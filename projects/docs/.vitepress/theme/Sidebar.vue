<script setup lang="ts">
import { useData } from 'vitepress';
import { VPNavBarSearch } from 'vitepress/theme';
import SidebarGroup from './SidebarGroup.vue';

const { site } = useData();
const sidebar = site.value.themeConfig.sidebar || [];

const emit = defineEmits<{ navigate: [] }>();

function onSearchClick() {
  setTimeout(() => emit('navigate'), 150);
}
</script>

<template>
  <aside class="sidebar" role="complementary" aria-label="Main navigation">
    <div class="sidebar-content">
      <header class="sidebar-header">
        <div class="logo-row">
          <a href="/" class="sidebar-logo" aria-label="Signality home">
            <svg
              style="filter: drop-shadow(0 0 12px rgba(151, 23, 231, 0.8)) brightness(1.25)"
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 22 22"
              fill="none"
            >
              <path
                d="M20.9839 8.88574C22.0992 9.99024 22.1078 11.7899 21.0034 12.9053L13.7993 20.1787C12.255 21.738 9.73959 21.7503 8.18018 20.2061L17.0034 10.8857L11.7095 9.25488L14.7681 2.73047L20.9839 8.88574ZM8.20361 1.82422C9.74796 0.264877 12.2643 0.252601 13.8237 1.79688L4.99951 11.1172L10.2944 12.748L7.23486 19.2725L1.02002 13.1172C-0.0953976 12.0126 -0.104152 10.213 1.00049 9.09766L8.20361 1.82422Z"
                fill="url(#paint0_linear_2801_5990)"
              />
              <path
                d="M20.9834 8.88574C22.0988 9.99033 22.1076 11.7899 21.0029 12.9053L13.7998 20.1787C12.2555 21.7381 9.7391 21.7503 8.17969 20.2061L17.0029 10.8857L11.709 9.25488L14.7686 2.73047L20.9834 8.88574ZM8.2041 1.82422C9.74845 0.264877 12.2638 0.252601 13.8232 1.79688L5 11.1172L10.2939 12.748L7.23535 19.2725L1.01953 13.1172C-0.0958138 12.0127 -0.104425 10.213 1 9.09766L8.2041 1.82422Z"
                fill="url(#paint1_linear_2801_5990)"
              />
              <defs>
                <linearGradient
                  id="paint0_linear_2801_5990"
                  x1="3.1397"
                  y1="18.5826"
                  x2="26.3579"
                  y2="4.96348"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stop-color="#E40035" />
                  <stop offset="0.24" stop-color="#F60A48" />
                  <stop offset="0.352" stop-color="#F20755" />
                  <stop offset="0.494" stop-color="#DC087D" />
                  <stop offset="0.745" stop-color="#9717E7" />
                  <stop offset="1" stop-color="#6C00F5" />
                </linearGradient>
                <linearGradient
                  id="paint1_linear_2801_5990"
                  x1="4.69222"
                  y1="2.73832"
                  x2="14.704"
                  y2="15.3673"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stop-color="#FF31D9" />
                  <stop offset="1" stop-color="#FF5BE1" stop-opacity="0" />
                </linearGradient>
              </defs>
            </svg>
            <span class="logo-text" id="logoText">signality</span>
          </a>
        </div>

        <div @click.capture="onSearchClick">
          <VPNavBarSearch />
        </div>

        <div class="sidebar-divider" aria-hidden="true"></div>
      </header>

      <nav class="sidebar-nav" aria-label="Documentation navigation">
        <ul class="sidebar-list">
          <SidebarGroup v-for="group in sidebar" :key="group.text" :item="group" :depth="0" />
        </ul>
      </nav>
    </div>
  </aside>
</template>

<style>
/* --- Sidebar Container --- */
.sidebar {
  width: 286px;
  flex-shrink: 0;
  border-right: 1px solid #232125;
  background-color: #0f0f11;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
  transition: transform 0.3s ease;
}

.sidebar-content {
  display: flex;
  flex-direction: column;
}

/* --- Header --- */
.sidebar-header {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.125rem 1.5rem 0;
  background-color: #0f0f11;
}

.logo-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem;
  text-decoration: none;
  flex: 1;
  min-width: 0;
}

.sidebar-divider {
  height: 1px;
  background-color: #1f1f24;
}

/* --- Navigation --- */
.sidebar-nav {
  padding: 0.5rem 1.5rem 1.5rem;
}

.sidebar-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

/* --- Logo Animation --- */
.logo-text {
  color: #eee;
  font-family: 'Poppins', system-ui, sans-serif;
  font-size: 1.3rem;
  font-weight: 500;
  line-height: normal;
  position: relative;
  white-space: nowrap;
  display: inline-flex;
  min-width: 100px;
}

.logo-text span {
  display: inline-block;
  position: relative;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  /* Base state for gradient transition */
  -webkit-text-fill-color: currentColor;
  filter: none;
}

/* --- Scrollbar --- */
.sidebar::-webkit-scrollbar {
  width: 6px;
}

.sidebar::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar::-webkit-scrollbar-thumb {
  background-color: #232327;
  border-radius: 3px;
}

.sidebar::-webkit-scrollbar-thumb:hover {
  background-color: #2b2b30;
}

/* --- Responsive --- */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    top: 0; /* Cover entire screen including header */
    left: 0;
    z-index: 200; /* Above mobile header (z-index: 100) */
    transform: translateX(-100%);
    height: 100vh; /* Full viewport height */
    width: 280px;
    box-shadow: 2px 0 16px rgba(0, 0, 0, 0.3);
    transition: transform 0.3s ease;
  }

  .sidebar-open {
    transform: translateX(0);
  }

  .sidebar-header {
    display: flex; /* Show header in sidebar on mobile */
    padding-top: 1rem;
  }

  .sidebar-content {
    padding-top: 0; /* Ensure no top padding */
  }
}

@media (max-width: 480px) {
  .sidebar {
    width: 85vw;
    max-width: 280px;
  }
}
</style>
