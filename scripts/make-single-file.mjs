// Bundle dist/ into one self-contained HTML file that runs from file://
// Output: dist/manabi-quest.html
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';

const html = readFileSync('dist/index.html', 'utf8');
const asset = readdirSync('dist/assets').find((f) => f.endsWith('.js'));
const js = readFileSync(`dist/assets/${asset}`, 'utf8');

const out = html
  .replace(/<script type="module"[^>]*><\/script>/, () =>
    `<script type="module">\n${js}\n</script>`,
  )
  .replace(/<link rel="modulepreload"[^>]*>/g, '');

writeFileSync('dist/manabi-quest.html', out, 'utf8');
console.log(`dist/manabi-quest.html written (${Math.round(out.length / 1024)} kB)`);
