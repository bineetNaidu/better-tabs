import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { copyFileSync, unlinkSync } from 'node:fs';

const root = fileURLToPath(new URL('.', import.meta.url));

function targetManifest(target: string) {
  return {
    name: 'target-manifest',
    writeBundle() {
      const out = resolve(root, 'dist', target);
      copyFileSync(
        resolve(out, target === 'chrome' ? 'manifest.chrome.json' : 'manifest.firefox.json'),
        resolve(out, 'manifest.json'),
      );
      unlinkSync(resolve(out, 'manifest.chrome.json'));
    },
  };
}

export default defineConfig(({ mode }) => {
  const target = mode === 'chrome' ? 'chrome' : 'firefox';
  return {
    plugins: [preact(), targetManifest(target)],
    publicDir: resolve(root, 'public'),
    build: {
      outDir: `dist/${target}`,
      emptyOutDir: true,
      rollupOptions: {
        input: {
          background: resolve(root, 'src/background.ts'),
          content: resolve(root, 'src/main.tsx'),
        },
        output: { entryFileNames: '[name].js', assetFileNames: '[name][extname]' },
      },
    },
  };
});
