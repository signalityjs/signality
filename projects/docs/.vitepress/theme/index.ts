import type { Theme } from 'vitepress';
import Layout from './Layout.vue';
import Demo from './Demo.vue';
import './tailwind.css';
import './website.css';

export default {
  Layout,
  enhanceApp({ app }) {
    // Register Demo component globally for use in markdown
    app.component('Demo', Demo);
  },
} satisfies Theme;
