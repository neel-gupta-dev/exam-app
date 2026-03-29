# Design System Specification: The Focused Scholar

## 1. Overview & Creative North Star
**Creative North Star: The Silent Architect**
This design system is built for the high-performance academic and professional. It rejects the "noisy" dashboard trend of the mid-2020s in favor of an environment that recedes into the background, allowing the user's data and thoughts to take center stage. 

The aesthetic is "Silent Productivity"—an editorial-grade dark mode that prioritizes atmospheric depth over structural lines. By leveraging intentional asymmetry in layouts and a rigorous adherence to tonal layering, we move beyond the "template" look. We do not use borders to contain; we use space and value shifts to organize. The result is a UI that feels like a premium, physical tool—machined, precise, and authoritative.

---

## 2. Colors
Our palette is rooted in the deep obsidian of the `surface` tokens, punctuated by the intellectual energy of `primary` (indigo/purple).

### Surface Hierarchy & Nesting
To achieve a high-end feel, we abandon the flat grid. We treat the UI as a series of physical layers.
- **Base Layer:** `surface` (#0b0e11) — The foundation.
- **Structural Sections:** `surface-container-low` (#0f1418) — Used for large sidebars or secondary navigation.
- **Content Containers:** `surface-container` (#141a20) — The primary workspace for cards and editors.
- **Interactive Floating Elements:** `surface-bright` (#222d37) — For modals or popovers that need to "pierce" the dark background.

### The "No-Line" Rule
**Strict Directive:** 1px solid borders are prohibited for sectioning or grouping. 
Boundaries must be defined solely through background shifts. For example, a `surface-container-highest` widget sits directly on a `surface` background. The change in value is enough to denote a boundary. If the UI feels "mushy," increase the whitespace (Spacing Scale 8 or 10) rather than adding a line.

### The "Glass & Gradient" Rule
While we avoid "heavy" gradients, we use "Signature Textures" to add soul. 
- **CTAs:** Use a linear gradient from `primary` to `primary-container` at a 135-degree angle. This prevents the button from looking like a flat sticker.
- **Floating Modals:** Apply a 20px backdrop-blur to `surface-variant` at 80% opacity to create a "frosted obsidian" effect.

---

## 3. Typography
We employ a dual-typeface strategy to balance editorial authority with functional readability.

*   **Display & Headlines (Manrope):** Chosen for its geometric precision. Use `display-md` and `headline-sm` to create "anchor points" on the page. These should be set with a tighter letter-spacing (-0.02em) to feel "locked in."
*   **Reading & Interface (Inter):** The workhorse. All `body` and `label` styles use Inter. Its high x-height ensures that even at `body-sm` (0.75rem), complex data remains legible during 4-hour study blocks.
*   **Hierarchy Note:** Use `on-surface-variant` for secondary metadata to create a stark visual delta between titles and descriptions, reducing cognitive load.

---

## 4. Elevation & Depth
In this design system, "elevation" is a lighting effect, not a structural one.

*   **The Layering Principle:** Depth is achieved by stacking surface tiers. Place a `surface-container-lowest` card on a `surface-container-low` section to create a "recessed" look, or a `surface-container-highest` card to create a "lifted" look.
*   **Ambient Shadows:** For floating elements (modals, dropdowns), use a shadow with a 40px blur at 6% opacity. The shadow color must be derived from `on-background`, creating a soft, natural glow rather than a harsh black smudge.
*   **The "Ghost Border" Fallback:** If a border is required for accessibility (e.g., in input fields), use `outline-variant` at 15% opacity. It should be barely perceptible—a "suggestion" of a boundary.

---

## 5. Components

### Navigation Sidebar
- **Style:** `surface-container-low`. No border on the right. 
- **Active State:** Use a `primary` vertical bar (2px wide) on the far left and a subtle `surface-variant` background tint on the item.

### Search Bar (The Command Palette)
- **Style:** `surface-bright` with a `xl` (0.75rem) roundedness. 
- **Kbd Shortcut:** Use `label-sm` text within a `secondary-container` chip to denote shortcuts (e.g., "⌘ K").

### Resource Cards
- **Construction:** Use `surface-container` background. Remove all borders. 
- **Interaction:** On hover, shift background to `surface-container-high`. Do not use "lift" animations; a simple color transition feels more professional.

### Data-Dense Widgets
- **Rule:** Forbid divider lines. Use `8` (1.75rem) spacing to separate data clusters.
- **Progress Tracking:** Use `primary` for active progress and `surface-variant` for the track. The track should be thin (4px) to remain minimalist.

### Inputs & Fields
- **Default:** `surface-container-highest` background with a `sm` (0.125rem) roundedness.
- **Focus:** Transition the "Ghost Border" from 15% to 50% opacity. Avoid heavy glows.

---

## 6. Do’s and Don’ts

### Do:
*   **Embrace Asymmetry:** Allow columns to have different widths (e.g., a 70/30 split) to create an editorial, non-templated flow.
*   **Use Monochromatic Icons:** Use icons from a single thin-stroke library. Tint icons with `on-surface-variant` for inactive states and `primary` for active.
*   **Master the White Space:** If a screen feels cluttered, your first instinct should be to increase the spacing scale (e.g., move from `4` to `6`), not to remove content.

### Don't:
*   **Don't use Pitch Black (#000):** It causes "smearing" on OLED screens and feels too aggressive. Stick to the `surface` (#0b0e11) palette.
*   **Don't use Centered Layouts:** For a productivity tool, left-aligned "F-pattern" layouts are more functional and feel more like a professional terminal.
*   **Don't use Heavy Shadows:** If a shadow is clearly visible, it's too dark. It should feel like a natural consequence of light, not a UI element.
*   **Don't use Dividers:** If you feel the need for a `<hr>` tag, you have failed to use background tonal shifts correctly. Use a `1.5` spacing gap or a color shift instead.