import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        project1: resolve(__dirname, 'project1.html'),
        project2: resolve(__dirname, 'project2.html'),
        project3: resolve(__dirname, 'project3.html'),
        project4: resolve(__dirname, 'project4.html'),
      }
    }
  }
});