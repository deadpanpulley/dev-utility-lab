# Dev Utility Lab

A privacy-first, browser-only JSON workspace. It is a portfolio project built in public: useful enough for daily development work, small enough to improve consistently.

## What it does

- Format and minify JSON
- Validate JSON with clear status feedback
- Search keys and values
- Redact sensitive fields at any nesting level before sharing
- Copy or download JSON
- Convert an array of objects to CSV
- Process everything locally — no server or account required

## Redacting sensitive data

Enter comma-separated field names (for example, `password, token, secret, apiKey`) and select **Redact fields**. Matching keys are case-insensitive and are replaced with `[REDACTED]` throughout objects and arrays. The original input is updated in place, so copy or download it before redacting if you need to retain the unmodified version.

## Converting CSV to JSON

Paste CSV into the editor and select **CSV to JSON**. The first non-empty row is always treated as the header row: headers are trimmed, must be non-empty and unique, and every data row must have the same number of cells. Quoted cells, escaped quotes, commas, and line breaks inside quoted cells are supported. CSV values are preserved as strings so identifiers such as `00123` are not changed.

## Run locally

This first release is dependency-free. Open `index.html` in a browser, or serve the folder with any static-file server.

```bash
npx serve .
```

## Roadmap

- [ ] JSON diff view
- [x] Redact sensitive fields before sharing
- [ ] JSON path explorer
- [x] CSV-to-JSON conversion
- [ ] Saved local workspaces

## Contributing

Issues and focused pull requests are welcome. Please keep the project local-first and dependency-light.

## License

MIT
