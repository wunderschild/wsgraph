import react from '@vitejs/plugin-react';

import * as fs from 'fs';
import { isNil } from 'lodash-es';
import * as path from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import tsconfigPaths from 'vite-tsconfig-paths';

const ROOT_PATH = path.resolve(__dirname, 'src');
const PLUGINS_PATH = path.resolve(ROOT_PATH, 'plugins');

const getPluginIndex = (dir: string) => {
  const pathTs = path.resolve(dir, 'index.ts');

  if ((fs.statSync(pathTs)).isFile()) {
    return pathTs;
  }

  const pathTsx = path.resolve(dir, 'index.tsx');
  if ((fs.statSync(pathTsx)).isFile()) {
    return pathTsx;
  }

  return undefined;
};

const orNil = <T, R>(value: T | undefined, op: (value: T) => R): R | undefined => (
  isNil(value) ? undefined : op(value)
);

const buildPluginEntries = () => (
  Object.fromEntries(
    fs.readdirSync(PLUGINS_PATH)
      .map(it => path.resolve(PLUGINS_PATH, it))
      .map(it => [it, (fs.statSync(it)).isDirectory()] as const)
      .filter(([, val]) => val)
      .map(([dir]) => orNil(
        getPluginIndex(dir),
        index => [`plugins/${path.basename(dir)}`, index],
      ))
      .filter(it => !isNil(it)),
  )
);

console.log(buildPluginEntries());

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    dts({
      rollupTypes: true,
    }),
  ],
  css: {
    modules: {
      generateScopedName: 'wg-[local]--[hash:base49:12]',
    },
  },
  build: {
    lib: {
      entry: {
        'index': path.resolve(ROOT_PATH, 'index.ts'),
        ...buildPluginEntries(),
      },
      name: 'WSGraph',
    },
    rollupOptions: {
      external: ['react', 'react/jsx-runtime'],
      output: {
        globals: {
          react: 'react',
        },
      },
    },
  },
});
