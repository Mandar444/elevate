# Elevate ’26 / Elevate 3.0

The E-Cell hackathon and business pitch competition website, built around a classic Clash of Clans village.

## Pages and hosting

- `/`: Elevate village, competition previews, field guide, sponsor and community partner roster, and closing invitation.
- `/neural-nexus/`: Neural Nexus AI/ML Hackathon, with its own laboratory hero, mission, preparation guide, FAQ, and registration status.
- `/startush-smackdown/`: Startush Smackdown Business Pitching Competition, with its own arena hero, mission, preparation guide, FAQ, and registration status.
- `/team/`: Our Team, with E-Cell branding, clan roster cards, and clearly labeled placeholders until confirmed names, roles, and photos are supplied.
- `/past-editions/`: Elevate 2024 and 2025, each with judges, special guests/mentors, and a photo album with an enlarged viewer.
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

## Adding team members

Edit `dist/content/team.json`. Keep `members` empty until the roster is confirmed. Put approved photos in `dist/assets/team/` and add entries with this shape:

```json
{
  "name": "Confirmed member name",
  "role": "Confirmed role",
  "photo": "/assets/team/member-photo.webp",
  "profileUrl": "https://profile.example"
}
```

Only the name is required. Missing or unavailable photos display the member’s initials. Profile links are optional. The six initial announcement cards are placeholders, not a claimed team count. Confirmed entries replace the placeholders automatically; names and roles use text nodes and profile/photo URLs are limited to HTTP(S).

## Adding previous-edition content

The archive is a static, editable collection. Update `dist/content/past-editions.json` and deploy the repository as usual. There is no upload service or administration login. Both 2024 and 2025 are already represented; keep arrays empty until actual historical details and approved photographs are supplied.

For each year, add people to `judges` or `guests`:

```json
{
  "name": "Confirmed person's name",
  "role": "Role at that edition",
  "organization": "Confirmed organization",
  "photo": "/assets/archive/2024/person.webp",
  "profileUrl": "https://profile.example"
}
```

Only the name is required for a person. Missing photographs show initials; profile URLs are optional. Use the guests array for special guests, speakers, or mentors, and identify their actual role in the role field.

Add photographs to that edition’s `photos` array:

```json
{
  "src": "/assets/archive/2024/event-photo.webp",
  "alt": "Describe what is visible in this actual photograph",
  "caption": "A short caption with confirmed context",
  "credit": "Photographer name, if applicable"
}
```

Put the referenced images in `dist/assets/archive/2024/` or `dist/assets/archive/2025/`. Source and alt text are required; captions and credits are optional. Prefer compressed WebP or JPEG photos. Gallery images load lazily and open in a native dialog, with previous/next buttons, arrow-key navigation, and Escape to close. HTML text is inserted safely as text nodes and image/profile URLs are limited to HTTP(S). Empty collections show explicit announcement spaces, with no invented judges, guest identities, event photos, or attendance claims.

## Run

Use Node.js 20 or newer. Run `npm start`, then open `http://127.0.0.1:5173`. No installation or build step is required for the static preview. Use the `PORT` environment variable to change the port. Run `npm run check` for source and village checks. To refresh the pinned Three.js dependency, run `npm ci` and `npm run vendor`.

## Current visual implementation

- Supplied E-Cell and Elevate ’26 logos, resized and compressed from the original files, displayed in light circular brand seals.
- Actual classic game building artwork rather than reinterpreted low-poly models: Town Hall 8, laboratory, Clan Castle, cannons, mortars, archer towers, wizard towers, air defenses, storages, mines, collectors, barracks, camps, and huts.
- 62 buildings, 196 individual wall posts, and a dense border of game trees, rocks, and shrubs. The wall texture uses the center post of the source corner sprite through texture coordinates.
- A flat isometric grass field with a subtle grid and dirt perimeter, based on the Pinterest village references recorded in the asset credits.
- The village stays behind the four opening homepage scenes. The lower homepage transitions into a carved wood-and-stone council board, a burgundy clan-banner sponsor hall with community plaques, and two equally prominent arena cards. The closing team invitation leads to a dedicated roster page. The repeated village backdrop ends at the field guide and the renderer pauses while hidden. The dedicated competition pages use their own camera destination and lighting, followed by distinct content sections.
- 45 original in-game troop sprites: two archers on each archer tower, a wizard on every wizard tower, six troops beside each camp, and eight patrols on the outer grass lanes.
- Twelve lighting sources: warm campfire and Town Hall light, purple elixir/laboratory light, and blue wizard-tower light. Shader-based illumination reaches the ground and nearby props; additive source glows and rising embers remain visible in moonlight.
- Scroll between event destinations; drag to pan; use the zoom controls or +/- keys; arrow keys pan the focused canvas. Switch between day/night or pause village animation. Click the laboratory or Clan Castle to visit a competition.

This is a 2.5D isometric scene in Three.js: original pre-rendered building and troop textures are positioned on planes in a depth-aware scene. The fixed viewing angle preserves the artwork's intended perspective. Troops use single standing poses with route movement, direction changes, and subtle bobbing; they are not multi-frame walking animations. Oversized foreground character cutouts remain removed.

## Prize pools and section palette

Elevate 3.0 has a ₹1,00,000 prize pool. Neural Nexus totals ₹60,000 (₹30,000 / ₹20,000 / ₹10,000 for first / second / third); Startush Smackdown totals ₹40,000 (₹20,000 / ₹12,000 / ₹8,000). The organizer's latest 60/40 split is used, interpreting the final hackathon award as third place. Amounts are static, accessible HTML in the homepage and each competition page. Keep hero labels, reward sections, arena cards, and FAQs in sync when changing them.

