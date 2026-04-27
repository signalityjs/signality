<script setup>
import { ref, onMounted } from 'vue'

const contributors = ref([])

onMounted(async () => {
  try {
    const res = await fetch('https://api.github.com/repos/signalityjs/signality/contributors')
    contributors.value = await res.json()
  } catch (e) {
    console.error('Failed to load contributors:', e)
  }
})
</script>

<template>
  <div class="stacked-avatars">
    <a
      href="https://github.com/signalityjs/signality/blob/main/CONTRIBUTING.md"
      target="_blank"
      class="avatar first-avatar"
      style="background: linear-gradient(135deg, #f300f3, #FF0049); z-index: 4; color: #fff;"
    >
      <svg
        class="icon-github"
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
      </svg>
      <svg
        class="icon-plus"
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
      <span class="custom-tooltip">I want to be marked as a <span style="font-weight: 500; color: #DEB3EB">contributor</span></span>
    </a>
    <a
      v-for="(user, index) in contributors.slice(0, 2)"
      :key="user.id"
      :href="user.html_url"
      target="_blank"
      class="avatar"
      :style="{ zIndex: 3 - index }"
    >
      <img :src="user.avatar_url + '&s=80'" :alt="user.login" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">
    </a>
    <div class="avatar" style="background-color: #27272A; z-index: 1;"></div>
  </div>
</template>

<style scoped>
.stacked-avatars {
  display: flex;
  align-items: center;
  margin-top: 12px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  color: #DFDFD6;
  border: 2.5px solid #1A1A1C;
  margin-left: -12px;
  position: relative;
  overflow: hidden;
}

.avatar:first-child {
  margin-left: 0;
}

.first-avatar {
  cursor: pointer;
  transition: transform 0.125s ease !important;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  color: inherit;
}

.icon-plus {
  position: absolute;
  opacity: 0;
}

.icon-github,
.icon-plus {
  transition: opacity 0.125s ease;
}

.first-avatar:hover .icon-github {
  opacity: 0;
}

.first-avatar:hover .icon-plus {
  opacity: 1;
}

a.first-avatar:hover {
  transform: scale(1.15);
}

.custom-tooltip {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%) scale(0.9);
  background-color: #161618;
  color: #fff;
  font-size: 13px;
  font-weight: 500;
  padding: 8px 14px;
  border-radius: 6px;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: all 0.25s ease;
  z-index: 100;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.custom-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 6px solid transparent;
  border-top-color: #161618;
}

.first-avatar:hover .custom-tooltip {
  opacity: 1;
  visibility: visible;
  transform: translateX(-50%) scale(1);
}

@media (hover: none) {
  .custom-tooltip {
    display: none;
  }
}
</style>