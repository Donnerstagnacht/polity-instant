// app.config.ts
import { defineConfig } from '@tanstack/react-start/config';
import tsConfigPaths from 'vite-tsconfig-paths';
import tailwindcss from '@tailwindcss/vite';
var app_config_default = defineConfig({
  tsr: {
    routesDirectory: './src/routes',
    generatedRouteTree: './src/routeTree.gen.ts',
  },
  vite: {
    plugins: [tsConfigPaths(), tailwindcss()],
    css: {
      devSourcemap: true,
    },
    build: {
      cssCodeSplit: false,
    },
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'react/jsx-dev-runtime',
        'react-dom/client',
      ],
    },
  },
});
export { app_config_default as default };
