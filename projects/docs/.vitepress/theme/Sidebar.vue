<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { useData } from 'vitepress';
import { VPNavBarSearch } from 'vitepress/theme';
import SidebarGroup from './SidebarGroup.vue';

const { site } = useData();
const sidebar = site.value.themeConfig.sidebar || [];
const base = site.value.base || '/';

// Determine current version based on base path
const getCurrentVersionFromBase = (basePath: string): string => {
  if (basePath === '/next/') return 'next';

  const match = basePath.match(/^\/v(\d+)\//);

  if (match) {
    return `v${match[1]}`;
  }

  return 'latest';
};

interface VersionOption {
  version: string;
  path: string;
  label: string;
  isLatest?: boolean;
  isNext?: boolean;
}

const versions = ref<VersionOption[]>([]);
const currentVersionLabel = ref('v0.0'); // Default fallback

const loadVersions = async () => {
  try {
    const response = await fetch(`${base}versions.json`);
    if (response.ok) {
      const versionsData = await response.json();

      if (Array.isArray(versionsData)) {
        versions.value = versionsData;

        // Find current version
        const currentVersionPath = getCurrentVersionFromBase(base);
        const currentVersionOption = versions.value.find(
          v => v.version === currentVersionPath || v.path === base
        );

        if (currentVersionOption) {
          // For latest version, use format v{major}.{minor} from label
          if (currentVersionOption.isLatest && currentVersionOption.label) {
            // Extract version from label like "v1.0.0" -> "v1.0"
            const versionMatch = currentVersionOption.label.match(/v(\d+)\.(\d+)/);
            if (versionMatch) {
              currentVersionLabel.value = `v${versionMatch[1]}.${versionMatch[2]}`;
            } else {
              currentVersionLabel.value = currentVersionOption.label;
            }
          } else {
            currentVersionLabel.value = currentVersionOption.label;
          }
        } else {
          // Fallback: determine from base path
          if (base === '/next/') {
            currentVersionLabel.value = 'Next';
          } else if (base.match(/^\/v\d+\//)) {
            const match = base.match(/^\/v(\d+)\//);
            currentVersionLabel.value = match ? `v${match[1]}` : 'v0.0';
          } else {
            // Fallback: try to extract from versions.json label or use default
            const latestVersion = versions.value.find(v => v.isLatest);
            if (latestVersion && latestVersion.label) {
              const versionMatch = latestVersion.label.match(/v(\d+)\.(\d+)/);
              if (versionMatch) {
                currentVersionLabel.value = `v${versionMatch[1]}.${versionMatch[2]}`;
              } else {
                currentVersionLabel.value = 'v0.0';
              }
            } else {
              currentVersionLabel.value = 'v0.0';
            }
          }
        }
      }
    }
  } catch {}
};

const versionDropdownOpen = ref(false);

const toggleVersionDropdown = () => {
  versionDropdownOpen.value = !versionDropdownOpen.value;
};

const selectVersion = (versionOption: VersionOption) => {
  versionDropdownOpen.value = false;

  const targetPath = versionOption.path;
  const currentPath = window.location.pathname;

  // Remove current base path and add new base path
  const pathWithoutBase = currentPath.replace(base, '/');
  const newPath =
    targetPath === '/' ? pathWithoutBase : targetPath + pathWithoutBase.replace(/^\//, '');

  // Navigate to new path
  window.location.href = newPath;
};

let clickOutsideHandler: ((event: MouseEvent) => void) | null = null;

onMounted(async () => {
  await loadVersions();

  clickOutsideHandler = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (!target.closest('.version-selector')) {
      versionDropdownOpen.value = false;
    }
  };
  document.addEventListener('click', clickOutsideHandler);
});

onUnmounted(() => {
  if (clickOutsideHandler) {
    document.removeEventListener('click', clickOutsideHandler);
  }
});

let isSwapped = false;
let isAnimating = false;
let autoInterval: ReturnType<typeof setInterval> | null = null;
let logoElement: HTMLElement | null = null;

function getLetters() {
  if (!logoElement) return null;
  const letters = logoElement.querySelectorAll('span');
  if (letters.length < 4) return null;
  return {
    g: letters[2] as HTMLElement, // 'g'
    n: letters[3] as HTMLElement, // 'n'
  };
}

function swapToNG() {
  if (isSwapped || isAnimating) return;
  const letters = getLetters();
  if (!letters) return;

  isAnimating = true;

  letters.g.classList.add('swap-g');
  letters.n.classList.add('swap-n');

  setTimeout(() => {
    letters.g.classList.add('gradient-glow');
    letters.n.classList.add('gradient-glow');
  }, 275);

  setTimeout(() => {
    isSwapped = true;
    isAnimating = false;
  }, 500);
}

function swapToGN() {
  if (!isSwapped || isAnimating) return;
  const letters = getLetters();
  if (!letters) return;

  isAnimating = true;

  letters.g.classList.add('gradient-fade');
  letters.n.classList.add('gradient-fade');

  letters.g.classList.remove('swap-g');
  letters.n.classList.remove('swap-n');
  letters.g.classList.add('swap-g-back');
  letters.n.classList.add('swap-n-back');

  setTimeout(() => {
    letters.g.classList.remove('gradient-glow', 'gradient-fade');
    letters.n.classList.remove('gradient-glow', 'gradient-fade');
  }, 400);

  setTimeout(() => {
    letters.g.classList.remove('swap-g-back');
    letters.n.classList.remove('swap-n-back');
    isSwapped = false;
    isAnimating = false;
  }, 600);
}

function fullAnimationCycle() {
  if (isAnimating) return;

  swapToNG();

  setTimeout(() => {
    swapToGN();
  }, 2000);
}

function handleMouseEnter() {
  swapToNG();
}

function handleMouseLeave() {
  swapToGN();
}

// onMounted(() => {
//   logoElement = document.getElementById('logoText');
//   const logoContainer = document.querySelector('.sidebar-logo');
//   if (!logoElement) return;
//
//   function wrapLetters(text: string) {
//     return text
//       .split('')
//       .map(letter => `<span>${letter}</span>`)
//       .join('');
//   }
//
//   logoElement.innerHTML = wrapLetters('signality');
//
//   if (logoContainer) {
//     logoContainer.addEventListener('mouseenter', handleMouseEnter);
//     logoContainer.addEventListener('mouseleave', handleMouseLeave);
//   }
//
//   setTimeout(() => {
//     fullAnimationCycle();
//     autoInterval = setInterval(fullAnimationCycle, 10000);
//   }, 3000);
// });

onUnmounted(() => {
  const logoContainer = document.querySelector('.sidebar-logo');
  if (logoContainer) {
    logoContainer.removeEventListener('mouseenter', handleMouseEnter);
    logoContainer.removeEventListener('mouseleave', handleMouseLeave);
  }
  if (autoInterval) {
    clearInterval(autoInterval);
  }
});
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

          <!--          <div class="flex items-center gap-1">-->
          <!--            <div-->
          <!--              class="border border-[#2E2E32] flex items-center justify-center rounded-md text-xs w-[30px] h-[30px]"-->
          <!--            >-->
          <!--              &lt;!&ndash;              v1.0&ndash;&gt;-->
          <!--              <svg-->
          <!--                xmlns="http://www.w3.org/2000/svg"-->
          <!--                width="20"-->
          <!--                height="20"-->
          <!--                viewBox="0 0 24 24"-->
          <!--                fill="none"-->
          <!--              >-->
          <!--                <path-->
          <!--                  d="M12 2C10.6868 2 9.38642 2.25866 8.17317 2.7612C6.95991 3.26375 5.85752 4.00035 4.92893 4.92893C3.05357 6.8043 2 9.34784 2 12C2 16.42 4.87 20.17 8.84 21.5C9.34 21.58 9.5 21.27 9.5 21V19.31C6.73 19.91 6.14 17.97 6.14 17.97C5.68 16.81 5.03 16.5 5.03 16.5C4.12 15.88 5.1 15.9 5.1 15.9C6.1 15.97 6.63 16.93 6.63 16.93C7.5 18.45 8.97 18 9.54 17.76C9.63 17.11 9.89 16.67 10.17 16.42C7.95 16.17 5.62 15.31 5.62 11.5C5.62 10.39 6 9.5 6.65 8.79C6.55 8.54 6.2 7.5 6.75 6.15C6.75 6.15 7.59 5.88 9.5 7.17C10.29 6.95 11.15 6.84 12 6.84C12.85 6.84 13.71 6.95 14.5 7.17C16.41 5.88 17.25 6.15 17.25 6.15C17.8 7.5 17.45 8.54 17.35 8.79C18 9.5 18.38 10.39 18.38 11.5C18.38 15.32 16.04 16.16 13.81 16.41C14.17 16.72 14.5 17.33 14.5 18.26V21C14.5 21.27 14.66 21.59 15.17 21.5C19.14 20.16 22 16.42 22 12C22 10.6868 21.7413 9.38642 21.2388 8.17317C20.7362 6.95991 19.9997 5.85752 19.0711 4.92893C18.1425 4.00035 17.0401 3.26375 15.8268 2.7612C14.6136 2.25866 13.3132 2 12 2Z"-->
          <!--                  fill="#E1E1E1"-->
          <!--                />-->
          <!--              </svg>-->
          <!--            </div>-->
          <!--          </div>-->

          <!--          <div class="version-selector">-->
          <!--            <button-->
          <!--              class="version-button"-->
          <!--              @click.stop="toggleVersionDropdown"-->
          <!--              :aria-expanded="versionDropdownOpen"-->
          <!--              aria-label="Select version"-->
          <!--            >-->
          <!--              <span class="version-text">{{ currentVersionLabel }}</span>-->
          <!--              <svg-->
          <!--                class="version-arrow"-->
          <!--                :class="{ 'version-arrow-open': versionDropdownOpen }"-->
          <!--                width="12"-->
          <!--                height="12"-->
          <!--                viewBox="0 0 12 12"-->
          <!--                fill="none"-->
          <!--                xmlns="http://www.w3.org/2000/svg"-->
          <!--              >-->
          <!--                <path-->
          <!--                  d="M3 4.5L6 7.5L9 4.5"-->
          <!--                  stroke="currentColor"-->
          <!--                  stroke-width="1.5"-->
          <!--                  stroke-linecap="round"-->
          <!--                  stroke-linejoin="round"-->
          <!--                />-->
          <!--              </svg>-->
          <!--            </button>-->

          <!--            <div v-if="versionDropdownOpen && versions.length > 0" class="version-dropdown">-->
          <!--              <button-->
          <!--                v-for="versionOption in versions"-->
          <!--                :key="versionOption.version"-->
          <!--                class="version-option"-->
          <!--                :class="{ 'version-option-active': versionOption.path === base }"-->
          <!--                @click.stop="selectVersion(versionOption)"-->
          <!--              >-->
          <!--                {{ versionOption.label }}-->
          <!--                <span v-if="versionOption.path === base" class="version-check">✓</span>-->
          <!--              </button>-->
          <!--            </div>-->
          <!--          </div>-->
        </div>

        <VPNavBarSearch />

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

/* --- Version Selector --- */
.version-selector {
  position: relative;
  flex-shrink: 0;
}

.version-button {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0;
  background: transparent;
  border: none;
  color: #a1a1aa;
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.2s ease;
  outline: none;
  white-space: nowrap;
}

.version-button:hover {
  color: #e4e4e7;
}

.version-button:focus {
  color: #e4e4e7;
}

.version-text {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 0.75rem;
}

.version-arrow {
  width: 12px;
  height: 12px;
  color: currentColor;
  transition: transform 0.2s ease;
  flex-shrink: 0;
}

.version-arrow-open {
  transform: rotate(180deg);
}

.version-dropdown {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  min-width: 120px;
  background: #1a1a1d;
  border: 1px solid #232327;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  z-index: 100;
  overflow: hidden;
}

.version-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0.625rem 0.875rem;
  background: transparent;
  border: none;
  color: #a1a1aa;
  font-size: 0.8125rem;
  font-weight: 500;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  cursor: pointer;
  transition: all 0.15s ease;
  text-align: left;
}

.version-option:hover {
  background: #232327;
  color: #e4e4e7;
}

.version-option-active {
  background: rgba(99, 102, 241, 0.1);
  color: #6366f1;
}

.version-check {
  color: #6366f1;
  font-weight: 600;
  margin-left: 0.5rem;
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

.logo-text span.swap-g {
  animation: swapG 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.logo-text span.swap-n {
  animation: swapN 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.logo-text span.swap-g-back {
  animation: swapGBack 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.logo-text span.swap-n-back {
  animation: swapNBack 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.logo-text span.gradient-glow {
  background: linear-gradient(
    135deg,
    #e40035 0%,
    #f60a48 15%,
    #f20755 25%,
    #dc087d 40%,
    #9717e7 70%,
    #6c00f5 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  background-size: 200% 100%;
  filter: drop-shadow(0 0 12px rgba(151, 23, 231, 0.8)) brightness(1.5);
  transition: filter 0.5s ease-out;
}

/* Fade out state - glow dims gradually */
.logo-text span.gradient-glow.gradient-fade {
  filter: drop-shadow(0 0 3px rgba(151, 23, 231, 0.15)) brightness(1.05);
}

@keyframes swapG {
  0% {
    transform: translateX(0);
    z-index: 1;
  }
  100% {
    transform: translateX(0.65em);
    z-index: 10;
  }
}

@keyframes swapN {
  0% {
    transform: translateX(0);
    z-index: 1;
  }
  100% {
    transform: translateX(-0.65em);
    z-index: 10;
  }
}

@keyframes swapGBack {
  0% {
    transform: translateX(0.65em);
    z-index: 10;
  }
  100% {
    transform: translateX(0);
    z-index: 1;
  }
}

@keyframes swapNBack {
  0% {
    transform: translateX(-0.65em) scale(1.1);
    z-index: 10;
  }
  100% {
    transform: translateX(0) scale(1);
    z-index: 1;
  }
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
    padding-top: 0; /* No top padding on mobile - start from top */
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
