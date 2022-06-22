# Welcome to remix-polyglot via url example

## Playground

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/Xiphe/remix-polyglot/tree/main/examples/via-url?file=app%2Froutes%2F%24lang.tsx)

## How to setup this approach into your app

_this assumes a freshly created remix app with typescript, please let me know
when you have trouble integrating_

1. install package

   ```bash
   npm install remix-polyglot
   # yarn add remix-polyglot

   # And to run dev processes in parallel
   npm install -D npm-run-all
   # yarn add -D npm-run-all
   ```

2. update your npm build scripts to run `remix-polyglot`  
   and your dev scripts to run `remix-polyglot --watch`  
   _Example: [`package.json`](https://github.com/Xiphe/remix-polyglot/blob/main/examples/via-url/package.json#L6-L12)_

3. Add at least one locale to your project under `/locales/{code}/{namespace}.json`  
   _Example: [`locales/en/common.json`](https://github.com/Xiphe/remix-polyglot/blob/main/examples/via-url/locales/en/common.json) (common is the default namespace)_

4. Run `npx remix-polyglot` once  
   _This should create a `remix-polyglot.env.d.ts` and an `app/manifest-remix-polyglot.json` file_

5. exclude `remix-polyglot.env.d.ts` and `app/manifest-remix-polyglot.json` from version control.
   _Example [`.gitignore`](https://github.com/Xiphe/remix-polyglot/blob/main/examples/via-url/.gitignore#L2-L3)_

6. Follow the `/* 🧑‍🔧 INSTALL: */` comments in [`app/entry.client.tsx`](https://github.com/Xiphe/remix-polyglot/blob/main/examples/via-url/app/entry.client.tsx), [`app/entry.server.tsx`](https://github.com/Xiphe/remix-polyglot/blob/main/examples/via-url/app/entry.server.tsx) and [`app/root.tsx`](https://github.com/Xiphe/remix-polyglot/blob/main/examples/via-url/app/root.tsx) to bootstrap your app with translation support.

7. Thats it 🎉

## How to use remix polyglot

Please follow the `/* 🗣 USE: */` comments in [route files](https://github.com/Xiphe/remix-polyglot/tree/main/examples/via-url/app/routes).
