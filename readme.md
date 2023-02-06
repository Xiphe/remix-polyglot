# 🚨 no longer works with remix since they use react-router internally 🚨

This was an experiment all along and the internal remix API's I've used are no longer available.
My i18n projects don't use Remix and I don't have any plans to further invest into this approach. 

✨🐬🌍

# remix-polyglot

type-safe, cached-forever, split-able, non-flickering, pre-loading,
persistence-agnostic internationalization made for remix ♥

_...all while still using plain old json files as phrase storage._

## 🚨 Monkey-Patches Remix 🙈

This package [uses unofficial Remix API](https://github.com/Xiphe/remix-polyglot/blob/main/src/client.tsx#L52-L60) and [monkey-patches Remix data functions](https://github.com/Xiphe/remix-polyglot/blob/main/src/client.tsx#L184-L246) to make sure all lazy translation files
are loaded before rendering a new page with new translation namespaces.

I hope remix will eventually provide an official way to [dynamically declare
route dependencies](https://github.com/remix-run/remix/discussions/3355)

Until then, this package is mainly meant as a case-study and to underline
my opinion that an API for this is needed. The package might break with any patch
release of remix - use at your own risk.

## Install

```bash
npm install remix-polyglot
# yarn add remix-polyglot
```

## Playground

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/Xiphe/remix-polyglot/tree/main/examples/via-url?file=app%2Froutes%2F%24lang.tsx)

## Examples

See [via-url example folder for guidance on how to setup your project](https://github.com/Xiphe/remix-polyglot/tree/main/examples/via-url)  
There is also a [cookie based example](https://github.com/Xiphe/remix-polyglot/tree/main/examples/via-cookie) but it's not documented that well.

## Wait what?!

### type-safe

by running `remix-polyglot` a declaration file is created based on your translation files
Enabling:

Auto-Completion:  
<img width="500"  src="https://user-images.githubusercontent.com/911218/175009081-6908950e-18ba-4738-92c1-e2d9643f0cba.png">

Catching Typos:  
<img width="500" float="left" src="https://user-images.githubusercontent.com/911218/175009513-495350db-a59b-4857-988c-143c671f2167.png">
<img width="500" src="https://user-images.githubusercontent.com/911218/175009553-42796d26-bb0f-4096-905f-9bf48d140e65.png">

Typed Interpolation:  
<img width="500" float="left" src="https://user-images.githubusercontent.com/911218/175009640-4d5558f8-26b0-44fd-ae08-7e66ec5dce93.png">
<img width="500" float="left" src="https://user-images.githubusercontent.com/911218/175009715-1f290dad-159f-4ba9-abb0-69624cea4140.png">
<img width="500"  src="https://user-images.githubusercontent.com/911218/175009785-f7e10211-0f3b-445f-9398-14fd728ec7ac.png">

### cached-forever

running `remix-polyglot` also minifies and content-hashes your translation files and puts
them next to the remix build artifacts.

<img width="500" src="https://user-images.githubusercontent.com/911218/175010199-9a4c5adb-3c0c-4d71-86d3-d9a5f2f16c95.png">

### split-able

Each route can use its own set of translations (namespaces) only the
translation files used for the current routes and locale are loaded.

<img width="500" src="https://user-images.githubusercontent.com/911218/175010416-a62bac3b-b876-4dec-9d85-e2735138361b.png">

### non-flickering

🚨 _This behavior is achieved using internal and potential unstable Remix API_

When navigating in the frontend, the transition to the next page is delayed
until all required translations are loaded.  
Creating the same UX like with traditional server rendering: First page render already includes all translations.  
No need for loading spinners.

<img width="500" src="https://user-images.githubusercontent.com/911218/175012762-02826913-2b52-47ec-9c71-c9f7bf9bfd9b.png">

_Note how the home-EA5A9AB7.json takes much longer to load then the route chunk
(this is not the case normally). The page transition will take 1s_

### pre-loading

🚨 _This behavior is achieved using internal and potential unstable Remix API_

Required translation files of target routes are loaded along with the route
chunk and loader data.  
This way, the splitted-out translations are very likely
to not increase page load time at all when navigating in the frontend.

<img width="500" src="https://user-images.githubusercontent.com/911218/175013082-81ca5225-4f48-42b2-86c7-e9d0cf45b899.png">

_Note how loading of home-EA5A9AB7.json starts at the same moment the route chunk is loaded_

---

## Let's talk

I've been unhappy with the state of i18n in JS/TS for quite a while and would like
to provide a sleek & modern solution here.

Please be invited to [discuss about this](https://github.com/Xiphe/remix-polyglot/discussions)
or [send me an email](mailto:remix-polyglot@xiphe.net).
