# personalwebsite

A personal portfolio site for showing referred clients what I do: website & app design, a white-label CRM platform, and custom AI automations.

Built with [Astro](https://astro.build), Tailwind CSS and Resend, and hosted on Vercel.

## Editing content

Almost everything you'll want to change lives in a few places. Search the project for `TODO:` to find every placeholder.

| What | Where |
|---|---|
| Name, headline, email, booking link, photo, resume, socials, platform name | `src/config/site.ts` |
| Case studies (one Markdown file each) | `src/content/projects/*.md` |
| Testimonials | `src/content/testimonials/*.yaml` |
| Services (and optional starting prices) | `src/content/services/*.yaml` |
| Automation examples on the homepage | `src/content/automations.yaml` |
| Experience timeline (About page) | `src/content/experience.yaml` |
| Bio and skills | `src/pages/about.astro` |
| FAQ | `src/pages/services.astro` |
| Colors and theme | `src/styles/global.css` (the tokens at the top) |

**Sample content:** placeholder projects, testimonials and experience entries have `sample: true`, which shows a "Sample" badge on the site. Replace them with real ones (and remove the flag), or delete the file.

**Adding a project:** copy one of the files in `src/content/projects/`, rename it (the file name becomes the URL, e.g. `/work/my-project/`) and edit the frontmatter. To use a real screenshot, put the image next to the file and add `cover: ./my-image.png` and `coverAlt: "…"`. Automation projects can list `workflow` steps, which are drawn as a diagram.

**Photo / resume:** put files in `public/` (e.g. `public/images/headshot.jpg`, `public/resume.pdf`) and set `photo` / `resumeUrl` in `src/config/site.ts`.

## Referral links

Give each person who refers you their own link, such as `https://yoursite.com/?ref=dad`. The site remembers it while the visitor browses. If they send an inquiry, the email subject says who referred them, e.g. "New inquiry (ref: dad): Website from Jane". There's also a ready-to-send intro message for referrers (`referralBlurb` in `src/config/site.ts`).

## Contact form

Inquiries are emailed to you through [Resend](https://resend.com) (free tier). Set these environment variables in **Vercel → Project → Settings → Environment Variables** (see `.env.example`):

| Variable | Value |
|---|---|
| `RESEND_API_KEY` | An API key from resend.com → API Keys |
| `CONTACT_TO_EMAIL` | Where inquiries go. Until you verify a domain, this must be the email address you signed up to Resend with |
| `CONTACT_FROM_EMAIL` | Optional. Defaults to Resend's test sender. After verifying your domain in Resend, use e.g. `Your Name <hello@yourdomain.com>` |

Redeploy after adding them. Until they're set, the form tells visitors to email you directly. Spam is filtered with a hidden honeypot field and a minimum fill time.

## Development

Requires Node.js 22.22+.

```sh
npm install
npm run dev      # http://localhost:4321
npm run check    # type-check
npm run build    # production build
```

For the contact form locally, copy `.env.example` to `.env` and fill it in.

## Deployment

Vercel builds the site automatically on every push. The `main` branch is production, and other branches get preview URLs. Every page is static except `/contact` and the form handler, which run as one serverless function.

When you connect a custom domain, set `SITE_URL=https://yourdomain.com` in Vercel so canonical links and the sitemap use it.
