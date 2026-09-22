import fs from "node:fs/promises";

const raw = JSON.parse(await fs.readFile("/workspace/scratch/maps_leads.json", "utf8"));
const domains = ["HireCarSpain.com", "HireCarSaudi.com", "HireCarEmirates.com", "HireCarNYC.com"];
const marketNames = {"HireCarSpain.com":"Spain","HireCarSaudi.com":"Saudi Arabia","HireCarEmirates.com":"United Arab Emirates","HireCarNYC.com":"New York City"};

function cleanPhone(phone, market) {
  const value = (phone || "").trim();
  if (market === "UAE" && /^0\d/.test(value)) return "+971 " + value.slice(1);
  if (market === "Saudi Arabia" && /^0\d/.test(value)) return "+966 " + value.slice(1);
  return value;
}
function candidate(phone, market) {
  const digits = (phone || "").replace(/\D/g, "");
  if (market === "Spain" && /^34[67]\d{8}$/.test(digits)) return digits;
  if (market === "Saudi Arabia" && /^9665\d{8}$/.test(digits)) return digits;
  if (market === "UAE" && /^9715\d{8}$/.test(digits)) return digits;
  if (market === "New York City" && /^1\d{10}$/.test(digits)) return digits;
  return "";
}
function directNumber(url) {
  try { const parsed = new URL(url); return (parsed.searchParams.get("phone") || parsed.pathname).replace(/\D/g, ""); }
  catch { return ""; }
}
function score(item) {
  let value = item.whatsapp_url ? 100 : 65;
  if (/\+971 5|\+966 5|\+34 6|\+34 7|\+1 \d{3}/.test(cleanPhone(item.maps_phone, item.market))) value += 10;
  return value;
}
function messages(item) {
  const company = item.name, domain = item.domain;
  if (domain === "HireCarSaudi.com") return {
    initial: `السلام عليكم فريق ${company}،\n\nنحن فريق مبيعات Domain Epoch. النطاق المميز ${domain} متاح للاستحواذ، وهو اسم واضح ودقيق لخدمات تأجير السيارات في السعودية. هل يمكن توجيهنا إلى مسؤول التسويق أو تطوير الأعمال لمعرفة ما إذا كانت شركتكم مهتمة به؟\n\nفريق مبيعات Domain Epoch\nsales@domainepoch.com`,
    follow1: `السلام عليكم فريق ${company}،\n\nنود متابعة رسالتنا السابقة بخصوص النطاق ${domain}، وهو اسم واضح ومميز مرتبط مباشرة بخدمات تأجير السيارات في السعودية. هل ترون أنه قد يكون مناسباً لشركتكم، أو يمكن توجيهنا إلى المسؤول عن التسويق أو تطوير الأعمال؟\n\nفريق مبيعات Domain Epoch\nsales@domainepoch.com`,
    follow2: `السلام عليكم فريق ${company}،\n\nنتابع معكم بخصوص النطاق ${domain}. يمكن استخدامه كصفحة حجز مخصصة للسوق السعودي، أو لحملة تسويقية، أو لاستقطاب العملاء الدوليين الباحثين عن تأجير السيارات في المملكة. هل ترغبون في مناقشة إمكانية الاستحواذ عليه؟\n\nفريق مبيعات Domain Epoch\nsales@domainepoch.com`,
    final: `السلام عليكم فريق ${company}،\n\nهذه متابعتنا الأخيرة بخصوص النطاق ${domain}. إذا كان الاسم مناسباً لخططكم الحالية أو المستقبلية في سوق تأجير السيارات السعودي، يسعدنا مناقشة التفاصيل مع المسؤول المختص. وإن لم يكن مناسباً حالياً، نشكركم على وقتكم.\n\nفريق مبيعات Domain Epoch\nsales@domainepoch.com`
  };
  if (domain === "HireCarSpain.com") return {
    initial: `Hola, equipo de ${company}.\n\nSomos el equipo comercial de Domain Epoch. El dominio ${domain} está disponible para su adquisición y es un nombre claro y directo para servicios de alquiler de coches en España. ¿Podrían indicarnos quién gestiona marketing, colaboraciones o desarrollo de negocio?\n\nEquipo comercial de Domain Epoch\nsales@domainepoch.com`,
    follow1: `Hola, equipo de ${company}.\n\nQueríamos dar seguimiento a nuestro mensaje anterior sobre ${domain}. ¿Consideran que este dominio podría ser relevante para su empresa, o podrían indicarnos quién gestiona marketing o desarrollo de negocio?\n\nEquipo comercial de Domain Epoch\nsales@domainepoch.com`,
    follow2: `Hola, equipo de ${company}.\n\nVolvemos a contactarles sobre ${domain}. El dominio podría utilizarse para una página de reservas, una campaña dirigida al mercado español o la captación de clientes internacionales. ¿Les interesaría valorar su adquisición?\n\nEquipo comercial de Domain Epoch\nsales@domainepoch.com`,
    final: `Hola, equipo de ${company}.\n\nEste es nuestro último seguimiento sobre ${domain}. Si el dominio puede encajar en sus planes actuales o futuros, estaremos encantados de facilitar más información. Si no es relevante por ahora, agradecemos igualmente su tiempo.\n\nEquipo comercial de Domain Epoch\nsales@domainepoch.com`
  };
  const market = marketNames[domain];
  return {
    initial: `Hello ${company} team,\n\nWe are the Domain Epoch Sales Team. ${domain} is available for acquisition and is a clear, market-specific name for car-rental services in ${market}. Could you connect us with the person responsible for marketing, partnerships, or business development?\n\nDomain Epoch Sales Team\nsales@domainepoch.com`,
    follow1: `Hello ${company} team,\n\nWe are following up on our previous message regarding ${domain}. Could this domain be relevant to your company, or could you direct us to the person responsible for marketing or business development?\n\nDomain Epoch Sales Team\nsales@domainepoch.com`,
    follow2: `Hello ${company} team,\n\nA quick follow-up regarding ${domain}. It could be used for a dedicated booking page, a market-focused campaign, or an international customer-acquisition page. Would your team consider discussing its acquisition?\n\nDomain Epoch Sales Team\nsales@domainepoch.com`,
    final: `Hello ${company} team,\n\nThis is our final follow-up regarding ${domain}. If the domain may fit your current or future plans, we would be happy to provide further details. If it is not relevant at this time, thank you for considering it.\n\nDomain Epoch Sales Team\nsales@domainepoch.com`
  };
}

