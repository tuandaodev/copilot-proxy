import { defineConfig } from '@solidjs/start/config';
import tailwindcss from '@tailwindcss/vite';

import pkg from './package.json';

export default defineConfig({
  vite: {
    define: {
      __APP_VERSION__: JSON.stringify(pkg.version),
    },
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': '/src',
      },
    },
  },
  server: {
    esbuild: {
      options: {
        supported: {
          'top-level-await': true,
        },
      },
    },
  },
});
