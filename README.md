# everycallcovered.com

The public landing page for Every Call Covered, hosted on GitHub Pages from `main`.

- `index.html`: the page. `assets/site.css` and `assets/site.js` hold its styles and its small script (the call
  player, the transfer demo, the cost calculator, the menu). No framework, no forms, no tracking, no third-party
  scripts; fonts come from Google Fonts.
- `404.html`: the not-found page, on the same stylesheet.
- `CNAME`: the custom domain GitHub Pages serves. DNS for everycallcovered.com is managed at Wix (registrar) and
  points at GitHub Pages.

The product itself lives in Worlds2025/pro-appliance-voice. This repo is only the public site.

## The app's address

Every sign-up, demo and sign-in link (`data-app`) points at the app's sign-in page, which also signs new people up:

```html
<meta name="ecc-app-url" content="https://every-call-covered.replit.app/sign-in">
```

The links carry the address in their own `href` too, so they work without JavaScript, and `assets/site.js` keeps them
in step with the tag. To move the app (for example to `https://app.everycallcovered.com/sign-in`), replace the
address everywhere in `index.html`.

## Without JavaScript

The page reads in full without JavaScript. The call player shows the repair call as it ends: the transcript and the
inbox in `index.html` are a copy of what `assets/site.js` draws for that call, and the controls that need the script
are hidden. If you change the repair call in `site.js`, update that copy to match.

## Sharing and icons

- `assets/og-image.png` (1200 x 630) is a screenshot of the top of this page, used by Open Graph and Twitter cards.
  Retake it if the hero changes.
- `favicon.svg`, `favicon.ico` and `apple-touch-icon.png` are the brand mark: the navy phone on amber.

## Prices

The plan prices on the page and in the calculator (`PRICES` in `assets/site.js`) come from the product's
`artifacts/api-server/src/lib/billing/plans.ts`. When a price changes there, change both places here.

## Images on this site

- **Product visuals** (anything showing the app's screens) are only ever:
  1. real screenshots of the app with demo data, or
  2. HTML/CSS rebuilt from the app's real components, like the inbox, the Personal "Today" screen and the
     live-call card in the call player. They use the app's own colors, type and tags.
- **Never** AI-generated pictures of the product UI.
- AI-generated images are fine for lifestyle pictures only: tradespeople, trucks, homes, night scenes.

## Checking a change locally

Serve the folder (for example `python -m http.server`) and open it at 375px and 1440px wide. Links to `/assets/`
are root-relative, so opening `index.html` straight from disk won't load the styles.
