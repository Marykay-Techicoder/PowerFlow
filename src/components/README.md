# PowerFlow Landing Page

Drop-in landing page for the PowerFlow app: Navbar → Hero → About → Services → Contact → Footer, built with Next.js (App Router), TypeScript, Tailwind CSS, Framer Motion, and Phosphor Icons.

## What's new / changed

- **`components/landing/navbar.tsx`** — new. Sticky nav that turns solid on scroll, smooth-scroll links to each section, animated slide-in mobile menu, "Login" + "Get Started" CTAs.
- **`components/landing/hero.tsx`** — enhanced. Fixed a stray-backtick typo, added a live "dashboard" visual (animated progress bar, floating status badges) so the hero has a real product image instead of just text + stat cards.
- **`components/landing/about.tsx`**, **`services.tsx`**, **`contact.tsx`** — unchanged in content, just added `id="about"`, `id="services"`, `id="contact"` anchors so the navbar can scroll to them, plus `scroll-mt-20` so the fixed navbar doesn't cover the section heading when you jump to it.
- **`components/landing/footer.tsx`** — unchanged.
- **`app/page.tsx`** — new. Assembles everything in order.
- **`app/globals.css`** — new. Defines every `--color-*` CSS variable the components reference (accent, success, warning, danger, info, primary). Without this file (or its `:root` block copied into your existing globals.css) the colors won't render at all.

## Install

```bash
npm install framer-motion @phosphor-icons/react
```

## Drop-in steps

1. Copy `components/landing/` into your project's `components/` folder (or wherever `@/components` resolves to).
2. Copy the `:root { ... }` block from `app/globals.css` into your existing `app/globals.css` (skip this if you're using this file as-is).
3. Replace or merge `app/page.tsx` with the one here.
4. Make sure your `tsconfig.json` has the `@/*` path alias:
   ```json
   "paths": { "@/*": ["./*"] }
   ```
   If your alias is different, update the imports at the top of `app/page.tsx` and `navbar.tsx`.

## CTA flow

Every entry point (navbar "Get Started", hero "Get Started Now", footer "Register") links to `/register`, and every "Login"/"Sign in" link points to `/login` — wire those two routes to your actual auth pages and users flow straight from landing → sign up → dashboard.

## Notes

- Colors are one edit away: change the hex values in `app/globals.css` to reskin the whole page.
- Respects `prefers-reduced-motion`.
- All sections are fully responsive (mobile → desktop) and use `whileInView` so animations replay as you scroll, without re-triggering on every re-render.
