import type * as Preset from '@docusaurus/preset-classic';
import type { Config } from '@docusaurus/types';
import { themes as prismThemes } from 'prism-react-renderer';

const config: Config = {
  title: 'De-frost',
  tagline: 'Track and optimize your android app\'s frozen frames with ease.',
  favicon: 'img/favicon.svg',

  future: {
    v4: true,
  },

  url: 'https://deFrost.dreamsportslabs.com',
  baseUrl: '/',

  organizationName: 'ds-horizon',
  projectName: 'deFrost',

  onBrokenLinks: 'throw',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: 'docs',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
        gtag: {
          trackingID: 'G-18C3S8YBVE',
          anonymizeIP: true,
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/banner.png',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'De-frost',
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'Documentation',
        },
        {
          href: 'https://github.com/ds-horizon/deFrost',
          label: 'GitHub',
          position: 'right',
        },
        {
          href: 'https://discord.gg/xYP8EZ9U',
          label: 'Discord',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Quick Start',
              to: '/docs/project/quick-start',
            },
            {
              label: 'Setup Guide',
              to: '/docs/project/setup',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Discord',
              href: 'https://discord.gg/xYP8EZ9U',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/ds-horizon/deFrost',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'Introduction',
              to: '/docs/project/introduction',
            },
            {
              label: 'Dashboard',
              to: '/docs/dashboard/overview',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} De-frost. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
