import type {CSSProperties} from 'react';
export function Icon({name,size=18,style}:{name:string;size?:number;style?:CSSProperties}){const paths:Record<string,React.ReactNode>={
 updates:<><path d="M4 4h16v16H4zM8 8h8M8 12h8M8 16h5"/></>,
 subscriptions:<><path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="3" fill="currentColor"/><circle cx="16" cy="17" r="3" fill="currentColor"/></>,
 documents:<><path d="M6 3h8l4 4v14H6zM14 3v5h4M9 12h6M9 16h6"/></>,
 search:<><circle cx="10" cy="10" r="6"/><path d="m15 15 5 5"/></>,
 arrow:<path d="M4 12h16m-6-6 6 6-6 6"/>,
 close:<path d="m6 6 12 12M6 18 18 6"/>,
 bookmark:<path d="M6 3h12v18l-6-4-6 4z"/>,
 chevron:<path d="m8 5 7 7-7 7"/>,
 external:<><path d="M14 3h7v7m0-7L10 14M10 5H4v15h15v-6"/></>,
 plus:<path d="M12 4v16M4 12h16"/>,
 check:<path d="m5 12 4 4L19 6"/>,
 upload:<><path d="M12 16V3m-5 5 5-5 5 5M4 16v5h16v-5"/></>,
 info:<><circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v1"/></>,
 clock:<><circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/></>,
 filter:<><path d="M4 6h16M7 12h10M10 18h4"/></>,
 lock:<><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V6a4 4 0 0 1 8 0v4"/></>,
 };return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={style}>{paths[name]||paths.documents}</svg>;}
