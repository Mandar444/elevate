# Classic Clash village assets

Downloaded public images for an isometric TH8 village scene. The main building set comes from the same classic Clash Wiki page, so the palette, viewpoint, and era are consistent. No generated art or standalone character cutouts are included.

## Recommended core sprites

- town_hall_level8_ingame.png
- cannon_level10_ingame_icon.png
- archer_tower_level10_ingame_icon.png
- mortar_level6_ingame_icon.png
- wizard_tower_level6_ingame_icon.png
- air_defense_level6_ingame_icon.png
- gold_mine_level12_ingame_icon.png
- gold_storage_level11_ingame_icon.png
- elixir_collector_level12_ingame_icon.png
- elixir_storage_level11_ingame_icon.png
- barracks_level10_ingame_icon.png
- army_camp_level6_ingame_icon.png
- builders_hut.png
- laboratory_level6_ingame_icon.png
- clan_castle_level4_ingame_icon.png
- wall_level8_ingame_icon.png
- hidden_tesla_level6_ingame_icon.png
- spell_factory_level3_ingame_icon.png

Repeat the mines, collectors, towers, and storages to make a dense village. Native images are mostly 200–350 pixels, so display buildings at roughly 60–150 CSS pixels for good sharpness. The wall sprites depict three posts at a corner, not a single post; the source single-wall render was not located.

## Landscape

Prefer obstacle-square-tree.png, obstacle-square-tree-2.png, obstacle-pine-tree.png, and obstacle-square-bush.png. The obstacle assets from coc.guide contain no square grass mat, which makes them easier to place among buildings or in a dense forest. Rocks and logs can decorate the outer edge.

The alternate tree-pine.png has a square grass mat and comes from a third-party PNG repost. The baked-checkerboard large-tree preview was rejected and moved into references; it must not be used as a sprite.

## Composition references

references/pinterest-th8-village2.jpg is a 1920×1080 actual game ground reference, showing purple and black wall compartments on fine-textured green grass. The edge includes dense shrubbery and orange dirt paths. It is a wall-only layout without buildings. Use it for the fixed camera angle, tight diagonal spacing, subtle grass grid, and forest colors. references/pinterest-th8-village.jpg is a smaller Batman wall layout.

- https://www.pinterest.com/pin/785737466209481095/
- https://www.pinterest.com/pin/841680617859552396/
- https://www.pinterest.com/pin/443745369525188319/

## Provenance and reuse

Buildings: https://clash-wiki.com/buildings/town-hall/town-hall-level-8/

Landscape: https://coc.guide/obstacle

Walls alternate: https://coc.guide/defense/wall

Copyright remains with Supercell and its licensors. These files are not represented as public domain or as cleared for unrestricted commercial use. Clash Wiki labels site content CC BY-NC-SA 3.0 while reserving publisher rights in game content. Supercell's Fan Content Policy governs permitted fan use, requires an unofficiality notice, and limits commercial uses and modifications: https://supercell.com/en/fan-content-policy/

## Placement metadata

asset-manifest.json contains exact download URLs, provenance, native dimensions, alpha presence, and alpha bounds for each asset. bottomCenterAnchor is the exact center-bottom of occupied pixels with alpha greater than 8, useful when sprite whitespace differs. suggestedFootprintCenter is only a visual estimate for placing the isometric footprint on a map coordinate; calibrate it while viewing the scene.

Visual QA: props-contact-sheet.png and obstacles-contact-sheet.png were inspected. The source PNG files have been kept unmodified.
