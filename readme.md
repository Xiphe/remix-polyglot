# remix-polyglot

type-safe, cached-forever, split-able, non-flickering, pre-loading,
persistence-agnostic internationalization made for remix ♥

## 🚨 Monkey-Patches Remix 🙈

This package uses unofficial Remix API to make sure all lazy translation files
are loaded before rendering a new page with new translation namespaces.

I hope remix will eventually provide an official way to [dynamically declare
route dependencies](https://github.com/remix-run/remix/discussions/3355)

Until then, this package is mainly meant as a case-study and to underline
my case that an API for this is needed. The package might break with any patch
release of remix - use at your own risk.

## Usage

Please see the latest commit in each of the `./examples`. To get an idea how
to install this.

## Let's talk

Please be invited to [discuss about this](https://github.com/Xiphe/remix-polyglot/discussions)
or [send me an email](mailto:remix-polyglot@xiphe.net)
