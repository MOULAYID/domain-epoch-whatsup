const page = "<!doctype html><html lang=\"en\"><head>\n<meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">\n<title>Domain Epoch Follow-ups</title><meta name=\"description\" content=\"Private WhatsApp follow-up workspace for Domain Epoch.\">\n<link rel=\"icon\" type=\"image/svg+xml\" href=\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='14' fill='%23111c2f'/%3E%3Cpath d='M16 16h15c12 0 19 6 19 16s-7 16-19 16H16V16zm11 9v14h5c5 0 8-2 8-7s-3-7-8-7h-5z' fill='%2325d366'/%3E%3C/svg%3E\">\n<style>\n:root{color-scheme:dark;--bg:#08101d;--panel:#111c2f;--panel2:#16243a;--line:#2a3b58;--text:#f8fafc;--muted:#a9b7cb;--green:#25d366;--blue:#4da3ff}\n*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font:16px/1.45 Arial,sans-serif}\nheader{position:sticky;top:0;z-index:5;background:rgba(8,16,29,.96);border-bottom:1px solid var(--line);backdrop-filter:blur(10px)}\n.top,main{width:min(1180px,calc(100% - 28px));margin:auto}.top{padding:18px 0 14px}h1{font-size:1.35rem;margin:0 0 14px}\n.filters{display:grid;grid-template-columns:repeat(4,minmax(150px,1fr));gap:9px}select,input{width:100%;min-height:42px;border:1px solid var(--line);border-radius:9px;background:var(--panel);color:var(--text);padding:8px 10px;font:inherit}\nmain{padding:22px 0 60px}.summary{color:var(--muted);margin-bottom:14px}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(330px,1fr));gap:13px}\narticle{background:var(--panel);border:1px solid var(--line);border-radius:13px;padding:16px;display:flex;flex-direction:column;gap:13px}.heading{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}.heading h2{font-size:1rem;margin:0}.domain{font-size:.82rem;color:#bfdbfe;margin-top:3px}\n.badge{font-size:.73rem;padding:4px 7px;border-radius:999px;background:#332c18;color:#fde68a;white-space:nowrap}.badge.verified{background:#113521;color:#86efac}\n.buttons{display:grid;grid-template-columns:1fr 1fr;gap:8px}.buttons a{min-height:43px;display:flex;align-items:center;justify-content:center;border-radius:9px;text-decoration:none;font-weight:700;font-size:.88rem;padding:8px;text-align:center}\n.initial{border:1px solid var(--line);color:#dbeafe;background:var(--panel2)}.follow{background:var(--green);color:#052e16}.second{background:var(--blue);color:#06182b}.final{background:#e8edf5;color:#152033}\n.tracking{display:grid;grid-template-columns:1.35fr 1fr;gap:8px}.empty{padding:35px;text-align:center;color:var(--muted);border:1px dashed var(--line);border-radius:12px}\n@media(max-width:720px){.filters{grid-template-columns:1fr 1fr}.grid{grid-template-columns:1fr}.top,main{width:min(100% - 20px,1180px)}}@media(max-width:430px){.filters,.buttons,.tracking{grid-template-columns:1fr}}\n</style></head><body>\n<header><div class=\"top\"><h1>Domain Epoch — WhatsApp follow-ups</h1><p class=\"summary\">After sending a message, update the lead status and last-contact date.</p><div class=\"filters\">\n<select id=\"domainFilter\" aria-label=\"Filter by domain\"><option value=\"\">All domains</option><option>HireCarSpain.com</option><option>HireCarSaudi.com</option><option>HireCarEmirates.com</option><option>HireCarNYC.com</option></select>\n<select id=\"marketFilter\" aria-label=\"Filter by market\"><option value=\"\">All markets</option><option>Spain</option><option>Saudi Arabia</option><option>United Arab Emirates</option><option>New York City</option></select>\n<select id=\"verificationFilter\" aria-label=\"Filter by verification\"><option value=\"\">All numbers</option><option value=\"verified\">Maps-verified</option><option value=\"candidate\">Needs confirmation</option></select>\n<select id=\"statusFilter\" aria-label=\"Filter by status\"><option value=\"\">All statuses</option><option>Not sent</option><option>Initial message sent</option><option>Follow-up 1 sent</option><option>Follow-up 2 sent</option><option>Replied</option><option>Interested</option><option>Not interested</option><option>Invalid number</option></select>\n</div></div></header><main><div id=\"summary\" class=\"summary\"></div><div id=\"grid\" class=\"grid\"></div></main>\n<script>\nlet leads=[];\nconst statusOptions=[\"Not sent\",\"Initial message sent\",\"Follow-up 1 sent\",\"Follow-up 2 sent\",\"Replied\",\"Interested\",\"Not interested\",\"Invalid number\"];\nconst saved={};\nconst filters=[\"domainFilter\",\"marketFilter\",\"verificationFilter\",\"statusFilter\"].map(function(id){return document.getElementById(id)});\nconst wa=function(phone,text){return \"https://wa.me/\"+phone+\"?text=\"+encodeURIComponent(text)};\nconst esc=function(value){return String(value).replace(/[&<>\"']/g,function(ch){return {\"&\":\"&amp;\",\"<\":\"&lt;\",\">\":\"&gt;\",'\"':\"&quot;\",\"'\":\"&#39;\"}[ch]})};\nfunction stateFor(id){return saved[id]||{status:\"Not sent\",date:\"\"}}\nasync function save(id,key,value){\n  const previous=Object.assign({},stateFor(id));\n  const next=Object.assign({},previous);next[key]=value;\n  saved[id]=next;\n  try{\n    const response=await fetch(\"/api/leads/\"+encodeURIComponent(id),{method:\"PATCH\",headers:{\"content-type\":\"application/json\"},body:JSON.stringify({status:next.status,last_contact_date:next.date||null})});\n    if(!response.ok)throw new Error(\"Save failed\");\n    render();\n  }catch(error){\n    saved[id]=previous;\n    alert(\"The update could not be saved. Please try again.\");\n    render();\n  }\n}\nfunction card(lead){\n  const state=stateFor(lead.id);\n  const options=statusOptions.map(function(x){return '<option '+(x===state.status?'selected':'')+'>'+x+'</option>'}).join('');\n  return '<article data-id=\"'+esc(lead.id)+'\"><div class=\"heading\"><div><h2>'+esc(lead.company)+'</h2><div class=\"domain\">'+lead.domain+' · '+lead.market+'</div></div><span class=\"badge '+(lead.verified?'verified':'')+'\">'+(lead.verified?'Maps verified':'Confirm identity')+'</span></div><div class=\"buttons\"><a class=\"initial\" target=\"_blank\" rel=\"noopener\" href=\"'+wa(lead.phone,lead.messages.initial)+'\">Initial message</a><a class=\"follow\" target=\"_blank\" rel=\"noopener\" href=\"'+wa(lead.phone,lead.messages.follow1)+'\">Follow-up 1</a><a class=\"second\" target=\"_blank\" rel=\"noopener\" href=\"'+wa(lead.phone,lead.messages.follow2)+'\">Follow-up 2</a><a class=\"final\" target=\"_blank\" rel=\"noopener\" href=\"'+wa(lead.phone,lead.messages.final)+'\">Final follow-up</a></div><div class=\"tracking\"><select class=\"lead-status\" aria-label=\"Status for '+esc(lead.company)+'\">'+options+'</select><input class=\"lead-date\" type=\"date\" aria-label=\"Last contact date for '+esc(lead.company)+'\" value=\"'+(state.date||'')+'\"></div></article>';\n}\nfunction bindTracking(){\n  document.querySelectorAll('article[data-id]').forEach(function(article){\n    const id=article.dataset.id;\n    article.querySelector('.lead-status').addEventListener('change',function(){save(id,'status',this.value)});\n    article.querySelector('.lead-date').addEventListener('change',function(){save(id,'date',this.value)});\n  });\n}\nfunction render(){\n  const values=filters.map(function(x){return x.value}),domain=values[0],market=values[1],verification=values[2],status=values[3];\n  const visible=leads.filter(function(lead){const state=stateFor(lead.id);return(!domain||lead.domain===domain)&&(!market||lead.market===market)&&(!verification||(verification===\"verified\"&&lead.verified)||(verification===\"candidate\"&&!lead.verified))&&(!status||state.status===status)});\n  document.getElementById(\"summary\").textContent=visible.length+\" of \"+leads.length+\" usable WhatsApp contacts\";\n  document.getElementById(\"grid\").innerHTML=visible.length?visible.map(card).join(\"\"):'<div class=\"empty\">No leads match these filters.</div>';\n  bindTracking();\n}\nasync function load(){\n  document.getElementById(\"summary\").textContent=\"Loading leads…\";\n  try{\n    const response=await fetch(\"/api/leads\");\n    if(!response.ok)throw new Error(\"Load failed\");\n    const payload=await response.json();leads=payload.leads;\n    leads.forEach(function(lead){saved[lead.id]={status:lead.status||\"Not sent\",date:lead.last_contact_date||\"\"}});\n    render();\n  }catch(error){\n    document.getElementById(\"summary\").textContent=\"The database is temporarily unavailable. Refresh to try again.\";\n  }\n}\nfilters.forEach(function(el){el.addEventListener(\"change\",render)});load();\n</script></body></html>\n";
const seedLeads = [
  {
    "id": "HireCarSpain.com::Alquicoche::34672058044",
    "company": "Alquicoche",
    "domain": "HireCarSpain.com",
    "market": "Spain",
    "phone": "34672058044",
    "verified": false,
    "messages": {
      "initial": "Hola, equipo de Alquicoche.\n\nSomos el equipo comercial de Domain Epoch. El dominio HireCarSpain.com está disponible para su adquisición y es un nombre claro y directo para servicios de alquiler de coches en España. ¿Podrían indicarnos quién gestiona marketing, colaboraciones o desarrollo de negocio?\n\nEquipo comercial de Domain Epoch\nsales@domainepoch.com",
      "follow1": "Hola, equipo de Alquicoche.\n\nQueríamos dar seguimiento a nuestro mensaje anterior sobre HireCarSpain.com. ¿Consideran que este dominio podría ser relevante para su empresa, o podrían indicarnos quién gestiona marketing o desarrollo de negocio?\n\nEquipo comercial de Domain Epoch\nsales@domainepoch.com",
      "follow2": "Hola, equipo de Alquicoche.\n\nVolvemos a contactarles sobre HireCarSpain.com. El dominio podría utilizarse para una página de reservas, una campaña dirigida al mercado español o la captación de clientes internacionales. ¿Les interesaría valorar su adquisición?\n\nEquipo comercial de Domain Epoch\nsales@domainepoch.com",
      "final": "Hola, equipo de Alquicoche.\n\nEste es nuestro último seguimiento sobre HireCarSpain.com. Si el dominio puede encajar en sus planes actuales o futuros, estaremos encantados de facilitar más información. Si no es relevante por ahora, agradecemos igualmente su tiempo.\n\nEquipo comercial de Domain Epoch\nsales@domainepoch.com"
    }
  },
  {
    "id": "HireCarSpain.com::Drive Me Barcelona, Supercar Driving Experiences, Rentals & Events::34661640740",
    "company": "Drive Me Barcelona, Supercar Driving Experiences, Rentals & Events",
    "domain": "HireCarSpain.com",
    "market": "Spain",
    "phone": "34661640740",
    "verified": false,
    "messages": {
      "initial": "Hola, equipo de Drive Me Barcelona, Supercar Driving Experiences, Rentals & Events.\n\nSomos el equipo comercial de Domain Epoch. El dominio HireCarSpain.com está disponible para su adquisición y es un nombre claro y directo para servicios de alquiler de coches en España. ¿Podrían indicarnos quién gestiona marketing, colaboraciones o desarrollo de negocio?\n\nEquipo comercial de Domain Epoch\nsales@domainepoch.com",
      "follow1": "Hola, equipo de Drive Me Barcelona, Supercar Driving Experiences, Rentals & Events.\n\nQueríamos dar seguimiento a nuestro mensaje anterior sobre HireCarSpain.com. ¿Consideran que este dominio podría ser relevante para su empresa, o podrían indicarnos quién gestiona marketing o desarrollo de negocio?\n\nEquipo comercial de Domain Epoch\nsales@domainepoch.com",
      "follow2": "Hola, equipo de Drive Me Barcelona, Supercar Driving Experiences, Rentals & Events.\n\nVolvemos a contactarles sobre HireCarSpain.com. El dominio podría utilizarse para una página de reservas, una campaña dirigida al mercado español o la captación de clientes internacionales. ¿Les interesaría valorar su adquisición?\n\nEquipo comercial de Domain Epoch\nsales@domainepoch.com",
      "final": "Hola, equipo de Drive Me Barcelona, Supercar Driving Experiences, Rentals & Events.\n\nEste es nuestro último seguimiento sobre HireCarSpain.com. Si el dominio puede encajar en sus planes actuales o futuros, estaremos encantados de facilitar más información. Si no es relevante por ahora, agradecemos igualmente su tiempo.\n\nEquipo comercial de Domain Epoch\nsales@domainepoch.com"
    }
  },
  {
    "id": "HireCarSpain.com::Minarent::34671615169",
    "company": "Minarent",
    "domain": "HireCarSpain.com",
    "market": "Spain",
    "phone": "34671615169",
    "verified": false,
    "messages": {
      "initial": "Hola, equipo de Minarent.\n\nSomos el equipo comercial de Domain Epoch. El dominio HireCarSpain.com está disponible para su adquisición y es un nombre claro y directo para servicios de alquiler de coches en España. ¿Podrían indicarnos quién gestiona marketing, colaboraciones o desarrollo de negocio?\n\nEquipo comercial de Domain Epoch\nsales@domainepoch.com",
      "follow1": "Hola, equipo de Minarent.\n\nQueríamos dar seguimiento a nuestro mensaje anterior sobre HireCarSpain.com. ¿Consideran que este dominio podría ser relevante para su empresa, o podrían indicarnos quién gestiona marketing o desarrollo de negocio?\n\nEquipo comercial de Domain Epoch\nsales@domainepoch.com",
      "follow2": "Hola, equipo de Minarent.\n\nVolvemos a contactarles sobre HireCarSpain.com. El dominio podría utilizarse para una página de reservas, una campaña dirigida al mercado español o la captación de clientes internacionales. ¿Les interesaría valorar su adquisición?\n\nEquipo comercial de Domain Epoch\nsales@domainepoch.com",
      "final": "Hola, equipo de Minarent.\n\nEste es nuestro último seguimiento sobre HireCarSpain.com. Si el dominio puede encajar en sus planes actuales o futuros, estaremos encantados de facilitar más información. Si no es relevante por ahora, agradecemos igualmente su tiempo.\n\nEquipo comercial de Domain Epoch\nsales@domainepoch.com"
    }
  },
  {
    "id": "HireCarSaudi.com::Rent 2 You Rent A Car::966531252518",
    "company": "Rent 2 You Rent A Car",
    "domain": "HireCarSaudi.com",
    "market": "Saudi Arabia",
    "phone": "966531252518",
    "verified": false,
    "messages": {
      "initial": "السلام عليكم فريق Rent 2 You Rent A Car،\n\nنحن فريق مبيعات Domain Epoch. النطاق المميز HireCarSaudi.com متاح للاستحواذ، وهو اسم واضح ودقيق لخدمات تأجير السيارات في السعودية. هل يمكن توجيهنا إلى مسؤول التسويق أو تطوير الأعمال لمعرفة ما إذا كانت شركتكم مهتمة به؟\n\nفريق مبيعات Domain Epoch\nsales@domainepoch.com",
      "follow1": "السلام عليكم فريق Rent 2 You Rent A Car،\n\nنود متابعة رسالتنا السابقة بخصوص النطاق HireCarSaudi.com، وهو اسم واضح ومميز مرتبط مباشرة بخدمات تأجير السيارات في السعودية. هل ترون أنه قد يكون مناسباً لشركتكم، أو يمكن توجيهنا إلى المسؤول عن التسويق أو تطوير الأعمال؟\n\nفريق مبيعات Domain Epoch\nsales@domainepoch.com",
      "follow2": "السلام عليكم فريق Rent 2 You Rent A Car،\n\nنتابع معكم بخصوص النطاق HireCarSaudi.com. يمكن استخدامه كصفحة حجز مخصصة للسوق السعودي، أو لحملة تسويقية، أو لاستقطاب العملاء الدوليين الباحثين عن تأجير السيارات في المملكة. هل ترغبون في مناقشة إمكانية الاستحواذ عليه؟\n\nفريق مبيعات Domain Epoch\nsales@domainepoch.com",
      "final": "السلام عليكم فريق Rent 2 You Rent A Car،\n\nهذه متابعتنا الأخيرة بخصوص النطاق HireCarSaudi.com. إذا كان الاسم مناسباً لخططكم الحالية أو المستقبلية في سوق تأجير السيارات السعودي، يسعدنا مناقشة التفاصيل مع المسؤول المختص. وإن لم يكن مناسباً حالياً، نشكركم على وقتكم.\n\nفريق مبيعات Domain Epoch\nsales@domainepoch.com"
    }
  },
  {
    "id": "HireCarSaudi.com::Sixt rent a car Riyadh Al Thumama::966541860627",
    "company": "Sixt rent a car Riyadh Al Thumama",
    "domain": "HireCarSaudi.com",
    "market": "Saudi Arabia",
    "phone": "966541860627",
    "verified": false,
    "messages": {
      "initial": "السلام عليكم فريق Sixt rent a car Riyadh Al Thumama،\n\nنحن فريق مبيعات Domain Epoch. النطاق المميز HireCarSaudi.com متاح للاستحواذ، وهو اسم واضح ودقيق لخدمات تأجير السيارات في السعودية. هل يمكن توجيهنا إلى مسؤول التسويق أو تطوير الأعمال لمعرفة ما إذا كانت شركتكم مهتمة به؟\n\nفريق مبيعات Domain Epoch\nsales@domainepoch.com",
      "follow1": "السلام عليكم فريق Sixt rent a car Riyadh Al Thumama،\n\nنود متابعة رسالتنا السابقة بخصوص النطاق HireCarSaudi.com، وهو اسم واضح ومميز مرتبط مباشرة بخدمات تأجير السيارات في السعودية. هل ترون أنه قد يكون مناسباً لشركتكم، أو يمكن توجيهنا إلى المسؤول عن التسويق أو تطوير الأعمال؟\n\nفريق مبيعات Domain Epoch\nsales@domainepoch.com",
      "follow2": "السلام عليكم فريق Sixt rent a car Riyadh Al Thumama،\n\nنتابع معكم بخصوص النطاق HireCarSaudi.com. يمكن استخدامه كصفحة حجز مخصصة للسوق السعودي، أو لحملة تسويقية، أو لاستقطاب العملاء الدوليين الباحثين عن تأجير السيارات في المملكة. هل ترغبون في مناقشة إمكانية الاستحواذ عليه؟\n\nفريق مبيعات Domain Epoch\nsales@domainepoch.com",
      "final": "السلام عليكم فريق Sixt rent a car Riyadh Al Thumama،\n\nهذه متابعتنا الأخيرة بخصوص النطاق HireCarSaudi.com. إذا كان الاسم مناسباً لخططكم الحالية أو المستقبلية في سوق تأجير السيارات السعودي، يسعدنا مناقشة التفاصيل مع المسؤول المختص. وإن لم يكن مناسباً حالياً، نشكركم على وقتكم.\n\nفريق مبيعات Domain Epoch\nsales@domainepoch.com"
    }
  },
  {
    "id": "HireCarSaudi.com::SIXT Rent a Car Riyadh Airport Terminal 5::966541859670",
    "company": "SIXT Rent a Car Riyadh Airport Terminal 5",
    "domain": "HireCarSaudi.com",
    "market": "Saudi Arabia",
    "phone": "966541859670",
    "verified": false,
    "messages": {
      "initial": "السلام عليكم فريق SIXT Rent a Car Riyadh Airport Terminal 5،\n\nنحن فريق مبيعات Domain Epoch. النطاق المميز HireCarSaudi.com متاح للاستحواذ، وهو اسم واضح ودقيق لخدمات تأجير السيارات في السعودية. هل يمكن توجيهنا إلى مسؤول التسويق أو تطوير الأعمال لمعرفة ما إذا كانت شركتكم مهتمة به؟\n\nفريق مبيعات Domain Epoch\nsales@domainepoch.com",
      "follow1": "السلام عليكم فريق SIXT Rent a Car Riyadh Airport Terminal 5،\n\nنود متابعة رسالتنا السابقة بخصوص النطاق HireCarSaudi.com، وهو اسم واضح ومميز مرتبط مباشرة بخدمات تأجير السيارات في السعودية. هل ترون أنه قد يكون مناسباً لشركتكم، أو يمكن توجيهنا إلى المسؤول عن التسويق أو تطوير الأعمال؟\n\nفريق مبيعات Domain Epoch\nsales@domainepoch.com",
      "follow2": "السلام عليكم فريق SIXT Rent a Car Riyadh Airport Terminal 5،\n\nنتابع معكم بخصوص النطاق HireCarSaudi.com. يمكن استخدامه كصفحة حجز مخصصة للسوق السعودي، أو لحملة تسويقية، أو لاستقطاب العملاء الدوليين الباحثين عن تأجير السيارات في المملكة. هل ترغبون في مناقشة إمكانية الاستحواذ عليه؟\n\nفريق مبيعات Domain Epoch\nsales@domainepoch.com",
      "final": "السلام عليكم فريق SIXT Rent a Car Riyadh Airport Terminal 5،\n\nهذه متابعتنا الأخيرة بخصوص النطاق HireCarSaudi.com. إذا كان الاسم مناسباً لخططكم الحالية أو المستقبلية في سوق تأجير السيارات السعودي، يسعدنا مناقشة التفاصيل مع المسؤول المختص. وإن لم يكن مناسباً حالياً، نشكركم على وقتكم.\n\nفريق مبيعات Domain Epoch\nsales@domainepoch.com"
    }
  },
  {
    "id": "HireCarSaudi.com::Budget::966536276946",
    "company": "Budget",
    "domain": "HireCarSaudi.com",
    "market": "Saudi Arabia",
    "phone": "966536276946",
    "verified": false,
    "messages": {
      "initial": "السلام عليكم فريق Budget،\n\nنحن فريق مبيعات Domain Epoch. النطاق المميز HireCarSaudi.com متاح للاستحواذ، وهو اسم واضح ودقيق لخدمات تأجير السيارات في السعودية. هل يمكن توجيهنا إلى مسؤول التسويق أو تطوير الأعمال لمعرفة ما إذا كانت شركتكم مهتمة به؟\n\nفريق مبيعات Domain Epoch\nsales@domainepoch.com",
      "follow1": "السلام عليكم فريق Budget،\n\nنود متابعة رسالتنا السابقة بخصوص النطاق HireCarSaudi.com، وهو اسم واضح ومميز مرتبط مباشرة بخدمات تأجير السيارات في السعودية. هل ترون أنه قد يكون مناسباً لشركتكم، أو يمكن توجيهنا إلى المسؤول عن التسويق أو تطوير الأعمال؟\n\nفريق مبيعات Domain Epoch\nsales@domainepoch.com",
      "follow2": "السلام عليكم فريق Budget،\n\nنتابع معكم بخصوص النطاق HireCarSaudi.com. يمكن استخدامه كصفحة حجز مخصصة للسوق السعودي، أو لحملة تسويقية، أو لاستقطاب العملاء الدوليين الباحثين عن تأجير السيارات في المملكة. هل ترغبون في مناقشة إمكانية الاستحواذ عليه؟\n\nفريق مبيعات Domain Epoch\nsales@domainepoch.com",
      "final": "السلام عليكم فريق Budget،\n\nهذه متابعتنا الأخيرة بخصوص النطاق HireCarSaudi.com. إذا كان الاسم مناسباً لخططكم الحالية أو المستقبلية في سوق تأجير السيارات السعودي، يسعدنا مناقشة التفاصيل مع المسؤول المختص. وإن لم يكن مناسباً حالياً، نشكركم على وقتكم.\n\nفريق مبيعات Domain Epoch\nsales@domainepoch.com"
    }
  },
  {
    "id": "HireCarSaudi.com::Budget Rent A Car::966538432235",
    "company": "Budget Rent A Car",
    "domain": "HireCarSaudi.com",
    "market": "Saudi Arabia",
    "phone": "966538432235",
    "verified": false,
    "messages": {
      "initial": "السلام عليكم فريق Budget Rent A Car،\n\nنحن فريق مبيعات Domain Epoch. النطاق المميز HireCarSaudi.com متاح للاستحواذ، وهو اسم واضح ودقيق لخدمات تأجير السيارات في السعودية. هل يمكن توجيهنا إلى مسؤول التسويق أو تطوير الأعمال لمعرفة ما إذا كانت شركتكم مهتمة به؟\n\nفريق مبيعات Domain Epoch\nsales@domainepoch.com",
      "follow1": "السلام عليكم فريق Budget Rent A Car،\n\nنود متابعة رسالتنا السابقة بخصوص النطاق HireCarSaudi.com، وهو اسم واضح ومميز مرتبط مباشرة بخدمات تأجير السيارات في السعودية. هل ترون أنه قد يكون مناسباً لشركتكم، أو يمكن توجيهنا إلى المسؤول عن التسويق أو تطوير الأعمال؟\n\nفريق مبيعات Domain Epoch\nsales@domainepoch.com",
      "follow2": "السلام عليكم فريق Budget Rent A Car،\n\nنتابع معكم بخصوص النطاق HireCarSaudi.com. يمكن استخدامه كصفحة حجز مخصصة للسوق السعودي، أو لحملة تسويقية، أو لاستقطاب العملاء الدوليين الباحثين عن تأجير السيارات في المملكة. هل ترغبون في مناقشة إمكانية الاستحواذ عليه؟\n\nفريق مبيعات Domain Epoch\nsales@domainepoch.com",
      "final": "السلام عليكم فريق Budget Rent A Car،\n\nهذه متابعتنا الأخيرة بخصوص النطاق HireCarSaudi.com. إذا كان الاسم مناسباً لخططكم الحالية أو المستقبلية في سوق تأجير السيارات السعودي، يسعدنا مناقشة التفاصيل مع المسؤول المختص. وإن لم يكن مناسباً حالياً، نشكركم على وقتكم.\n\nفريق مبيعات Domain Epoch\nsales@domainepoch.com"
    }
  },
  {
    "id": "HireCarSaudi.com::First Class Rent A Car::966599436176",
    "company": "First Class Rent A Car",
    "domain": "HireCarSaudi.com",
    "market": "Saudi Arabia",
    "phone": "966599436176",
    "verified": false,
    "messages": {
      "initial": "السلام عليكم فريق First Class Rent A Car،\n\nنحن فريق مبيعات Domain Epoch. النطاق المميز HireCarSaudi.com متاح للاستحواذ، وهو اسم واضح ودقيق لخدمات تأجير السيارات في السعودية. هل يمكن توجيهنا إلى مسؤول التسويق أو تطوير الأعمال لمعرفة ما إذا كانت شركتكم مهتمة به؟\n\nفريق مبيعات Domain Epoch\nsales@domainepoch.com",
      "follow1": "السلام عليكم فريق First Class Rent A Car،\n\nنود متابعة رسالتنا السابقة بخصوص النطاق HireCarSaudi.com، وهو اسم واضح ومميز مرتبط مباشرة بخدمات تأجير السيارات في السعودية. هل ترون أنه قد يكون مناسباً لشركتكم، أو يمكن توجيهنا إلى المسؤول عن التسويق أو تطوير الأعمال؟\n\nفريق مبيعات Domain Epoch\nsales@domainepoch.com",
      "follow2": "السلام عليكم فريق First Class Rent A Car،\n\nنتابع معكم بخصوص النطاق HireCarSaudi.com. يمكن استخدامه كصفحة حجز مخصصة للسوق السعودي، أو لحملة تسويقية، أو لاستقطاب العملاء الدوليين الباحثين عن تأجير السيارات في المملكة. هل ترغبون في مناقشة إمكانية الاستحواذ عليه؟\n\nفريق مبيعات Domain Epoch\nsales@domainepoch.com",
      "final": "السلام عليكم فريق First Class Rent A Car،\n\nهذه متابعتنا الأخيرة بخصوص النطاق HireCarSaudi.com. إذا كان الاسم مناسباً لخططكم الحالية أو المستقبلية في سوق تأجير السيارات السعودي، يسعدنا مناقشة التفاصيل مع المسؤول المختص. وإن لم يكن مناسباً حالياً، نشكركم على وقتكم.\n\nفريق مبيعات Domain Epoch\nsales@domainepoch.com"
    }
  },
  {
    "id": "HireCarSaudi.com::Budget Rent A Car | بدجت لتاجير السيارات::966573880459",
    "company": "Budget Rent A Car | بدجت لتاجير السيارات",
    "domain": "HireCarSaudi.com",
    "market": "Saudi Arabia",
    "phone": "966573880459",
    "verified": false,
    "messages": {
      "initial": "السلام عليكم فريق Budget Rent A Car | بدجت لتاجير السيارات،\n\nنحن فريق مبيعات Domain Epoch. النطاق المميز HireCarSaudi.com متاح للاستحواذ، وهو اسم واضح ودقيق لخدمات تأجير السيارات في السعودية. هل يمكن توجيهنا إلى مسؤول التسويق أو تطوير الأعمال لمعرفة ما إذا كانت شركتكم مهتمة به؟\n\nفريق مبيعات Domain Epoch\nsales@domainepoch.com",
      "follow1": "السلام عليكم فريق Budget Rent A Car | بدجت لتاجير السيارات،\n\nنود متابعة رسالتنا السابقة بخصوص النطاق HireCarSaudi.com، وهو اسم واضح ومميز مرتبط مباشرة بخدمات تأجير السيارات في السعودية. هل ترون أنه قد يكون مناسباً لشركتكم، أو يمكن توجيهنا إلى المسؤول عن التسويق أو تطوير الأعمال؟\n\nفريق مبيعات Domain Epoch\nsales@domainepoch.com",
      "follow2": "السلام عليكم فريق Budget Rent A Car | بدجت لتاجير السيارات،\n\nنتابع معكم بخصوص النطاق HireCarSaudi.com. يمكن استخدامه كصفحة حجز مخصصة للسوق السعودي، أو لحملة تسويقية، أو لاستقطاب العملاء الدوليين الباحثين عن تأجير السيارات في المملكة. هل ترغبون في مناقشة إمكانية الاستحواذ عليه؟\n\nفريق مبيعات Domain Epoch\nsales@domainepoch.com",
      "final": "السلام عليكم فريق Budget Rent A Car | بدجت لتاجير السيارات،\n\nهذه متابعتنا الأخيرة بخصوص النطاق HireCarSaudi.com. إذا كان الاسم مناسباً لخططكم الحالية أو المستقبلية في سوق تأجير السيارات السعودي، يسعدنا مناقشة التفاصيل مع المسؤول المختص. وإن لم يكن مناسباً حالياً، نشكركم على وقتكم.\n\nفريق مبيعات Domain Epoch\nsales@domainepoch.com"
    }
  },
  {
    "id": "HireCarSaudi.com::More Rent a Car::966506209555",
    "company": "More Rent a Car",
    "domain": "HireCarSaudi.com",
    "market": "Saudi Arabia",
    "phone": "966506209555",
    "verified": false,
    "messages": {
      "initial": "السلام عليكم فريق More Rent a Car،\n\nنحن فريق مبيعات Domain Epoch. النطاق المميز HireCarSaudi.com متاح للاستحواذ، وهو اسم واضح ودقيق لخدمات تأجير السيارات في السعودية. هل يمكن توجيهنا إلى مسؤول التسويق أو تطوير الأعمال لمعرفة ما إذا كانت شركتكم مهتمة به؟\n\nفريق مبيعات Domain Epoch\nsales@domainepoch.com",
      "follow1": "السلام عليكم فريق More Rent a Car،\n\nنود متابعة رسالتنا السابقة بخصوص النطاق HireCarSaudi.com، وهو اسم واضح ومميز مرتبط مباشرة بخدمات تأجير السيارات في السعودية. هل ترون أنه قد يكون مناسباً لشركتكم، أو يمكن توجيهنا إلى المسؤول عن التسويق أو تطوير الأعمال؟\n\nفريق مبيعات Domain Epoch\nsales@domainepoch.com",
      "follow2": "السلام عليكم فريق More Rent a Car،\n\nنتابع معكم بخصوص النطاق HireCarSaudi.com. يمكن استخدامه كصفحة حجز مخصصة للسوق السعودي، أو لحملة تسويقية، أو لاستقطاب العملاء الدوليين الباحثين عن تأجير السيارات في المملكة. هل ترغبون في مناقشة إمكانية الاستحواذ عليه؟\n\nفريق مبيعات Domain Epoch\nsales@domainepoch.com",
      "final": "السلام عليكم فريق More Rent a Car،\n\nهذه متابعتنا الأخيرة بخصوص النطاق HireCarSaudi.com. إذا كان الاسم مناسباً لخططكم الحالية أو المستقبلية في سوق تأجير السيارات السعودي، يسعدنا مناقشة التفاصيل مع المسؤول المختص. وإن لم يكن مناسباً حالياً، نشكركم على وقتكم.\n\nفريق مبيعات Domain Epoch\nsales@domainepoch.com"
    }
  },
  {
    "id": "HireCarSaudi.com::Hertz Car Rental - Jeddah - Ar Rabwah::966554466137",
    "company": "Hertz Car Rental - Jeddah - Ar Rabwah",
    "domain": "HireCarSaudi.com",
    "market": "Saudi Arabia",
    "phone": "966554466137",
    "verified": false,
    "messages": {
      "initial": "السلام عليكم فريق Hertz Car Rental - Jeddah - Ar Rabwah،\n\nنحن فريق مبيعات Domain Epoch. النطاق المميز HireCarSaudi.com متاح للاستحواذ، وهو اسم واضح ودقيق لخدمات تأجير السيارات في السعودية. هل يمكن توجيهنا إلى مسؤول التسويق أو تطوير الأعمال لمعرفة ما إذا كانت شركتكم مهتمة به؟\n\nفريق مبيعات Domain Epoch\nsales@domainepoch.com",
      "follow1": "السلام عليكم فريق Hertz Car Rental - Jeddah - Ar Rabwah،\n\nنود متابعة رسالتنا السابقة بخصوص النطاق HireCarSaudi.com، وهو اسم واضح ومميز مرتبط مباشرة بخدمات تأجير السيارات في السعودية. هل ترون أنه قد يكون مناسباً لشركتكم، أو يمكن توجيهنا إلى المسؤول عن التسويق أو تطوير الأعمال؟\n\nفريق مبيعات Domain Epoch\nsales@domainepoch.com",
      "follow2": "السلام عليكم فريق Hertz Car Rental - Jeddah - Ar Rabwah،\n\nنتابع معكم بخصوص النطاق HireCarSaudi.com. يمكن استخدامه كصفحة حجز مخصصة للسوق السعودي، أو لحملة تسويقية، أو لاستقطاب العملاء الدوليين الباحثين عن تأجير السيارات في المملكة. هل ترغبون في مناقشة إمكانية الاستحواذ عليه؟\n\nفريق مبيعات Domain Epoch\nsales@domainepoch.com",
      "final": "السلام عليكم فريق Hertz Car Rental - Jeddah - Ar Rabwah،\n\nهذه متابعتنا الأخيرة بخصوص النطاق HireCarSaudi.com. إذا كان الاسم مناسباً لخططكم الحالية أو المستقبلية في سوق تأجير السيارات السعودي، يسعدنا مناقشة التفاصيل مع المسؤول المختص. وإن لم يكن مناسباً حالياً، نشكركم على وقتكم.\n\nفريق مبيعات Domain Epoch\nsales@domainepoch.com"
    }
  },
  {
    "id": "HireCarSaudi.com::إيسار لتأجير السيارات في جدة::966581487047",
    "company": "إيسار لتأجير السيارات في جدة",
    "domain": "HireCarSaudi.com",
    "market": "Saudi Arabia",
    "phone": "966581487047",
    "verified": false,
    "messages": {
      "initial": "السلام عليكم فريق إيسار لتأجير السيارات في جدة،\n\nنحن فريق مبيعات Domain Epoch. النطاق المميز HireCarSaudi.com متاح للاستحواذ، وهو اسم واضح ودقيق لخدمات تأجير السيارات في السعودية. هل يمكن توجيهنا إلى مسؤول التسويق أو تطوير الأعمال لمعرفة ما إذا كانت شركتكم مهتمة به؟\n\nفريق مبيعات Domain Epoch\nsales@domainepoch.com",
      "follow1": "السلام عليكم فريق إيسار لتأجير السيارات في جدة،\n\nنود متابعة رسالتنا السابقة بخصوص النطاق HireCarSaudi.com، وهو اسم واضح ومميز مرتبط مباشرة بخدمات تأجير السيارات في السعودية. هل ترون أنه قد يكون مناسباً لشركتكم، أو يمكن توجيهنا إلى المسؤول عن التسويق أو تطوير الأعمال؟\n\nفريق مبيعات Domain Epoch\nsales@domainepoch.com",
      "follow2": "السلام عليكم فريق إيسار لتأجير السيارات في جدة،\n\nنتابع معكم بخصوص النطاق HireCarSaudi.com. يمكن استخدامه كصفحة حجز مخصصة للسوق السعودي، أو لحملة تسويقية، أو لاستقطاب العملاء الدوليين الباحثين عن تأجير السيارات في المملكة. هل ترغبون في مناقشة إمكانية الاستحواذ عليه؟\n\nفريق مبيعات Domain Epoch\nsales@domainepoch.com",
      "final": "السلام عليكم فريق إيسار لتأجير السيارات في جدة،\n\nهذه متابعتنا الأخيرة بخصوص النطاق HireCarSaudi.com. إذا كان الاسم مناسباً لخططكم الحالية أو المستقبلية في سوق تأجير السيارات السعودي، يسعدنا مناقشة التفاصيل مع المسؤول المختص. وإن لم يكن مناسباً حالياً، نشكركم على وقتكم.\n\nفريق مبيعات Domain Epoch\nsales@domainepoch.com"
    }
  },
  {
    "id": "HireCarEmirates.com::Uptown Rent a Car - Luxury Cars for Rent in Dubai::971586877777",
    "company": "Uptown Rent a Car - Luxury Cars for Rent in Dubai",
    "domain": "HireCarEmirates.com",
    "market": "United Arab Emirates",
    "phone": "971586877777",
    "verified": true,
    "messages": {
      "initial": "Hello Uptown Rent a Car - Luxury Cars for Rent in Dubai team,\n\nWe are the Domain Epoch Sales Team. HireCarEmirates.com is available for acquisition and is a clear, market-specific name for car-rental services in United Arab Emirates. Could you connect us with the person responsible for marketing, partnerships, or business development?\n\nDomain Epoch Sales Team\nsales@domainepoch.com",
      "follow1": "Hello Uptown Rent a Car - Luxury Cars for Rent in Dubai team,\n\nWe are following up on our previous message regarding HireCarEmirates.com. Could this domain be relevant to your company, or could you direct us to the person responsible for marketing or business development?\n\nDomain Epoch Sales Team\nsales@domainepoch.com",
      "follow2": "Hello Uptown Rent a Car - Luxury Cars for Rent in Dubai team,\n\nA quick follow-up regarding HireCarEmirates.com. It could be used for a dedicated booking page, a market-focused campaign, or an international customer-acquisition page. Would your team consider discussing its acquisition?\n\nDomain Epoch Sales Team\nsales@domainepoch.com",
      "final": "Hello Uptown Rent a Car - Luxury Cars for Rent in Dubai team,\n\nThis is our final follow-up regarding HireCarEmirates.com. If the domain may fit your current or future plans, we would be happy to provide further details. If it is not relevant at this time, thank you for considering it.\n\nDomain Epoch Sales Team\nsales@domainepoch.com"
    }
  },
  {
    "id": "HireCarEmirates.com::VIP Car Rental::971553451555",
    "company": "VIP Car Rental",
    "domain": "HireCarEmirates.com",
    "market": "United Arab Emirates",
    "phone": "971553451555",
    "verified": false,
    "messages": {
      "initial": "Hello VIP Car Rental team,\n\nWe are the Domain Epoch Sales Team. HireCarEmirates.com is available for acquisition and is a clear, market-specific name for car-rental services in United Arab Emirates. Could you connect us with the person responsible for marketing, partnerships, or business development?\n\nDomain Epoch Sales Team\nsales@domainepoch.com",
      "follow1": "Hello VIP Car Rental team,\n\nWe are following up on our previous message regarding HireCarEmirates.com. Could this domain be relevant to your company, or could you direct us to the person responsible for marketing or business development?\n\nDomain Epoch Sales Team\nsales@domainepoch.com",
      "follow2": "Hello VIP Car Rental team,\n\nA quick follow-up regarding HireCarEmirates.com. It could be used for a dedicated booking page, a market-focused campaign, or an international customer-acquisition page. Would your team consider discussing its acquisition?\n\nDomain Epoch Sales Team\nsales@domainepoch.com",
      "final": "Hello VIP Car Rental team,\n\nThis is our final follow-up regarding HireCarEmirates.com. If the domain may fit your current or future plans, we would be happy to provide further details. If it is not relevant at this time, thank you for considering it.\n\nDomain Epoch Sales Team\nsales@domainepoch.com"
    }
  },
  {
    "id": "HireCarEmirates.com::RRG Rental Car LLC::971521545907",
    "company": "RRG Rental Car LLC",
    "domain": "HireCarEmirates.com",
    "market": "United Arab Emirates",
    "phone": "971521545907",
    "verified": false,
    "messages": {
      "initial": "Hello RRG Rental Car LLC team,\n\nWe are the Domain Epoch Sales Team. HireCarEmirates.com is available for acquisition and is a clear, market-specific name for car-rental services in United Arab Emirates. Could you connect us with the person responsible for marketing, partnerships, or business development?\n\nDomain Epoch Sales Team\nsales@domainepoch.com",
      "follow1": "Hello RRG Rental Car LLC team,\n\nWe are following up on our previous message regarding HireCarEmirates.com. Could this domain be relevant to your company, or could you direct us to the person responsible for marketing or business development?\n\nDomain Epoch Sales Team\nsales@domainepoch.com",
      "follow2": "Hello RRG Rental Car LLC team,\n\nA quick follow-up regarding HireCarEmirates.com. It could be used for a dedicated booking page, a market-focused campaign, or an international customer-acquisition page. Would your team consider discussing its acquisition?\n\nDomain Epoch Sales Team\nsales@domainepoch.com",
      "final": "Hello RRG Rental Car LLC team,\n\nThis is our final follow-up regarding HireCarEmirates.com. If the domain may fit your current or future plans, we would be happy to provide further details. If it is not relevant at this time, thank you for considering it.\n\nDomain Epoch Sales Team\nsales@domainepoch.com"
    }
  },
  {
    "id": "HireCarEmirates.com::X Car Rental - Sports and Luxury Car Rental Dubai::971529292988",
    "company": "X Car Rental - Sports and Luxury Car Rental Dubai",
    "domain": "HireCarEmirates.com",
    "market": "United Arab Emirates",
    "phone": "971529292988",
    "verified": false,
    "messages": {
      "initial": "Hello X Car Rental - Sports and Luxury Car Rental Dubai team,\n\nWe are the Domain Epoch Sales Team. HireCarEmirates.com is available for acquisition and is a clear, market-specific name for car-rental services in United Arab Emirates. Could you connect us with the person responsible for marketing, partnerships, or business development?\n\nDomain Epoch Sales Team\nsales@domainepoch.com",
      "follow1": "Hello X Car Rental - Sports and Luxury Car Rental Dubai team,\n\nWe are following up on our previous message regarding HireCarEmirates.com. Could this domain be relevant to your company, or could you direct us to the person responsible for marketing or business development?\n\nDomain Epoch Sales Team\nsales@domainepoch.com",
      "follow2": "Hello X Car Rental - Sports and Luxury Car Rental Dubai team,\n\nA quick follow-up regarding HireCarEmirates.com. It could be used for a dedicated booking page, a market-focused campaign, or an international customer-acquisition page. Would your team consider discussing its acquisition?\n\nDomain Epoch Sales Team\nsales@domainepoch.com",
      "final": "Hello X Car Rental - Sports and Luxury Car Rental Dubai team,\n\nThis is our final follow-up regarding HireCarEmirates.com. If the domain may fit your current or future plans, we would be happy to provide further details. If it is not relevant at this time, thank you for considering it.\n\nDomain Epoch Sales Team\nsales@domainepoch.com"
    }
  },
  {
    "id": "HireCarEmirates.com::Quick Drive Car Rental - Dubai::971505259245",
    "company": "Quick Drive Car Rental - Dubai",
    "domain": "HireCarEmirates.com",
    "market": "United Arab Emirates",
    "phone": "971505259245",
    "verified": false,
    "messages": {
      "initial": "Hello Quick Drive Car Rental - Dubai team,\n\nWe are the Domain Epoch Sales Team. HireCarEmirates.com is available for acquisition and is a clear, market-specific name for car-rental services in United Arab Emirates. Could you connect us with the person responsible for marketing, partnerships, or business development?\n\nDomain Epoch Sales Team\nsales@domainepoch.com",
      "follow1": "Hello Quick Drive Car Rental - Dubai team,\n\nWe are following up on our previous message regarding HireCarEmirates.com. Could this domain be relevant to your company, or could you direct us to the person responsible for marketing or business development?\n\nDomain Epoch Sales Team\nsales@domainepoch.com",
      "follow2": "Hello Quick Drive Car Rental - Dubai team,\n\nA quick follow-up regarding HireCarEmirates.com. It could be used for a dedicated booking page, a market-focused campaign, or an international customer-acquisition page. Would your team consider discussing its acquisition?\n\nDomain Epoch Sales Team\nsales@domainepoch.com",
      "final": "Hello Quick Drive Car Rental - Dubai team,\n\nThis is our final follow-up regarding HireCarEmirates.com. If the domain may fit your current or future plans, we would be happy to provide further details. If it is not relevant at this time, thank you for considering it.\n\nDomain Epoch Sales Team\nsales@domainepoch.com"
    }
  },
  {
    "id": "HireCarEmirates.com::Dolphin Rent a Car::971563647391",
    "company": "Dolphin Rent a Car",
    "domain": "HireCarEmirates.com",
    "market": "United Arab Emirates",
    "phone": "971563647391",
    "verified": false,
    "messages": {
      "initial": "Hello Dolphin Rent a Car team,\n\nWe are the Domain Epoch Sales Team. HireCarEmirates.com is available for acquisition and is a clear, market-specific name for car-rental services in United Arab Emirates. Could you connect us with the person responsible for marketing, partnerships, or business development?\n\nDomain Epoch Sales Team\nsales@domainepoch.com",
      "follow1": "Hello Dolphin Rent a Car team,\n\nWe are following up on our previous message regarding HireCarEmirates.com. Could this domain be relevant to your company, or could you direct us to the person responsible for marketing or business development?\n\nDomain Epoch Sales Team\nsales@domainepoch.com",
      "follow2": "Hello Dolphin Rent a Car team,\n\nA quick follow-up regarding HireCarEmirates.com. It could be used for a dedicated booking page, a market-focused campaign, or an international customer-acquisition page. Would your team consider discussing its acquisition?\n\nDomain Epoch Sales Team\nsales@domainepoch.com",
      "final": "Hello Dolphin Rent a Car team,\n\nThis is our final follow-up regarding HireCarEmirates.com. If the domain may fit your current or future plans, we would be happy to provide further details. If it is not relevant at this time, thank you for considering it.\n\nDomain Epoch Sales Team\nsales@domainepoch.com"
    }
  },
  {
    "id": "HireCarEmirates.com::Driver Car Rental Dubai: Monthly Car Rental in Dubai | Cheap Car Rental Dubai::971504734471",
    "company": "Driver Car Rental Dubai: Monthly Car Rental in Dubai | Cheap Car Rental Dubai",
    "domain": "HireCarEmirates.com",
    "market": "United Arab Emirates",
    "phone": "971504734471",
    "verified": false,
    "messages": {
      "initial": "Hello Driver Car Rental Dubai: Monthly Car Rental in Dubai | Cheap Car Rental Dubai team,\n\nWe are the Domain Epoch Sales Team. HireCarEmirates.com is available for acquisition and is a clear, market-specific name for car-rental services in United Arab Emirates. Could you connect us with the person responsible for marketing, partnerships, or business development?\n\nDomain Epoch Sales Team\nsales@domainepoch.com",
      "follow1": "Hello Driver Car Rental Dubai: Monthly Car Rental in Dubai | Cheap Car Rental Dubai team,\n\nWe are following up on our previous message regarding HireCarEmirates.com. Could this domain be relevant to your company, or could you direct us to the person responsible for marketing or business development?\n\nDomain Epoch Sales Team\nsales@domainepoch.com",
      "follow2": "Hello Driver Car Rental Dubai: Monthly Car Rental in Dubai | Cheap Car Rental Dubai team,\n\nA quick follow-up regarding HireCarEmirates.com. It could be used for a dedicated booking page, a market-focused campaign, or an international customer-acquisition page. Would your team consider discussing its acquisition?\n\nDomain Epoch Sales Team\nsales@domainepoch.com",
      "final": "Hello Driver Car Rental Dubai: Monthly Car Rental in Dubai | Cheap Car Rental Dubai team,\n\nThis is our final follow-up regarding HireCarEmirates.com. If the domain may fit your current or future plans, we would be happy to provide further details. If it is not relevant at this time, thank you for considering it.\n\nDomain Epoch Sales Team\nsales@domainepoch.com"
    }
  },
  {
    "id": "HireCarEmirates.com::Renty - Rent Luxury Car in Dubai::971504617277",
    "company": "Renty - Rent Luxury Car in Dubai",
    "domain": "HireCarEmirates.com",
    "market": "United Arab Emirates",
    "phone": "971504617277",
    "verified": false,
    "messages": {
      "initial": "Hello Renty - Rent Luxury Car in Dubai team,\n\nWe are the Domain Epoch Sales Team. HireCarEmirates.com is available for acquisition and is a clear, market-specific name for car-rental services in United Arab Emirates. Could you connect us with the person responsible for marketing, partnerships, or business development?\n\nDomain Epoch Sales Team\nsales@domainepoch.com",
      "follow1": "Hello Renty - Rent Luxury Car in Dubai team,\n\nWe are following up on our previous message regarding HireCarEmirates.com. Could this domain be relevant to your company, or could you direct us to the person responsible for marketing or business development?\n\nDomain Epoch Sales Team\nsales@domainepoch.com",
      "follow2": "Hello Renty - Rent Luxury Car in Dubai team,\n\nA quick follow-up regarding HireCarEmirates.com. It could be used for a dedicated booking page, a market-focused campaign, or an international customer-acquisition page. Would your team consider discussing its acquisition?\n\nDomain Epoch Sales Team\nsales@domainepoch.com",
      "final": "Hello Renty - Rent Luxury Car in Dubai team,\n\nThis is our final follow-up regarding HireCarEmirates.com. If the domain may fit your current or future plans, we would be happy to provide further details. If it is not relevant at this time, thank you for considering it.\n\nDomain Epoch Sales Team\nsales@domainepoch.com"
    }
  },
  {
    "id": "HireCarEmirates.com::Ritz Rent A Car - Car rental in Dubai::971553668292",
    "company": "Ritz Rent A Car - Car rental in Dubai",
    "domain": "HireCarEmirates.com",
    "market": "United Arab Emirates",
    "phone": "971553668292",
    "verified": false,
    "messages": {
      "initial": "Hello Ritz Rent A Car - Car rental in Dubai team,\n\nWe are the Domain Epoch Sales Team. HireCarEmirates.com is available for acquisition and is a clear, market-specific name for car-rental services in United Arab Emirates. Could you connect us with the person responsible for marketing, partnerships, or business development?\n\nDomain Epoch Sales Team\nsales@domainepoch.com",
      "follow1": "Hello Ritz Rent A Car - Car rental in Dubai team,\n\nWe are following up on our previous message regarding HireCarEmirates.com. Could this domain be relevant to your company, or could you direct us to the person responsible for marketing or business development?\n\nDomain Epoch Sales Team\nsales@domainepoch.com",
      "follow2": "Hello Ritz Rent A Car - Car rental in Dubai team,\n\nA quick follow-up regarding HireCarEmirates.com. It could be used for a dedicated booking page, a market-focused campaign, or an international customer-acquisition page. Would your team consider discussing its acquisition?\n\nDomain Epoch Sales Team\nsales@domainepoch.com",
      "final": "Hello Ritz Rent A Car - Car rental in Dubai team,\n\nThis is our final follow-up regarding HireCarEmirates.com. If the domain may fit your current or future plans, we would be happy to provide further details. If it is not relevant at this time, thank you for considering it.\n\nDomain Epoch Sales Team\nsales@domainepoch.com"
    }
  },
  {
    "id": "HireCarEmirates.com::Abu Dhabi Rent a Car::971506434193",
    "company": "Abu Dhabi Rent a Car",
    "domain": "HireCarEmirates.com",
    "market": "United Arab Emirates",
    "phone": "971506434193",
    "verified": false,
    "messages": {
      "initial": "Hello Abu Dhabi Rent a Car team,\n\nWe are the Domain Epoch Sales Team. HireCarEmirates.com is available for acquisition and is a clear, market-specific name for car-rental services in United Arab Emirates. Could you connect us with the person responsible for marketing, partnerships, or business development?\n\nDomain Epoch Sales Team\nsales@domainepoch.com",
      "follow1": "Hello Abu Dhabi Rent a Car team,\n\nWe are following up on our previous message regarding HireCarEmirates.com. Could this domain be relevant to your company, or could you direct us to the person responsible for marketing or business development?\n\nDomain Epoch Sales Team\nsales@domainepoch.com",
      "follow2": "Hello Abu Dhabi Rent a Car team,\n\nA quick follow-up regarding HireCarEmirates.com. It could be used for a dedicated booking page, a market-focused campaign, or an international customer-acquisition page. Would your team consider discussing its acquisition?\n\nDomain Epoch Sales Team\nsales@domainepoch.com",
      "final": "Hello Abu Dhabi Rent a Car team,\n\nThis is our final follow-up regarding HireCarEmirates.com. If the domain may fit your current or future plans, we would be happy to provide further details. If it is not relevant at this time, thank you for considering it.\n\nDomain Epoch Sales Team\nsales@domainepoch.com"
    }
  },
  {
    "id": "HireCarNYC.com::SIXT Rent a Car New York City Battery Park::18887498227",
    "company": "SIXT Rent a Car New York City Battery Park",
    "domain": "HireCarNYC.com",
    "market": "New York City",
    "phone": "18887498227",
    "verified": false,
    "messages": {
      "initial": "Hello SIXT Rent a Car New York City Battery Park team,\n\nWe are the Domain Epoch Sales Team. HireCarNYC.com is available for acquisition and is a clear, market-specific name for car-rental services in New York City. Could you connect us with the person responsible for marketing, partnerships, or business development?\n\nDomain Epoch Sales Team\nsales@domainepoch.com",
      "follow1": "Hello SIXT Rent a Car New York City Battery Park team,\n\nWe are following up on our previous message regarding HireCarNYC.com. Could this domain be relevant to your company, or could you direct us to the person responsible for marketing or business development?\n\nDomain Epoch Sales Team\nsales@domainepoch.com",
      "follow2": "Hello SIXT Rent a Car New York City Battery Park team,\n\nA quick follow-up regarding HireCarNYC.com. It could be used for a dedicated booking page, a market-focused campaign, or an international customer-acquisition page. Would your team consider discussing its acquisition?\n\nDomain Epoch Sales Team\nsales@domainepoch.com",
      "final": "Hello SIXT Rent a Car New York City Battery Park team,\n\nThis is our final follow-up regarding HireCarNYC.com. If the domain may fit your current or future plans, we would be happy to provide further details. If it is not relevant at this time, thank you for considering it.\n\nDomain Epoch Sales Team\nsales@domainepoch.com"
    }
  },
  {
    "id": "HireCarNYC.com::NYC Perfect Transportation Inc.::18882093095",
    "company": "NYC Perfect Transportation Inc.",
    "domain": "HireCarNYC.com",
    "market": "New York City",
    "phone": "18882093095",
    "verified": false,
    "messages": {
      "initial": "Hello NYC Perfect Transportation Inc. team,\n\nWe are the Domain Epoch Sales Team. HireCarNYC.com is available for acquisition and is a clear, market-specific name for car-rental services in New York City. Could you connect us with the person responsible for marketing, partnerships, or business development?\n\nDomain Epoch Sales Team\nsales@domainepoch.com",
      "follow1": "Hello NYC Perfect Transportation Inc. team,\n\nWe are following up on our previous message regarding HireCarNYC.com. Could this domain be relevant to your company, or could you direct us to the person responsible for marketing or business development?\n\nDomain Epoch Sales Team\nsales@domainepoch.com",
      "follow2": "Hello NYC Perfect Transportation Inc. team,\n\nA quick follow-up regarding HireCarNYC.com. It could be used for a dedicated booking page, a market-focused campaign, or an international customer-acquisition page. Would your team consider discussing its acquisition?\n\nDomain Epoch Sales Team\nsales@domainepoch.com",
      "final": "Hello NYC Perfect Transportation Inc. team,\n\nThis is our final follow-up regarding HireCarNYC.com. If the domain may fit your current or future plans, we would be happy to provide further details. If it is not relevant at this time, thank you for considering it.\n\nDomain Epoch Sales Team\nsales@domainepoch.com"
    }
  },
  {
    "id": "HireCarNYC.com::RealCar: Premium & Luxury Car Rental NYC::12129918002",
    "company": "RealCar: Premium & Luxury Car Rental NYC",
    "domain": "HireCarNYC.com",
    "market": "New York City",
    "phone": "12129918002",
    "verified": false,
    "messages": {
      "initial": "Hello RealCar: Premium & Luxury Car Rental NYC team,\n\nWe are the Domain Epoch Sales Team. HireCarNYC.com is available for acquisition and is a clear, market-specific name for car-rental services in New York City. Could you connect us with the person responsible for marketing, partnerships, or business development?\n\nDomain Epoch Sales Team\nsales@domainepoch.com",
      "follow1": "Hello RealCar: Premium & Luxury Car Rental NYC team,\n\nWe are following up on our previous message regarding HireCarNYC.com. Could this domain be relevant to your company, or could you direct us to the person responsible for marketing or business development?\n\nDomain Epoch Sales Team\nsales@domainepoch.com",
      "follow2": "Hello RealCar: Premium & Luxury Car Rental NYC team,\n\nA quick follow-up regarding HireCarNYC.com. It could be used for a dedicated booking page, a market-focused campaign, or an international customer-acquisition page. Would your team consider discussing its acquisition?\n\nDomain Epoch Sales Team\nsales@domainepoch.com",
      "final": "Hello RealCar: Premium & Luxury Car Rental NYC team,\n\nThis is our final follow-up regarding HireCarNYC.com. If the domain may fit your current or future plans, we would be happy to provide further details. If it is not relevant at this time, thank you for considering it.\n\nDomain Epoch Sales Team\nsales@domainepoch.com"
    }
  },
  {
    "id": "HireCarNYC.com::Enterprise Rent-A-Car::16464222600",
    "company": "Enterprise Rent-A-Car",
    "domain": "HireCarNYC.com",
    "market": "New York City",
    "phone": "16464222600",
    "verified": false,
    "messages": {
      "initial": "Hello Enterprise Rent-A-Car team,\n\nWe are the Domain Epoch Sales Team. HireCarNYC.com is available for acquisition and is a clear, market-specific name for car-rental services in New York City. Could you connect us with the person responsible for marketing, partnerships, or business development?\n\nDomain Epoch Sales Team\nsales@domainepoch.com",
      "follow1": "Hello Enterprise Rent-A-Car team,\n\nWe are following up on our previous message regarding HireCarNYC.com. Could this domain be relevant to your company, or could you direct us to the person responsible for marketing or business development?\n\nDomain Epoch Sales Team\nsales@domainepoch.com",
      "follow2": "Hello Enterprise Rent-A-Car team,\n\nA quick follow-up regarding HireCarNYC.com. It could be used for a dedicated booking page, a market-focused campaign, or an international customer-acquisition page. Would your team consider discussing its acquisition?\n\nDomain Epoch Sales Team\nsales@domainepoch.com",
      "final": "Hello Enterprise Rent-A-Car team,\n\nThis is our final follow-up regarding HireCarNYC.com. If the domain may fit your current or future plans, we would be happy to provide further details. If it is not relevant at this time, thank you for considering it.\n\nDomain Epoch Sales Team\nsales@domainepoch.com"
    }
  },
  {
    "id": "HireCarNYC.com::Hertz Location d'Autos::12124865065",
    "company": "Hertz Location d'Autos",
    "domain": "HireCarNYC.com",
    "market": "New York City",
    "phone": "12124865065",
    "verified": false,
    "messages": {
      "initial": "Hello Hertz Location d'Autos team,\n\nWe are the Domain Epoch Sales Team. HireCarNYC.com is available for acquisition and is a clear, market-specific name for car-rental services in New York City. Could you connect us with the person responsible for marketing, partnerships, or business development?\n\nDomain Epoch Sales Team\nsales@domainepoch.com",
      "follow1": "Hello Hertz Location d'Autos team,\n\nWe are following up on our previous message regarding HireCarNYC.com. Could this domain be relevant to your company, or could you direct us to the person responsible for marketing or business development?\n\nDomain Epoch Sales Team\nsales@domainepoch.com",
      "follow2": "Hello Hertz Location d'Autos team,\n\nA quick follow-up regarding HireCarNYC.com. It could be used for a dedicated booking page, a market-focused campaign, or an international customer-acquisition page. Would your team consider discussing its acquisition?\n\nDomain Epoch Sales Team\nsales@domainepoch.com",
      "final": "Hello Hertz Location d'Autos team,\n\nThis is our final follow-up regarding HireCarNYC.com. If the domain may fit your current or future plans, we would be happy to provide further details. If it is not relevant at this time, thank you for considering it.\n\nDomain Epoch Sales Team\nsales@domainepoch.com"
    }
  },
  {
    "id": "HireCarNYC.com::Avis Car Rental::12126821860",
    "company": "Avis Car Rental",
    "domain": "HireCarNYC.com",
    "market": "New York City",
    "phone": "12126821860",
    "verified": false,
    "messages": {
      "initial": "Hello Avis Car Rental team,\n\nWe are the Domain Epoch Sales Team. HireCarNYC.com is available for acquisition and is a clear, market-specific name for car-rental services in New York City. Could you connect us with the person responsible for marketing, partnerships, or business development?\n\nDomain Epoch Sales Team\nsales@domainepoch.com",
      "follow1": "Hello Avis Car Rental team,\n\nWe are following up on our previous message regarding HireCarNYC.com. Could this domain be relevant to your company, or could you direct us to the person responsible for marketing or business development?\n\nDomain Epoch Sales Team\nsales@domainepoch.com",
      "follow2": "Hello Avis Car Rental team,\n\nA quick follow-up regarding HireCarNYC.com. It could be used for a dedicated booking page, a market-focused campaign, or an international customer-acquisition page. Would your team consider discussing its acquisition?\n\nDomain Epoch Sales Team\nsales@domainepoch.com",
      "final": "Hello Avis Car Rental team,\n\nThis is our final follow-up regarding HireCarNYC.com. If the domain may fit your current or future plans, we would be happy to provide further details. If it is not relevant at this time, thank you for considering it.\n\nDomain Epoch Sales Team\nsales@domainepoch.com"
    }
  },
  {
    "id": "HireCarNYC.com::National Car Rental::12123665423",
    "company": "National Car Rental",
    "domain": "HireCarNYC.com",
    "market": "New York City",
    "phone": "12123665423",
    "verified": false,
    "messages": {
      "initial": "Hello National Car Rental team,\n\nWe are the Domain Epoch Sales Team. HireCarNYC.com is available for acquisition and is a clear, market-specific name for car-rental services in New York City. Could you connect us with the person responsible for marketing, partnerships, or business development?\n\nDomain Epoch Sales Team\nsales@domainepoch.com",
      "follow1": "Hello National Car Rental team,\n\nWe are following up on our previous message regarding HireCarNYC.com. Could this domain be relevant to your company, or could you direct us to the person responsible for marketing or business development?\n\nDomain Epoch Sales Team\nsales@domainepoch.com",
      "follow2": "Hello National Car Rental team,\n\nA quick follow-up regarding HireCarNYC.com. It could be used for a dedicated booking page, a market-focused campaign, or an international customer-acquisition page. Would your team consider discussing its acquisition?\n\nDomain Epoch Sales Team\nsales@domainepoch.com",
      "final": "Hello National Car Rental team,\n\nThis is our final follow-up regarding HireCarNYC.com. If the domain may fit your current or future plans, we would be happy to provide further details. If it is not relevant at this time, thank you for considering it.\n\nDomain Epoch Sales Team\nsales@domainepoch.com"
    }
  },
  {
    "id": "HireCarNYC.com::Car Rental New York::16467130968",
    "company": "Car Rental New York",
    "domain": "HireCarNYC.com",
    "market": "New York City",
    "phone": "16467130968",
    "verified": false,
    "messages": {
      "initial": "Hello Car Rental New York team,\n\nWe are the Domain Epoch Sales Team. HireCarNYC.com is available for acquisition and is a clear, market-specific name for car-rental services in New York City. Could you connect us with the person responsible for marketing, partnerships, or business development?\n\nDomain Epoch Sales Team\nsales@domainepoch.com",
      "follow1": "Hello Car Rental New York team,\n\nWe are following up on our previous message regarding HireCarNYC.com. Could this domain be relevant to your company, or could you direct us to the person responsible for marketing or business development?\n\nDomain Epoch Sales Team\nsales@domainepoch.com",
      "follow2": "Hello Car Rental New York team,\n\nA quick follow-up regarding HireCarNYC.com. It could be used for a dedicated booking page, a market-focused campaign, or an international customer-acquisition page. Would your team consider discussing its acquisition?\n\nDomain Epoch Sales Team\nsales@domainepoch.com",
      "final": "Hello Car Rental New York team,\n\nThis is our final follow-up regarding HireCarNYC.com. If the domain may fit your current or future plans, we would be happy to provide further details. If it is not relevant at this time, thank you for considering it.\n\nDomain Epoch Sales Team\nsales@domainepoch.com"
    }
  },
  {
    "id": "HireCarNYC.com::NYC Black Car Chauffeur services::19294840929",
    "company": "NYC Black Car Chauffeur services",
    "domain": "HireCarNYC.com",
    "market": "New York City",
    "phone": "19294840929",
    "verified": false,
    "messages": {
      "initial": "Hello NYC Black Car Chauffeur services team,\n\nWe are the Domain Epoch Sales Team. HireCarNYC.com is available for acquisition and is a clear, market-specific name for car-rental services in New York City. Could you connect us with the person responsible for marketing, partnerships, or business development?\n\nDomain Epoch Sales Team\nsales@domainepoch.com",
      "follow1": "Hello NYC Black Car Chauffeur services team,\n\nWe are following up on our previous message regarding HireCarNYC.com. Could this domain be relevant to your company, or could you direct us to the person responsible for marketing or business development?\n\nDomain Epoch Sales Team\nsales@domainepoch.com",
      "follow2": "Hello NYC Black Car Chauffeur services team,\n\nA quick follow-up regarding HireCarNYC.com. It could be used for a dedicated booking page, a market-focused campaign, or an international customer-acquisition page. Would your team consider discussing its acquisition?\n\nDomain Epoch Sales Team\nsales@domainepoch.com",
      "final": "Hello NYC Black Car Chauffeur services team,\n\nThis is our final follow-up regarding HireCarNYC.com. If the domain may fit your current or future plans, we would be happy to provide further details. If it is not relevant at this time, thank you for considering it.\n\nDomain Epoch Sales Team\nsales@domainepoch.com"
    }
  },
  {
    "id": "HireCarNYC.com::NY Car Service - Black Car Service NYC::15163633331",
    "company": "NY Car Service - Black Car Service NYC",
    "domain": "HireCarNYC.com",
    "market": "New York City",
    "phone": "15163633331",
    "verified": false,
    "messages": {
      "initial": "Hello NY Car Service - Black Car Service NYC team,\n\nWe are the Domain Epoch Sales Team. HireCarNYC.com is available for acquisition and is a clear, market-specific name for car-rental services in New York City. Could you connect us with the person responsible for marketing, partnerships, or business development?\n\nDomain Epoch Sales Team\nsales@domainepoch.com",
      "follow1": "Hello NY Car Service - Black Car Service NYC team,\n\nWe are following up on our previous message regarding HireCarNYC.com. Could this domain be relevant to your company, or could you direct us to the person responsible for marketing or business development?\n\nDomain Epoch Sales Team\nsales@domainepoch.com",
      "follow2": "Hello NY Car Service - Black Car Service NYC team,\n\nA quick follow-up regarding HireCarNYC.com. It could be used for a dedicated booking page, a market-focused campaign, or an international customer-acquisition page. Would your team consider discussing its acquisition?\n\nDomain Epoch Sales Team\nsales@domainepoch.com",
      "final": "Hello NY Car Service - Black Car Service NYC team,\n\nThis is our final follow-up regarding HireCarNYC.com. If the domain may fit your current or future plans, we would be happy to provide further details. If it is not relevant at this time, thank you for considering it.\n\nDomain Epoch Sales Team\nsales@domainepoch.com"
    }
  }
];
const allowedStatuses = new Set(["Not sent","Initial message sent","Follow-up 1 sent","Follow-up 2 sent","Replied","Interested","Not interested","Invalid number"]);

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {"content-type":"application/json; charset=utf-8","cache-control":"no-store"},
  });
}

