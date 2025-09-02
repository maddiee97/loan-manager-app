// client/vite.config.js (Updated)
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path" // <-- Add this new import line

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Add this whole 'resolve' section below
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})