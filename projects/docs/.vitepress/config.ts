import { defineConfig } from 'vitepress';
import tailwind from '@tailwindcss/vite';
import { demosWatcher } from './plugins/demos-watcher';

const base = process.env.VITEPRESS_BASE || '/';
const cloudflareToken = process.env.CLOUDFLARE_ANALYTICS_TOKEN;

// https://vitepress.dev/reference/site-config
export default defineConfig({
  // Site metadata
  lang: 'en-US',
  title: 'Signality',
  description:
    'Comprehensive library of signal-first utilities for Angular. SSR-ready, type-safe, and designed for seamless reactive composition and DI-interop.',

  // Base path (configurable via VITEPRESS_BASE env var)
  base,

  // Clean URLs without .html extension
  cleanUrls: true,

  // Last updated timestamp
  lastUpdated: true,

  // Sitemap for SEO
  sitemap: {
    hostname: 'https://signality.dev',
  },

  // Head meta tags for SEO
  head: [
    // Charset and viewport
    ['meta', { charset: 'utf-8' }],
    ['meta', { name: 'viewport', content: 'width=device-width, initial-scale=1, user-scalable=1, maximum-scale=1, viewport-fit=cover' }],

    // Primary meta tags
    ['meta', { name: 'title', content: 'Signality - Signal-First Utilities for Angular' }],
    [
      'meta',
      {
        name: 'description',
        content:
          'Comprehensive library of signal-first utilities for Angular. SSR-ready, type-safe, and designed for seamless reactive composition and DI-interop.',
      },
    ],
    [
      'meta',
      {
        name: 'keywords',
        content:
          'angular, signals, utilities, angular utility library, reactive, typescript, ssr, signality',
      },
    ],
    ['meta', { name: 'author', content: 'Signality Team' }],
    ['meta', { name: 'robots', content: 'index, follow' }],

    // Open Graph / Facebook
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:url', content: 'https://signality.dev/' }],
    ['meta', { property: 'og:title', content: 'Signality - Signal-First Utilities for Angular' }],
    [
      'meta',
      {
        property: 'og:description',
        content:
          'Comprehensive library of signal-first utilities for Angular. SSR-ready, type-safe, and designed for seamless reactive composition and DI-interop.',
      },
    ],
    ['meta', { property: 'og:image', content: 'https://signality.dev/og-image.png' }],
    ['meta', { property: 'og:site_name', content: 'Signality' }],
    ['meta', { property: 'og:locale', content: 'en_US' }],

    // Twitter
    ['meta', { property: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { property: 'twitter:url', content: 'https://signality.dev/' }],
    [
      'meta',
      { property: 'twitter:title', content: 'Signality - Signal-First Utilities for Angular' },
    ],
    [
      'meta',
      {
        property: 'twitter:description',
        content:
          'Comprehensive library of signal-first utilities for Angular. SSR-ready, type-safe, and designed for seamless reactive composition and DI-interop.',
      },
    ],
    ['meta', { property: 'twitter:image', content: 'https://signality.dev/og-image.png' }],

    // Favicon (paths are relative to base)
    ['link', { rel: 'icon', type: 'image/svg+xml', href: `${base}favicon.ico` }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '32x32', href: `${base}favicon-32x32.png` }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '16x16', href: `${base}favicon-16x16.png` }],
    ['link', { rel: 'apple-touch-icon', sizes: '180x180', href: `${base}apple-touch-icon.png` }],
    ['link', { rel: 'manifest', href: `${base}site.webmanifest` }],

    // Theme color
    ['meta', { name: 'theme-color', content: '#0f0f11' }],
    ['meta', { name: 'msapplication-TileColor', content: '#0f0f11' }],

    // Fonts
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    [
      'link',
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap',
      },
    ],
    [
      'link',
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
      },
    ],

    // Canonical URL (will be overridden per page)
    ['link', { rel: 'canonical', href: 'https://signality.dev/' }],

    // Cloudflare Web Analytics
    [
      'script',
      {
        defer: '',
        src: 'https://static.cloudflareinsights.com/beacon.min.js',
        'data-cf-beacon': `{"token": "${cloudflareToken}"}`,
      },
    ],
  ],

  themeConfig: {
    siteTitle: '',
    logo: '/logo.svg',
    outline: [2, 3],

    search: {
      provider: 'local',
    },

    nav: [
      { text: 'Guide', link: '/' },
      { text: 'API', link: '/api-reference' },
      {
        text: 'Links',
        items: [
          { text: 'GitHub', link: 'https://github.com/signalityjs/signality' },
          { text: 'npm', link: 'https://www.npmjs.com/package/@signality/core' },
          {
            text: 'Changelog',
            link: 'https://github.com/signalityjs/signality/blob/main/CHANGELOG.md',
          },
        ],
      },
    ],

    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Getting Started', link: '/' },
          { text: 'Key Concepts', link: '/guide/key-concepts' },
          { text: 'AI Development', link: '/guide/ai-development' },
        ],
      },
      {
        text: 'Resources',
        items: [
          { text: 'GitHub', link: 'https://github.com/signalityjs/signality' },
          { text: 'Roadmap', link: '/resources/roadmap' },
        ],
      },
      {
        text: 'Browser',
        items: [
          { text: 'Battery', link: '/browser/battery' },
          { text: 'Bluetooth', link: '/browser/bluetooth' },
          { text: 'Breakpoints', link: '/browser/breakpoints' },
          { text: 'BroadcastChannel', link: '/browser/broadcast-channel' },
          { text: 'BrowserLanguage', link: '/browser/browser-language' },
          { text: 'Clipboard', link: '/browser/clipboard' },
          { text: 'DevicePosture', link: '/browser/device-posture' },
          { text: 'DisplayMedia', link: '/browser/display-media' },
          { text: 'EyeDropper', link: '/browser/eye-dropper' },
          { text: 'FileDialog', link: '/browser/file-dialog' },
          { text: 'Favicon', link: '/browser/favicon' },
          { text: 'Fps', link: '/browser/fps' },
          { text: 'Fullscreen', link: '/browser/fullscreen' },
          { text: 'Gamepad', link: '/browser/gamepad' },
          { text: 'Geolocation', link: '/browser/geolocation' },
          { text: 'InputModality', link: '/browser/input-modality' },
          { text: 'Listener', link: '/browser/listener' },
          { text: 'MediaQuery', link: '/browser/media-query' },
          { text: 'Network', link: '/browser/network' },
          { text: 'Online', link: '/browser/online' },
          { text: 'PageVisibility', link: '/browser/page-visibility' },
          { text: 'PermissionState', link: '/browser/permission-state' },
          { text: 'PictureInPicture', link: '/browser/picture-in-picture' },
          { text: 'ScreenOrientation', link: '/browser/screen-orientation' },
          { text: 'SpeechRecognition', link: '/browser/speech-recognition' },
          { text: 'SpeechSynthesis', link: '/browser/speech-synthesis' },
          { text: 'Storage', link: '/browser/storage' },
          { text: 'TextDirection', link: '/browser/text-direction' },
          { text: 'TextSelection', link: '/browser/text-selection' },
          { text: 'Vibration', link: '/browser/vibration' },
          { text: 'WebNotification', link: '/browser/web-notification' },
          { text: 'WebShare', link: '/browser/web-share' },
          { text: 'WebWorker', link: '/browser/web-worker' },
          { text: 'WindowFocus', link: '/browser/window-focus' },
          { text: 'WindowSize', link: '/browser/window-size' },
        ],
      },
      {
        text: 'Elements',
        items: [
          { text: 'ActiveElement', link: '/elements/active-element' },
          { text: 'Dropzone', link: '/elements/dropzone' },
          { text: 'ElementFocus', link: '/elements/element-focus' },
          { text: 'ElementFocusWithin', link: '/elements/element-focus-within' },
          { text: 'ElementHover', link: '/elements/element-hover' },
          { text: 'ElementSize', link: '/elements/element-size' },
          { text: 'ElementVisibility', link: '/elements/element-visibility' },
          { text: 'MousePosition', link: '/elements/mouse-position' },
          { text: 'OnClickOutside', link: '/elements/on-click-outside' },
          { text: 'OnDisconnect', link: '/elements/on-disconnect' },
          { text: 'OnLongPress', link: '/elements/on-long-press' },
          { text: 'PointerSwipe', link: '/elements/pointer-swipe' },
          { text: 'ScrollPosition', link: '/elements/scroll-position' },
          { text: 'Swipe', link: '/elements/swipe' },
        ],
      },
      {
        text: 'Observers',
        items: [
          { text: 'IntersectionObserver', link: '/observers/intersection-observer' },
          { text: 'MutationObserver', link: '/observers/mutation-observer' },
          { text: 'ResizeObserver', link: '/observers/resize-observer' },
        ],
      },
      {
        text: 'Reactivity',
        items: [
          { text: 'Debounced', link: '/reactivity/debounced' },
          { text: 'Throttled', link: '/reactivity/throttled' },
          { text: 'Watcher', link: '/reactivity/watcher' },
        ],
      },
      {
        text: 'Scheduling',
        items: [
          { text: 'DebounceCallback', link: '/scheduling/debounce-callback' },
          { text: 'Interval', link: '/scheduling/interval' },
          { text: 'ThrottleCallback', link: '/scheduling/throttle-callback' },
        ],
      },
      {
        text: 'Router',
        items: [
          { text: 'Fragment', link: '/router/fragment' },
          { text: 'Params', link: '/router/params' },
          { text: 'QueryParams', link: '/router/query-params' },
          { text: 'RouteData', link: '/router/route-data' },
          { text: 'RouterListener', link: '/router/router-listener' },
          { text: 'Title', link: '/router/title' },
          { text: 'Url', link: '/router/url' },
        ],
      },
      {
        text: 'Forms',
        items: [{ text: 'Cva', link: '/forms/cva' }],
      },
      {
        text: 'CDK Interop',
        items: [
          { text: 'FocusMonitor', link: '/cdk-interop/focus-monitor' },
          { text: 'InputModality', link: '/cdk-interop/input-modality' },
          { text: 'LiveAnnouncer', link: '/cdk-interop/live-announcer' },
        ],
      },
      {
        text: 'Reference',
        items: [{ text: 'Utility Types', link: '/reference/utility-types' }],
      },
    ],

    // Social links
    socialLinks: [{ icon: 'github', link: 'https://github.com/signalityjs/signality' }],

    // Footer
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024-present Signality Team',
    },

    // Edit link
    editLink: {
      pattern: 'https://github.com/signalityjs/signality/edit/main/projects/docs/:path',
      text: 'Edit this page on GitHub',
    },
  },

  vite: {
    plugins: [tailwind(), demosWatcher()],
    server: {
      host: process.env.VITEPRESS_HOST || 'localhost',
      watch: {
        ignored: ['!**/public/demos/**'],
      },
    },
  },

  markdown: {
    theme: {
      light: 'github-dark',
      dark: 'github-dark',
    },
  },
});
