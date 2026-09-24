import type {Profile} from './types';
type Data=any;
let loaded:Promise<Data>;
const KEY='ans-demo-v1';
function local():Data {try{return JSON.parse(localStorage.getItem(KEY)||'{}');}catch{return {};}}
function persist(value:Data){localStorage.setItem(KEY,JSON.stringify(value));}
export async function demoApi<T>(url:string,init?:RequestInit):Promise<T>{
 if(init?.signal?.aborted)throw new DOMException('Aborted','AbortError');
 loaded ||= fetch('/snapshot.json').then(r=>{if(!r.ok)throw new Error('Demo snapshot unavailable');return r.json();});
 const data=await loaded, saved=local(), profiles:Profile[]=saved.profiles||data.profiles;
 const u=new URL(url,location.origin),p=u.pathname,params=u.searchParams;
 const body=typeof init?.body==='string'?JSON.parse(init.body):null;
 const method=init?.method||'GET';
 const tags:Data={};function walk(v:Data){if(Array.isArray(v))v.forEach(walk);else if(v&&typeof v==='object'){if(v.tag_id)tags[v.tag_id]=v;Object.values(v).forEach(walk);}}walk(data.taxonomy);
 function ancestors(tag:string){const result:string[]=[];while(tag&&!result.includes(tag)){result.push(tag);tag=tags[tag]?.parent;}return result;}
 function label(id:string){return {id,name:tags[id]?.display_name||id};}
 function validate(profile:Profile){if(!profile.name.trim()||!profile.rules.length)throw new Error('Choose a name and at least one subscription.');for(const t of [...profile.exclude,...profile.rules.flatMap(r=>r.all_of)])if(!tags[t]||/^(LE_|AC_|OS_|IMP_|SD_)/.test(t))throw new Error('Invalid subscription tag.');}
 function matches(id:string,profile?:Profile){if(!profile)return [];const d=data.records[id],out:Data[]=[];for(const e of d.events){const direct=e.notification.routing_tag_ids as string[],inherited=direct.flatMap(ancestors);if(profile.exclude.some(t=>inherited.includes(t)))continue;for(const r of profile.rules){if(!r.all_of.every(t=>inherited.includes(t)))continue;const matched=direct.filter(t=>r.all_of.some(c=>ancestors(t).includes(c)));const ids=e.classification_support.filter((s:Data)=>s.tag_ids.some((t:string)=>matched.includes(t))).flatMap((s:Data)=>s.evidence_ids);out.push({event_id:e.event_id,event_title:e.title,rule_id:r.id,reason:'Matches '+r.all_of.map(t=>tags[t].display_name).join(', ')+' within this event.',subscriptions:r.all_of.map(label),tags:matched.map(label),evidence:d.evidence.filter((x:Data)=>ids.includes(x.evidence_id)).map((x:Data)=>({...x,url:`/sources/${id}.pdf#page=${x.pdf_page_start}`}))});}}return out;}
 const profile=profiles.find(x=>x.id===params.get('profile_id'));
 function rows(pr:Profile|undefined,view='all',filter=true){return data.updates.map((row:Data)=>{const state=saved.states?.[pr?.id||'']?.[row.id]||{read:false,saved:false};const allMatches=matches(row.id,pr);const events=row.events.filter((e:Data)=>{
 if(view==='for_you'&&!allMatches.some(m=>m.event_id===e.id))return false;
 if(!filter)return true;
 const raw=data.records[row.id].events.find((x:Data)=>x.event_id===e.id),inherited=raw.notification.routing_tag_ids.flatMap(ancestors);
 if(!params.getAll('topic').every(t=>inherited.includes(t)))return false;
 const text=[row.title,e.title,e.position,...raw.classification.affected_entities.map((x:Data)=>x.name_or_scope),...raw.notification.routing_tag_ids.map((t:string)=>tags[t]?.display_name||t)].join(' ').toLowerCase();
 return (params.get('q')||'').toLowerCase().split(/\s+/).every(t=>text.includes(t));});
 const rank=['IMP_CRITICAL','IMP_HIGH','IMP_MEDIUM','IMP_LOW','IMP_INFORMATIONAL'];
 return {...row,state,events,matches:allMatches.filter(m=>events.some((e:Data)=>e.id===m.event_id)),topics:[...new Set(events.flatMap((e:Data)=>(e.topics||[]).map((t:Data)=>t.id)))].map(t=>label(t as string)),importance:events.map((e:Data)=>e.importance).sort((a:string,b:string)=>rank.indexOf(a)-rank.indexOf(b))[0]};
 }).filter((r:Data)=>r.events.length&&(view!=='saved'||r.state.saved)&&(!filter||((!params.get('document_type')||r.document_type.id===params.get('document_type'))&&(!params.get('date_from')||(r.published_date&&r.published_date>=params.get('date_from')!))&&(!params.get('date_to')||(r.published_date&&r.published_date<=params.get('date_to')!)))));}
 let result:Data;
 if(p==='/taxonomy')result={taxonomy:data.taxonomy};
 else if(p==='/readiness')result={frontend_ready:true,corpus_integrity_passed:true,corpus_records:data.updates.length};
 else if(p==='/profiles'&&method==='GET')result=profiles;
 else if(p==='/profiles'&&method==='POST'){validate(body);saved.profiles=[...profiles.filter(x=>x.id!==body.id),body];persist(saved);result=body;}
 else if(p==='/profiles/preview'){validate(body);const list=rows(body,'for_you',false);result={updates:list,total:list.length,reviewed_total:data.updates.length,saved:false,group_counts:Object.fromEntries(body.rules.map((r:Data)=>[r.id,list.filter((x:Data)=>x.matches.some((m:Data)=>m.rule_id===r.id)).length]))};}
 else if(/^\/profiles\/[^/]+\/documents\/[^/]+\/state$/.test(p)&&method==='PATCH'){const parts=p.split('/'),pid=parts[2],id=parts[4];if(!profiles.some(x=>x.id===pid)||!data.records[id])throw new Error('Unknown profile or document');saved.states||={};saved.states[pid]||={};result={...(saved.states[pid][id]||{read:false,saved:false}),...body};saved.states[pid][id]=result;persist(saved);}
 else if(p==='/updates'){const list=rows(profile,params.get('view')||'all');const offset=Number(params.get('offset')||0),limit=Number(params.get('limit')||100);result={updates:list.slice(offset,offset+limit),total:list.length,offset,limit};}
 else if(p.startsWith('/updates/'))result=rows(profile,'all',false).find((r:Data)=>r.id===p.split('/')[2]);
 else if(p==='/documents'&&method==='GET')result={documents:data.documents.filter((d:Data)=>JSON.stringify(d).toLowerCase().includes((params.get('q')||'').toLowerCase()))};
 else if(p.startsWith('/documents/')&&method==='GET')result={document:data.documents.find((d:Data)=>d.id===p.split('/')[2])};
 else throw new Error('This action is unavailable in the saved-record demonstration.');
 if(result===undefined)throw new Error('Saved record not found');
 return structuredClone(result) as T;
}
