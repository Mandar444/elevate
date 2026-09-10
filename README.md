# Elevate ’26 / Elevate 3.0

The E-Cell hackathon and business pitch competition website, built around a classic Clash of Clans village.

## Pages and hosting

- `/`: Elevate village, competition previews, field guide, sponsor and community partner roster, and closing invitation.
- `/neural-nexus/`: Neural Nexus AI/ML Hackathon, with its own laboratory hero, mission, preparation guide, FAQ, and registration status.
- `/startush-smackdown/`: Startush Smackdown Business Pitching Competition, with its own arena hero, mission, preparation guide, FAQ, and registration status.
- `404.html`: a useful fallback for missing pages.

The competition names follow the supplied spelling, including **Startush Smackdown**. Navigation, village landmarks, and homepage competition buttons link to the dedicated pages. Existing homepage chapter anchors remain usable.

The repository is ready to import into Vercel. `vercel.json` selects the static `dist` output, runs `npm run build`, and enables trailing slashes for directory pages. The local server supports the same directory routes and missing-page behavior. No server runtime or application secrets are required.

At deployment, the build updates canonical URLs, Open Graph URLs, structured data, sitemap, and robots sitemap location using `SITE_URL`, then Vercel's production domain, then the deployment domain. Set the optional `SITE_URL` environment variable to a full origin such as `https://your-event-domain.com` if a specific domain is required. With no deployment variables, local builds retain the private preview domain. Dates and venue are still pending, so no dated Event structured data is invented.

