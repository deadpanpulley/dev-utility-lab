const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const context = { URL, window: {}, document: { getElementById: () => null } };
vm.createContext(context);
const source = fs.readFileSync("url-workbench/app.js", "utf8");
// Stop before browser event wiring; pure helpers have already been defined.
vm.runInContext(source.slice(0, source.indexOf('  const input =')) + "}());", context);
const { inspectUrl, rebuildUrl } = context.window.URLWorkbench;

const inspected = inspectUrl("https://user:pass@example.com:8443/a%20path?tag=one&tag=two#section");
assert.equal(inspected.host, "example.com:8443");
assert.equal(inspected.pathname, "/a%20path");
assert.deepEqual(JSON.parse(JSON.stringify(inspected.params)), [["tag", "one"], ["tag", "two"]]);
assert.equal(rebuildUrl("https://example.com/a?old=1#fragment", [["q", "hello world"], ["tag", "a&b"]]), "https://example.com/a?q=hello+world&tag=a%26b#fragment");
assert.throws(() => inspectUrl("ftp://example.com"), /HTTP or HTTPS/);
assert.throws(() => inspectUrl("not a url"));
console.log("URL Workbench helper tests passed");
