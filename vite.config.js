import { rmSync } from 'node:fs'
import { join, resolve } from 'path'
import { defineConfig } from 'vite'

// Plugins
import vue from '@vitejs/plugin-vue2'
import electron from 'vite-plugin-electron'
import eslintPlugin from 'vite-plugin-eslint'
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
      '@': resolve(__dirname, 'src'),
      crypto: 'crypto-browserify',
      events: 'events/',
      path: 'path-browserify',
      process: 'process/browser',
      stream: 'stream-browserify',
      util: 'util/'
    }
  },
  root: join(__dirname),
  publicDir: 'public',
  plugins: [
    alias(),
    vue(),
    eslintPlugin(),
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
    ])
  ],
  server,
  clearScreen: false
})
