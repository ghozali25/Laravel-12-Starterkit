// i18n audit: scans t('...') keys, dedup/sort en/id JSON, and fills missing keys.
// Usage: node scripts/i18n-audit.js

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(__dirname, '..');
const SRC_DIR = path.join(ROOT, 'resources', 'js');
const EN_PATH = path.join(ROOT, 'lang', 'en.json');
const ID_PATH = path.join(ROOT, 'lang', 'id.json');
const REPORT_PATH = path.join(ROOT, 'lang', 'i18n-missing-report.txt');

function walk(dir, exts, out = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, exts, out);
    else if (exts.includes(path.extname(e.name))) out.push(p);
  }
  return out;
}

function extractKeysFromFile(file) {
  const src = fs.readFileSync(file, 'utf8');
  const keys = new Set();
  // t('...') or t("...")
  const re1 = /\bt\(\s*'([^'\\]*(?:\\.[^'\\]*)*)'\s*\)/g;
  const re2 = /\bt\(\s*"([^"\\]*(?:\\.[^"\\]*)*)"\s*\)/g;
  // Template literal basic support (no expressions)
  const re3 = /\bt\(\s*`([^`$\\]*(?:\\.[^`$\\]*)*)`\s*\)/g;
  let m;
  while ((m = re1.exec(src))) keys.add(m[1]);
  while ((m = re2.exec(src))) keys.add(m[1]);
  while ((m = re3.exec(src))) keys.add(m[1]);
  return keys;
}

function loadJson(p) {
  const raw = fs.readFileSync(p, 'utf8');
  // Note: duplicate keys in JSON will be overridden by later occurrences upon parse
  return JSON.parse(raw);
}

function sortObject(obj) {
  return Object.keys(obj)
    .sort((a, b) => a.localeCompare(b))
    .reduce((acc, k) => {
      acc[k] = obj[k];
      return acc;
    }, {});
}

function main() {
  const files = walk(SRC_DIR, ['.tsx', '.ts', '.jsx', '.js']);
  const allKeys = new Set();
  for (const f of files) {
    try {
      const ks = extractKeysFromFile(f);
      ks.forEach((k) => allKeys.add(k));
    } catch {}
  }

  const en = loadJson(EN_PATH);
  const id = loadJson(ID_PATH);

  const missingEn = [];
  const missingId = [];

  for (const k of allKeys) {
    if (!(k in en)) missingEn.push(k);
    if (!(k in id)) missingId.push(k);
  }

  // Fill missing keys
  for (const k of missingEn) en[k] = k;
  for (const k of missingId) id[k] = en[k] ?? k;

  // Sort and write back
  const enSorted = sortObject(en);
  const idSorted = sortObject(id);
  fs.writeFileSync(EN_PATH, JSON.stringify(enSorted, null, 4) + '\n', 'utf8');
  fs.writeFileSync(ID_PATH, JSON.stringify(idSorted, null, 4) + '\n', 'utf8');

  // Report
  const report = [];
  report.push(`# i18n audit report`);
  report.push(`Total keys in code: ${allKeys.size}`);
  report.push(`Missing in en.json: ${missingEn.length}`);
  if (missingEn.length) report.push(...missingEn.map((k) => `EN MISSING: ${k}`));
  report.push(`Missing in id.json: ${missingId.length}`);
  if (missingId.length) report.push(...missingId.map((k) => `ID MISSING: ${k}`));
  fs.writeFileSync(REPORT_PATH, report.join('\n') + '\n', 'utf8');

  console.log('i18n audit complete.');
  console.log(`Updated: ${EN_PATH}, ${ID_PATH}`);
  console.log(`Report: ${REPORT_PATH}`);
}

main();
