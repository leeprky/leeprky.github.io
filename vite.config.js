import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

function dualModeRootHtmlPlugin() {
  return {
    name: 'dual-mode-root-html',
    transformIndexHtml: {
      order: 'pre',
      handler(html, ctx) {
        if (ctx.server) {
          return html
            .replace(/<link[^>]*id="prod-bundle-css"[^>]*>/g, '')
            .replace('./dist/assets/main.js', '/src/main.jsx');
        }
        return html;
      },
    },
  };
}

export default defineConfig({
  plugins: [dualModeRootHtmlPlugin(), react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    cssCodeSplit: false,
    rollupOptions: {
      input: './src/main.jsx',
      output: {
        entryFileNames: 'assets/main.js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: (assetInfo) => {
          const name = assetInfo.name || (assetInfo.names && assetInfo.names[0]) || '';
          if (name.endsWith('.css')) {
            return 'assets/main.css';
          }
          return 'assets/[name][extname]';
        },
      },
    },
  },
});
