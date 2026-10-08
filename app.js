const FE_KEY='fundededge_firms_v4';
const COMPARE_KEY='fundededge_compare_v4';
const AUTH_KEY='fundededge_admin_session_v4';
const ADMIN_EMAIL='admin@fundededge.com';
const ADMIN_PASSWORD='FundedEdge123!'; // DEMO ONLY — replace with server-side auth before launch

const SEED=[
 {id:'ftmo',name:'FTMO',category:'Forex / CFD',sizes:'$10K–$200K',price:'From €89',target:'10%',dailyDD:'5%',maxDD:'10%',split:'80–90%',payout:'Bi-weekly',platforms:'MT4 / MT5 / cTrader / DXtrade',rating:4.9,tag:'Top Rated',status:'active',verified:'2026-10-08',website:'https://ftmo.com/',affiliate:'',description:'Established proprietary trading firm with structured evaluation programs and multiple trading platforms.'},
 {id:'the5ers',name:'The5ers',category:'Forex / CFD',sizes:'$5K–$100K+',price:'From $39',target:'Varies',dailyDD:'5%',maxDD:'6–10%',split:'Up to 100%',payout:'14 days',platforms:'MT5 / cTrader',rating:4.7,tag:'Flexible',status:'active',verified:'2026-10-08',website:'https://the5ers.com/',affiliate:'',description:'Funding programs focused on flexible growth paths and multiple account options.'},
 {id:'topstep',name:'Topstep',category:'Futures',sizes:'$50K–$150K',price:'Varies',target:'Varies',dailyDD:'Varies',maxDD:'Varies',split:'Up to 90%',payout:'Varies',platforms:'TopstepX',rating:4.8,tag:'Futures',status:'active',verified:'2026-10-08',website:'https://www.topstep.com/',affiliate:'',description:'Futures-focused trading program with a dedicated trading platform and evaluation structure.'},
 {id:'apex',name:'Apex Trader Funding',category:'Futures',sizes:'$25K–$300K+',price:'Varies',target:'Varies',dailyDD:'Varies',maxDD:'Varies',split:'Up to 100%',payout:'Varies',platforms:'NinjaTrader / Rithmic / Tradovate',rating:4.7,tag:'Popular',status:'active',verified:'2026-10-08',website:'https://apextraderfunding.com/',affiliate:'',description:'Futures prop firm offering multiple account sizes and platform connections.'}
];
function esc(v=''){return String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
function seed(){try{if(!localStorage.getItem(FE_KEY))localStorage.setItem(FE_KEY,JSON.stringify(SEED));}catch(e){}}
function firms(){seed();try{return JSON.parse(localStorage.getItem(FE_KEY)||'[]')}catch(e){return [...SEED]}}
function setFirms(v){localStorage.setItem(FE_KEY,JSON.stringify(v));}
function compareIds(){try{return JSON.parse(localStorage.getItem(COMPARE_KEY)||'[]')}catch(e){return []}}
function addCompare(id){let a=compareIds();if(!a.includes(id))a.push(id);if(a.length>3)a=a.slice(-3);localStorage.setItem(COMPARE_KEY,JSON.stringify(a));toast('Added to comparison');}
function removeCompare(id){localStorage.setItem(COMPARE_KEY,JSON.stringify(compareIds().filter(x=>x!==id)));}
function toast(msg){let el=document.getElementById('toast');if(!el){el=document.createElement('div');el.id='toast';el.className='toast';document.body.appendChild(el)}el.textContent=msg;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),1800)}
function card(f){return `<article class="card"><div class="cardtop"><span class="tag">${esc(f.tag||'Prop Firm')}</span><span class="rating">★ ${esc(f.rating)}</span></div><div class="firmname">${esc(f.name)}</div><div class="muted">${esc(f.category)}</div><div class="stats"><div class="stat"><small>Account sizes</small><strong>${esc(f.sizes)}</strong></div><div class="stat"><small>Starting price</small><strong>${esc(f.price)}</strong></div><div class="stat"><small>Max drawdown</small><strong>${esc(f.maxDD)}</strong></div><div class="stat"><small>Profit split</small><strong>${esc(f.split)}</strong></div></div><div class="actions"><a class="btn" href="firm.html?id=${encodeURIComponent(f.id)}">View profile</a><button class="btn btn-primary" onclick="addCompare('${esc(f.id)}')">Compare</button></div></article>`}
function requireAdmin(){if(sessionStorage.getItem(AUTH_KEY)!=='1'){location.href='admin.html';return false}return true}
function loginAdmin(email,password){if(email===ADMIN_EMAIL&&password===ADMIN_PASSWORD){sessionStorage.setItem(AUTH_KEY,'1');return true}return false}
function logoutAdmin(){sessionStorage.removeItem(AUTH_KEY);location.href='admin.html';}
window.addEventListener('DOMContentLoaded',seed);
