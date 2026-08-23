<template>
  <!-- Layout.vue renders this outside the main element so the contentinfo
       landmark stays top-level. -->
  <footer class="l-footer">
    <p class="l-footer-license">Released under the MIT License.</p>
    <nav class="l-footer-links" aria-label="Footer links">
      <a
        href="https://github.com/signalityjs/signality"
        target="_blank"
        rel="noopener noreferrer"
        class="l-footer-link"
      >GitHub</a>
      <a
        href="https://www.npmjs.com/package/@signality/core"
        target="_blank"
        rel="noopener noreferrer"
        class="l-footer-link"
      >npm</a>
      <a href="/resources/changelog" class="l-footer-link">Changelog</a>
    </nav>
  </footer>
</template>

<style scoped>
.l-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  max-width: 72rem;
  margin: 4.5rem auto 0;
  padding: 1.75rem 1.5rem 2rem;
  border-top: 1px solid #1f1f24;
}

.l-footer-license {
  margin: 0;
  color: #8b8794;
  font-size: 0.8125rem;
}

.l-footer-links {
  display: flex;
  gap: 1.25rem;
}

.l-footer-link {
  color: #a39fa8;
  font-size: 0.8125rem;
  text-decoration: none;
  transition: color 0.2s ease;
}

.l-footer-link:hover {
  color: #eee;
}

@media (max-width: 768px) {
  .l-footer {
    margin-top: 2rem;
  }
}

@media (max-width: 640px) {
  .l-footer {
    flex-direction: column;
    justify-content: center;
  }
}
</style>
