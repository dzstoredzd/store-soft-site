import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {test} from 'node:test';
import vm from 'node:vm';
test('website owns complete localized offers and integer-centime prices without a pricing API', async()=>{
  const script = await readFile(new URL('../pricing/pricing.js',import.meta.url),'utf8');
  assert.doesNotMatch(script,/supabase|apikey|XMLHttpRequest|fetch\(|setInterval/);
  const context = {window:{}};
  vm.runInNewContext(await readFile(new URL('../pricing/offers.js',import.meta.url),'utf8'),context);
  const offers=context.window.storeSoftOffers;
  // Same offer as the app's Algeria page (algeria_offer.dart): kDzPayOnce 900000,
  // kDzExtraDeviceYear 400000, kDzMaxExtraDevices 3.
  assert.equal(offers.map(offer=>offer.code).join(','),'pro');
  const [pro]=offers;
  assert.equal(pro.billing,'once');
  assert.equal(pro.once_centimes,900000);
  assert.equal(pro.sync.additional_device_year_centimes,400000);
  assert.equal(pro.sync.max_extra_devices,3);
  assert.equal(pro.available_until,undefined);
  for(const lang of ['ar','fr','en']){
    assert.ok(pro.title[lang].length);
    assert.equal(pro.features[lang].length,5);
    assert.equal(pro.sync.features[lang].length,5);
    assert.ok(pro.billing_note[lang].length);
  }
  assert.equal(pro.title.ar,'ادفع مرة واحدة، والبرنامج لك للأبد');
  assert.match(pro.billing_note.ar,/يحتفظون بتفعيلهم الحالي/);
  assert.match(script,/today <= offer\.available_until/);
  assert.doesNotMatch(await readFile(new URL('../pricing/offers.js',import.meta.url),'utf8'),/690000|300000|"yearly"|"lifetime"/);
});
test('money sign follows the language and keeps the number in one piece', async()=>{
  const script = await readFile(new URL('../pricing/pricing.js',import.meta.url),'utf8');
  assert.match(script,/sign: 'دج'/);assert.match(script,/sign: 'DA'/);assert.match(script,/sign: 'DZD'/);
  assert.match(script,/var NBSP = '\\u00a0';/);
  assert.match(script,/replace\(\/\\B\(\?=\(\\d\{3\}\)\+\(\?!\\d\)\)\/g, NBSP\)/);
});
test('home page says pay once, 9 000, with the sign of each language', async()=>{
  const read=file=>readFile(new URL('../'+file,import.meta.url),'utf8');
  const [home,page]=await Promise.all([read('home.js'),read('index.html')]);
  assert.match(home,/"priceOnce": "ادفع مرة واحدة: 9\\u00a0000 دج"/);
  assert.match(home,/"priceOnce": "Payez une seule fois : 9\\u00a0000 DA"/);
  assert.match(page,/data-home-copy="priceOnce">ادفع مرة واحدة: 9&nbsp;000 دج</);
  assert.doesNotMatch(home+page,/اشتراك سنوي|Abonnement annuel|"yearly"/);
  for(const key of ['mockSales','mockProfit','mockOwed']) assert.match(page,new RegExp(`data-home-copy="${key}">[^<]*دج<`));
});
test('every Store Soft page uses the self-hosted app font (IBM Plex Sans Arabic), no Google Fonts', async()=>{
  const read=file=>readFile(new URL('../'+file,import.meta.url),'utf8');
  const fontCss=await read('assets/fonts/plex.css');
  for(const weight of ['Regular','Medium','SemiBold','Bold']){
    assert.match(fontCss,new RegExp(`IBMPlexSansArabic-${weight}\\.woff2`));
    assert.ok((await readFile(new URL(`../assets/fonts/IBMPlexSansArabic-${weight}.woff2`,import.meta.url))).length>10000);
  }
  for(const page of ['index.html','privacy.html','terms.html','delete-account.html','pricing/index.html','storesoft/download/index.html','storesoft/v1/android/index.html','storesoft/try/index.html']){
    const html=await read(page);
    assert.match(html,/href="\/assets\/fonts\/plex\.css/,page);
    assert.doesNotMatch(html,/fonts\.googleapis|fonts\.gstatic/,page);
  }
  assert.match(await read('storesoft/try/index.html'),/font-src 'self'/);
  for(const css of ['styles.css','pricing/pricing.css','storesoft/download/styles.css','storesoft/try/styles.css']){
    assert.match(await read(css),/"IBM Plex Sans Arabic"/,css);
    assert.doesNotMatch(await read(css),/Alexandria/,css);
  }
});
