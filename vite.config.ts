import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { inspectAttr } from 'kimi-plugin-inspect-react'

// https://vite.dev/config/
export default defineConfig({
  // Must be absolute, not relative ('./'): react-router deep-links (e.g.
  // /dashboard) get rewritten to index.html by vercel.json, and a relative
  // asset path resolves against that URL's own path, not the site root —
  // breaking every route except '/'.
  base: '/',
  plugins: [inspectAttr(), react()],
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
