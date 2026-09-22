const page = __PAGE_JSON__;
const seedLeads = __LEADS_JSON__;
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
