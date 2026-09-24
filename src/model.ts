import type {Concept,Profile,Timing,Action} from './types';
export {demoApi as api} from './demoApi';
export const post=(value:unknown):RequestInit=>({method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(value)});
export function dateLabel(value:string|null|undefined){if(!value)return 'Date not stated';if(!/^\d{4}-\d{2}-\d{2}$/.test(value))return value;return new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}).format(new Date(value+'T00:00:00Z'));}
export function timeLabel(t:Timing){if(t.expression_type==='NOT_STATED')return 'Not stated';return t.date?dateLabel(t.date):t.raw_text||'Not stated';}
export function actionLabel(a:Action){if(a.fulfilment==='COMPLETED')return 'Completed';if(a.mode==='PROPOSED')return a.mandatory?'Proposed requirement':'Proposed option';return a.mandatory?'Requirement within stated scope':'Permitted action';}
export function readable(s:string){return s.replace(/^(IMP_|DT_)/,'').toLowerCase().replaceAll('_',' ').replace(/^./,c=>c.toUpperCase());}
export function profileName(p:Profile){const defaults:Record<string,string>={'Equity lawyer (fictional)':'Equity','Debt/trusts lawyer (fictional)':'Debt & trusts','Funds/regulatory lawyer (fictional)':'Funds & regulation'};return defaults[p.name]||p.name;}
export function flattenTaxonomy(t:Record<string,unknown>):Concept[]{const found=new Map<string,Concept>();function walk(x:unknown,family:string){if(Array.isArray(x)){x.forEach(v=>walk(v,family));return;}if(x&&typeof x==='object'){const o=x as Record<string,unknown>;if(typeof o.tag_id==='string'&&typeof o.display_name==='string')found.set(o.tag_id,{...(o as Concept),family});Object.values(o).filter(v=>v&&typeof v==='object').forEach(v=>walk(v,family));}}walk(t.practices,'Practice');Object.entries(t.tag_families as Record<string,unknown>).forEach(([k,v])=>walk(v,readable(k)));return [...found.values()];}
export const subscriptionAllowed=(c:Concept)=>! /^(LE_|AC_|OS_|IMP_|SD_)/.test(c.tag_id);
export function officialLink(url:string|null){if(!url)return null;try{const u=new URL(url);return ['https:','http:'].includes(u.protocol)&&(u.hostname==='sebi.gov.in'||u.hostname.endsWith('.sebi.gov.in'))?u.href:null;}catch{return null;}}
export function savedProfile(){try{return localStorage.getItem('ans.profile')||'equity-lawyer';}catch{return 'equity-lawyer';}}
