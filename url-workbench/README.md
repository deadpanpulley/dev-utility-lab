# URL Workbench

A small, browser-only URL inspector for a common developer task: understanding an unfamiliar URL without handing it to a third-party service.

## Features

- Breaks an HTTP(S) URL into protocol, host, port, path, and fragment
- Shows decoded query parameters for editing
- Preserves repeated parameter names and URL fragments
- Rebuilds correctly encoded URLs as you type
- Converts individual query values to and from URL-safe Base64, including Unicode text
- Copies the rebuilt URL when browser clipboard permission is available
- Works entirely locally with no dependencies, network requests, or accounts

## Run locally

Open `index.html` in a browser, or use a static server from this directory:

```bash
npx serve .
```

## Verify

From the repository root:

```bash
node url-workbench/test/app.test.cjs
```

The tests cover URL component extraction, repeated parameters, encoding during rebuilding, URL-safe Base64 conversion (including Unicode), fragments, and invalid protocol/input handling.

## License

MIT
