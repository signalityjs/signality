# Getting started

<div class="info-banner">
  <div style="font-weight: 600; font-size: 16px; margin-bottom: 8px;">Signality v0.5 is here! 🎉</div>
  The last minor before <code>1.0</code> — the API is close to frozen.

  We welcome <a href="https://github.com/signalityjs/signality/blob/main/CONTRIBUTING.md" target="_blank">contributions</a> of all kinds - whether it's fixing bugs, adding features, improving documentation, or suggesting ideas.

  <div style="display: flex; flex-direction: column; gap: 8px">
    <ContributorsAvatars />
    <div style="display: flex; gap: 8px; align-items: center; margin-left: 14px">
      <svg
        style="margin-top: -6px"
        width="18px"
        height="18px"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M21 20H17.6C14.2397 20 12.5595 20 11.2761 19.346C10.1471 18.7708 9.2292 17.8529 8.65396 16.7239C8 15.4405 8 13.7603 8 10.4V4M8 4L13 9M8 4L3 9"
          stroke="#EDEDED"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      <span>All contributors will be featured!</span>
    </div>
  </div>
</div>

Signality is a library of signal-first utilities for Angular: [76 SSR-ready, type-safe composables](/catalog) for browser APIs, DOM elements, and reactive state. Think [VueUse](https://vueuse.org/), for Angular Signals.

<style>
.info-banner {
  background-color: #1A1A1C;
  border-radius: 10px;
  font-size: 14px;
  padding: 20px;
  margin: 1rem 0;
}
</style>

## Prerequisites

Before installing Signality, make sure you have:

- <svg xmlns="http://www.w3.org/2000/svg" style="display: inline-block; vertical-align: middle; margin-right: 6px; filter: brightness(1.2) saturate(1.3);" width="16" height="16" viewBox="0 0 16 16" fill="none"><g clip-path="url(#clip0_2826_5863)"><path d="M15.5625 2.6625L15.0125 11.2375L9.7875 0L15.5625 2.6625ZM11.9375 13.75L8 16L4.0625 13.75L4.8625 11.8125H11.15L11.9375 13.75ZM8 4.2625L10.0625 9.2875H5.9375L8 4.2625ZM0.9875 11.2375L0.4375 2.6625L6.2125 0L0.9875 11.2375Z" fill="url(#paint0_linear_2826_5863)"/><path d="M15.5625 2.6625L15.0125 11.2375L9.7875 0L15.5625 2.6625ZM11.9375 13.75L8 16L4.0625 13.75L4.8625 11.8125H11.15L11.9375 13.75ZM8 4.2625L10.0625 9.2875H5.9375L8 4.2625ZM0.9875 11.2375L0.4375 2.6625L6.2125 0L0.9875 11.2375Z" fill="url(#paint1_linear_2826_5863)"/></g><defs><linearGradient id="paint0_linear_2826_5863" x1="1.838" y1="10.4662" x2="13.8731" y2="4.747" gradientUnits="userSpaceOnUse"><stop stop-color="#E40035"/><stop offset="0.24" stop-color="#F60A48"/><stop offset="0.352" stop-color="#F20755"/><stop offset="0.494" stop-color="#DC087D"/><stop offset="0.745" stop-color="#9717E7"/><stop offset="1" stop-color="#6C00F5"/></linearGradient><linearGradient id="paint1_linear_2826_5863" x1="3.59162" y1="1.61612" x2="11.4677" y2="10.6006" gradientUnits="userSpaceOnUse"><stop stop-color="#FF31D9"/><stop offset="1" stop-color="#FF5BE1" stop-opacity="0"/></linearGradient><clipPath id="clip0_2826_5863"><rect width="16" height="16" fill="white"/></clipPath></defs></svg>
  **Angular 20+**
- <svg xmlns="http://www.w3.org/2000/svg" style="display: inline-block; vertical-align: middle; margin-right: 6px;" width="16" height="16" viewBox="0 0 16 16" fill="none"><g clip-path="url(#clip0_2826_5866)"><path d="M2.83398 5.875H15.2927V15.0837H2.83398V5.875Z" fill="white"/><path d="M0.1875 7.98877V15.8013H15.8125V0.17627H0.1875V7.98877ZM12.7788 7.36377C13.153 7.45062 13.4931 7.64635 13.7563 7.92627C13.9011 8.07709 14.027 8.24499 14.1313 8.42627C14.1313 8.44627 13.4563 8.90252 13.045 9.15752C13.03 9.16752 12.97 9.10252 12.9038 9.00377C12.8287 8.87423 12.722 8.76582 12.5937 8.68866C12.4654 8.6115 12.3196 8.5681 12.17 8.56252C11.6963 8.53002 11.3913 8.77877 11.3938 9.18752C11.39 9.28928 11.4132 9.39022 11.4613 9.48002C11.565 9.69627 11.7588 9.82502 12.3663 10.0875C13.485 10.5688 13.9637 10.8863 14.2612 11.3375C14.5937 11.8375 14.6675 12.645 14.4425 13.2425C14.1925 13.8925 13.58 14.3338 12.7137 14.48C12.3181 14.5254 11.9184 14.5212 11.5238 14.4675C10.919 14.3678 10.3619 14.0775 9.93375 13.6388C9.79 13.48 9.51 13.0663 9.5275 13.0363C9.57304 13.0023 9.6211 12.9718 9.67125 12.945L10.25 12.625L10.6987 12.365L10.7925 12.5038C10.9508 12.7301 11.1521 12.9229 11.385 13.0713C11.885 13.3338 12.5675 13.2975 12.905 12.9938C13.0183 12.8825 13.089 12.7349 13.1048 12.5769C13.1205 12.4188 13.0804 12.2603 12.9913 12.1288C12.8663 11.955 12.6162 11.8088 11.9175 11.5038C11.1112 11.1563 10.7637 10.9413 10.4462 10.5988C10.2481 10.3727 10.1018 10.1061 10.0175 9.81752C9.95469 9.48783 9.94541 9.15017 9.99 8.81752C10.1562 8.03877 10.74 7.49502 11.5925 7.33377C11.9873 7.285 12.3872 7.29595 12.7788 7.36627V7.36377ZM9.11125 8.01877V8.65877H7.0825V14.4375H5.64375V8.65752H3.61V8.03252C3.60362 7.81699 3.60863 7.60127 3.625 7.38627C3.635 7.37502 4.875 7.37502 6.375 7.37502H9.10375L9.11125 8.01877Z" fill="#007ACC"/></g><defs><clipPath id="clip0_2826_5866"><rect width="16" height="16" fill="white"/></clipPath></defs></svg>
  **TypeScript 5.4+**

## Installation

Choose your preferred package manager:

::: code-group

```bash [<svg xmlns="http://www.w3.org/2000/svg" style="display: inline-block; vertical-align: middle; margin-right: 6px;" width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="2" y="2" width="11" height="10" fill="white"/><path d="M1 1V13H13V1H1ZM11 11H9V5H7V11H3V3H11V11Z" fill="#E53935"/></svg> npm]
npm install @signality/core
```

```bash [<svg xmlns="http://www.w3.org/2000/svg" style="display: inline-block; vertical-align: middle; margin-right: 6px;" width="14" height="14" viewBox="0 0 16 16" fill="none"> <path d="M1 11H5V15H1V11ZM6 11H10V15H6V11ZM11 11H15V15H11V11ZM6 6H10V10H6V6Z" fill="#4E4E4E"/><path d="M1 1H5V5H1V1ZM6 1H10V5H6V1ZM11 1H15V5H11V1ZM11 6H15V10H11V6Z" fill="#FFB300"/></svg> pnpm]
pnpm add @signality/core
```

```bash [<svg xmlns="http://www.w3.org/2000/svg" style="display: inline-block; vertical-align: middle; margin-right: 6px;" width="15" height="15" viewBox="0 0 14 14" fill="none"><path d="M12.0639 10.4864C11.4699 10.6199 10.9107 10.8772 10.4228 11.2415C9.66836 11.714 8.85352 12.0825 8.0004 12.337C7.89581 12.4586 7.7515 12.5392 7.59309 12.5645C6.70681 12.6907 5.81456 12.7707 4.91997 12.8042C4.43784 12.8077 4.14253 12.6809 4.06028 12.4827C4.02645 12.4028 4.0089 12.3169 4.00867 12.2302C4.00845 12.1434 4.02554 12.0575 4.05895 11.9774C4.09236 11.8974 4.14142 11.8248 4.20326 11.7639C4.26509 11.703 4.33844 11.6551 4.41903 11.623C4.34388 11.5767 4.27275 11.5241 4.2064 11.4659C4.13509 11.3951 4.06028 11.2529 4.03797 11.3054C3.94478 11.5329 3.89622 12.0902 3.64553 12.3405C3.30165 12.6883 2.65109 12.5724 2.26609 12.3707C1.8439 12.1462 2.29628 11.6191 2.29628 11.6191C2.26012 11.6375 2.2206 11.6485 2.18008 11.6514C2.13957 11.6542 2.0989 11.6489 2.0605 11.6357C2.0221 11.6224 1.98677 11.6016 1.95662 11.5744C1.92647 11.5472 1.90212 11.5141 1.88503 11.4773C1.66511 11.1097 1.56824 10.6814 1.60853 10.2549C1.71838 9.78493 1.97487 9.36205 2.3409 9.04743C2.28342 8.42619 2.37708 7.80026 2.6139 7.22305C2.92658 6.6214 3.37614 6.10155 3.9264 5.70537C3.9264 5.70537 3.12184 4.81987 3.42109 4.01574C3.61534 3.49249 3.69365 3.49643 3.75753 3.47368C3.9831 3.40421 4.18917 3.28267 4.35909 3.11887C4.58798 2.86743 4.87242 2.67293 5.18977 2.55087C5.50712 2.42881 5.84859 2.38256 6.18697 2.4158C6.18697 2.4158 6.66559 0.947117 7.11447 1.23455C7.36136 1.61374 7.57395 2.01418 7.74972 2.43112C7.74972 2.43112 8.2804 2.12049 8.34034 2.23643C8.64556 3.04754 8.72051 3.92725 8.5569 4.7783C8.36406 5.59484 7.99692 6.36002 7.48065 7.02137C7.42422 7.11499 8.12378 7.4103 8.56434 8.63268C8.97209 9.75005 8.6094 10.6885 8.67284 10.7931C8.68422 10.8119 8.68772 10.8193 8.68772 10.8193C8.68772 10.8193 9.15497 10.8565 10.0934 10.2768C10.6123 9.89762 11.225 9.66765 11.8653 9.6118C11.9795 9.59024 12.0976 9.61382 12.1948 9.6776C12.292 9.74137 12.3607 9.84036 12.3863 9.95373C12.412 10.0671 12.3927 10.186 12.3325 10.2854C12.2723 10.3849 12.1758 10.457 12.0635 10.4868L12.0639 10.4864Z" fill="#0288D1"/></svg> yarn]
yarn add @signality/core
```

:::

## Quick start

Once installed, you can import and use any utility from the library:

```angular-ts
import { Component, effect } from '@angular/core';
import { storage, speechSynthesis, favicon } from '@signality/core';

@Component({
  template: `
    <input [(ngModel)]="value" />
    <button (click)="synthesis.speak(value())">Speak</button>
  `,
})
export class Demo {
  readonly value = storage('key', 'Hi, Angular!'); // Web Storage API
  readonly synthesis = speechSynthesis(); // Web Speech API
  readonly fav = favicon(); // Dynamic Favicon

  constructor() {
    effect(() => {
      if (this.synthesis.isSpeaking()) {
        this.fav.setEmoji('🔊');
      } else {
        this.fav.reset();
      }
    });
  }
}
```

## What's next?

- Browse [All Utilities](/catalog) in one searchable index
- Learn the [Key Concepts](/guide/key-concepts): Signal-First Design, MaybeSignal, WithInjector, and more
- Explore [Browser Utilities](/browser/battery): Battery, Fullscreen, Clipboard, and more
- Check out [Reactivity](/reactivity/debounced): Debounced, Throttled signals
