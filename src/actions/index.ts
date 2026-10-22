import { ActionError, defineAction } from 'astro:actions';
import { CONTACT_FROM_EMAIL, CONTACT_TO_EMAIL, RESEND_API_KEY } from 'astro:env/server';
import { z } from 'astro/zod';
import { Resend } from 'resend';
import { site } from '../config/site';
import { budgetRanges, inquiryTypes, timelines } from '../lib/inquiry';

// Submissions faster than this after the form was rendered are almost
// certainly bots.
const MIN_FILL_MS = 3000;

// Empty form fields arrive as undefined, so optional text stays `.optional()`
// (not `.default('')`) and is defaulted in the handler.
const optionalText = (max: number) => z.string().trim().max(max).optional();

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

export const server = {
  contact: defineAction({
    accept: 'form',
    input: z.object({
      name: z.string('Please tell me your name.').trim().min(2, 'Please tell me your name.').max(100),
      email: z.email('Please enter a valid email address.').max(200),
      company: optionalText(150),
      service: z.enum(inquiryTypes, 'Please choose what you need help with.'),
      budget: z.enum(budgetRanges).optional(),
      timeline: z.enum(timelines).optional(),
      message: z
        .string('Please add a few words about your project.')
        .trim()
        .min(10, 'Please add a few words about your project.')
        .max(5000, 'Please keep your message under 5,000 characters.'),
      ref: optionalText(60),
      // Which version of the site the form was sent from
      lang: z.enum(['en', 'zh']).optional(),
      // Spam traps: a field humans never see, and the time the form was shown.
      website: optionalText(200),
      startedAt: z.coerce.number().optional(),
    }),
    handler: async (input) => {
      const tooFast = input.startedAt !== undefined && Date.now() - input.startedAt < MIN_FILL_MS;
      if (input.website || tooFast) {
        // Pretend it worked so bots don't learn anything.
        return { ok: true };
      }

      const zh = input.lang === 'zh';
      if (!RESEND_API_KEY || !CONTACT_TO_EMAIL) {
        console.error('Contact form: RESEND_API_KEY or CONTACT_TO_EMAIL is not set.');
        throw new ActionError({
          code: 'INTERNAL_SERVER_ERROR',
          message: zh
            ? site.email
              ? `表单还未接通，请直接发邮件到 ${site.email}。`
              : '表单还未接通，请稍后再试。'
            : site.email
              ? `The form isn't connected yet. Please email me directly at ${site.email}.`
              : "The form isn't connected yet. Please try again a little later.",
        });
      }

      const ref = (input.ref ?? '').replace(/[^\w\s.@-]/g, '').trim();
      // Inquiries from the Chinese site are marked, so you know to reply in Chinese.
      const subject = `New inquiry${zh ? ' [中文]' : ''}${ref ? ` (ref: ${ref})` : ''}: ${input.service} from ${input.name}`;
      const rows: [string, string][] = [
        ['Name', input.name],
        ['Email', input.email],
        ['Company', input.company || '—'],
        ['Needs', input.service],
        ['Budget', input.budget ?? '—'],
        ['Timeline', input.timeline ?? '—'],
        ['Referred by', ref || '—'],
        ['Site language', zh ? 'Chinese' : 'English'],
      ];

      const text = `${rows.map(([k, v]) => `${k}: ${v}`).join('\n')}\n\n${input.message}`;
      const html = `
        <table cellpadding="4" style="font-family:sans-serif;font-size:14px">
          ${rows.map(([k, v]) => `<tr><td style="color:#78716c">${k}</td><td><strong>${escapeHtml(v)}</strong></td></tr>`).join('')}
        </table>
        <p style="font-family:sans-serif;font-size:14px;white-space:pre-wrap">${escapeHtml(input.message)}</p>`;

      const resend = new Resend(RESEND_API_KEY);
      const { error } = await resend.emails.send({
        from: CONTACT_FROM_EMAIL,
        to: CONTACT_TO_EMAIL,
        replyTo: input.email,
        subject,
        text,
        html,
      });

      if (error) {
        console.error('Contact form: Resend error', error);
        throw new ActionError({
          code: 'INTERNAL_SERVER_ERROR',
          message: zh
            ? site.email
              ? `发送消息时出了点问题，请直接发邮件到 ${site.email}。`
              : '发送消息时出了点问题，请稍后再试。'
            : site.email
              ? `Something went wrong sending your message. Please email me directly at ${site.email}.`
              : 'Something went wrong sending your message. Please try again in a moment.',
        });
      }

      return { ok: true };
    },
  }),
};
