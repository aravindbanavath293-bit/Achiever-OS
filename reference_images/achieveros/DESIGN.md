---
name: AchieverOS
colors:
  surface: '#fbf8fb'
  surface-dim: '#dbd9dc'
  surface-bright: '#fbf8fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3f5'
  surface-container: '#efedf0'
  surface-container-high: '#eae7ea'
  surface-container-highest: '#e4e2e4'
  on-surface: '#1b1b1d'
  on-surface-variant: '#44474d'
  inverse-surface: '#303032'
  inverse-on-surface: '#f2f0f2'
  outline: '#75777e'
  outline-variant: '#c5c6ce'
  surface-tint: '#515f7a'
  primary: '#27354f'
  on-primary: '#ffffff'
  primary-container: '#3e4c67'
  on-primary-container: '#aebddd'
  inverse-primary: '#b8c7e7'
  secondary: '#5c5f60'
  on-secondary: '#ffffff'
  secondary-container: '#e1e3e4'
  on-secondary-container: '#626566'
  tertiary: '#30363c'
  on-tertiary: '#ffffff'
  tertiary-container: '#464d53'
  on-tertiary-container: '#b7bdc5'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d7e3ff'
  primary-fixed-dim: '#b8c7e7'
  on-primary-fixed: '#0c1b34'
  on-primary-fixed-variant: '#394762'
  secondary-fixed: '#e1e3e4'
  secondary-fixed-dim: '#c5c7c8'
  on-secondary-fixed: '#191c1d'
  on-secondary-fixed-variant: '#454748'
  tertiary-fixed: '#dde3eb'
  tertiary-fixed-dim: '#c1c7cf'
  on-tertiary-fixed: '#161c22'
  on-tertiary-fixed-variant: '#41474e'
  background: '#fbf8fb'
  on-background: '#1b1b1d'
  surface-variant: '#e4e2e4'
typography:
  display:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  title-task:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  metadata:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  container-max: 1200px
  gutter: 20px
---

## Brand & Style

The design system is built on the principles of **Functional Serenity**. It targets high-performance individuals who require a tool that fades into the background, allowing their work to take center stage. The aesthetic is a hybrid of **Modern Minimalism** and **Systematic Utility**, drawing inspiration from the clarity of structured productivity tools.

The emotional response should be one of "controlled focus." By using generous whitespace, a restricted primary palette, and precise alignment, the UI minimizes cognitive load. It avoids decorative flourishes in favor of meaningful intent, where every border and shadow serves to define hierarchy rather than mere decoration.

## Colors

This design system utilizes a "Foundation + Signal" color strategy. 

- **Primary (Slate Indigo):** Used for navigation states, primary actions, and branding. It provides a grounded, professional anchor.
- **Neutral/Surface:** The background is a deliberate off-white (`#FDFDFD`) to reduce screen glare, while surfaces (cards, modals) are pure white (`#FFFFFF`) to create a subtle lift.
- **Priority Accents:** Red, Yellow, and Green are reserved strictly for task priority and status indicators. These should be used sparingly to prevent visual "noise."
- **Borders:** A consistent light gray (`#E2E8F0`) is used for low-contrast containment, ensuring the UI feels organized but not "boxed in."

## Typography

The typography system relies exclusively on **Inter** to maintain a systematic and utilitarian feel. 

- **Hierarchy:** Contrast is achieved through weight and color rather than drastic size shifts. Task titles use a medium weight to stand out against body text.
- **Metadata:** Smaller, low-contrast text is used for timestamps, tags, and secondary info to keep the interface clean.
- **Labels:** Uppercase labels with slight letter spacing are reserved for section headers or category grouping to provide a rhythmic break in long lists.

## Layout & Spacing

The design system follows a **4px baseline grid** to ensure mathematical harmony. 

- **Layout Model:** A 12-column fluid grid is used for dashboard views, while single-column centered layouts (768px max-width) are preferred for focused task management or document editing.
- **Margins:** Desktop views should maintain a minimum side margin of 32px. Mobile views reduce this to 16px.
- **Density:** The system prioritizes "Comfortable" density. Lists and task rows should have a minimum height of 48px to remain touch-friendly and visually breathable.

## Elevation & Depth

This design system uses **Tonal Layering** supplemented by **Soft Ambient Shadows**. Depth is used to communicate interactivity and importance:

- **Level 0 (Base):** The main application background. No shadow.
- **Level 1 (Cards/Sidebar):** A subtle 1px border (`#E2E8F0`) with no shadow, or a very faint 2px blur shadow to distinguish floating elements from the background.
- **Level 2 (Modals/Popovers):** Used for focused interactions. These utilize a more pronounced shadow (12px blur, 10% opacity) to create a clear physical separation from the workspace.
- **Interactive States:** On hover, buttons or task rows should transition with a subtle background color shift (e.g., from transparent to `#F1F5F9`) rather than an increase in shadow.

## Shapes

The shape language is **Soft and Systematic**. 

A base radius of **4px (0.25rem)** is applied to inputs and task rows to maintain a professional, organized appearance. **8px (0.5rem)** is used for cards and containers to provide a touch of modern approachability without feeling overly "bubbly."

Buttons and priority tags utilize a **Pill (Full) Roundedness** to distinguish them from structural layout elements like rows or cards.

## Components

- **Buttons:** Primary buttons use the Slate Indigo background with white text. Secondary buttons use a ghost style (border only) to maintain low visual weight.
- **Task Rows:** These are the core component. They feature a checkbox on the far left, a medium-weight title, and metadata labels on the right. Hovering over a row should reveal hidden "quick actions" like delete or drag-and-drop handles.
- **Progress Indicators:** Circular ring charts for daily goals and linear bars for project completion. Use a thin 2px stroke for rings to maintain the minimalist aesthetic.
- **Badges/Tags:** Category tags use a "Tinted" style—a very pale version of the category color as the background with a darker version of the same color for text.
- **Checkboxes:** When checked, the checkbox should fill with the Primary color and trigger a subtle strikethrough and 50% opacity change on the associated task title.
- **Consistency Streaks:** Represented by a small fire or star icon next to user profiles, utilizing a subtle glow effect to reward daily engagement.