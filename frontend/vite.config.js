import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  preview: {
    port: process.env.PORT || 5000,
    host: true,
    allowedHosts: ['smartlearn-nct9.onrender.com']
  }
})