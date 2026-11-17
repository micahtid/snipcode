# SnipCode

SnipCode is a Chrome extension that extracts components from any live web page.

Point at an element to get its markup and styles. SnipCode uses the browser's computed styles,
not just the source CSS, so the output matches what renders on screen.

Everything runs in your browser, with no account, server, or cloud sync.

## What It Does

- Snip any element into ready-to-use code.
- Press Shift to select multiple elements, then Enter to snip them all at once.
- Bookmark snippets to keep them. Saved snippets never expire from history.
- Scan a whole page for its fonts, assets, colors, or full design schema.

## Output Formats

Every snip can be exported in seven formats. Set your default in Settings.

- `html` is a self-contained document with an inline stylesheet.
- `tailwind` is HTML with Tailwind classes.
- `bem-css` is BEM classes plus a CSS file.
- `bem-scss` is BEM classes plus an SCSS file.
- `jsx-tailwind` is a React component with Tailwind classes.
- `jsx-css` is a React component with BEM classes plus CSS.
- `vue` is a Vue single-file component.

## Installing

Install SnipCode from the
[Chrome Web Store](https://chromewebstore.google.com/detail/snipcode/njpicmnoclpenaomomflkmenlfpefcam).

To load it unpacked, build it first:

```bash
npm install
npm run build
```

Then open `chrome://extensions`, turn on Developer mode, click Load unpacked, and select the
`dist/` folder. SnipCode requires Chrome 122 or later.

## Using It

1. Click the toolbar icon to open the side panel.
2. Click Snip Element. The page dims and a highlight follows your cursor.
3. Hover over the element you want. Press the up arrow to select its parent, or Esc to cancel.
4. Click to snip. The code appears in the panel and is saved to your history.

To snip several elements, press Shift to turn on multi-select, click each element (click again
to deselect), then press Enter. Esc cancels. Download saves every component in a single zip.

To scan the whole page instead, open the mode menu next to the main button and choose fonts,
assets, colors, or schema.

## Bring Your Own Key

SnipCode works without an API key. Add one in Settings to enable an optional AI pass that gives
classes semantic names and adds comments. OpenRouter, Anthropic, OpenAI, and Google are
supported. Your key stays in your browser and never reaches our servers.

## Privacy

SnipCode collects no telemetry or analytics. It only makes network requests to your AI provider,
if you add a key, and to fetch cross-origin stylesheets it needs to read the page's styles.

SnipCode requests these permissions:

- Site access, to read the element you snip.
- `scripting`, to run SnipCode on the page.
- `storage` and `unlimitedStorage`, to keep settings, keys, and snippets locally.
- `downloads`, to save files to your device.
- `sidePanel`, to open the side panel.
- `debugger`, to read exact computed styles.

## How The Code Is Organized

The side panel is a React app under `src/`. The snip pipeline runs in the page from
`src/content/`, with one folder per phase. See the [architecture diagram](./docs/architecture.md)
for the full flow.

## Developing

```bash
npm install
npm run typecheck
npm run build
npm test
```

`npm test` runs the unit and end-to-end tests. The fidelity harness runs separately with
`node tests/run-pipeline.mjs` and `node tests/split-render.mjs`.

Contributions are welcome. Report bugs or request features in
[issues](https://github.com/micahtid/snipcode/issues).

## License

[MIT](./LICENSE)
