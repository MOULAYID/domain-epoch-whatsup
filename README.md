# Domain Epoch WhatsApp Follow-ups

A private outreach workspace for following up with prospective buyers of:

- `HireCarSpain.com`
- `HireCarSaudi.com`
- `HireCarEmirates.com`
- `HireCarNYC.com`

## Features

- Personalized WhatsApp messages for every usable lead
- Initial message, Follow-up 1, Follow-up 2, and final follow-up
- Arabic copy for Saudi Arabia
- Spanish copy for Spain
- English copy for the UAE and New York City
- One-click `wa.me` links with prefilled messages
- Filters by domain, market, verification status, and outreach status
- Manual status and last-contact-date tracking saved in the browser

## After sending a follow-up

Return to the website immediately and:

1. Change the lead's status to the message stage you sent.
2. Set the last-contact date.
3. If the company replies, change the status to `Replied`, `Interested`, or `Not interested`.
4. If the number is incorrect or unavailable on WhatsApp, select `Invalid number`.

Tracking data is saved in the browser's local storage. It is specific to the browser and device being used and is not synchronized to GitHub.

## Safety

The website does not automatically send messages. Review the recipient's WhatsApp business identity and the prefilled message before pressing **Send**, especially for numbers marked **Confirm identity**.

## Generate the static page

```bash
node generate.mjs
```

The generated page is written to `dist/index.html`.

