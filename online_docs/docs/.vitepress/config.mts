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
    search: {
      provider: 'local'
    },
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Installation', link: '/v0.0.0/install' },
      { text: 'Demos', link: '/demos' },
      { text: 'Tutorials', link: '/v0.0.0/tutorials' },
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
                { text: 'Installation', link: '/v0.0.0/install' },
              ],

            },
            {
              text: 'User Guide',
              collapsed: false,
              items: [
                { text: 'Data Format Reference', link: '/v0.0.0/data-format',
                  items: [
                  { text: 'Homology', link: '/v0.0.0/data-format-homology'}
                ]
                },
                { text: 'Configuration', link: '/v0.0.0/config',
                items: [
                  { text: 'Example config', link: '/v0.0.0/config#example-config'}
                ]

                },

                { text: 'Server setup', link: '/v0.0.0/server-config' },

              ],

            },
            {
              text: 'Demos & Tutorials',
              collapsed: false,
              items: [
                { text: 'Yeast', link: '/v0.0.0/yeast-tutorial' },
                { text: 'Pectobacterium', link: '/v0.0.0/pecto-tutorial' },
                { text: 'Arabidopsis', link: '/v0.0.0/ara-tutorial' },
                { text: 'PanTools', link: '/pantools' }
              ],

            },

                { text: 'Development Guide', link: 'v0.0.0/dev-setup' },



      ],

      // This sidebar gets displayed when a user
      // is on `v0.0.x` directory.
      '/v0.0.1/': [
        {
              text: 'Getting Started',
              collapsed: false,
              items: [
                { text: 'Installation', link: '/installation' },
                { text: '...', link: '/api-examples' }
              ],

            },
            {
              text: 'User Guide',
              collapsed: false,
              items: [
                { text: 'Data Format Reference', link: '/data-format',
                  items: [
                    { text: 'Data Format Reference', link: '/data-format-homology'}
                  ]
                },
              ],

            },
            {
              text: 'Examples',
              collapsed: false,
              items: [
                { text: 'Configuration', link: '/config' },
                { text: 'Server setup', link: '/server-config' },
                { text: 'Demos', link: '/demos' }

              ],

            },
            {
              text: 'Tutorials',
              collapsed: false,
              items: [
                { text: 'Yeast', link: '/yeast-tutorial' },
                { text: 'Pectobacterium', link: '/pecto-tutorial' },
                { text: 'Arabidopsis', link: '/ara-tutorial' },
                { text: 'PanTools', link: '/pantools' }
              ],

            }
      ],
    }
  ,

    socialLinks: [
      { icon: 'github', link: 'https://github.com/PanBrowse/PanVA' }
    ],
    footer: {
      message: 'Released under the XXX License. Docs built with <a href="https://vitepress.dev">VitePress</a>.',
      copyright: 'Copyright © 2024-present, PanVA team, Wageningen University & Eindhoven University of Technology.'
    }
  }
})
