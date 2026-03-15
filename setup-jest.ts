import { setupZonelessTestEnv } from 'jest-preset-angular/setup-env/zoneless';
import { applyPolyfills } from './testing/polyfills';

setupZonelessTestEnv();
applyPolyfills();
