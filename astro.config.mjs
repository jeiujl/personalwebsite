// @ts-check
import { defineConfig, envField, fontProviders } from 'astro/config';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// On Vercel the production URL is provided automatically; set SITE_URL once you
// connect a custom domain so canonical links and the sitemap use it.
const site =
  process.env.SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:4321');

export default defineConfig({
  site,
  output: 'static',
  adapter: vercel({ webAnalytics: { enabled: true } }),
  integrations: [sitemap()],
  vite: { plugins: [tailwindcss()] },
  fonts: [
    {
      // Self-hosted from the installed @fontsource-variable/geist package, so
      // builds don't depend on a font CDN.
      provider: fontProviders.local(),
      name: 'Geist',
      cssVariable: '--font-geist',
      options: {
        variants: [
          {
            src: ['@fontsource-variable/geist/files/geist-latin-wght-normal.woff2'],
            weight: '100 900',
            style: 'normal',
          },
        ],
      },
      fallbacks: ['ui-sans-serif', 'system-ui', 'sans-serif'],
    },
  ],
  env: {
    schema: {
      // Optional so the site builds without them; the contact form reports a
      // friendly error until they are set in Vercel.
      RESEND_API_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
      CONTACT_TO_EMAIL: envField.string({ context: 'server', access: 'secret', optional: true }),
      CONTACT_FROM_EMAIL: envField.string({
        context: 'server',
        access: 'secret',
        default: 'Website <onboarding@resend.dev>',
      }),
    },
  },
});
