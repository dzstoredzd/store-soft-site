// Arabic pages: every number written with a thousands space ("9 000", "18 450") must be
// drawn in the right order. In right-to-left text a plain space can split it and show
// "000 9". Measures where the browser really draws each digit group. Every non-local
// request is blocked. Run: PLAYWRIGHT_PATH=<playwright> node test/rtl-prices.browser.mjs
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_PATH||'playwright');
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css',
  '.png':'image/png','.webp':'image/webp','.woff2':'font/woff2','.json':'application/json; charset=utf-8'};
const server=createServer(async(req,res)=>{
  const relative=decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/\/$/,'/index.html');
  const target=path.resolve(root,'.'+relative);
  if(!target.startsWith(root+path.sep)){res.writeHead(403).end();return;}
  try{res.writeHead(200,{'Content-Type':types[path.extname(target)]||'text/plain'}).end(await readFile(target));}
  catch{res.writeHead(404).end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base=`http://127.0.0.1:${server.address().port}`;
const pages=['/','/pricing/','/pricing/?lang=ar&embed=1','/usb/','/windows/','/storesoft/download/','/storesoft/v1/android/'];
let browser;
const problems=[];
try{
  browser=await chromium.launch({channel:process.env.PLAYWRIGHT_CHANNEL||'msedge',headless:true});
  for(const width of [375,1280]){
    const page=await browser.newPage({viewport:{width,height:900}});
    await page.route('**/*',route=>route.request().url().startsWith(base)?route.continue():route.abort());
    for(const url of pages){
      await page.goto(base+url);
      await page.waitForTimeout(800);
      // Open every FAQ so its text is laid out too.
      await page.evaluate(()=>document.querySelectorAll('details').forEach(d=>{d.open=true;}));
      // Pricing: add two Sync devices so the "once + per year" total is drawn too.
      if(url.startsWith('/pricing/')){await page.locator('.more').first().click();await page.locator('.more').first().click();}
      const found=await page.evaluate(()=>{
        const out=[];let checked=0;
        const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
        for(let n=walker.nextNode();n;n=walker.nextNode()){
          const el=n.parentElement;
          if(!el||el.closest('script,style,noscript,option,select,[hidden]'))continue;
          const re=/(\d{1,3})[ \u00a0\u202f](\d{3})(?!\d)/g;let m;
          while((m=re.exec(n.data))){
            const a=document.createRange();a.setStart(n,m.index);a.setEnd(n,m.index+1);
            const startB=m.index+m[1].length+1;
            const b=document.createRange();b.setStart(n,startB);b.setEnd(n,startB+1);
            const ra=a.getBoundingClientRect(),rb=b.getBoundingClientRect();
            if(!ra.width||!rb.width)continue;
            checked++;
            // Same line only; the first digit group must be left of the thousands group.
            if(Math.abs(ra.top-rb.top)<4&&ra.left>rb.left)out.push(m[0]+' in "'+n.data.trim().slice(0,70)+'"');
          }
          // "9 000 دج" reads right to left: the sign is drawn on the left of the number.
          const sign=/(\d)[\s\u00a0]دج/g;
          while((m=sign.exec(n.data))){
            const d=document.createRange();d.setStart(n,m.index);d.setEnd(n,m.index+1);
            const s=document.createRange();s.setStart(n,m.index+2);s.setEnd(n,m.index+3);
            const rd=d.getBoundingClientRect(),rs=s.getBoundingClientRect();
            if(!rd.width||!rs.width||Math.abs(rd.top-rs.top)>=4)continue;
            checked++;
            if(rs.left>rd.left)out.push('sign on the wrong side in "'+n.data.trim().slice(0,70)+'"');
          }
        }
        // Pricing total "9 000 دج + 8 000 دج / سنة": the once price comes first (on the right).
        document.querySelectorAll('.total-value').forEach(total=>{
          const parts=total.querySelectorAll('bdi');
          if(parts.length<2||parts[1].closest('[hidden]'))return;
          checked++;
          if(parts[0].getBoundingClientRect().left<parts[1].getBoundingClientRect().left)out.push('total order "'+total.innerText+'"');
        });
        return {checked,bad:out};
      });
      if(!found.checked&&!url.includes('download')&&!url.includes('android')&&url!=='/windows/')problems.push(`${url} @${width}: no price found to check`);
      for(const bad of found.bad)problems.push(`${url} @${width}: reversed ${bad}`);
      console.log(`${url} @${width}: ${found.checked} numbers checked, ${found.bad.length} reversed`);
    }
    await page.close();
  }
  assert.deepEqual(problems,[],'\n'+problems.join('\n'));
  console.log('Arabic number order: ok');
}finally{await browser?.close();server.close();}
