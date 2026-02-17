import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'jeonse-check-app',
  brand: {
    displayName: '전세사기 체크리스트',
    primaryColor: '#3182F6',
    icon: '',
  },
  web: {
    host: 'localhost',
    port: 5173,
    commands: {
      dev: 'vite',
      build: 'vite build',
    },
  },
  permissions: [],
});
