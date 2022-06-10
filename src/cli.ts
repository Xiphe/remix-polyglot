#!/usr/bin/env node

import type { CmplOptions, WtchOpts, Prcssr } from 'cmpl';
import { wtch, cmpl, cntntHsh } from 'cmpl';
import { resolve } from 'node:path';
import { generatePolyglotTypes, deepPartial } from 'typed-t';
import ts, { factory as f } from 'typescript';
import { writeFile } from 'node:fs/promises';
import minimist from 'minimist';
import {
  additionalPolyglotMembers,
  createBetterRemixPolyglotTypes,
  createImports,
  ucFirst,
} from './factories';

const defaults = {
  entry: './locales',
  outDir: './public/build/locales',
  manifest: './app/manifest-remix-polyglot.json',
  declaration: './remix-polyglot.env.d.ts',
};
const argv = minimist(process.argv.slice(2), {
  alias: {
    entry: 'e',
    mainLocale: ['l', 'main-locale'],
    outDir: ['o', 'out-dir'],
    declaration: 'd',
    manifest: 'm',
    watch: 'w',
    help: 'h',
    suffix: 's',
    prefix: 'p',
  },
  default: defaults,
});

if (argv.help) {
  console.log(
    [
      'compile-locales [options] <localesDir> <outDir>\n',
      'options:',
      `  --entry, -e        locales dir (default ${defaults.entry})`,
      `  --out-dir, -o      output dir (default ${defaults.outDir})`,
      `  --manifest, -m     manifest file location (default ${defaults.manifest})`,
      `  --declaration, -d  declaration file location (default ${defaults.declaration})`,
      `  --suffix, -s       interpolation suffix for polyglot`,
      `  --prefix, -p       interpolation prefix for polyglot`,
      `  --main-locale -l   which locale should be used for type generations`,
      '  --watch, -w        watch for changes in localesDir',
      '  --help, -h         display this message',
    ].join('\n'),
  );
  process.exit(0);
}
const entry = resolve(process.cwd(), argv.entry);
const outDir = resolve(process.cwd(), argv.outDir);
const manifestPath = resolve(process.cwd(), argv.manifest);
const declarationPath = resolve(process.cwd(), argv.declaration);

function ciError(message: string) {
  if (process.env.CI) {
    throw new Error(message);
  } else {
    console.error(`Warning: ${message}`);
  }
}

const declarations: Record<string, ts.Statement[]> = {};
const rename = cntntHsh(8);
let mainLocale = argv.mainLocale;

const processor: Prcssr = {
  rename,
  include(n, d) {
    if (d && n.includes('/')) {
      ciError(`Unexpected nested translation folder ${n}`);
      return false;
    }
    if (!d && !n.match(/\.json$/)) {
      ciError(`Unexpected language file ${n}`);
      return false;
    }
    return true;
  },
  outDir,
  transform(content, file) {
    const [locale, namespace] = file.replace(/\.json$/, '').split('/');
    const parsedContent = sortDeepByKey(JSON.parse(content.toString()), [
      `${file}#`,
    ]);
    if (typeof parsedContent === 'string') {
      throw new Error(`Unexpected string in ${file}`);
    }
    if (!mainLocale || locale === mainLocale) {
      mainLocale = locale;
      declarations[file] = generatePolyglotTypes(parsedContent, {
        prefix: argv.prefix,
        suffix: argv.suffix,
        names: {
          phrase: `${ucFirst(namespace)}Phrase`,
          phrases: `${ucFirst(namespace)}Phrases`,
          polyglot: `${ucFirst(namespace)}Polyglot`,
        },
        heritageClauses: [],
        additionalMembers: additionalPolyglotMembers(),
      });
    }

    return Buffer.from(JSON.stringify(parsedContent));
  },
};

const printer = ts.createPrinter();
const sourceFile = ts.createSourceFile(
  'placeholder.ts',
  '',
  ts.ScriptTarget.ESNext,
  true,
  ts.ScriptKind.TS,
);

function sortDeepByKey(
  record: unknown,
  parents: string[] = [],
): string | Record<string, any> {
  if (typeof record === 'string') {
    return record;
  }
  if (!isRecord(record)) {
    throw new Error(`Unexpected ${typeof record} in ${parents.join('.')}`);
  }
  return Object.fromEntries(
    Object.entries(record)
      .map(([k, v]) => [k, sortDeepByKey(v, parents.concat(k))])
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)),
  );
}
function isRecord(thing: unknown): thing is Record<string, unknown> {
  return typeof thing === 'object' && thing !== null && !Array.isArray(thing);
}

const opts: WtchOpts = {
  processors: [processor],
  entry,
};

async function writeSummaries(
  mnfst: Record<string, string> | Record<string, string>[],
) {
  if (Array.isArray(mnfst)) {
    throw new Error('Expected only one manifest');
  }
  const manifest: Record<string, string> = {};
  const locales = new Set<string>();
  const allNamespaces = new Set<string>();
  const mainNamespaces = new Set<string>();
  const decl: ts.Statement[] = [];
  await Promise.all(
    Object.entries(
      Object.entries(mnfst).reduce((m, [i, o]) => {
        const [lng, file] = i.split('/');
        const namespace = file.replace(/\.json$/, '');
        locales.add(lng);
        if (!m[lng]) {
          m[lng] = {};
        }
        m[lng][namespace] = o.split('/')[1];
        allNamespaces.add(namespace);
        if (lng === mainLocale) {
          mainNamespaces.add(namespace);
          decl.push(...declarations[i]);
        }
        return m;
      }, {} as Record<string, Record<string, string>>),
    ).map(async ([lng, ndx]) => {
      const content = Buffer.from(JSON.stringify(ndx));
      const ndxName = await rename(`__index.json`, content);
      manifest[lng] = ndxName;
      await writeFile(resolve(outDir, lng, ndxName), content);
    }),
  );
  await writeFile(manifestPath, JSON.stringify(manifest));

  const outputFile = printer.printList(
    ts.ListFormat.MultiLine,
    f.createNodeArray([
      ...createImports(),
      deepPartial,
      createBetterRemixPolyglotTypes(
        Array.from(locales),
        Array.from(allNamespaces),
        Array.from(mainNamespaces),
        decl,
      ),
    ]),
    sourceFile,
  );
  await writeFile(declarationPath, outputFile);
}

(async () => {
  if (argv.watch) {
    for await (const mnfst of wtch(opts)) {
      await writeSummaries(mnfst);
    }
  } else {
    const mnfst = await cmpl(opts);

    await writeSummaries(mnfst);
  }
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
