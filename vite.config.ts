import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { readdirSync, readFileSync } from 'node:fs';
import { Scanner } from '@tailwindcss/oxide';
import {defineConfig} from 'vite';

// The WASI scanner cannot discover files on Windows drive paths when native
// addons are blocked. Read sources with Node and use its content scanner.
function tailwindWindowsSources() {
  const root = path.resolve(import.meta.dirname, 'src');
  const cssFile = path.join(root, 'index.css');
  const sources = (dir: string): string[] => readdirSync(dir, { withFileTypes: true })
    .flatMap(entry => entry.isDirectory() ? sources(path.join(dir, entry.name))
      : /\.(tsx?|html)$/.test(entry.name) ? [path.join(dir, entry.name)] : []);
  return {
    name: 'tailwind-windows-sources',
    enforce: 'pre' as const,
    transform(code: string, id: string) {
      if (process.platform !== 'win32' || path.resolve(id.split('?')[0]) !== cssFile) return;
      const files = [...sources(root), path.resolve(import.meta.dirname, 'index.html')];
      const scanner = new Scanner({ sources: [] });
      const candidates = scanner.scanFiles(files.map(file => ({ content: readFileSync(file, 'utf8'), extension: path.extname(file).slice(1) })));
      return `${code}\n@source inline(${JSON.stringify(candidates.join(' '))});`;
    },
    handleHotUpdate(ctx: import('vite').HmrContext) {
      if (process.platform !== 'win32' || !/\.(tsx?|html)$/.test(ctx.file)) return;
      const modules = ctx.server.moduleGraph.getModulesByFile(cssFile);
      if (!modules) return;
      for (const module of modules) ctx.server.moduleGraph.invalidateModule(module);
      return [...ctx.modules, ...modules];
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [tailwindWindowsSources(), react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        'next-themes': path.resolve(__dirname, './src/lib/next-themes.tsx'),
        'next/link': path.resolve(__dirname, './src/lib/next-link.tsx'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