const leads = domains.flatMap(domain => raw.filter(item => item.domain === domain).sort((a,b)=>score(b)-score(a)).slice(0,10).map(item => {
  const phone = item.whatsapp_url ? directNumber(item.whatsapp_url) : candidate(cleanPhone(item.maps_phone,item.market),item.market);
  return phone ? {id:`${domain}::${item.name}::${phone}`,company:item.name,domain,market:marketNames[domain],phone,verified:Boolean(item.whatsapp_url),messages:messages(item)} : null;
}).filter(Boolean));
const safeData = JSON.stringify(leads).replaceAll("<", "\\u003c");

const html = `<!doctype html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Domain Epoch Follow-ups</title><meta name="description" content="Private WhatsApp follow-up workspace for Domain Epoch.">
<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='14' fill='%23111c2f'/%3E%3Cpath d='M16 16h15c12 0 19 6 19 16s-7 16-19 16H16V16zm11 9v14h5c5 0 8-2 8-7s-3-7-8-7h-5z' fill='%2325d366'/%3E%3C/svg%3E">
<style>
:root{color-scheme:dark;--bg:#08101d;--panel:#111c2f;--panel2:#16243a;--line:#2a3b58;--text:#f8fafc;--muted:#a9b7cb;--green:#25d366;--blue:#4da3ff}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font:16px/1.45 Arial,sans-serif}
header{position:sticky;top:0;z-index:5;background:rgba(8,16,29,.96);border-bottom:1px solid var(--line);backdrop-filter:blur(10px)}
.top,main{width:min(1180px,calc(100% - 28px));margin:auto}.top{padding:18px 0 14px}h1{font-size:1.35rem;margin:0 0 14px}
.filters{display:grid;grid-template-columns:repeat(4,minmax(150px,1fr));gap:9px}select,input{width:100%;min-height:42px;border:1px solid var(--line);border-radius:9px;background:var(--panel);color:var(--text);padding:8px 10px;font:inherit}
main{padding:22px 0 60px}.summary{color:var(--muted);margin-bottom:14px}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(330px,1fr));gap:13px}
article{background:var(--panel);border:1px solid var(--line);border-radius:13px;padding:16px;display:flex;flex-direction:column;gap:13px}.heading{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}.heading h2{font-size:1rem;margin:0}.domain{font-size:.82rem;color:#bfdbfe;margin-top:3px}
.badge{font-size:.73rem;padding:4px 7px;border-radius:999px;background:#332c18;color:#fde68a;white-space:nowrap}.badge.verified{background:#113521;color:#86efac}
.buttons{display:grid;grid-template-columns:1fr 1fr;gap:8px}.buttons a{min-height:43px;display:flex;align-items:center;justify-content:center;border-radius:9px;text-decoration:none;font-weight:700;font-size:.88rem;padding:8px;text-align:center}
.initial{border:1px solid var(--line);color:#dbeafe;background:var(--panel2)}.follow{background:var(--green);color:#052e16}.second{background:var(--blue);color:#06182b}.final{background:#e8edf5;color:#152033}
.tracking{display:grid;grid-template-columns:1.35fr 1fr;gap:8px}.empty{padding:35px;text-align:center;color:var(--muted);border:1px dashed var(--line);border-radius:12px}
@media(max-width:720px){.filters{grid-template-columns:1fr 1fr}.grid{grid-template-columns:1fr}.top,main{width:min(100% - 20px,1180px)}}@media(max-width:430px){.filters,.buttons,.tracking{grid-template-columns:1fr}}
</style></head><body>
<header><div class="top"><h1>Domain Epoch — WhatsApp follow-ups</h1><p class="summary">After sending a message, update the lead status and last-contact date.</p><div class="filters">
<select id="domainFilter" aria-label="Filter by domain"><option value="">All domains</option>${domains.map(d=>`<option>${d}</option>`).join("")}</select>
<select id="marketFilter" aria-label="Filter by market"><option value="">All markets</option>${Object.values(marketNames).map(m=>`<option>${m}</option>`).join("")}</select>
<select id="verificationFilter" aria-label="Filter by verification"><option value="">All numbers</option><option value="verified">Maps-verified</option><option value="candidate">Needs confirmation</option></select>
<select id="statusFilter" aria-label="Filter by status"><option value="">All statuses</option><option>Not sent</option><option>Initial message sent</option><option>Follow-up 1 sent</option><option>Follow-up 2 sent</option><option>Replied</option><option>Interested</option><option>Not interested</option><option>Invalid number</option></select>
</div></div></header><main><div id="summary" class="summary"></div><div id="grid" class="grid"></div></main>
<script>
const leads=${safeData};
const statusOptions=["Not sent","Initial message sent","Follow-up 1 sent","Follow-up 2 sent","Replied","Interested","Not interested","Invalid number"];
const storageKey="domainEpochFollowupsV1";
const saved=JSON.parse(localStorage.getItem(storageKey)||"{}");
const filters=["domainFilter","marketFilter","verificationFilter","statusFilter"].map(function(id){return document.getElementById(id)});
const wa=function(phone,text){return "https://wa.me/"+phone+"?text="+encodeURIComponent(text)};
const esc=function(value){return String(value).replace(/[&<>"']/g,function(ch){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]})};
function stateFor(id){return saved[id]||{status:"Not sent",date:""}}
function save(id,key,value){saved[id]=Object.assign({},stateFor(id));saved[id][key]=value;localStorage.setItem(storageKey,JSON.stringify(saved));render()}
function card(lead){
  const state=stateFor(lead.id);
  const options=statusOptions.map(function(x){return '<option '+(x===state.status?'selected':'')+'>'+x+'</option>'}).join('');
  return '<article data-id="'+esc(lead.id)+'"><div class="heading"><div><h2>'+esc(lead.company)+'</h2><div class="domain">'+lead.domain+' · '+lead.market+'</div></div><span class="badge '+(lead.verified?'verified':'')+'">'+(lead.verified?'Maps verified':'Confirm identity')+'</span></div><div class="buttons"><a class="initial" target="_blank" rel="noopener" href="'+wa(lead.phone,lead.messages.initial)+'">Initial message</a><a class="follow" target="_blank" rel="noopener" href="'+wa(lead.phone,lead.messages.follow1)+'">Follow-up 1</a><a class="second" target="_blank" rel="noopener" href="'+wa(lead.phone,lead.messages.follow2)+'">Follow-up 2</a><a class="final" target="_blank" rel="noopener" href="'+wa(lead.phone,lead.messages.final)+'">Final follow-up</a></div><div class="tracking"><select class="lead-status" aria-label="Status for '+esc(lead.company)+'">'+options+'</select><input class="lead-date" type="date" aria-label="Last contact date for '+esc(lead.company)+'" value="'+(state.date||'')+'"></div></article>';
}
function bindTracking(){
  document.querySelectorAll('article[data-id]').forEach(function(article){
    const id=article.dataset.id;
    article.querySelector('.lead-status').addEventListener('change',function(){save(id,'status',this.value)});
    article.querySelector('.lead-date').addEventListener('change',function(){save(id,'date',this.value)});
  });
}
function render(){
  const values=filters.map(function(x){return x.value}),domain=values[0],market=values[1],verification=values[2],status=values[3];
  const visible=leads.filter(function(lead){const state=stateFor(lead.id);return(!domain||lead.domain===domain)&&(!market||lead.market===market)&&(!verification||(verification==="verified"&&lead.verified)||(verification==="candidate"&&!lead.verified))&&(!status||state.status===status)});
  document.getElementById("summary").textContent=visible.length+" of "+leads.length+" usable WhatsApp contacts";
  document.getElementById("grid").innerHTML=visible.length?visible.map(card).join(""):'<div class="empty">No leads match these filters.</div>';
  bindTracking();
}
filters.forEach(function(el){el.addEventListener("change",render)});render();
</script></body></html>`;
await fs.mkdir("dist",{recursive:true});await fs.writeFile("dist/index.html",html);
