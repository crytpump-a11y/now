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
        default-src 'self' https://kaovqtczflglzsnlnlld.supabase.co;
        connect-src 'self' https://kaovqtczflglzsnlnlld.supabase.co wss://kaovqtczflglzsnlnlld.supabase.co;
        script-src 'self' 'unsafe-inline' 'unsafe-eval' https://kaovqtczflglzsnlnlld.supabase.co;
        style-src 'self' 'unsafe-inline' https://kaovqtczflglzsnlnlld.supabase.co;
        img-src 'self' data: https://kaovqtczflglzsnlnlld.supabase.co;
        font-src 'self' data: https://kaovqtczflglzsnlnlld.supabase.co;
        frame-src 'self' https://kaovqtczflglzsnlnlld.supabase.co;
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
