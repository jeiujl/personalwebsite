// Site-wide motion: smooth scrolling, scroll reveals, the hero headline,
// workflow diagrams that light up, counting metrics, magnetic buttons and
// card tilt. Nothing here runs for people who prefer reduced motion, and
// "before" states are only set by JavaScript, so content is never stuck hidden.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';

const EASE = 'power3.out';

function smoothScroll() {
  const lenis = new Lenis({ lerp: 0.12, autoRaf: false });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

function heroTitle() {
  const title = document.querySelector<HTMLElement>('[data-hero-title]');
  if (!title) return;
  const split = SplitText.create(title, { type: 'words', mask: 'words', aria: 'auto' });
  const items = document.querySelectorAll('[data-hero-item]');
  gsap
    .timeline({ defaults: { ease: EASE } })
    .from(split.words, { yPercent: 110, duration: 0.9, stagger: 0.045 })
    .from(items, { opacity: 0, y: 18, duration: 0.7, stagger: 0.08 }, '-=0.5')
    .add(() => split.revert());
}

function reveals() {
  gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
    if (el.parentElement?.closest('[data-reveal], [data-reveal-stagger]')) return;
    gsap.from(el, {
      opacity: 0,
      y: 28,
      duration: 0.9,
      ease: EASE,
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });
  });

  gsap.utils.toArray<HTMLElement>('[data-reveal-stagger]').forEach((group) => {
    const children = [...group.children].filter((c) => !(c as HTMLElement).hidden);
    gsap.from(children, {
      opacity: 0,
      y: 32,
      duration: 0.8,
      ease: EASE,
      stagger: 0.09,
      scrollTrigger: { trigger: group, start: 'top 85%', once: true },
    });
  });
}

function workflows() {
  const mm = gsap.matchMedia();
  gsap.utils.toArray<HTMLElement>('[data-workflow]').forEach((diagram) => {
    const steps = diagram.querySelectorAll('[data-workflow-step]');
    const lines = diagram.querySelectorAll<HTMLElement>('[data-workflow-line]');
    const badges = diagram.querySelectorAll('[data-workflow-badge]');
    mm.add({ wide: '(min-width: 1024px)', narrow: '(max-width: 1023.98px)' }, (ctx) => {
      const wide = ctx.conditions?.wide;
      gsap.set(lines, { transformOrigin: wide ? 'left center' : 'center top' });
      const tl = gsap.timeline({
        defaults: { ease: EASE },
        scrollTrigger: { trigger: diagram, start: 'top 75%', once: true },
      });
      steps.forEach((step, i) => {
        tl.from(step, { opacity: 0.15, y: 14, duration: 0.45 }, i === 0 ? 0 : '>-0.1');
        tl.from(badges[i], { scale: 0.6, duration: 0.4, ease: 'back.out(2.5)' }, '<');
        if (lines[i]) tl.from(lines[i], { [wide ? 'scaleX' : 'scaleY']: 0, duration: 0.35 }, '>-0.15');
      });
    });
  });
}

function counters() {
  gsap.utils.toArray<HTMLElement>('[data-count]').forEach((el) => {
    const original = el.textContent ?? '';
    const match = original.match(/-?\d+(?:\.\d+)?/);
    if (!match) return;
    const target = parseFloat(match[0]);
    // Counting 0 → 1 reads oddly ("< 0 min"), so small whole numbers just appear.
    if (Number.isInteger(target) && Math.abs(target) <= 1) return;
    const decimals = match[0].split('.')[1]?.length ?? 0;
    const [before, after] = [original.slice(0, match.index), original.slice((match.index ?? 0) + match[0].length)];
    const state = { value: 0 };
    gsap.to(state, {
      value: target,
      duration: 1.4,
      ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      onUpdate: () => {
        el.textContent = `${before}${state.value.toFixed(decimals)}${after}`;
      },
      onComplete: () => {
        el.textContent = original;
      },
    });
  });
}

function pointerEffects() {
  if (!matchMedia('(pointer: fine)').matches) return;

  document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((el) => {
    const x = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3.out' });
    const y = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3.out' });
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      x((e.clientX - (r.left + r.width / 2)) * 0.25);
      y((e.clientY - (r.top + r.height / 2)) * 0.35);
    });
    el.addEventListener('pointerleave', () => {
      x(0);
      y(0);
    });
  });

  document.querySelectorAll<HTMLElement>('[data-tilt]').forEach((el) => {
    gsap.set(el, { transformPerspective: 900 });
    const rx = gsap.quickTo(el, 'rotationX', { duration: 0.5, ease: 'power3.out' });
    const ry = gsap.quickTo(el, 'rotationY', { duration: 0.5, ease: 'power3.out' });
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      rx(-((e.clientY - r.top) / r.height - 0.5) * 6);
      ry(((e.clientX - r.left) / r.width - 0.5) * 6);
    });
    el.addEventListener('pointerleave', () => {
      rx(0);
      ry(0);
    });
  });
}

if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
  gsap.registerPlugin(ScrollTrigger, SplitText);
  smoothScroll();
  heroTitle();
  reveals();
  workflows();
  counters();
  pointerEffects();

  // Content height changes (FAQ answers, project filters) shift trigger points.
  const refresh = () => ScrollTrigger.refresh();
  document.querySelectorAll('details').forEach((d) => d.addEventListener('toggle', refresh));
  document.addEventListener('projects:filtered', refresh);
}
