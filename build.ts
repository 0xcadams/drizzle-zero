import * as tsup from 'tsup';

const main = async () => {
  await tsup.build({
    outDir: './dist',
    splitting: false,
    dts: true,
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    external: [
      'esbuild',
      'tsx',
      'prettier',
      'typescript',
      '@rocicorp/zero',
      'drizzle-orm',
      'commander',
      'ts-morph',
    ],
  });

  await tsup.build({
    outDir: './dist/cli',
    splitting: false,
    entry: ['src/cli/index.ts'],
    format: ['esm'],
    banner: {
      js: `#!/usr/bin/env node`,
    },
    target: 'node16',
    platform: 'node',
    external: [
      'esbuild',
      'tsx',
      'prettier',
      'typescript',
      '@rocicorp/zero',
      'drizzle-orm',
    ],
  });
};

main().catch(e => {
  console.error(e);
  process.exit(1);
});
