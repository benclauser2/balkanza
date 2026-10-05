# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Standalone relationship quiz page ("How well do you know your partner?") for balkanza.com, intended to live at `https://balkanza.com/quiz`. Plain static site: `index.html`, `css/quiz.css`, `js/quiz.js`, plus `assets/`. No package manager, build step, bundler, linter or test suite.

## Running

Open `index.html` directly, or serve the folder for full behavior (the share button needs a secure context — `localhost` counts):

```
npx serve .
# or
python -m http.server
```

## Architecture

- **Single page, three views.** `#quiz-intro`, `#quiz-stage` and `#quiz-result` are sibling `<section>`s; `showSection()` in `js/quiz.js` toggles their `hidden` attribute. The editorial and CTA sections below are always visible.
- **Content lives in JS.** `QUESTIONS` (array of statements) and `RESULT_BANDS` (score thresholds, title, summary, tips) at the top of `js/quiz.js`. Score = number of "true" answers. Bands are matched in order by `min`, so keep them sorted descending. Band `title` is a `[before, emphasised, after]` tuple rendered into an `<em>` via DOM nodes.
- **Question count is driven by `QUESTIONS.length`**, but the static HTML hardcodes "20" in the hero tags, progress label and `<progress max>` — update those if the count changes.
- **No `innerHTML` anywhere.** All dynamic text goes through `textContent` / `replaceChildren` — keep it that way.
- **Progressive enhancement.** The start button ships `disabled` and is enabled at the end of `initQuiz()`; `initQuiz()` bails if any expected element ID is missing. A `<noscript>` notice covers no-JS. The share button is hidden unless Web Share or Clipboard API is available (falls back to "Copy quiz link").
- **Accessibility behaviors to preserve:** focus moves to the question `<legend>` / result heading on each render (`tabindex="-1"`), validation error uses `role="alert"`, share status uses `role="status"`, Escape closes the mobile nav and the language menu (the lang menu stops propagation so it doesn't also close the nav), Back keeps the current selection.
- **CSS** (`css/quiz.css`): design tokens on `:root` copied from the main site (see below). BEM-style class names (`block__element`, `is-*` state classes). File is organized by commented sections (Base, Shared components, Navigation, Hero, Question stage, Results, Editorial, CTA, Footer, Animation, Responsive); breakpoints at 860px and 600px, plus a `prefers-reduced-motion` block.

## Design source of truth: https://balkanza.com/

The main site defines the look. Colors, fonts, type scale, buttons, cards, tags, eyebrows and spacing here must match it. If they disagree, the main site wins. Don't invent new colors, fonts or component styles. Copy the main site's values.

- The main site's styles are in its compiled stylesheet, linked from the homepage `<head>` as `build/assets/landing-v3-<hash>.css` (the hash changes with each deploy). Its rules are scoped under `.v3` and use the `v3-` BEM prefix. Fetch the live CSS to check values, e.g. `curl -sL https://balkanza.com/ | grep -o 'landing-v3-[^"]*\.css'`.
- Tokens (`.v3` on the main site, `:root` here) are `--cream #f4ede4`, `--cream-2 #eadfd0`, `--paper #fff`, `--wine #c8102e`, `--wine-deep #9a0c24`, `--terra #e63946`, `--gold-warm #c9a24e`, `--ink #0a0a0a`, `--ink-2 #1f1f1f`, `--muted #6b6b6b` and `--line #e5ded3`. The main site also has `--gold` (same value as terra) and `--gold-soft #f26572`, which aren't used here yet.
- Fonts come from Google Fonts and are the same on both sites: Fraunces (serif, used for headings and `<em>` emphasis), Inter (sans, used for body text and buttons) and JetBrains Mono (used for eyebrows, tags and small labels). The main site loads more weights than this page: Fraunces 300 and italic 500, and Inter 700. Add them to the `<link>` in `index.html` if a design needs them.
- Shared classes reuse the main site's names and values: `.wrap` (max 1200px, 32px side padding), `.btn`, `.btn-primary` (wine background with cream text), `.btn-ghost`, `.card` (22px radius, `--line` border), `.tag`, `.eyebrow` and `.section-title` (Fraunces, `clamp(36px,5vw,64px)`). Copy any new component from the matching `v3-*` rule on the main site.

## Placeholders

Much copy is marked "Placeholder" (intro, result summaries, disclaimer, CTA, editorial) and awaits final text. The language switcher is a stub — it only swaps the visible label; each option still needs wiring to a real locale route. Nav/footer links point to absolute balkanza.com / app.balkanza.com URLs.
