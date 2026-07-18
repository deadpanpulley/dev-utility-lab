const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const context = { URL, TextEncoder, TextDecoder, Uint8Array, btoa, atob, window: {}, document: { getElementById: () => null } };
vm.createContext(context);
const source = fs.readFileSync("url-workbench/app.js", "utf8");
// Stop before browser event wiring; pure helpers have already been defined.
vm.runInContext(source.slice(0, source.indexOf('  const input =')) + "}());", context);
const { inspectUrl, rebuildUrl, base64UrlEncode, base64UrlDecode } = context.window.URLWorkbench;

const inspected = inspectUrl("https://user:pass@example.com:8443/a%20path?tag=one&tag=two#section");
assert.equal(inspected.host, "example.com:8443");
assert.equal(inspected.pathname, "/a%20path");
assert.deepEqual(JSON.parse(JSON.stringify(inspected.params)), [["tag", "one"], ["tag", "two"]]);
assert.equal(rebuildUrl("https://example.com/a?old=1#fragment", [["q", "hello world"], ["tag", "a&b"]]), "https://example.com/a?q=hello+world&tag=a%26b#fragment");
assert.equal(base64UrlEncode("hello world"), "aGVsbG8gd29ybGQ");
assert.equal(base64UrlDecode("aGVsbG8gd29ybGQ"), "hello world");
assert.equal(base64UrlDecode(base64UrlEncode("R\u00e9sum\u00e9 \ud83d\ude80")), "R\u00e9sum\u00e9 \ud83d\ude80");
assert.throws(() => base64UrlDecode("not base64!"), /valid URL-safe Base64/);
assert.throws(() => inspectUrl("ftp://example.com"), /HTTP or HTTPS/);
assert.throws(() => inspectUrl("not a url"));
console.log("URL Workbench helper tests passed");
