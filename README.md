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

Every sign-up, demo and sign-in link takes the app's address from one tag in `index.html`:

```html
<meta name="ecc-app-url" content="https://every-call-covered.replit.app/sign-in">
```

Change that one value (for example to `https://app.everycallcovered.com/sign-in`) and every button follows.

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
