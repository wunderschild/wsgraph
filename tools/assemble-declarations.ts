import * as fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { Extractor, ExtractorConfig, ExtractorResult } from '@microsoft/api-extractor';

const dirname = path.dirname(fileURLToPath(import.meta.url));

const ROOT_PATH = path.resolve(dirname, '..');
const DECL_PATH = path.resolve(ROOT_PATH, 'decl');
const DIST_PATH = path.resolve(ROOT_PATH, 'dist');

const PLUGINS_PATH = path.resolve(DECL_PATH, 'plugins');
const PLUGINS_DIST_PATH = path.resolve(DIST_PATH, 'plugins');

const MAIN_TYPEFILE_PATH = path.resolve(DIST_PATH, 'wsgraph.d.ts');

const exists = (file: string) => (
  fs.access(file, fs.constants.R_OK)
    .then(() => true)
    .catch(() => false)
);

const getPlugins = () => (
  fs.readdir(PLUGINS_PATH)
    .then(dir => dir.map(f => path.resolve(PLUGINS_PATH, f)))
    .then(dir => Promise.all(dir.map(async f => [f, await fs.stat(f)] as const)))
    .then(dir => dir.filter(([, stats]) => stats.isDirectory()))
    .then(dir => dir.map(([f]) => path.resolve(f, 'index.d.ts')))
    .then(dir => Promise.all(dir.map(async (f) => [f, await exists(f)] as const)))
    .then(dir => dir.filter(([, exists]) => exists))
    .then(dir => dir.map(([f]) => path.basename(path.dirname(f))))
);

const createExtractorConfig = (
  entrypoint: string,
  outputTo: string,
) => (
  ExtractorConfig.prepare({
    configObject: {
      'mainEntryPointFilePath': entrypoint,
      'compiler': {
        tsconfigFilePath: path.resolve(ROOT_PATH, 'tsconfig.d.json'),
      },
      'dtsRollup': {
        'enabled': true,
        untrimmedFilePath: outputTo,
      },
      projectFolder: ROOT_PATH,
    },
    configObjectFullPath: undefined,
    packageJsonFullPath: path.resolve(ROOT_PATH, 'package.json'),
  })
);

const configForIndex = () =>
  createExtractorConfig(
    path.resolve(DECL_PATH, 'index.d.ts'),
    path.resolve(DIST_PATH, 'index.d.ts'),
  );

const configForPlugin = (plugin: string) => createExtractorConfig(
  path.resolve(PLUGINS_PATH, plugin, 'index.d.ts'),
  path.resolve(PLUGINS_DIST_PATH, `${plugin}.d.ts`),
);

const rollupAllEntrypoints = (plugins: string[]) => {
  Extractor.invoke(configForIndex());

  for (const plugin of plugins) {
    Extractor.invoke(configForPlugin(plugin));
  }
};

const composeMainTypefile = (plugins: string[]) => {
  const refs = plugins.map(plugin => `/// <reference path='./plugins/${plugin}.d.ts' />`);

  return [
    '/// <reference path="./index.d.ts" />\n',
    ...refs,
  ].join('\n');
};

const main = async () => {
  const pluginList = await getPlugins();

  rollupAllEntrypoints(pluginList);

  await fs.writeFile(MAIN_TYPEFILE_PATH, composeMainTypefile(pluginList));
};

main()
  .catch(e => console.error(e));
