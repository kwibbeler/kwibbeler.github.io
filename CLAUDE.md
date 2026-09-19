Plain HTML, CSS and vanilla JavaScript only: no build step, no framework, no npm; the site must work as static files on GitHub Pages.
Shared data and plan logic live in `plan-data.js` with no DOM code; each page (`index`, `phases`, `weekly`) has its own small script for what it shows.
Colors and spacing come from the CSS variables at the top of `style.css`; do not hard-code new colors in a page.
Plan data stays in the visitor's browser (localStorage); never add a backend, API keys, or personal info, because the repo is public.
Ask before adding a dependency or a new page, and preview with `python3 -m http.server 8000` before pushing.
