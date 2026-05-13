"use client";

import { useEffect } from "react";

/**
 * Client-side effects for the homepage:
 * - Scroll progress bar
 * - Cursor follower glow (desktop only, respects prefers-reduced-motion)
 * - IntersectionObserver-based reveal animations (mask + lift)
 * - 3D tilt on .hp-quick-card hover
 * - Magnetic pull on hero/CTA buttons within proximity
 * - Scroll-driven hero parallax (image zoom + headline lift/fade)
 *
 * Mounted once in page.tsx as <HomeEffects />.
 */
export default function HomeEffects() {
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const progress = document.getElementById("hp-scroll-progress");
    const cursor = document.getElementById("hp-cursor");
    const heroImg = document.querySelector<HTMLElement>(".hp-hero-img");
    const heroHeadline = document.querySelector<HTMLElement>(".hp-hero-headline");
    const heroTagline = document.querySelector<HTMLElement>(".hp-hero-tagline");
    const heroFloats = document.querySelectorAll<HTMLElement>(".hp-hf");

    let cx = 0, cy = 0, tx = 0, ty = 0;
    let cursorRaf: number | null = null;

    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.body.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      if (progress) progress.style.width = pct + "%";

      const h = window.innerHeight;
      const ratio = Math.min(scrollTop / h, 1);
      if (heroImg) {
        heroImg.style.transform = `scale(${1.05 + ratio * 0.12}) translateY(${ratio * -40}px)`;
      }
      if (heroHeadline) {
        heroHeadline.style.transform = `translateY(${ratio * -36}px)`;
        heroHeadline.style.opacity = String(Math.max(1 - ratio * 1.2, 0));
      }
      if (heroTagline) {
        heroTagline.style.transform = `translateY(${ratio * -20}px)`;
        heroTagline.style.opacity = String(Math.max(0.85 - ratio * 1.1, 0));
      }
      heroFloats.forEach((el, i) => {
        const rate = i === 0 ? -60 : 50;
        el.style.setProperty("--scroll-y", `${ratio * rate}px`);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const onMove = (e: MouseEvent) => {
      tx = e.clientX;
      ty = e.clientY;
    };

    const animateCursor = () => {
      cx += (tx - cx) * 0.1;
      cy += (ty - cy) * 0.1;
      if (cursor) {
        cursor.style.left = cx + "px";
        cursor.style.top = cy + "px";
      }
      cursorRaf = requestAnimationFrame(animateCursor);
    };

    if (!reduceMotion && cursor) {
      document.addEventListener("mousemove", onMove);
      animateCursor();
    }

    const hoverTargets = document.querySelectorAll<HTMLElement>(
      "a, button, .hp-quick-card, .hp-latest-tile, .hp-pill, .hp-bento-tile, .hp-offer-item, .hp-principal"
    );
    const onEnter = () => cursor?.classList.add("is-hover");
    const onLeave = () => cursor?.classList.remove("is-hover");
    hoverTargets.forEach((el) => {
      el.addEventListener("mouseenter", onEnter);
      el.addEventListener("mouseleave", onLeave);
    });

    const reveals = document.querySelectorAll<HTMLElement>(".hp-reveal");
    let revealObserver: IntersectionObserver | null = null;
    if ("IntersectionObserver" in window) {
      revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
              const el = entry.target as HTMLElement;
              window.setTimeout(() => el.classList.add("is-in"), i * 60);
              revealObserver?.unobserve(el);
            }
          });
        },
        { threshold: 0.12 }
      );
      reveals.forEach((r) => revealObserver?.observe(r));
    } else {
      reveals.forEach((r) => r.classList.add("is-in"));
    }

    const cards = document.querySelectorAll<HTMLElement>(".hp-quick-card");
    const tiltHandlers: Array<{ el: HTMLElement; move: (e: MouseEvent) => void; leave: () => void }> = [];
    if (!reduceMotion) {
      cards.forEach((card) => {
        const move = (e: MouseEvent) => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const cxp = rect.width / 2;
          const cyp = rect.height / 2;
          const rotX = ((y - cyp) / cyp) * -6;
          const rotY = ((x - cxp) / cxp) * 6;
          card.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-6px)`;
        };
        const leave = () => {
          card.style.transform = "";
        };
        card.addEventListener("mousemove", move);
        card.addEventListener("mouseleave", leave);
        tiltHandlers.push({ el: card, move, leave });
      });
    }

    // Magnetic buttons — pull toward cursor when within proximity
    const magnetTargets = document.querySelectorAll<HTMLElement>(".hp-hero-pill, .hp-cta-btn, .nav-cta");
    const magnetHandlers: Array<{ el: HTMLElement; move: (e: MouseEvent) => void; leave: () => void }> = [];
    if (!reduceMotion) {
      magnetTargets.forEach((btn) => {
        const move = (e: MouseEvent) => {
          const rect = btn.getBoundingClientRect();
          const cxb = rect.left + rect.width / 2;
          const cyb = rect.top + rect.height / 2;
          const dx = e.clientX - cxb;
          const dy = e.clientY - cyb;
          const dist = Math.hypot(dx, dy);
          const pullRadius = 140;
          if (dist < pullRadius) {
            const strength = (1 - dist / pullRadius) * 0.35;
            btn.style.transform = `translate(${dx * strength}px, ${dy * strength}px)`;
          } else {
            btn.style.transform = "";
          }
        };
        const leave = () => {
          btn.style.transform = "";
        };
        document.addEventListener("mousemove", move);
        btn.addEventListener("mouseleave", leave);
        magnetHandlers.push({ el: btn, move, leave });
      });
    }

    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("mousemove", onMove);
      if (cursorRaf !== null) cancelAnimationFrame(cursorRaf);
      hoverTargets.forEach((el) => {
        el.removeEventListener("mouseenter", onEnter);
        el.removeEventListener("mouseleave", onLeave);
      });
      revealObserver?.disconnect();
      tiltHandlers.forEach(({ el, move, leave }) => {
        el.removeEventListener("mousemove", move);
        el.removeEventListener("mouseleave", leave);
      });
      magnetHandlers.forEach(({ el, move, leave }) => {
        document.removeEventListener("mousemove", move);
        el.removeEventListener("mouseleave", leave);
      });
    };
  }, []);

  return (
    <>
      <div className="hp-scroll-progress" id="hp-scroll-progress" />
      <div className="hp-cursor" id="hp-cursor" />
    </>
  );
}
