(function () {
  "use strict";

  function inspectUrl(value) {
    const url = new URL(value);
    if (!/^https?:$/.test(url.protocol)) throw new Error("Use an HTTP or HTTPS URL.");
    return {
      protocol: url.protocol,
      host: url.host,
      hostname: url.hostname,
      port: url.port || "(default)",
      pathname: url.pathname || "/",
      hash: url.hash || "(none)",
      params: Array.from(url.searchParams.entries())
    };
  }

  function rebuildUrl(source, params) {
    const url = new URL(source);
    url.search = "";
    params.forEach(([name, value]) => url.searchParams.append(name, value));
    return url.href;
  }

  function base64UrlEncode(value) {
    const bytes = new TextEncoder().encode(value);
    let binary = "";
    bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }

  function base64UrlDecode(value) {
    if (!/^[A-Za-z0-9_-]*$/.test(value) || value.length % 4 === 1) throw new Error("Enter valid URL-safe Base64.");
    const padded = value.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - value.length % 4) % 4);
    let binary;
    try { binary = atob(padded); } catch { throw new Error("Enter valid URL-safe Base64."); }
    return new TextDecoder("utf-8", { fatal: true }).decode(Uint8Array.from(binary, (character) => character.charCodeAt(0)));
  }

  window.URLWorkbench = { inspectUrl, rebuildUrl, base64UrlEncode, base64UrlDecode };

  const input = document.getElementById("url-input");
  const inspectButton = document.getElementById("inspect-button");
  const status = document.getElementById("status");
  const details = document.getElementById("details");
  const components = document.getElementById("component-list");
  const paramList = document.getElementById("param-list");
  const addButton = document.getElementById("add-param-button");
  const output = document.getElementById("rebuilt-url");
  const copyButton = document.getElementById("copy-button");
  let sourceUrl = "";

  function setStatus(message, isError) {
    status.textContent = message;
    status.classList.toggle("error", Boolean(isError));
  }

  function createParamRow(name, value) {
    const row = document.createElement("div");
    row.className = "param-row";
    const nameInput = document.createElement("input");
    nameInput.type = "text"; nameInput.value = name; nameInput.placeholder = "Parameter name"; nameInput.setAttribute("aria-label", "Parameter name");
    const valueInput = document.createElement("input");
    valueInput.type = "text"; valueInput.value = value; valueInput.placeholder = "Value"; valueInput.setAttribute("aria-label", "Parameter value");
    const valueTools = document.createElement("div");
    valueTools.className = "value-tools";
    const encode = document.createElement("button");
    encode.type = "button"; encode.className = "convert"; encode.textContent = "Base64 encode"; encode.setAttribute("aria-label", "Encode parameter value as URL-safe Base64");
    const decode = document.createElement("button");
    decode.type = "button"; decode.className = "convert"; decode.textContent = "Base64 decode"; decode.setAttribute("aria-label", "Decode parameter value from URL-safe Base64");
    encode.addEventListener("click", () => { valueInput.value = base64UrlEncode(valueInput.value); renderResult(); setStatus("Parameter value encoded as URL-safe Base64."); });
    decode.addEventListener("click", () => {
      try { valueInput.value = base64UrlDecode(valueInput.value); renderResult(); setStatus("Parameter value decoded from URL-safe Base64."); }
      catch (error) { setStatus(error.message, true); }
    });
    const remove = document.createElement("button");
    remove.type = "button"; remove.className = "remove"; remove.textContent = "Remove"; remove.setAttribute("aria-label", "Remove parameter " + name);
    [nameInput, valueInput].forEach((field) => field.addEventListener("input", renderResult));
    remove.addEventListener("click", () => { row.remove(); renderResult(); });
    valueTools.append(valueInput, encode, decode);
    row.append(nameInput, valueTools, remove);
    paramList.append(row);
    return nameInput;
  }

  function getParams() {
    return Array.from(paramList.querySelectorAll(".param-row")).map((row) => {
      const fields = row.querySelectorAll("input");
      return [fields[0].value, fields[1].value];
    });
  }

  function renderResult() { if (sourceUrl) output.textContent = rebuildUrl(sourceUrl, getParams()); }

  function showInspection() {
    try {
      const info = inspectUrl(input.value.trim());
      sourceUrl = input.value.trim();
      components.replaceChildren();
      [["Protocol", info.protocol], ["Host", info.host], ["Hostname", info.hostname], ["Port", info.port], ["Path", info.pathname], ["Fragment", info.hash]].forEach(([label, value]) => {
        const term = document.createElement("dt"); term.textContent = label;
        const description = document.createElement("dd"); description.textContent = value;
        components.append(term, description);
      });
      paramList.replaceChildren();
      info.params.forEach(([name, value]) => createParamRow(name, value));
      details.hidden = false;
      renderResult();
      setStatus("URL inspected locally. Edit parameters below to rebuild it.");
    } catch (error) {
      details.hidden = true; sourceUrl = "";
      setStatus(error.message || "Enter a valid absolute URL.", true);
    }
  }

  inspectButton.addEventListener("click", showInspection);
  input.addEventListener("keydown", (event) => { if (event.key === "Enter") showInspection(); });
  addButton.addEventListener("click", () => { const field = createParamRow("", ""); field.focus(); renderResult(); });
  copyButton.addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(output.textContent); setStatus("Rebuilt URL copied to your clipboard."); }
    catch { setStatus("Could not copy automatically. Select the rebuilt URL and copy it manually.", true); }
  });
}());
