const $ = (id) => document.getElementById(id);
const input = $('input'); const status = $('status'); const dot = $('status-dot');
const sample = { user: { id: 42, name: 'Avery Kim', role: 'developer' }, projects: [{ name: 'Dev Utility Lab', status: 'building', stars: 0 }, { name: 'API Monitor', status: 'idea', stars: 0 }], updatedAt: '2026-07-11T09:00:00Z' };

function setStatus(message, kind = '') { status.textContent = message; dot.className = kind; }
function parse() { try { return { value: JSON.parse(input.value) }; } catch (error) { const message = error.message.replace(/^Unexpected token/, 'Invalid character'); setStatus(message, 'error'); return { error }; } }
function output(value, spacing = 2) { input.value = JSON.stringify(value, null, spacing); setStatus('Valid JSON', 'ok'); updateMatches(); }
function download(content, name, type) { const url = URL.createObjectURL(new Blob([content], { type })); const link = document.createElement('a'); link.href = url; link.download = name; link.click(); URL.revokeObjectURL(url); }
function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;
  let afterQuote = false;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (quoted) {
      if (character === '"' && text[index + 1] === '"') { cell += '"'; index += 1; }
      else if (character === '"') { quoted = false; afterQuote = true; }
      else cell += character;
    } else if (afterQuote && character !== ',' && character !== '\n' && character !== '\r') {
      throw new Error('A quoted cell must end with a comma or a new line');
    } else if (character === '"') {
      if (cell) throw new Error('A quote must start at the beginning of a cell');
      quoted = true;
    } else if (character === ',') {
      row.push(cell); cell = ''; afterQuote = false;
    } else if (character === '\n' || character === '\r') {
      if (character === '\r' && text[index + 1] === '\n') index += 1;
      row.push(cell); rows.push(row); row = []; cell = ''; afterQuote = false;
    } else cell += character;
  }
  if (quoted) throw new Error('A quoted cell is missing its closing quote');
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows.filter((currentRow) => currentRow.some((value) => value.trim()));
}
function csvToJson(text) {
  const rows = parseCsv(text.replace(/^\uFEFF/, ''));
  if (rows.length < 2) throw new Error('CSV needs a header row and at least one data row');
  const headers = rows[0].map((header) => header.trim());
  if (headers.some((header) => !header)) throw new Error('CSV headers cannot be empty');
  if (new Set(headers).size !== headers.length) throw new Error('CSV headers must be unique');
  if (rows.slice(1).some((row) => row.length !== headers.length)) throw new Error('Each CSV row must have the same number of cells as the header');
  return rows.slice(1).map((row) => Object.fromEntries(headers.map((header, index) => [header, row[index]])));
}

$('format').onclick = () => { const { value } = parse(); if (value !== undefined) output(value); };
$('minify').onclick = () => { const { value } = parse(); if (value !== undefined) output(value, 0); };
$('validate').onclick = () => { const { value } = parse(); if (value !== undefined) setStatus(`Valid JSON · ${Array.isArray(value) ? value.length + ' items' : 'object ready'}`, 'ok'); };
$('clear').onclick = () => { input.value = ''; $('search').value = ''; setStatus('Ready for JSON'); updateMatches(); input.focus(); };
$('sample').onclick = () => output(sample);
$('copy').onclick = async () => { if (!input.value.trim()) return setStatus('Nothing to copy', 'error'); try { await navigator.clipboard.writeText(input.value); setStatus('Copied to clipboard', 'ok'); } catch { setStatus('Clipboard access was unavailable', 'error'); } };
$('download').onclick = () => { const { value } = parse(); if (value !== undefined) { download(JSON.stringify(value, null, 2), 'data.json', 'application/json'); setStatus('Downloaded data.json', 'ok'); } };
$('csv').onclick = () => { const { value } = parse(); if (!Array.isArray(value) || !value.every(item => item && typeof item === 'object' && !Array.isArray(item))) return setStatus('CSV needs an array of objects', 'error'); const fields = [...new Set(value.flatMap(Object.keys))]; const cell = (v) => `"${String(v ?? '').replaceAll('"', '""')}"`; const csv = [fields.join(','), ...value.map(row => fields.map(key => cell(row[key])).join(','))].join('\n'); download(csv, 'data.csv', 'text/csv'); setStatus(`Downloaded ${value.length} rows as CSV`, 'ok'); };
$('csv-to-json').onclick = () => {
  if (!input.value.trim()) return setStatus('Paste CSV with a header row first', 'error');
  try {
    const value = csvToJson(input.value);
    output(value);
    setStatus(`Converted ${value.length} CSV row${value.length === 1 ? '' : 's'} to JSON`, 'ok');
  } catch (error) { setStatus(error.message, 'error'); }
};
$('redact').onclick = () => {
  const fields = new Set($('redact-fields').value.split(',').map((field) => field.trim().toLowerCase()).filter(Boolean));
  if (!fields.size) return setStatus('Add at least one field name', 'error');
  const { value } = parse();
  if (value === undefined) return;
  let count = 0;
  const redactValue = (current) => {
    if (Array.isArray(current)) return current.map(redactValue);
    if (current && typeof current === 'object') return Object.fromEntries(Object.entries(current).map(([key, item]) => {
      if (fields.has(key.toLowerCase())) { count += 1; return [key, '[REDACTED]']; }
      return [key, redactValue(item)];
    }));
    return current;
  };
  output(redactValue(value));
  setStatus(count ? `Redacted ${count} field${count === 1 ? '' : 's'}` : 'No matching fields found', count ? 'ok' : '');
};
function updateMatches() { const q = $('search').value.trim().toLowerCase(); const text = input.value.toLowerCase(); const count = q ? text.split(q).length - 1 : 0; $('matches').textContent = count; }
$('search').oninput = updateMatches; input.oninput = () => { setStatus('Editing…'); updateMatches(); };
input.onkeydown = (event) => { if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) { event.preventDefault(); $('format').click(); } };
$('year').textContent = new Date().getFullYear();
