import type { Theme } from 'vitepress';
import Layout from './Layout.vue';
import Demo from './Demo.vue';
import ContributorsAvatars from './ContributorsAvatars.vue';
import './tailwind.css';
import './website.css';

export default {
  Layout,
  enhanceApp({ app }) {
    app.component('Demo', Demo);
    app.component('ContributorsAvatars', ContributorsAvatars);
  },
} satisfies Theme;
