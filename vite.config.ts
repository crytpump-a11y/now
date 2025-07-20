import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    hmr: {
      port: 5173
    },
    headers: {
      'Content-Security-Policy': `
        default-src 'self' https://kaovqtczflglzsnlnlld.supabase.co https://nobetci-eczaneler-api-turkiye.p.rapidapi.com;
        connect-src 'self' https://kaovqtczflglzsnlnlld.supabase.co wss://kaovqtczflglzsnlnlld.supabase.co https://nobetci-eczaneler-api-turkiye.p.rapidapi.com https://rapidapi.com;
        script-src 'self' 'unsafe-inline' 'unsafe-eval' https://kaovqtczflglzsnlnlld.supabase.co https://nobetci-eczaneler-api-turkiye.p.rapidapi.com https://rapidapi.com;
        style-src 'self' 'unsafe-inline' https://kaovqtczflglzsnlnlld.supabase.co https://nobetci-eczaneler-api-turkiye.p.rapidapi.com https://rapidapi.com;
        img-src 'self' data: https://kaovqtczflglzsnlnlld.supabase.co https://nobetci-eczaneler-api-turkiye.p.rapidapi.com https://rapidapi.com;
        font-src 'self' data: https://kaovqtczflglzsnlnlld.supabase.co https://nobetci-eczaneler-api-turkiye.p.rapidapi.com https://rapidapi.com;
        frame-src 'self' https://kaovqtczflglzsnlnlld.supabase.co https://nobetci-eczaneler-api-turkiye.p.rapidapi.com https://rapidapi.com;
        worker-src 'self' blob:;
        media-src 'self' data:;
        object-src 'none';
        base-uri 'self';
        form-action 'self';
        frame-ancestors 'none';
        block-all-mixed-content;
      `.replace(/\s+/g, ' ').trim()
    }
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});