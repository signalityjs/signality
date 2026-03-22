import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { DEMO_ROUTES } from './demo-routes';

@Component({
  selector: 'app-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <nav class="sidebar">
      <div class="sidebar-header">
        <a class="logo-link" routerLink="/">
          <svg
            class="logo-icon"
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 22 22"
            fill="none"
          >
            <path
              d="M20.9839 8.88574C22.0992 9.99024 22.1078 11.7899 21.0034 12.9053L13.7993 20.1787C12.255 21.738 9.73959 21.7503 8.18018 20.2061L17.0034 10.8857L11.7095 9.25488L14.7681 2.73047L20.9839 8.88574ZM8.20361 1.82422C9.74796 0.264877 12.2643 0.252601 13.8237 1.79688L4.99951 11.1172L10.2944 12.748L7.23486 19.2725L1.02002 13.1172C-0.0953976 12.0126 -0.104152 10.213 1.00049 9.09766L8.20361 1.82422Z"
              fill="url(#paint0_linear_demos)"
            />
            <path
              d="M20.9834 8.88574C22.0988 9.99033 22.1076 11.7899 21.0029 12.9053L13.7998 20.1787C12.2555 21.7381 9.7391 21.7503 8.17969 20.2061L17.0029 10.8857L11.709 9.25488L14.7686 2.73047L20.9834 8.88574ZM8.2041 1.82422C9.74845 0.264877 12.2638 0.252601 13.8232 1.79688L5 11.1172L10.2939 12.748L7.23535 19.2725L1.01953 13.1172C-0.0958138 12.0127 -0.104425 10.213 1 9.09766L8.2041 1.82422Z"
              fill="url(#paint1_linear_demos)"
            />
            <defs>
              <linearGradient
                id="paint0_linear_demos"
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
                id="paint1_linear_demos"
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
          <span class="logo-text">signality</span>
          <span class="logo-badge">demos</span>
        </a>
      </div>
      <ul>
        @for (route of routes; track route.path) {
        <li>
          <a [routerLink]="route.path" routerLinkActive="active">
            {{ route.title }}
          </a>
        </li>
        }
      </ul>
    </nav>
    <main class="content">
      <div class="info-banner">
        <p>
          This project lets you test Signality utilities in the browser by creating demo components.
          Each demo can also be embedded in documentation <code>.md</code> files.
        </p>
      </div>
      <router-outlet />
    </main>
  `,
  styles: `
    :host {
      display: flex;
      height: 100vh;
      font-family: 'Inter', system-ui, sans-serif;
    }

    .sidebar {
      width: 240px;
      min-width: 240px;
      background: #0F0F11;
      border-right: 1px solid #232125;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
    }

    .sidebar::-webkit-scrollbar {
      width: 4px;
    }

    .sidebar::-webkit-scrollbar-thumb {
      background: #232327;
      border-radius: 4px;
    }

    .sidebar::-webkit-scrollbar-thumb:hover {
      background: #2B2B30;
    }

    .sidebar::-webkit-scrollbar-track {
      background: transparent;
    }

    .sidebar-header {
      position: sticky;
      top: 0;
      z-index: 1;
      padding: 1.25rem 1rem;
      border-bottom: 1px solid #1F1F24;
      background: #0F0F11;
    }

    .logo-link {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      text-decoration: none;
    }

    .logo-icon {
      filter: drop-shadow(0 0 12px rgba(151, 23, 231, 0.8)) brightness(1.25);
      flex-shrink: 0;
    }

    .logo-text {
      font-family: 'Poppins', sans-serif;
      font-size: 1.2rem;
      font-weight: 500;
      color: #EEE;
    }

    .logo-badge {
      font-size: 0.625rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #DEB3EB;
      background: rgba(222, 179, 235, 0.12);
      border: 1px solid rgba(222, 179, 235, 0.25);
      border-radius: 4px;
      padding: 0.125rem 0.375rem;
      line-height: 1;
      margin-top: 1px;
    }

    ul {
      list-style: none;
      margin: 0;
      padding: 0.5rem 0;
    }

    li a {
      display: block;
      padding: 0.5rem 1rem;
      color: #A0A0A5;
      text-decoration: none;
      font-size: 0.875rem;
      transition: color 0.15s;

      &:hover {
        color: #E0E0E5;
      }

      &.active {
        color: #DEB3EB;
      }
    }

    .content {
      flex: 1;
      overflow-y: auto;
      padding: 2rem;
    }

    .info-banner {
      margin-bottom: 1.5rem;
      padding: 0.875rem 1rem;
      border: 1px solid rgba(222, 179, 235, 0.2);
      border-radius: 8px;
      background: rgba(222, 179, 235, 0.05);

      p {
        margin: 0;
        font-size: 0.8125rem;
        line-height: 1.5;
        color: #A0A0A5;
      }

      code {
        padding: 0.125rem 0.375rem;
        border-radius: 4px;
        background: rgba(255, 255, 255, 0.08);
        font-size: 0.75rem;
        color: #DEB3EB;
      }
    }
  `,
})
export class Layout {
  readonly routes = DEMO_ROUTES;
}
