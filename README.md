# Elevate 3.0 — The Clash of Ideas

A complete promotional website draft for Elevate's third edition: a Clash of Clans-themed hackathon and business pitching competition.

## Run locally

Install Node.js 20 or newer, then run `npm start` from this project folder. Open `http://127.0.0.1:5173`. No package installation is required. If port 5173 is occupied, set the `PORT` environment variable to another port before starting.

Run `npm run check` for static source checks.

## Project structure

- `dist/index.html`: all page content and SEO metadata, accessible even before JavaScript loads.
- `dist/style.css`: responsive Clash-inspired typography, palette, navigation, beveled game controls, and panels.
- `dist/fonts.css` and `dist/assets/font-*.woff2`: self-hosted fonts.
- `dist/app.js`: mobile navigation, competition briefs, registration dialogs, and pointer interactions.
- `dist/world.js`: native WebGL scene with actual 3D geometric shards and drifting particles; performance capped to about 30 FPS and pixel ratio 1.75. It pauses offscreen or when the page is hidden. Static artwork remains when WebGL is unavailable.
- `dist/assets/`: optimized desktop/mobile village scenery and illustrated competition cards.
- `dist/robots.txt`, `dist/sitemap.xml`, `dist/favicon.svg`: search and branding essentials.
- `server.mjs`: dependency-free local preview server.
- `.openai/hosting.json`: private Sites registration; preserves the existing project identity.

The village artwork is an image with cursor-responsive depth. The ambient shards are live 3D geometry. This is not an explorable 3D village model.

## Details to finalize

Dates, venue, host/organizer identity, event duration, eligibility, team size, entry fees, challenge themes, judging criteria, prizes, sponsors, contact details, social links, schedule, and registration URL are not yet supplied. Current copy explicitly says coming soon where needed. Registration does not collect or store personal information and does not pretend to submit a form.

Update those details in `dist/index.html` and the competition briefs in `dist/app.js`. Once registration is confirmed, replace the coming-soon dialog with the authorized registration destination or a real registration integration.

The current canonical and sitemap origin point to the private Sites preview. Before a public domain launch, update that origin in the HTML and sitemap. Private previews are owner-accessible and cannot serve as a publicly indexed promotional site. Add accurate Event structured data when the actual date and location are confirmed. No event dates, sponsorships, or prize amounts have been invented.

## Artwork and fonts

- Village artwork: **Clash of Clans “Clashy Constructs Wallpaper”**, commissioned by Supercell and created by Piñata. Source: https://pinata.fi/portfolio/clash-of-clans-clashy-constructs-wallpaper/ . Downloaded source: https://pinata.fi/wp-content/uploads/2020/06/ClashofClans_Village_Background_Landscape.jpg . Used for this private themed draft. Copyright remains with its respective owners. See https://supercell.com/en/fan-content-policy/ for applicable fan-content conditions.
- Builder/wizard and barbarian pitch card illustrations: generated with OpenAI's built-in image tool for this requested themed redesign. The game characters and related intellectual property belong to their respective owners.
- Lilita One and Nunito Sans: Google Fonts, self-hosted. License texts are in `licenses/`.

The site includes an unofficiality notice and the Fan Content Policy link. It does not claim Supercell sponsorship or endorsement.

## Accessibility and behavior

Semantic HTML, a skip link, visible keyboard focus, native keyboard-accessible disclosures and modal dialogs, mobile navigation labels, locally hosted fonts, and `prefers-reduced-motion` support. Images have responsive or constrained dimensions. Static content is available without JavaScript; enhanced interactions need JavaScript.

## Validation

Static checks cover asset references, anchor destinations, unique IDs, accessible labels, structured-data JSON, JavaScript syntax, CSS brace balance, and the minimum declared text size. Browser interaction or visual tests have not been run.