async function seedDatabase(db) {
  const row = await db.prepare("SELECT COUNT(*) AS count FROM leads").first();
  if (Number(row?.count || 0) >= seedLeads.length) return;
  const sql = `INSERT OR IGNORE INTO leads
    (id, company, domain, market, phone, verified, initial_message, followup_1_message, followup_2_message, final_message)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  const statements = seedLeads.map((lead) => db.prepare(sql).bind(
    lead.id, lead.company, lead.domain, lead.market, lead.phone, lead.verified ? 1 : 0,
    lead.messages.initial, lead.messages.follow1, lead.messages.follow2, lead.messages.final,
  ));
  for (let index = 0; index < statements.length; index += 20) {
    await db.batch(statements.slice(index, index + 20));
  }
}

async function listLeads(db) {
  await seedDatabase(db);
  const result = await db.prepare(`SELECT
      l.id, l.company, l.domain, l.market, l.phone, l.verified,
      l.initial_message, l.followup_1_message, l.followup_2_message, l.final_message,
      COALESCE(o.status, 'Not sent') AS status, o.last_contact_date
    FROM leads l
    LEFT JOIN outreach o ON o.lead_id = l.id
    ORDER BY CASE l.domain
      WHEN 'HireCarSpain.com' THEN 1 WHEN 'HireCarSaudi.com' THEN 2
      WHEN 'HireCarEmirates.com' THEN 3 ELSE 4 END, l.company`).all();
  return result.results.map((row) => ({
    id: row.id, company: row.company, domain: row.domain, market: row.market,
    phone: row.phone, verified: Boolean(row.verified), status: row.status,
    last_contact_date: row.last_contact_date,
    messages: {initial:row.initial_message,follow1:row.followup_1_message,follow2:row.followup_2_message,final:row.final_message},
  }));
}

async function updateLead(db, id, request) {
  const body = await request.json();
  const status = String(body.status || "");
  const date = body.last_contact_date == null || body.last_contact_date === "" ? null : String(body.last_contact_date);
  if (!allowedStatuses.has(status)) return json({error:"Invalid status"}, 400);
  if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) return json({error:"Invalid date"}, 400);
  const exists = await db.prepare("SELECT id FROM leads WHERE id = ?").bind(id).first();
  if (!exists) return json({error:"Lead not found"}, 404);
  await db.prepare(`INSERT INTO outreach (lead_id, status, last_contact_date, updated_at)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(lead_id) DO UPDATE SET
      status = excluded.status,
      last_contact_date = excluded.last_contact_date,
      updated_at = excluded.updated_at`)
    .bind(id, status, date, new Date().toISOString()).run();
  return json({ok:true,status,last_contact_date:date});
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (!env.DB) return json({error:"Database binding unavailable"}, 503);
    try {
      if (request.method === "GET" && url.pathname === "/") {
        return new Response(page, {headers:{"content-type":"text/html; charset=utf-8","cache-control":"no-store"}});
      }
      if (request.method === "GET" && url.pathname === "/api/leads") {
        return json({leads:await listLeads(env.DB)});
      }
      if (request.method === "PATCH" && url.pathname.startsWith("/api/leads/")) {
        const id = decodeURIComponent(url.pathname.slice("/api/leads/".length));
        return await updateLead(env.DB, id, request);
      }
      return new Response("Not found", {status:404});
    } catch (error) {
      console.error("Request failed", error);
      return json({error:"Database operation failed"}, 500);
    }
  },
};
