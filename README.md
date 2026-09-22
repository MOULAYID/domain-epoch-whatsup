# Domain Epoch WhatsApp Follow-ups

A portable, database-backed outreach workspace for:

- `HireCarSpain.com`
- `HireCarSaudi.com`
- `HireCarEmirates.com`
- `HireCarNYC.com`

## What is included

- 33 real lead records in `data/leads.json`
- Company, market, WhatsApp number, verification state, and personalized messages
- Initial message, Follow-up 1, Follow-up 2, and final follow-up
- Arabic copy for Saudi Arabia, Spanish for Spain, and English for the UAE and NYC
- Persistent outreach status and last-contact dates in a D1/SQLite database
- One-click WhatsApp links with prefilled messages
- Filters by domain, market, verification, and outreach status

## Database

The schema is defined in `db/schema.ts`. The generated migration is stored in `drizzle/`.

Tables:

- `leads`: company and outreach-message data
- `outreach`: current status, last-contact date, and update timestamp

The Worker safely inserts missing seed leads from the checked-in dataset using `INSERT OR IGNORE`. Status and date changes are saved through the server API, not browser storage.

## After sending a follow-up

Return to the website and:

1. Select the message stage you sent.
2. Set the last-contact date.
3. Change the status to `Replied`, `Interested`, or `Not interested` when the prospect answers.
4. Select `Invalid number` when the contact cannot be reached.

## Build

```bash
npm install
npm run build
npm run validate
```

The build produces a Cloudflare-compatible Worker in `dist/server/index.js`, together with the hosting manifest and database migration.

## Regenerate a migration

```bash
npm run db:generate
```

Commit every generated SQL migration and its matching `drizzle/meta` files.

## Safety

The application never sends messages automatically. Verify the recipient's WhatsApp business identity and review the prefilled message before pressing **Send**, particularly when a lead is marked **Confirm identity**.
