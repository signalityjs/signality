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
  backdrop-filter: blur(16px);
  background-color: color-mix(in srgb, #0f0f11 70%, transparent);
}

.mobile-header-logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
}

.mobile-header-title {
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
