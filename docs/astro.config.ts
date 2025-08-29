// @ts-check
import starlight from '@astrojs/starlight';

import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

import { defineConfig } from 'astro/config';

const SITE = 'https://deFrost.dreamsportslabs.com';

// https://astro.build/config
export default defineConfig({
  site: SITE,
  output: 'static',
  integrations: [
    starlight({
      title: 'De-frost',
      pagination: true,
      titleDelimiter: '/',
      description:
        'Track and optimize your android app’s frozen frames with ease.',
      logo: {
        dark: './src/assets/logo-dark.svg',
        light: './src/assets/logo-light.svg',
        alt: 'Defrost Logo',
        replacesTitle: true,
      },
      social: {
        github: 'https://github.com/dream-sports-labs/deFrost',
        discord: 'https://discord.gg/xYP8EZ9U',
      },
      sidebar: [
        {
          label: 'Project',
          autogenerate: { directory: 'project' },
        },
        {
          label: 'Dashboard',
          items: [
            'dashboard/overview',
            'dashboard/android-frames',
            'dashboard/react-commits',
            'dashboard/how-to-use',
          ],
        },
        {
          label: 'CLI',
          items: ['cli/create-build', 'cli/record', 'cli/visualization'],
        },
        {
          label: 'Guides',
          autogenerate: { directory: 'guides' },
        },
      ],
      customCss: ['./src/tailwind.css', '@fontsource-variable/inter'],
      components: {
        Head: './src/overrides/head.astro',
      },
    }),
    tailwind({ applyBaseStyles: false }),
    react(),
  ],
});
