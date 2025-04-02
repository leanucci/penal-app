import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // This ensures JSX is processed in both .jsx and .js files
      include: "**/*.{jsx,js}",
    }),
  ],
  resolve: {
    extensions: ['.js', '.jsx', '.json']
  }
})