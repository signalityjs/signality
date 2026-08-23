<template>
  <header class="l-nav">
    <div class="l-nav-inner">
      <a href="/" class="l-nav-logo" aria-label="Signality home">
        <svg
          style="filter: drop-shadow(0 0 12px rgba(151, 23, 231, 0.8)) brightness(1.25)"
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
          viewBox="0 0 22 22"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M20.9839 8.88574C22.0992 9.99024 22.1078 11.7899 21.0034 12.9053L13.7993 20.1787C12.255 21.738 9.73959 21.7503 8.18018 20.2061L17.0034 10.8857L11.7095 9.25488L14.7681 2.73047L20.9839 8.88574ZM8.20361 1.82422C9.74796 0.264877 12.2643 0.252601 13.8237 1.79688L4.99951 11.1172L10.2944 12.748L7.23486 19.2725L1.02002 13.1172C-0.0953976 12.0126 -0.104152 10.213 1.00049 9.09766L8.20361 1.82422Z"
            fill="url(#landing_logo_gradient)"
          />
          <path
            d="M20.9834 8.88574C22.0988 9.99033 22.1076 11.7899 21.0029 12.9053L13.7998 20.1787C12.2555 21.7381 9.7391 21.7503 8.17969 20.2061L17.0029 10.8857L11.709 9.25488L14.7686 2.73047L20.9834 8.88574ZM8.2041 1.82422C9.74845 0.264877 12.2638 0.252601 13.8232 1.79688L5 11.1172L10.2939 12.748L7.23535 19.2725L1.01953 13.1172C-0.0958138 12.0127 -0.104425 10.213 1 9.09766L8.2041 1.82422Z"
            fill="url(#landing_logo_gradient2)"
          />
          <defs>
            <linearGradient
              id="landing_logo_gradient"
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
              id="landing_logo_gradient2"
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
        <span class="l-nav-wordmark">signality</span>
      </a>

      <nav class="l-nav-links" aria-label="Site navigation">
        <a href="/guide/getting-started" class="l-nav-link">Docs</a>
        <a href="/catalog" class="l-nav-link">All Utilities</a>
        <a href="/resources/changelog" class="l-nav-link">Changelog</a>
        <a
          href="https://github.com/signalityjs/signality"
          class="l-nav-link l-nav-github"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Signality on GitHub"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path
              d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
            />
          </svg>
        </a>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.l-nav {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(15, 15, 17, 0.8);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid #1f1f24;
}

@supports not (backdrop-filter: blur(12px)) {
  .l-nav {
    background: #0f0f11;
  }
}

.l-nav-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 72rem;
  margin: 0 auto;
  padding: 0 1.5rem;
  height: 64px;
}

.l-nav-logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
}

.l-nav-wordmark {
  color: #eee;
  font-family: 'Poppins', system-ui, sans-serif;
  font-size: 1.3rem;
  font-weight: 500;
}

.l-nav-links {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.l-nav-link {
  color: #a39fa8;
  font-size: 0.875rem;
  text-decoration: none;
  transition: color 0.2s ease;
}

.l-nav-link:hover {
  color: #eee;
}

.l-nav-github {
  display: inline-flex;
  align-items: center;
}

/* MobileHeader takes over below this width */
@media (max-width: 768px) {
  .l-nav {
    display: none;
  }
}
</style>
