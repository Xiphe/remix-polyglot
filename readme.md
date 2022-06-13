# remix-polyglot

type-safe, cached-forever, split-able, non-flickering, pre-loading,
persistence-agnostic internationalization made for remix ♥

## 🚨 Monkey-Patches Remix 🙈

This package [uses unofficial Remix API](https://github.com/Xiphe/remix-polyglot/blob/main/src/client.tsx#L50-L58) and [monkey-patches Remix data functions](https://github.com/Xiphe/remix-polyglot/blob/main/src/client.tsx#L199) to make sure all lazy translation files
are loaded before rendering a new page with new translation namespaces.

I hope remix will eventually provide an official way to [dynamically declare
route dependencies](https://github.com/remix-run/remix/discussions/3355)

Until then, this package is mainly meant as a case-study and to underline
my opinion that an API for this is needed. The package might break with any patch
release of remix - use at your own risk.

## Usage

See [via-url example](https://github.com/Xiphe/remix-polyglot/tree/main/examples/via-url) (in particular the the [install commit f52cfcf](https://github.com/Xiphe/remix-polyglot/commit/f52cfcfb7a4a321cfa4cce22be8d54dd78e60021)) when you wish to switch locales using a factor of the url (like `https://example.org/en`).

See [via-cookie example](https://github.com/Xiphe/remix-polyglot/tree/main/examples/via-cookie) (in particular the the [install commit 5f835ea5](https://github.com/Xiphe/remix-polyglot/commit/5f835ea57e9544c5e1d1a2287bc7f0c88ed26ad5)) when you want to switch locales using user-preferences.

## Let's talk

I've been unhappy with the state of i18n in JS/TS for quite a while and would like
to provide a sleek & modern solution here.

Please be invited to [discuss about this](https://github.com/Xiphe/remix-polyglot/discussions)
or [send me an email](mailto:remix-polyglot@xiphe.net).
