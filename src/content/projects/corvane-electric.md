---
title: A permit-lead engine for an electrical contractor
client: "Corvane Electric"
summary: "A lead engine that reads new building permits every morning and finds commercial jobs where a general contractor is hired but no electrician has filed yet, so the contractor can call first."
category: crm
role: "Data pipeline, AI agent & dashboard design"
tools: [Open permit data, AI lead scoring, Contractor matching, Drafted outreach, Pipeline dashboard]
concept: true
featured: true
order: 5
cover: ./images/concept-corvane-electric-cover.webp
coverAlt: "Corvane Electric's Permit Leads app in a browser. A table lists today's 14 building-permit leads from Toronto, Mississauga and Vaughan, with address, project type, estimated value, general contractor, issue date, lead score and a red Not yet tag where no electrician has filed. The selected permit has a small map, a 9-day timeline and a drafted intro email to the general contractor, ready to approve and send."
workflow:
  - label: New permits are pulled every morning
    detail: From Toronto, Mississauga and Vaughan open data
  - label: Rules filter them
    detail: Commercial only, over $1M, no electrical permit filed yet
  - label: The general contractor is matched
    detail: Company, role to contact and past projects
  - label: An intro email is drafted
    detail: It waits for approval before anything is sent
  - label: Replies and follow-ups are tracked
    detail: In one pipeline, with a follow-up if nobody answers
---

## The brief

Corvane Electric is a commercial electrical contractor in Toronto. Most of its work comes from general contractors, and the best jobs go to whoever calls first. The team was finding projects by word of mouth and expensive data subscriptions, often after another electrician was already on board.

## My approach

- **Use public data, every day:** building permits from three cities are read each morning, so new projects show up within a day of the permit being issued.
- **Plain-English rules:** the team sets what counts as a good lead, like "commercial only, over $1M, no electrical permit yet", without touching code.
- **Call first, not cold:** each lead comes with the general contractor, the scope and a drafted intro email that mentions the actual project.
- **A person approves every email:** nothing goes out until someone on the team clicks approve.

## What's inside

- A **daily lead list** with the permit, project type, value, general contractor and whether an electrician has filed
- A **lead detail panel** with the permit timeline and a map of the site
- **Drafted intro emails** with approve, edit and a scheduled follow-up
- A **morning digest** on the phone: how many new leads came in overnight
