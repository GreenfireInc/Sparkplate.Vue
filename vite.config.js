import { rmSync } from 'node:fs'
import { join, resolve } from 'path'
import { defineConfig } from 'vite'

// Plugins
import vue from '@vitejs/plugin-vue2'
import electron from 'vite-plugin-electron'
import renderer from 'vite-plugin-electron-renderer'
import eslint from 'vite-plugin-eslint'
import pkg from './package.json'
import alias from '@rollup/plugin-alias'

rmSync('dist', { recursive: true, force: true })

const isDevelopment =
  process.env.NODE_ENV === 'development' || !!process.env.VSCODE_DEBUG
const isProduction = process.env.NODE_ENV === 'production'

const url = new URL(pkg.debug.env.VITE_DEV_SERVER_URL)
const server = isDevelopment
  ? {
      host: url.hostname,
      port: +url.port
    }
  : undefined

// https://vitejs.dev/config/
export default defineConfig({
  envPrefix: 'VITE_',
  resolve: {
    alias: {
      '@': '/src',
      crypto: 'crypto-browserify',
      stream: 'stream-browserify',
      assert: 'assert',
      http: 'stream-http',
      https: 'https-browserify',
      os: 'os-browserify/browser',
      url: 'url',
      buffer: 'buffer',
      process: 'process/browser',
      util: 'util',
      events: 'events',
      path: 'path-browserify',
      string_decoder: 'string_decoder',
      punycode: 'punycode'
    },
    dedupe: ['vue']
  },
  define: {
    'process.env': {},
    global: 'globalThis'
  },
  root: join(__dirname),
  publicDir: 'public',
  plugins: [
    alias(),
    vue(),
    electron([
      {
        // Main-Process entry file of the Electron App.
        entry: 'background/index.js',
        onstart(options) {
          if (process.env.VSCODE_DEBUG) {
            console.log(
              /* For `.vscode/.debug.script.mjs` */ '[startup] Electron App'
            )
          } else {
            options.startup()
          }
        },
        vite: {
          build: {
            ssr: true,
            sourcemap: isDevelopment,
            minify: isProduction,
            outDir: 'dist/background',
            lib: {
              entry: 'background/index.js',
              formats: ['cjs']
            },
            rollupOptions: {
              external: Object.keys(
                'dependencies' in pkg ? pkg.dependencies : {}
              ),
              output: {
                entryFileNames: '[name].cjs'
              }
            }
          }
        }
      },
      {
        entry: 'background/preload.js',
        onstart(options) {
          // Notify the Renderer-Process to reload the page when the Preload-Scripts build is complete,
          // instead of restarting the entire Electron App.
          options.reload()
        },
        vite: {
          build: {
            sourcemap: isDevelopment,
            minify: isProduction,
            outDir: 'dist/preload',
            rollupOptions: {
              external: Object.keys(
                'dependencies' in pkg ? pkg.dependencies : {}
              )
            }
          }
        }
      }
    ]),
    renderer({
      nodeIntegration: true
    }),
    eslint()
  ],
  server,
  clearScreen: false,
  optimizeDeps: {
    include: [
      '@ensdomains/address-encoder',
      '@ensdomains/ensjs',
      'buffer',
      'process',
      'events',
      'string_decoder',
      'punycode'
    ],
    esbuildOptions: {
      define: {
        global: 'globalThis'
      }
    }
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true
    },
    rollupOptions: {
      plugins: []
    }
  }
})
