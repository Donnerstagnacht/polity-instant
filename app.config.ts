import { defineConfig } from '@tanstack/react-start/config';
import tsConfigPaths from 'vite-tsconfig-paths';
import tailwindcss from '@tailwindcss/vite';
import { loadEnv } from 'vite';

// Load ALL env vars (not just VITE_*) into process.env for server-side access
Object.assign(process.env, loadEnv(process.env.NODE_ENV || 'development', process.cwd(), ''));

export default defineConfig({
  tsr: {
    routesDirectory: './src/routes',
    generatedRouteTree: './src/routeTree.gen.ts',
  },
  vite: {
    plugins: [tsConfigPaths(), tailwindcss()],
    ssr: {
      noExternal: ['zustand'],
    },
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
