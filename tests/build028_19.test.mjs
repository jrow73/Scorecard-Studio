import fs from 'node:fs';
const app = fs.readFileSync(new URL('../js/app.js', import.meta.url), 'utf8');
const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
if (!app.includes('function openNativeColorPicker(native, anchor)')) throw new Error('missing viewport-safe native color picker helper');
if (!app.includes('native.addEventListener("change"')) throw new Error('custom color must commit on change');
if (app.includes('native.addEventListener("input", () => { details.open = false')) throw new Error('premature input-event dismissal remains');
if (!/\.\/js\/app\.js\?v=028\.(?:19|2[0-9]|[3-9][0-9])/.test(html)) throw new Error('index cache key is older than Build 028.19');
console.log('Build 028.19 focused checks passed.');
