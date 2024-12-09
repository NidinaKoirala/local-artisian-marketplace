import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/configs/
export default defineConfig({
  plugins: [react()],
  base: 'local-artisian-marketplace',
});
