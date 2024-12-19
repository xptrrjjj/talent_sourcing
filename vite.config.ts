// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';

// // https://vitejs.dev/config/
// export default defineConfig({
//   plugins: [react()],
//   optimizeDeps: {
//     exclude: ['lucide-react'],
//   },
// });


import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'], // Exclude dependencies not needed during dev
  },
  build: {
    target: 'esnext', // Use modern JavaScript syntax
    outDir: 'dist', // Specify output directory for build files
    emptyOutDir: true, // Clear output directory before building
    minify: 'esbuild', // Minify the output for better performance
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name].[hash].[ext]', // Define asset output structure
        chunkFileNames: 'js/[name].[hash].js', // Define chunk output structure
        entryFileNames: 'js/[name].[hash].js', // Define entry point output structure
      },
    },
  },
  server: {
    open: true, // Automatically open the app in the browser during dev
    port: 443, // Specify a custom port for dev server
    host: '0.0.0.0', // Allow access from external devices
    https: {
      key: fs.readFileSync('/etc/letsencrypt/live/recruiter.2bv.io/privkey.pem'),
      cert: fs.readFileSync('/etc/letsencrypt/live/recruiter.2bv.io/fullchain.pem'),
    },
    headers: {
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains', // Forces HTTPS
    },
    // port: 5173, // Specify a custom port for dev server
    // host: 'localhost', // Allow access from external devices
  },
});
