import { defineConfig } from 'vitepress';
import { demoblockPlugin } from 'vitepress-theme-demoblock';

export default defineConfig({
  title: 'typed-idb',
  description: 'typed-idb:集成示例',
  lang: 'zh-CN',
  themeConfig: {
    nav: [
      { text: '文档', link: '/api/', },
    ],
    sidebar: {
      '/': [
        {
          text: '使用指南',
          items: [
            { text: '介绍', link: '/home.md' }, // 修正相对路径
          ],
        },
      ],

    },
    socialLinks: [{ icon: 'github', link: 'https://github.com/chency7' }],
  },
  vite: {
    build: {
      chunkSizeWarningLimit: 6000,
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@import "./theme/custom.scss";`, // 修正路径
        },
      },
    },
  },
  markdown: {
    config: (md) => {
      md.use(demoblockPlugin);
    }
  }
});

