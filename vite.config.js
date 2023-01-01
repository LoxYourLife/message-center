import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import { quasar, transformAssetUrls } from '@quasar/vite-plugin';

module.exports = defineConfig(({ command, mode }) => {
  const isProduction = mode === 'production';
  return {
    base: isProduction ? '/admin/plugins/message_center' : '',
    root: 'app',
    write: false,
    plugins: [vue(), quasar({ sassVariables: 'app/quasar.extras.sass', autoImportComponentCase: 'combined' })],
    build: {
      outDir: path.resolve(__dirname, 'build'),
      assetsDir: 'assets',
      emptyOutDir: true,
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'app/build.html')
        },
        // make sure to externalize deps that shouldn't be bundled
        // into your library
        external: [],
        output: {
          // Provide global variables to use in the UMD build
          // for externalized deps
          globals: {
            vue: 'vue'
          }
        }
      }
    },
    server: {
      port: 9000,
      proxy: {
        '/admin/express/plugins/message_center': {
          target: 'http://localhost:3300/',
          changeOrigin: true
          //rewrite: (path) => console.log(path)
        }
      }
    }
  };
});
