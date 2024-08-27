import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  ignoreDeadLinks: true,
  title: "PanVA",
  description: "Documentation for PanVA",
  base: '/PanVA/',
  lastUpdated: true,
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    outline: [2, 3], // This includes both second-level (##) and third-level (###) headings.
    // logo: '/vitepress-logo-mini.svg',
    search: {
      provider: 'local'
    },
    nav: [
      { text: 'Installation', link: '/v0.0.0/install' },
      { text: 'Demos', link: '/v0.0.0/demos' },
      {
        text: 'Versions',
        items: [
          { text: '0.0.0 (latest)', link: '/v0.0.0/install' },
        ]
      }
    ],

    sidebar: {
      // This sidebar gets displayed when a user
      // is on `v0.0.0` directory.
      '/v0.0.0/': [
        {
              text: 'Getting Started',
              collapsed: false,
              items: [
                { text: 'Introduction', link: '/v0.0.0/introduction' },
                { text: 'Technical test', link: '/v0.0.0/technical-test' },
                { text: 'Installation', link: '/v0.0.0/install' }
              ],

            },
            {
              text: 'Demos', link: '/v0.0.0/demos'
            },
            {
              text: 'User Guide',
              collapsed: false,
              items: [
                { text: 'Data format reference', link: '/v0.0.0/data-format',
                  items: [
                  { text: 'Homology', link: '/v0.0.0/data-format-homology'}
                ]
                },
                { text: 'Configuration', link: '/v0.0.0/config',
                items: [
                  { text: 'Example config', link: '/v0.0.0/config#example-config'}
                ]

                },

                // { text: 'Server setup', link: '/v0.0.0/server-config' },

              ],

            },
            // {
            //   text: 'Tutorials',
            //   collapsed: false,
            //   items: [
            //     { text: 'Part 1. Technical Test Yeast', link: '/v0.0.0/tutorial-pt1-yeast' },
            //     { text: 'Part 2. DIY', link: '/v0.0.0/tutorial-pt2-diy' },
            //     { text: 'PanTools', link: '/v0.0.0/tutorial-pantools' }
            //   ],

            // },
            {
              text: 'Development guide',
              collapsed: true,
              items: [
                { text: 'Development Install', link: 'v0.0.0/dev-setup' },
                { text: 'Example Server Setup', link: 'v0.0.0/server-setup' },
              ]
            }


      ],

      // This sidebar gets displayed when a user
      // is on `v0.0.x` directory.
      '/v0.0.1/': [
       
      ],
    }
  ,

    socialLinks: [
      { icon: 'github', link: 'https://github.com/PanBrowse/PanVA' }
    ],
    footer: {
      message: 'Released under the GPL-3 License. Docs built with <a href="https://vitepress.dev">VitePress</a>.',
      copyright: 'Copyright © 2024-present, PanVA team, Wageningen University & Eindhoven University of Technology.'
    }
  }
})
