import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build, context, transform } from 'esbuild';

const [mode, flag, ...extra] = process.argv.slice(2);
const check = mode === 'check';
const channel = check ? flag ?? 'testing' : mode;
const testing = channel === 'testing';
const watch = testing && flag === '--watch' && !check;
const install = channel === 'stable' && flag === '--install';

if (extra.length || !['testing', 'stable'].includes(channel) || (!check && flag && !watch && !install)) {
    throw new Error('Usage: build.mjs testing [--watch] | stable [--install] | check [testing|stable]');
}

const root = fileURLToPath(new URL('../', import.meta.url));
const { name, version, description, author, repository, userscript } = JSON.parse(
    await readFile(resolve(root, 'package.json'), 'utf8')
);
const filename = name + '.user.js';
const branch = testing ? 'testing' : 'main';
const namespace = repository.url.replace(/\.git$/, '');
const slug = new URL(namespace).pathname.slice(1);
const updateUrl = 'https://raw.githubusercontent.com/' + slug + '/' + branch + '/' + filename;
const matches = ['pornstarharem', 'hentaiheroes', 'comixharem', 'mangarpg', 'amouragent'];
const metadata = [
    ['name', userscript.name + (testing ? ' (Dev)' : '')],
    ['version', version],
    ['description', description],
    ['author', author],
    ...matches.map(domain => ['match', 'https://*.' + domain + '.com/*']),
    ['run-at', userscript.runAt],
    ['namespace', namespace + (testing ? '/testing' : '')],
    ['downloadURL', updateUrl],
    ['updateURL', updateUrl],
    ['icon', 'https://www.google.com/s2/favicons?sz=64&domain=hentaiheroes.com'],
    ['grant', 'none']
];

const minifyCss = {
    name: 'minify-css',
    setup(builder) {
        builder.onLoad({ filter: /\.css$/ }, async ({ path }) => {
            const css = await readFile(path, 'utf8');
            const { code, warnings } = await transform(css, { loader: 'css', minify: true, legalComments: 'none' });
            return { contents: code.trim(), loader: 'text', resolveDir: dirname(path), warnings };
        });
    }
};

const output = testing || install || check ? filename : 'dist/' + filename;
const options = {
    absWorkingDir: root,
    entryPoints: ['src/index.ts'],
    outfile: output,
    write: !check,
    bundle: true,
    format: 'iife',
    platform: 'browser',
    target: 'es2022',
    charset: 'utf8',
    treeShaking: true,
    minify: !testing,
    legalComments: 'none',
    sourcemap: testing ? 'inline' : false,
    loader: { '.css': 'text' },
    plugins: testing ? [] : [minifyCss],
    define: {
        USERSCRIPT_VERSION: JSON.stringify(version)
    },
    banner: {
        js: [
            '// ==UserScript==',
            ...metadata.map(([key, value]) => '// ' + ('@' + key).padEnd(16) + value),
            '// ==/UserScript==',
            '',
            '"use strict";'
        ].join('\n')
    }
};

if (watch) {
    const watcher = await context(options);
    await watcher.watch();
    console.log('Watching src/ for the testing build');
} else {
    const result = await build(options);
    if (check) {
        const current = await readFile(resolve(root, output), 'utf8');
        if (current !== result.outputFiles[0].text) {
            const command = testing ? 'npm run build:testing' : 'npm run build:release';
            throw new Error(output + ' is out of date. Rebuild with ' + command);
        }
    }
    console.log((check ? 'Verified ' : 'Built ') + output + ' (' + channel + ')');
}
