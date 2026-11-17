// storesoft.org/usb: order form contract, French copy and privacy of the WhatsApp link.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import test from 'node:test';

const html = await readFile(new URL('../usb/index.html', import.meta.url), 'utf8');
const js = await readFile(new URL('../usb/usb.js', import.meta.url), 'utf8');
const css = await readFile(new URL('../usb/usb.css', import.meta.url), 'utf8');
const sitemap = await readFile(new URL('../sitemap.xml', import.meta.url), 'utf8');

test('usb order posts the usb_order_v1 contract to the lead function', () => {
  assert.match(js, /functions\/v1\/submit-store-soft-lead'/);
  assert.match(js, /form_version: 'usb_order_v1'/);
  assert.match(js, /requested_platform: 'computer'/);
  assert.match(js, /source: 'usb'/);
  for (const field of ['name', 'phone', 'wilaya', 'baladia', 'shop_type', 'website'])
    assert.match(html, new RegExp(`name="${field}"`), field);
  for (const code of ['grocery', 'clothing', 'cosmetics', 'spare_parts', 'repair_shop', 'other'])
    assert.match(html, new RegExp(`value="${code}"`), code);
});

test('wilaya and commune files are the unchanged copies named in SOURCE.md', async () => {
  const source = await readFile(new URL('../usb/data/SOURCE.md', import.meta.url), 'utf8');
  for (const file of ['wilayas.json', 'communes.json']) {
    const bytes = await readFile(new URL('../usb/data/' + file, import.meta.url));
    const sum = createHash('sha256').update(bytes).digest('hex');
    assert.match(source, new RegExp(`${file.replace('.', '\\.')} \\| ${bytes.length.toLocaleString('en-US')} \\| \`${sum}\``), file);
  }
});

test('69 wilayas, every wilaya has communes, and the name fixes match the communes', async () => {
  const read = async file => JSON.parse((await readFile(new URL('../usb/data/' + file, import.meta.url), 'utf8')).replace(/^﻿/, ''));
  const wilayas = await read('wilayas.json');
  const communes = await read('communes.json');
  assert.deepEqual(wilayas.map(w => Number(w.code)), Array.from({ length: 69 }, (_, i) => i + 1));
  for (const w of wilayas) assert.ok(communes.some(c => c.wilaya_id === w.id), `wilaya ${w.code} has communes`);
  // Each fixed name is a commune (the chef-lieu) of that wilaya number in communes.json.
  const fixes = [...js.matchAll(/(\d+): \['[^']+', (?:'([^']*)'|"([^"]*)")\]/g)].map(m => [m[1], m[2] || m[3]]);
  assert.deepEqual(fixes.map(f => Number(f[0])), [49, 50, 52, 53, 54, 57, 58]);
  const plain = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  for (const [id, name] of fixes)
    assert.ok(communes.some(c => c.wilaya_id === id && plain(c.name) === plain(name)), `${id} ${name}`);
  assert.match(js, /fetch\('data\/wilayas.json'\), fetch\('data\/communes.json'\)/);
});

test('every Arabic text block has a French translation', () => {
  const keys = new Set([...html.matchAll(/data-i(?:-placeholder|-alt)?="([^"]+)"/g)].map(m => m[1]));
  const frBlock = js.slice(js.indexOf('var fr = {'), js.indexOf('var form ='));
  for (const key of keys) assert.match(frBlock, new RegExp(`\\b${key}:`), `missing French for ${key}`);
});

test('the WhatsApp order message never carries the name or the phone', () => {
  const fn = js.slice(js.indexOf('function orderMessage'), js.indexOf('function campaignData'));
  assert.doesNotMatch(fn, /values\.(name|phone)/);
});

test('free trial box: Windows download page and a mailto link, no email service', () => {
  assert.match(html, /id="trialDownload" href="\/windows\/"/);
  assert.match(html, /جرّبه مجانًا لمدة 14 يومًا/);
  assert.match(js, /trialTitle: 'Pas encore sûr \? Essayez-le gratuitement pendant 14 jours'/);
  assert.match(js, /trialSend\.href = email \? 'mailto:'/);
  // The email address only goes into the mailto link, never to a server.
  const trial = js.slice(js.indexOf('function trialEmailValue'), js.indexOf('trialForm.addEventListener'));
  assert.doesNotMatch(trial, /fetch\(|endpoint/);
});

test('trial sits below the order box, not inside the order form', () => {
  const form = html.slice(html.indexOf('id="formView"'), html.indexOf('id="successView"'));
  assert.doesNotMatch(form, /id="trialBox"/);
  assert.ok(html.indexOf('id="trialBox"') > html.indexOf('id="successView"'));
});

test('WhatsApp bubble and sticky bar hide while the order section is on screen', () => {
  assert.ok(js.includes("observe(document.getElementById('order'))"));
  assert.ok(js.includes("waFloat.classList.toggle('is-hidden'"));
  assert.ok(css.includes('.wa-float.is-hidden'));
});

test('proof numbers use a no-break space and the words, not a "+" sign', () => {
  assert.ok(html.includes('<b>19&nbsp;000</b>'));
  assert.ok(js.includes('<b>19\\u00a0000</b>'));
  assert.doesNotMatch(html, /19 000|\+19|19\+/);
});

test('price, page and sitemap agree', () => {
  assert.match(js, /var price = 9000;/);
  assert.match(html, /<link rel="canonical" href="https:\/\/storesoft.org\/usb\/" \/>/);
  assert.match(sitemap, /<loc>https:\/\/storesoft.org\/usb\/<\/loc>/);
});
