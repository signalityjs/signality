<script setup lang="ts"></script>

<template>
  <div class="landing-page">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-container"></div>
    </section>
  </div>
</template>

<style scoped>
.landing-page {
  width: 100%;
  min-height: 100vh;
  background: #0f0f11;
  color: #eee;
}

/* Hero Section */
.hero-section {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  position: relative;
  padding: 8rem 2rem 6rem;
  text-align: center;
  overflow: hidden;
  background: #0f0f11;
}

.hero-container {
  max-width: 900px;
  margin: 0 auto;
}
</style>
