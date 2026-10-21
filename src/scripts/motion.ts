// Site-wide motion: smooth scrolling, monument headline reveals, scroll
// reveals, the marquee, workflow diagrams that light up, counting metrics and
// magnetic buttons. Nothing here runs for people who prefer reduced motion,
// and "before" states are only set by JavaScript, so content is never stuck
// hidden. (The homepage scroll story lives in HeroScene.astro.)
import { gsap } from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

// Weighted, never bouncy: fast start with a gentle settle, and a slow start
// with a decisive finish.
const EASE = 'settle';
const DECISIVE = 'decisive';

function smoothScroll() {
  const lenis = new Lenis({ lerp: 0.12, autoRaf: false });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

function monuments() {
  // Each line slides up out of its own mask (the parent clips it).
  document.querySelectorAll<HTMLElement>('[data-monument]').forEach((title) => {
    const lines = title.querySelectorAll('[data-monument-line]');
    const hero = title.closest('[data-band]');
    const items = hero ? hero.querySelectorAll('[data-hero-item]') : [];
    const inView = title.getBoundingClientRect().top < innerHeight;
    gsap
      .timeline({
        defaults: { ease: EASE },
        scrollTrigger: inView ? undefined : { trigger: title, start: 'top 85%', once: true },
      })
      .from(lines, { yPercent: 105, duration: 1.1, stagger: 0.09 })
      .from(items, { opacity: 0, y: 18, duration: 0.75, stagger: 0.08 }, '-=0.75');
  });
}

function marquees() {
  document.querySelectorAll<HTMLElement>('[data-marquee]').forEach((track) => {
    const loop = gsap.to(track, { xPercent: -50, ease: 'none', duration: 32, repeat: -1 });
    // Scrolling speeds the band up, then it eases back to cruising speed.
    ScrollTrigger.create({
      trigger: track,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: (self) => {
        const boost = gsap.utils.clamp(1, 6, 1 + Math.abs(self.getVelocity()) / 500);
        gsap.to(loop, {
          timeScale: boost,
          duration: 0.2,
          overwrite: true,
          onComplete: () => void gsap.to(loop, { timeScale: 1, duration: 1, ease: DECISIVE }),
        });
      },
    });
  });
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
        if (badges[i]) tl.from(badges[i], { scaleY: 0, transformOrigin: 'bottom', duration: 0.4, ease: DECISIVE }, '<');
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
    const x = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'settle' });
    const y = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'settle' });
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

}

if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
  gsap.registerPlugin(ScrollTrigger, CustomEase);
  CustomEase.create('settle', '0.32,0.72,0,1');
  CustomEase.create('decisive', '0.19,1,0.22,1');
  ScrollTrigger.config({ ignoreMobileResize: true });
  smoothScroll();
  monuments();
  marquees();
  reveals();
  workflows();
  counters();
  pointerEffects();

  // Content height changes (FAQ answers, project filters) shift trigger points.
  const refresh = () => ScrollTrigger.refresh();
  document.querySelectorAll('details').forEach((d) => d.addEventListener('toggle', refresh));
  document.addEventListener('projects:filtered', refresh);
}