Vercel references: [static project configuration](https://vercel.com/docs/project-configuration/vercel-json) and [system environment variables](https://vercel.com/docs/environment-variables/system-environment-variables).

## Adding sponsors and community partners

Edit `dist/content/partners.json`. Put approved logos in `dist/assets/partners/`, then add entries to `sponsors` or `communityPartners`, using this shape:

```json
{
  "name": "Confirmed partner name",
  "logo": "/assets/partners/approved-logo.webp",
  "url": "https://partner.example"
}
```

Keep each array empty until partners are confirmed. Empty arrays show explicitly labeled announcement spaces; no brands or endorsements are fabricated. A partner without a URL becomes a non-clickable card, and one without a logo displays its name. Logo cards accommodate additional partners automatically on desktop and mobile.

## Run

Use Node.js 20 or newer. Run `npm start`, then open `http://127.0.0.1:5173`. No installation or build step is required for the static preview. Use the `PORT` environment variable to change the port. Run `npm run check` for source and village checks. To refresh the pinned Three.js dependency, run `npm ci` and `npm run vendor`.

## Current visual implementation

- Supplied E-Cell and Elevate ’26 logos, resized and compressed from the original files, displayed in light circular brand seals.
- Actual classic game building artwork rather than reinterpreted low-poly models: Town Hall 8, laboratory, Clan Castle, cannons, mortars, archer towers, wizard towers, air defenses, storages, mines, collectors, barracks, camps, and huts.
- 62 buildings, 196 individual wall posts, and a dense border of game trees, rocks, and shrubs. The wall texture uses the center post of the source corner sprite through texture coordinates.
- A flat isometric grass field with a subtle grid and dirt perimeter, based on the Pinterest village references recorded in the asset credits.
- The village stays behind the four opening homepage scenes. The lower homepage transitions to warm field notes, a dark alliance roster, and a compact closing invitation with independent game prop artwork. The FAQ surface is transparent against its own section; the repeating village backdrop ends at the field guide. The renderer pauses while hidden. The dedicated competition pages use their own camera destination and lighting, followed by distinct content sections.
- 45 original in-game troop sprites: two archers on each archer tower, a wizard on every wizard tower, six troops beside each camp, and eight patrols on the outer grass lanes.
- Twelve lighting sources: warm campfire and Town Hall light, purple elixir/laboratory light, and blue wizard-tower light. Shader-based illumination reaches the ground and nearby props; additive source glows and rising embers remain visible in moonlight.
- Scroll between event destinations; drag to pan; use the zoom controls or +/- keys; arrow keys pan the focused canvas. Switch between day/night or pause village animation. Click the laboratory or Clan Castle to visit a competition.

This is a 2.5D isometric scene in Three.js: original pre-rendered building and troop textures are positioned on planes in a depth-aware scene. The fixed viewing angle preserves the artwork's intended perspective. Troops use single standing poses with route movement, direction changes, and subtle bobbing; they are not multi-frame walking animations. Oversized foreground character cutouts remain removed.

## Files

- `dist/index.html`: event copy, logos, metadata, navigation, FAQ, and dialogs.
- `dist/style.css`, `dist/voyage.css`: base controls, village layout, bottom navigation, responsive event typography, dialogs, and reduced motion.
- `dist/chapters.css`: lower homepage sections and sponsor/community partner layouts.
- `dist/competition.css`, `dist/competition.js`: standalone competition page layout and focused village heroes.
- `dist/event-ui.js`: shared registration dialogs, day/night, pause, and camera controls.
- `dist/partners.js`, `dist/content/partners.json`: sponsor and community partner roster.
- `dist/app.js`: chapter state, navigation, informational registration, and competition briefs.
- `dist/world.js`: orthographic renderer, texture batching, terrain, camera, pan/zoom, selection, and lighting.
- `dist/village-layout.js`: building coordinates, wall compartments, landmarks, and camera destinations.
- `dist/village-life.js`: tower crew, camps, patrol paths, shader lighting, source glows, and embers.
- `dist/troop-assets.js`, `dist/assets/troops/`: four original game troop textures and their foot anchors.
- `dist/prop-assets.js`: local texture URLs, dimensions, and footprint anchors.
- `dist/assets/props/`: 28 game artwork textures, compressed losslessly.
- `dist/assets/ecell-logo.webp`, `dist/assets/elevate26-logo.webp`: supplied event branding.
- `dist/vendor/`: self-hosted Three.js 0.180.0 and MIT license.
- `licenses/VILLAGE-ASSETS.md`, `licenses/village-asset-manifest.json`: source attribution, rights notes, and placement metadata.

## Event details

The date, venue, organizer's full name, participation rules, team sizes, event duration, entry fees, challenges, judging, prizes, sponsors, contact information, schedule, and registration URL are still awaiting confirmation. Current copy identifies pending details. The registration dialog collects no data and makes no false submission claim.

Edit the event copy in `dist/index.html` and the competition pages in `dist/neural-nexus/index.html` and `dist/startush-smackdown/index.html`. Replace each coming-soon registration dialog when an authorized registration destination is supplied. Add Event structured data after the date and location are known. The existing owner-private Sites publication is for review; Vercel is the requested production hosting destination.

## Accessibility, performance, and checks

Essential information is semantic HTML. Navigation links provide alternatives to map controls. The page includes a skip link, visible focus, native dialogs/disclosures, inactive chapter focus isolation, reduced-motion support, a dedicated animation pause control, an illustrated graphics fallback, and a conventional layout on short viewports. Buildings are batched and troops instanced. Ambient motion is capped at 30 fps on desktop and 24 fps on mobile, with capped pixel density; rendering stops when hidden and runs on demand when animation is paused.

Checks validate all four static HTML routes, local assets, navigation and anchor references, metadata, deployment-domain replacement, partner data, CSS structure, JavaScript syntax, sprite anchors, building types, unique wall positions, camera destinations at desktop/tablet/mobile dimensions, camera continuity, tower and camp population, patrol clearance, animation transforms, and shader/uniform wiring. These are source and scene-data checks; browser interaction, visual layout, and GPU shader execution tests have not been run.

## Credits

Supplied logos belong to the event organizers. Clash of Clans assets remain the property of Supercell and their respective owners; the site identifies itself as an unofficial themed event. Pinterest references and exact asset sources are in `licenses/VILLAGE-ASSETS.md`. Lilita One and Nunito Sans are self-hosted Google Fonts with their license texts included. Three.js uses the included MIT license.
