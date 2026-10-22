# personalwebsite

A personal portfolio site for showing referred clients what I do: website & app design, a white-label CRM platform, and custom AI automations.

Built with [Astro](https://astro.build), Tailwind CSS and Resend, and hosted on Vercel.

## Editing content

Almost everything you'll want to change lives in a few places. Search the project for `TODO:` to find every placeholder.

| What | Where |
|---|---|
| Name, giant homepage headline (`heroDisplay`), sentence under it, email, booking link, photo, resume, socials, platform name, homepage stats | `src/config/site.ts` |
| Case studies (one Markdown file each) | `src/content/projects/*.md` |
| Testimonials | `src/content/testimonials/*.yaml` |
| Services (and optional starting prices) | `src/content/services/*.yaml` |
| Automation examples on the homepage | `src/content/automations.yaml` |
| Experience and education (About page) | `src/content/experience.yaml` |
| Bio and skills | `src/pages/about.astro` |
| FAQ | `src/pages/services.astro` |
| Colors, fonts and the four service colors | `src/styles/global.css` (tokens at the top) and `src/lib/disciplines.ts` |
| The five automation steps in the homepage story | `src/components/HeroScene.astro` (the `steps` list) |

**Testimonials:** the reviews sections stay hidden until `src/content/testimonials/` has at least one quote. Only add quotes a client has approved word for word (see the README in that folder).

**Stats band:** the big count-up numbers on the homepage come from `stats` in `src/config/site.ts`. Keep them true; swap in your own (e.g. businesses helped) as they grow.

**Concept projects:** self-initiated designs for fictional brands have `concept: true`. They get a "Concept" badge, a note on their page, and their own section below client work. Their client name ends with "(fictional brand)".

**Adding a project:** copy one of the files in `src/content/projects/`, rename it (the file name becomes the URL, e.g. `/work/my-project/`) and edit the frontmatter. `category` is one of `website`, `app`, `crm` or `ai`, which sets the project's color and work filter. To use a real screenshot, put the image next to the file and add `cover: ./my-image.png` and `coverAlt: "…"`. Automation projects can list `workflow` steps, which are drawn as a diagram.

**Photo:** the headshot lives in `src/assets/` and is imported at the top of `src/config/site.ts` (`photo`, with `photoAlt` describing it), so Astro serves it in optimized sizes. To swap it, replace `src/assets/jerry-liu.jpg` with another 4:5 portrait.

**Resume:** put the PDF in `public/` (e.g. `public/resume.pdf`) and set `resumeUrl: '/resume.pdf'` in `src/config/site.ts`.

## Design & motion

**The look** combines three references: Decide AI (one mint signal color, step bars, square cards), GSAP (warm cream on near-black, a color per service, `{ curly }` labels, outlined pill buttons) and Dylan Brouwer (dark heroes over light pages, giant condensed headlines fading from dark to light, a small mono label layer). Every page opens with a dark band (`data-surface="dark"`) and continues on light pages. Components use the same color tokens and adapt to whichever surface they sit on.

- **Homepage scroll story** (`src/components/HeroScene.astro`, `src/scripts/automation-scene.ts`): a night sky with the 3D automation network beside the giant headline. On devices with real GPU acceleration, scrolling pins the section and walks through the five steps (missed call → review). Everyone else, including people who turn off motion and speed tests like Lighthouse, gets the static network and the five steps as a list. Add `?3d=1` to the URL to force the 3D story on.
- **Scroll animations** (`src/scripts/motion.ts`): GSAP + Lenis. Add `data-reveal` to an element to fade it in on scroll, or `data-reveal-stagger` to a grid to reveal its children one by one. Also available: `data-count` (count-up numbers) and `data-magnetic` (buttons). The giant headlines rise line by line, and the marquee band speeds up as you scroll. Everything is skipped when the visitor prefers reduced motion.
- **Fonts** are self-hosted: Anton (giant headlines), Geist (text) and Geist Mono (labels).

## Referral links

Give each person who refers you their own link, such as `https://yoursite.com/?ref=dad`. The site remembers it while the visitor browses. If they send an inquiry, the email subject says who referred them, e.g. "New inquiry (ref: dad): Website from Jane". There's also a ready-to-send intro message for referrers (`referralBlurb` in `src/config/site.ts`).

## Contact form

Inquiries are emailed to you through [Resend](https://resend.com) (free tier). Set these environment variables in **Vercel → Project → Settings → Environment Variables** (see `.env.example`):

| Variable | Value |
|---|---|
| `RESEND_API_KEY` | An API key from resend.com → API Keys |
| `CONTACT_TO_EMAIL` | Where inquiries go. Until you verify a domain, this must be the email address you signed up to Resend with |
| `CONTACT_FROM_EMAIL` | Optional. Defaults to Resend's test sender. After verifying your domain in Resend, use e.g. `Your Name <hello@yourdomain.com>` |

Redeploy after adding them. Until they're set, the form shows a "not connected yet" message (and points to your email if `email` is set in `site.ts`). While `email` is empty, the form is the only way to reach you, so set these before sharing the site. Spam is filtered with a hidden honeypot field and a minimum fill time.

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
