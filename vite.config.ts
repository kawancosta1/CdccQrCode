import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  base: '/CdccQrCode/',
  plugins: [react()],
  server: {
    watch: {
      usePolling: true,
    },
  },
})
