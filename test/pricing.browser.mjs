// Static website QA. Every non-local request is blocked.
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {createRequire} from 'node:module';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_PATH||'playwright');
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const server=createServer(async(req,res)=>{
  const relative=new URL(req.url,'http://localhost').pathname.replace(/\/$/,'/index.html');
  const target=path.resolve(root,'.'+relative);
  if(!target.startsWith(root+path.sep)){res.writeHead(403).end();return;}
  try{res.writeHead(200,{'Content-Type':({'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css','.png':'image/png','.woff2':'font/woff2'})[path.extname(target)]||'text/plain'}).end(await readFile(target));}catch{res.writeHead(404).end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base=`http://127.0.0.1:${server.address().port}`;
let browser;
try{
  browser=await chromium.launch({channel:process.env.PLAYWRIGHT_CHANNEL||'msedge',headless:true});
  for(const width of [320,390,599,600,900,1200,1440]){
    const context=await browser.newContext({viewport:{width,height:900}}),page=await context.newPage();
    const errors=[],external=[];
    page.on('pageerror',error=>errors.push(error.message));
    await page.route('**/*',route=>{if(route.request().url().startsWith(base))return route.continue();external.push(route.request().url());return route.abort();});
    // Pay once (Pro) plus optional Cloud Sync per extra device, like the app's Algeria page.
    const sign={ar:'دج',fr:'DA',en:'DZD'};
    const price=(n,language)=>n.replace(' ','\u00a0')+'\u00a0'+sign[language];
    for(const language of ['ar','fr','en']){
      await page.goto(base+'/pricing/?lang='+language);
      await page.locator('.offer').first().waitFor();
      assert.equal(await page.locator('html').getAttribute('dir'),language==='ar'?'rtl':'ltr');
      assert.equal(await page.locator('html').getAttribute('lang'),language);
      const card=page.locator('[data-code="pro"]');
      assert.equal(await page.locator('.offer').count(),1,'One clear card');
      assert.equal(await card.locator('.amount').textContent(),price('9 000',language));
      assert.equal(await card.locator('.count').innerText(),'0');
      assert.ok(await card.locator('.less').isDisabled(),'Cannot go below zero extra devices');
      assert.match(await card.locator('.extra').textContent(),new RegExp(price('4 000',language)));
      assert.equal(await card.locator('.offer > .features li, :scope > .features li').count(),5);
      assert.equal(await card.locator('.sync .features li').count(),5);
      assert.equal(await card.locator('.total-value').innerText(),price('9 000',language));
      assert.match(await card.locator('.payment').innerText(),/CCP[\s\S]*BaridiMob/);
      assert.equal(await page.locator('#status').isVisible(),false,'No status line when prices show');
      assert.equal(await page.locator('#help').isVisible(),false,'One WhatsApp button when prices show');
      assert.doesNotMatch(await page.locator('.offers').textContent(),/(^|\D)(6\s?900|3\s?000|7\s?000)(\D|$)/,'No old prices (6 900, 3 000, 7 000)');
      for(const other of Object.values(sign).filter(s=>s!==sign[language]))
        assert.doesNotMatch(await page.locator('.offers').textContent(),new RegExp('\\d\u00a0'+other+'(?![A-Z])'),`${language}: only ${sign[language]}`);
      assert.ok(await page.evaluate(async()=>{await document.fonts.ready;return document.fonts.check('700 16px "IBM Plex Sans Arabic"')&&getComputedStyle(document.body).fontFamily.startsWith('"IBM Plex Sans Arabic"');}),'App font is loaded');
      await card.locator('.more').click();await card.locator('.more').click();
      assert.equal(await card.locator('.count').innerText(),'2');
      assert.equal(await card.locator('.count-label').innerText(),{ar:'جهازان إضافيان',fr:'2 appareils en plus',en:'2 extra devices'}[language]);
      assert.equal(await card.locator('.total-value').innerText(),price('9 000',language)+' + '+price('8 000',language)+{ar:' / سنة',fr:' / an',en:' / year'}[language]);
      await card.locator('.more').click();
      assert.equal(await card.locator('.count').innerText(),'3');
      assert.ok(await card.locator('.more').isDisabled(),'Stops at 3 extra devices, like the app');
      assert.ok((await card.locator('.more-devices').getAttribute('href')).startsWith('https://wa.me/213654338649?text='),'More devices goes to WhatsApp');
      const order=decodeURIComponent((await card.locator('.button').getAttribute('href')).split('?text=')[1]);
      assert.ok(order.includes(price('9 000',language))&&order.includes(price('12 000',language)),'WhatsApp order carries the total');
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${width}/${language} overflow`);
      for(const selector of ['[data-code="pro"] .less','[data-code="pro"] .more','[data-code="pro"] .more-devices','[data-code="pro"] .button','[data-lang="ar"]']){
        const box=await page.locator(selector).boundingBox();assert.ok(box.height>=48&&box.width>=48,`${selector} touch target`);
      }
      await context.setOffline(true);
      await page.evaluate(()=>window.dispatchEvent(new Event('offline')));
      assert.equal(await page.locator('.offer').count(),1,'Loaded static prices remain available offline');
      await card.locator('.less').click();await card.locator('.less').click();await card.locator('.less').click();
      assert.equal(await card.locator('.total-value').innerText(),price('9 000',language));
      await context.setOffline(false);
      if(process.env.QA_OUTPUT_DIR&&[390,1440].includes(width)){await mkdir(process.env.QA_OUTPUT_DIR,{recursive:true});await page.screenshot({path:path.join(process.env.QA_OUTPUT_DIR,`static-pricing-${width}-${language}.png`),fullPage:true});}
    }
    await page.goto(base+'/pricing/?lang=invalid');assert.equal(await page.locator('html').getAttribute('lang'),'ar');
    // Missing offers: error line and the WhatsApp help box.
    await page.route('**/pricing/offers.js*',route=>route.fulfill({status:200,contentType:'text/javascript',body:''}));
    await page.goto(base+'/pricing/?lang=ar');
    assert.equal(await page.locator('.offer').count(),0);
    assert.ok(await page.locator('#status.error').isVisible());assert.ok(await page.locator('#support').isVisible());
    assert.match(await page.locator('#support').getAttribute('href'),/^https:\/\/wa.me\/213654338649/);
    await page.unroute('**/pricing/offers.js*');
    assert.deepEqual(external,[],'No Supabase or other API requests');assert.deepEqual(errors,[]);
    await context.close();console.log(`PASS static pricing AR/FR/EN, local totals, offline and layout ${width}px; zero external requests`);
  }
}finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
