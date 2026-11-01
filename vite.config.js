import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  base: './', // Use relative base path so it deploys seamlessly to GitHub Pages, Vercel, Netlify, or any static host
  server: {
    host: true,
    port: 5173
  }
});
