# Elevate 3.0 — The Clash of Ideas

A promotional website for the third edition of Elevate: a Clash of Clans-themed hackathon and business pitching competition.

## Run locally

Use Node.js 20 or newer. Run `npm start` in this folder, then open `http://127.0.0.1:5173`. The preview has no build step and does not require an install because its browser dependencies are vendored. Set the `PORT` environment variable to use another port.

Run `npm run check` for source and geometry checks. To refresh the vendored Three.js dependency, run `npm ci` followed by `npm run vendor`.

## The experience

The village is real Three.js geometry: a fortified town hall, workshop, pitch arena, elixir collectors, vault, cannons, trees, waterfall, windmill, balloon, fire, and four articulated inhabitants. Scroll to travel between competition destinations. Drag or use the arrow keys on the focused canvas to rotate the view. Click a labeled building or use the navigation links to visit a competition. Daylight and moonlight change the scene lighting, glowing windows, elixir, and sky.

Generated transparent Barbarian, Archer Queen, and Wizard artwork frames the village and competition destinations. These large foreground characters are layered images; the small villagers and scenery are live geometry.

Mobile viewports use a wider camera composition. Short viewports use a conventional scrolling layout to keep content reachable. Reduced-motion users get an on-demand renderer with ambient animation disabled. Rendering pauses offscreen and in hidden tabs, caps device resolution and frame rate, batches static geometry, and caches static shadows. If WebGL is unavailable or lost, an illustrated fallback preserves navigation and event content.

## Project structure

- `dist/index.html`: event content, semantic structure, native dialogs, FAQ, and SEO metadata.
- `dist/style.css`: layout, chapter transitions, responsive behavior, and typography.
- `dist/clan.css`: foreground characters and the saturated game interface.
- `dist/app.js`: chapter navigation, day/night state, dialogs, and character parallax.
- `dist/world.js`: renderer, camera choreography, building hit regions, lights, and animation.
- `dist/village-model.js`: geometry, materials, scenery, articulated villagers, and landmarks.
- `dist/vendor/`: self-hosted Three.js 0.180.0, geometry helpers, and MIT license.
- `dist/assets/`: optimized WebP character cutouts, illustrated briefs, fallback scenery, and local fonts.
- `server.mjs`: dependency-free preview server.
- `scripts/check.mjs`, `scripts/check-world.mjs`: source and geometry validation.
- `scripts/vendor.mjs`: reproducible dependency preparation from the pinned npm package.
- `.openai/hosting.json`: existing private Sites project identity.

## Details to finalize

Dates, venue, organizer, eligibility, team sizes, duration, entry fees, challenge statements, judging criteria, prizes, sponsors, contact information, schedule, and the registration URL have not been supplied. The current site says coming soon where appropriate. Registration opens an informational dialog and collects no personal data.

Edit the event information in `dist/index.html` and competition briefs in `dist/app.js`. Replace the registration dialog with the authorized destination once supplied. Update the canonical URL and sitemap for the eventual public domain. Add accurate Event structured data after dates and location are confirmed. The current owner-private publication is for review and is not publicly indexable.

## Artwork and typography

- Fallback village: Clash of Clans “Clashy Constructs Wallpaper,” commissioned by Supercell and created by Piñata. Source: https://pinata.fi/portfolio/clash-of-clans-clashy-constructs-wallpaper/ . Original image: https://pinata.fi/wp-content/uploads/2020/06/ClashofClans_Village_Background_Landscape.jpg .
- Foreground Barbarian, Archer Queen, Wizard, and illustrated competition briefs: generated with OpenAI's image tool for the requested theme. Foreground assets retain genuine transparency and are optimized to about 300 KB combined. Generation prompts are recorded in `licenses/character-prompts.txt`.
- Game characters and related intellectual property remain with their respective owners. This is an unofficial themed event draft. The footer links to https://supercell.com/en/fan-content-policy/ and does not imply endorsement.
- Lilita One and Nunito Sans are self-hosted Google Fonts with license texts in `licenses/`. This build does not bundle Supercell's proprietary game font.
- Three.js is MIT licensed; its license is included in `dist/vendor/THREE-LICENSE.txt`.

## Accessibility and validation

The page has semantic headings, an event-details skip link, visible keyboard focus, native modal dialogs and FAQ disclosures, inactive chapter focus isolation, keyboard alternatives to 3D navigation, reduced-motion support, and a static fallback. Essential event text is HTML rather than canvas text.

Checks cover local assets, module imports, anchor destinations, unique IDs, accessible references, metadata JSON, JavaScript syntax, CSS structure, declared minimum text size, finite geometry/transforms, scene complexity, and camera destinations at desktop, tablet, and mobile dimensions. Browser interaction and screenshot tests have not been run.
