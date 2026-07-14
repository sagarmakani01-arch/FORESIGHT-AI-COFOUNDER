---
name: Premium Executive Edition
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#393939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#20201f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353535'
  on-surface: '#e5e2e1'
  on-surface-variant: '#c4c7c7'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#8e9192'
  outline-variant: '#444748'
  surface-tint: '#c9c6c5'
  primary: '#c9c6c5'
  on-primary: '#313030'
  primary-container: '#050505'
  on-primary-container: '#797777'
  inverse-primary: '#5f5e5e'
  secondary: '#4edea3'
  on-secondary: '#003824'
  secondary-container: '#00a572'
  on-secondary-container: '#00311f'
  tertiary: '#c8c6c5'
  on-tertiary: '#313030'
  tertiary-container: '#050505'
  on-tertiary-container: '#787776'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e5e2e1'
  primary-fixed-dim: '#c9c6c5'
  on-primary-fixed: '#1c1b1b'
  on-primary-fixed-variant: '#474646'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#e5e2e1'
  tertiary-fixed-dim: '#c8c6c5'
  on-tertiary-fixed: '#1c1b1b'
  on-tertiary-fixed-variant: '#474746'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353535'
typography:
  display-lg:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: 0.02em
  body-lg:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: '0'
  body-md:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: '0'
  label-caps:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.1em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 20px
  margin-desktop: 64px
  stack-lg: 48px
  stack-md: 24px
  stack-sm: 12px
---

## Brand & Style
The design system is built on the principle of **Luxury through Restraint**. It targets an executive audience that values precision, clarity, and quiet confidence over visual noise. The aesthetic is a sophisticated blend of **Minimalism** and **Modern Corporate**, utilizing a matte-black foundation to evoke the feel of high-end physical hardware or bespoke editorial publishing.

The emotional response is one of authority and calm. By prioritizing exceptional whitespace and meticulous alignment, the UI recedes to let the data and AI insights command the user's focus. There are no decorative flourishes; every element exists to serve a functional purpose within a refined, high-status environment.

## Colors
The palette is strictly curated to maintain an atmosphere of "Dark Mode" luxury. 

- **Primary:** Deep Matte Black (#050505) serves as the universal background, providing a non-reflective, ink-like surface.
- **Accent:** Deep Emerald (#10B981) is used sparingly for primary actions, success states, and critical data points. It is the only chromatic hue allowed in the core interface.
- **Typography:** Off-white (#E5E2E1) is used for maximum readability without the harshness of pure white, reducing eye strain during long sessions.
- **Borders/Dividers:** A subtle grey-white (#FFFFFF at 8-12% opacity) creates 0.5px hairlines to define structure without breaking the visual flow.

## Typography
This design system utilizes **Geist** to achieve a technical yet editorial feel. 

- **Headlines:** Large headers feature generous tracking and high weight contrast. Use `display-lg` for major section entries to create an "editorial" impact.
- **Labels:** Use `label-caps` for navigation and small headers to inject an air of architectural precision.
- **Hierarchy:** Maintain high contrast between weights (e.g., Bold 700 for headers vs. Regular 400 for body) to guide the eye through dense information.
- **Alignment:** Stick to a rigid left-aligned grid for all text blocks to reinforce the sense of order.

## Layout & Spacing
The layout follows a **Fixed Grid** philosophy on desktop to preserve the integrity of whitespace, transitioning to a fluid model for mobile.

- **Grid:** A 12-column grid with wide 24px gutters.
- **Whitespace:** Use "generous breathing room." Ensure vertical margins between major sections (stack-lg) are significantly larger than standard web patterns to signal luxury.
- **Alignment:** Meticulously align all elements to the 8px baseline grid. Components should feel "locked" into the layout.
- **Mobile:** Reflow content into a single column, reducing side margins to 20px but maintaining the high-contrast typographic scale.

## Elevation & Depth
Depth is achieved through **Tonal Layering** and natural shadows rather than vibrant glows.

- **Layers:** Use a slightly lighter neutral (#1A1A1A) for elevated containers (cards, modals) against the base (#050505).
- **Outlines:** Every elevated element must have a 0.5px border of #E5E2E1 at 10% opacity. This creates a "razor-sharp" edge definition.
- **Shadows:** Use soft, multi-layered shadows with 0% spread and low opacity. Shadows should feel like ambient occlusion in a dimly lit room, not a digital effect.
- **Interactive States:** Lift elements slightly on hover (2px Y-offset) with a subtle increase in border opacity to 20%.

## Shapes
The shape language balances the rigid grid with approachable, softened corners.

- **Corner Radius:** All primary containers, buttons, and input fields use a consistent **24px (rounded-xl)** radius. 
- **Consistency:** Small components like checkboxes or tags should scale down to a **8px (soft)** radius to maintain visual harmony.
- **Borders:** Fixed at 0.5px. This ultra-thin weight is critical to the "Executive" look; do not use standard 1px or 2px borders unless for high-contrast focus states.

## Components
- **Buttons:** Primary buttons are solid Deep Emerald (#10B981) with Black text. Secondary buttons are transparent with a 0.5px Off-white border. 24px corner radius is mandatory.
- **Input Fields:** Background should be a subtle tint (#121212) with a 0.5px border. Labels must use `label-caps` positioned above the field.
- **Cards:** No heavy shadows. Use tonal separation (#1A1A1A) and the 0.5px border. Padding should be generous (min 32px).
- **Chips/Tags:** Small, pill-shaped, using the `label-caps` type style. Use a 0.5px border with no background fill for a "ghost" effect.
- **Lists:** Separated by 0.5px horizontal hairlines. Increase row height to at least 64px to ensure the interface feels "un-crowded."
- **Data Visualization:** Use Deep Emerald for the primary data series. Supporting series should use varying opacities of Off-white.