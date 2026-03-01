<script setup lang="ts">
defineProps<{
  sidebarOpen: boolean;
}>();

const emit = defineEmits<{
  toggle: [];
}>();
</script>

<template>
  <header class="mobile-header">
    <a href="/" class="mobile-header-logo" aria-label="Signality home">
      <span class="mobile-header-title">signality</span>
    </a>

    <button
      type="button"
      class="mobile-header-burger"
      :class="{ 'mobile-header-burger--active': sidebarOpen }"
      @click="emit('toggle')"
      :aria-expanded="sidebarOpen"
      aria-label="Toggle navigation menu"
    >
      <span class="burger-line"></span>
      <span class="burger-line"></span>
      <span class="burger-line"></span>
    </button>
  </header>
</template>

<style>
.mobile-header {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  height: 56px;
  padding: 0 1rem;
  background-color: #0f0f11;
  border-bottom: 1px solid #232125;
  align-items: center;
  justify-content: space-between;
}

.mobile-header-logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
}

.mobile-header-title {
  font-family: 'Poppins', system-ui, sans-serif;
  font-size: 1.125rem;
  font-weight: 500;
  color: #eee;
}

.mobile-header-burger {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 5px;
  width: 40px;
  height: 40px;
  padding: 0;
  background: transparent;
  border: none;
  cursor: pointer;
}

.burger-line {
  display: block;
  width: 22px;
  height: 2px;
  background-color: #a0a0a5;
  border-radius: 1px;
  transition: all 0.3s ease;
}

.mobile-header-burger:hover .burger-line {
  background-color: #fff;
}

.mobile-header-burger--active .burger-line:nth-child(1) {
  transform: translateY(7px) rotate(45deg);
}

.mobile-header-burger--active .burger-line:nth-child(2) {
  opacity: 0;
}

.mobile-header-burger--active .burger-line:nth-child(3) {
  transform: translateY(-7px) rotate(-45deg);
}

@media (max-width: 768px) {
  .mobile-header {
    display: flex;
  }
}
</style>
