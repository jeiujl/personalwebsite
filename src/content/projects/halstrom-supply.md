---
title: An email-to-quote agent for a building-supply distributor
client: "Halstrom Supply Co."
summary: "An AI agent that reads quote requests from email, PDFs and photos of handwritten lists, matches every line to the right product and price, and drafts the quote for a sales rep to approve."
category: ai
role: "AI agent design, integration & review screens"
tools: [Email intake, PDF and photo reading, SKU matching, Price lists, Quote drafting, Human review]
concept: true
featured: true
order: 6
cover: ./images/concept-halstrom-supply-cover.webp
coverAlt: "Quote Desk, an AI quoting agent for Halstrom Supply Co., in a browser. Left: a queue of contractor email requests with status pills. Centre: an email with a takeoff PDF and a table of extracted items matched to products, prices and stock, with one valve size flagged for a rep to check. Right: a draft quote totalling $3,706.63 CAD, ready to approve and send."
workflow:
  - label: A quote request arrives
    detail: An email, a PDF takeoff or a photo of a handwritten list
  - label: The agent reads every line
    detail: Items, sizes and quantities, however they're written
  - label: Items are matched to products
    detail: With the customer's price list and current stock
  - label: Anything unsure is flagged
    detail: A rep checks it instead of the agent guessing
  - label: The rep approves and sends
    detail: The quote is logged against the customer
---

## The brief

Halstrom Supply Co. is a building-supply and plumbing/HVAC parts distributor. Contractors send quote requests in every format: quick emails, PDF takeoffs, photos of lists written on the back of a drawing. Sales reps were retyping each line into the system, and busy days meant quotes went out a day late.

## My approach

- **Take requests the way customers send them:** email, PDF or photo, with no new portal for contractors to learn.
- **Match, don't guess:** each line is matched to a real product, with the customer's own pricing and live stock.
- **Show the doubt:** when a size or item is unclear, the agent says so and a rep decides.
- **Reps stay in charge:** every quote is a draft until a rep approves it.

## What's inside

- A **request queue** showing what's drafted, what needs review and what's been sent
- An **extracted items table**: the line as written, the matched product, quantity, price, stock and a confidence check
- A **draft quote** with totals and HST, ready to approve, edit or send
- **Daily stats**: quotes sent, average time to quote and how many lines needed a person
