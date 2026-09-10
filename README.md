# Elevate ’26 / Elevate 3.0

The E-Cell hackathon and business pitch competition website, built around a classic Clash of Clans village.

## Run

Use Node.js 20 or newer. Run `npm start`, then open `http://127.0.0.1:5173`. No installation or build step is required for the static preview. Use the `PORT` environment variable to change the port. Run `npm run check` for source and village checks. To refresh the pinned Three.js dependency, run `npm ci` and `npm run vendor`.

## Current visual implementation

- Supplied E-Cell and Elevate ’26 logos, resized and compressed from the original files. Rejected generated background-removal variants are not included. Light brand panels preserve the supplied artwork.
- Actual classic game building artwork rather than reinterpreted low-poly models: Town Hall 8, laboratory, Clan Castle, cannons, mortars, archer towers, wizard towers, air defenses, storages, mines, collectors, barracks, camps, and huts.
- 62 buildings, 196 individual wall posts, and a dense border of game trees, rocks, and shrubs. The wall texture uses the center post of the source corner sprite through texture coordinates.
- A flat isometric grass field with a subtle grid and dirt perimeter, based on the Pinterest village references recorded in the asset credits.
- Scroll between event destinations; drag to pan; use the zoom controls or +/- keys; arrow keys pan the focused canvas. Day/night adjusts the scenery. Click the laboratory or Clan Castle to visit a competition.

This is a 2.5D isometric scene in Three.js: original pre-rendered building textures are positioned on planes in a depth-aware scene. It does not claim to reproduce fully rotatable 3D game models. The fixed viewing angle preserves the game artwork's intended perspective. Foreground character cutouts and the earlier animated inhabitants have been removed.

## Files

- `dist/index.html`: event copy, logos, metadata, navigation, FAQ, and dialogs.
- `dist/style.css`: game interface, parchment panels, mobile layout, and reduced motion.
- `dist/app.js`: chapter state, navigation, informational registration, and competition briefs.
- `dist/world.js`: orthographic renderer, texture batching, terrain, camera, pan/zoom, selection, and lighting.
- `dist/village-layout.js`: building coordinates, wall compartments, landmarks, and camera destinations.
- `dist/prop-assets.js`: local texture URLs, dimensions, and footprint anchors.
- `dist/assets/props/`: 28 game artwork textures, compressed losslessly.
- `dist/assets/ecell-logo.webp`, `dist/assets/elevate26-logo.webp`: supplied event branding.
- `dist/vendor/`: self-hosted Three.js 0.180.0 and MIT license.
- `licenses/VILLAGE-ASSETS.md`, `licenses/village-asset-manifest.json`: source attribution, rights notes, and placement metadata.

## Event details

The date, venue, organizer's full name, participation rules, team sizes, event duration, entry fees, challenges, judging, prizes, sponsors, contact information, schedule, and registration URL are still awaiting confirmation. Current copy identifies pending details. The registration dialog collects no data and makes no false submission claim.

Edit the event copy in `dist/index.html` and briefs in `dist/app.js`. Replace the coming-soon registration dialog when an authorized registration destination is supplied. Update canonical and sitemap URLs when the public domain is confirmed, and add Event structured data after the date and location are known. The current owner-private publication is for review and is not publicly indexable.

## Accessibility, performance, and checks

Essential information is semantic HTML. Navigation links provide alternatives to map controls. The page includes a skip link, visible focus, native dialogs/disclosures, inactive chapter focus isolation, reduced-motion support, an illustrated graphics fallback, and a conventional layout on short viewports. The renderer batches textures, caps pixel density, renders on demand, and pauses when hidden or offscreen.

Checks validate local assets, anchor and accessible references, metadata, CSS structure, JavaScript syntax, sprite anchors, building types, unique wall positions, camera destinations at desktop/tablet/mobile dimensions, and removal of character overlay references. Browser interaction and screenshot tests have not been run.

## Credits

Supplied logos belong to the event organizers. Clash of Clans assets remain the property of Supercell and their respective owners; the site identifies itself as an unofficial themed event. Pinterest references and exact asset sources are in `licenses/VILLAGE-ASSETS.md`. Lilita One and Nunito Sans are self-hosted Google Fonts with their license texts included. Three.js uses the included MIT license.
