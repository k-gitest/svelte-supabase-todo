import path, { resolve } from "path";
import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte()],
  resolve: {
    alias: {
      $lib: resolve(__dirname, "./src/lib"),
      $components: resolve(__dirname, "./src/components"),
      '@/': path.join(__dirname, './src/'),
    },
  },
  server: {
    host: true
  }
})
