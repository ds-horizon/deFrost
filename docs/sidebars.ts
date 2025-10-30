import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docsSidebar: [
    {
      type: 'category',
      label: 'Project',
      items: [
        'project/introduction',
        'project/quick-start',
        'project/setup',
      ],
    },
    {
      type: 'category',
      label: 'Dashboard',
      items: [
        'dashboard/overview',
        'dashboard/android-frames',
        'dashboard/react-commits',
        'dashboard/how-to-use',
      ],
    },
    {
      type: 'category',
      label: 'CLI',
      items: [
        'cli/create-build',
        'cli/record',
        'cli/visualization',
      ],
    },
    {
      type: 'category',
      label: 'Guides',
      items: [
        'guides/detailed-workflow',
      ],
    },
  ],
};

export default sidebars;
