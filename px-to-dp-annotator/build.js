const esbuild = require('esbuild');
const fs = require('fs');

(async () => {
  await esbuild.build({
    entryPoints: ['src/main.ts'],
    outfile: 'dist/main.js',
    bundle: true,
    format: 'cjs',
    platform: 'browser',
    target: ['es2018'],
    external: [],
  });
  fs.mkdirSync('dist', { recursive: true });
  fs.copyFileSync('src/ui.html', 'dist/ui.html');
  console.log('build ok');
})();