Exit code: 0
Wall time: 1 seconds
Output:
const $ = (id) => document.getElementById(id);
const input = $('input'); const status = $('status'); const dot = $('status-dot');
const sample = { user: { id: 42, name: 'Avery Kim', role: 'developer' }, projects: [{ name: 'Dev Utility Lab', status: 'building', stars: 0 }, { name: 'API Monitor', status: 'idea', stars: 0 }], updatedAt: '2026-07-11T09:00:00Z' };

function setStatus(message, kind = '') { status.textContent = message; dot.className = kind; }
function parse() { try { return { value: JSON.parse(input.value) }; } catch (error) { const message = error.message.replace(/^Unexpected token/, 'Invalid character'); setStatus(message, 'error'); return { error }; } }
function output(value, spacing = 2) { input.value = JSON.stringify(value, null, spacing); setStatus('Valid JSON', 'ok'); updateMatches(); }
function download(content, name, type) { const url = URL.createObjectURL(new Blob([content], { type })); const link = document.createElement('a'); link.href = url; link.download = name; link.click(); URL.revokeObjectURL(url); }

$('format').onclick = () => { const { value } = parse(); if (value !== undefined) output(value); };
$('minify').onclick = () => { const { value } = parse(); if (value !== undefined) output(value, 0); };
$('validate').onclick = () => { const { value } = parse(); if (value !== undefined) setStatus(`Valid JSON Â· ${Array.isArray(value) ? value.length + ' items' : 'object ready'}`, 'ok'); };
$('clear').onclick = () => { input.value = ''; $('search').value = ''; setStatus('Ready for JSON'); updateMatches(); input.focus(); };
$('sample').onclick = () => output(sample);
$('copy').onclick = async () => { if (!input.value.trim()) return setStatus('Nothing to copy', 'error'); await navigator.clipboard.writeText(input.value); setStatus('Copied to clipboard', 'ok'); };
$('download').onclick = () => { const { value } = parse(); if (value !== undefined) { download(JSON.stringify(value, null, 2), 'data.json', 'application/json'); setStatus('Downloaded data.json', 'ok'); } };
$('csv').onclick = () => { const { value } = parse(); if (!Array.isArray(value) || !value.every(item => item && typeof item === 'object' && !Array.isArray(item))) return setStatus('CSV needs an array of objects', 'error'); const fields = [...new Set(value.flatMap(Object.keys))]; const cell = (v) => `"${String(v ?? '').replaceAll('"', '""')}"`; const csv = [fields.join(','), ...value.map(row => fields.map(key => cell(row[key])).join(','))].join('\n'); download(csv, 'data.csv', 'text/csv'); setStatus(`Downloaded ${value.length} rows as CSV`, 'ok'); };
function updateMatches() { const q = $('search').value.trim().toLowerCase(); const text = input.value.toLowerCase(); const count = q ? text.split(q).length - 1 : 0; $('matches').textContent = count; }
$('search').oninput = updateMatches; input.oninput = () => { setStatus('Editingâ€¦'); updateMatches(); };
input.onkeydown = (event) => { if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) { event.preventDefault(); $('format').click(); } };
$('year').textContent = new Date().getFullYear();

