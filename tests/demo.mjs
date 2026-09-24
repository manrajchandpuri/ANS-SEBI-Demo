import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
const base=process.env.DEMO_URL||'http://127.0.0.1:4178';
const browser=await chromium.launch({headless:true});
const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
try {
 await page.goto(base);await page.getByRole('heading',{name:'Regulatory updates',exact:true}).waitFor();
 await page.locator('.update-list[aria-busy="false"]').waitFor();
 const cases=JSON.parse(await fs.readFile(new URL('./matching.json',import.meta.url),'utf8'));
 for(const c of cases){const result=await page.evaluate(async c=>{const {demoApi}=await import('/src/demoApi.ts');const q=new URLSearchParams({profile_id:c.profile.id,view:'for_you',limit:'200'});for(const [k,v] of Object.entries(c.filters)){if(k==='topics')v.forEach(t=>q.append('topic',t));else q.set(k,v);}const r=await demoApi('/updates?'+q);return r.updates.map(r=>({id:r.id,events:r.events.map(e=>e.id),matches:r.matches.map(m=>[m.event_id,m.rule_id])}));},c);assert.deepEqual(result,c.expected);}
 console.log('PASS 15 original-engine matching and filter comparisons');
 await page.locator('.update-open').first().click();await page.getByRole('heading',{name:'What changed',exact:true}).waitFor();await page.getByRole('button',{name:'Close update details'}).click();
 const b=page.locator('.row-save').first();await b.click();await page.waitForFunction(()=>document.querySelector('.row-save')?.getAttribute('aria-pressed')==='true');await page.reload();await page.locator('.update-list[aria-busy="false"]').waitFor();assert.equal(await page.locator('.row-save').first().getAttribute('aria-pressed'),'true');
 await page.goto(base+'/subscriptions');await page.getByRole('heading',{name:'Subscriptions',exact:true}).waitFor();
 await page.evaluate(async()=>{const {demoApi}=await import('/src/demoApi.ts');await demoApi('/profiles',{method:'POST',body:JSON.stringify({id:'demo-profile',name:'Demo profile',rules:[{id:'r',all_of:['FR']}],exclude:[]})});});
 await page.reload();await page.getByRole('combobox',{name:'Active subscription profile'}).locator('option',{hasText:'Demo profile'}).waitFor({state:'attached'});
 await page.goto(base+'/documents-view');await page.getByRole('heading',{name:'Documents',exact:true}).waitFor();await page.locator('.document-line').first().waitFor();
 const manifest=await (await fetch(base+'/snapshot-manifest.json')).json();
 for(const [id,hash] of Object.entries(manifest.pdf_sha256)){const r=await fetch(base+`/sources/${id}.pdf`);assert(r.ok);assert.equal(crypto.createHash('sha256').update(Buffer.from(await r.arrayBuffer())).digest('hex'),hash);}
 console.log('PASS saved changes, profile persistence, direct routes and '+manifest.documents+' PDF hashes');
 await page.getByRole('button',{name:'Reset demo',exact:true}).click();await page.waitForFunction(()=>localStorage.getItem('ans-demo-v1')===null);
 assert.deepEqual(errors,[]);console.log('PASS reset and no browser errors');
}finally{await browser.close();}