`dist/stronghold.css` supplies the reward layouts and the final section palette: dark timber for the council, cobalt for the alliance hall, violet for Neural Nexus, burgundy and gold for Startush Smackdown, navy and wine for the team, and distinct blue/wine archive chapters. Pale preparation and expanded FAQ panels are replaced. The renderer stops at the new treasury section; the village and hidden mobile toolbar are preserved.

## Mobile behavior

Phones use flowing homepage chapters at every screen height. Competition introductions flow above a separately framed village view. Safe-area insets keep the header and bottom dock away from notches and home indicators; measured header/dock heights also reserve room when text is enlarged. The day/night, pause, reset, and zoom toolbar is hidden throughout the mobile site, including landscape and competition pages; desktop controls remain available. Visible touch controls are at least 44 pixels high. The phone dock keeps four primary pages visible and groups Field Guide, Our Allies, and Past Editions under More. Sponsor banners use two columns, and team cards use one column on narrow phones. Content heights remain flexible and registration dialogs scroll within the visible viewport.

Vertical swipes stay assigned to page scrolling, horizontal swipes pan the village, and multi-touch gestures cannot trigger landmark navigation. Native pinch zoom stays available. Phone rendering is capped at 1.25 pixel ratio and 850,000 backing pixels, with a 60 fps animation target; data-saving mode uses 30 fps and at most 1 pixel ratio. Small responsive logo and fallback image variants reduce download size. Reduced-motion and offscreen rendering behavior remain supported.

## Motion and rendering performance

The renderer targets 60 fps on desktop and phones, or 30 fps when data-saving mode is enabled. It follows stable frame deadlines with timestamp tolerance, rather than restarting the interval after every drawn frame. Sustained missed frame budgets gradually lower render resolution to 70% of its initial pixel ratio; sustained headroom restores quality slowly. This is an adaptive target, not a guarantee of measured device FPS.

Camera projections, landmark hitboxes, and label positioning update only when the camera changes. Homepage scroll positions are measured after viewport or content resizing and cached during scrolling; navigation and accessibility state change only at section boundaries. Static object matrices, patrol route lengths, tower anchors, and ember origins are reused. Night-light flicker is computed once per light on the CPU and daylight skips night-light fragment calculations. Texture uploads are spread across small batches before the first scene frame. Continuously blurred HUD surfaces are replaced with the same translucent palette. Paused, hidden, and offscreen scenes still stop rendering.

Checks simulate display clocks at 60, 90, 120, and 144 Hz with timestamp jitter, data-saving cadence, reset behavior, and adaptive-resolution reduction/recovery. Device/browser frame-rate measurements have not been performed.

## Files

- `dist/index.html`: event copy, logos, metadata, navigation, FAQ, and dialogs.
- `dist/style.css`, `dist/voyage.css`: base controls, village layout, bottom navigation, responsive event typography, dialogs, and reduced motion.
- `dist/chapters.css`, `dist/clan.css`: homepage section foundations, carved council board, clan-banner partner roster, balanced arena buttons, and shared six-destination navigation.
- `dist/team/index.html`, `dist/team.css`, `dist/team.js`, `dist/content/team.json`: team page and editable roster.
- `dist/assets/ui/`: generated reusable council frame and clan banner artwork.
- `dist/archive.css`, `dist/archive.js`, `dist/past-editions/index.html`, `dist/content/past-editions.json`: previous-edition rosters, galleries, image viewer, and homepage invitation.
- `dist/frame-pacing.js`, `dist/performance.css`: frame deadlines, adaptive resolution, and lightweight HUD compositing.
- `dist/mobile.css`, `dist/responsive.js`: phone layout, touch gesture direction, safe areas, and render budgets.
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

Essential information is semantic HTML. Navigation links provide alternatives to map controls. The page includes a skip link, visible focus, native dialogs/disclosures, inactive chapter focus isolation, reduced-motion support, a desktop animation pause control, an illustrated graphics fallback, and a conventional layout on short viewports. Buildings are batched and troops instanced. Animation targets 60 fps with stable deadline-based scheduling and capped pixel density; rendering stops when hidden and runs on demand when animation is paused.

Checks validate all six static HTML routes, local assets, navigation and anchor references, metadata, deployment-domain replacement, partner, team, and previous-edition data, equal competition buttons, CSS structure, JavaScript syntax, sprite anchors, building types, unique wall positions, camera destinations at desktop/tablet/mobile dimensions, camera continuity, tower and camp population, patrol clearance, animation transforms, and shader/uniform wiring. Mobile checks additionally cover responsive image files, eight phone/tablet portrait and landscape sizes, rendering budgets, centered arena cameras, data-saving preferences, and gesture direction locking. These are source and scene-data checks; browser interaction, visual layout, and GPU shader execution tests have not been run.

## Credits

The council frame and blank clan banner were generated for this design using the built-in image-generation tool, then compressed to WebP with alpha retained. Their prompts and source QA are recorded in `licenses/clan-ui-provenance.json` and `licenses/clan-ui-qa.json`. The council frame is used as an unfilled CSS border image; text, names, and logos remain real HTML content.

Supplied logos belong to the event organizers. Clash of Clans assets remain the property of Supercell and their respective owners; the site identifies itself as an unofficial themed event. Pinterest references and exact asset sources are in `licenses/VILLAGE-ASSETS.md`. Lilita One and Nunito Sans are self-hosted Google Fonts with their license texts included. Three.js uses the included MIT license.
