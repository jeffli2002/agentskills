# Agent Skills Marketplace - Design System

## Overview

This design system is based on UI/UX Pro Max recommendations for a **developer marketplace** targeting the SaaS/tech community. It follows marketplace best practices with a focus on trust, community, and discoverability.

## Design Principles

1. **Trust & Authority** - Professional appearance with clear social proof
2. **Search-First** - Prominent search functionality for skill discovery
3. **Community-Driven** - Highlight ratings, reviews, and creator profiles
4. **Developer-Focused** - Clean, technical aesthetic that appeals to developers

---

## Color Palette

Based on **SaaS General** color recommendations with trust blue + accent contrast.

### Primary Colors

| Color | Hex | Usage |
|-------|-----|-------|
| Primary Blue | `#2563EB` | Primary actions, links, brand elements |
| Secondary Blue | `#3B82F6` | Hover states, secondary actions |
| CTA Orange | `#F97316` | Call-to-action buttons, important highlights |

### Neutral Colors

| Color | Hex | Usage |
|-------|-----|-------|
| Background | `#F8FAFC` | Page background, light sections |
| Text Primary | `#1E293B` | Body text, headings (slate-900) |
| Text Muted | `#64748B` | Secondary text, captions (slate-600) |
| Border | `#E2E8F0` | Borders, dividers (slate-200) |

### Semantic Colors

| Color | Hex | Usage |
|-------|-----|-------|
| Success | `#10B981` | Success states, positive feedback |
| Warning | `#F59E0B` | Warnings, caution states |
| Error | `#EF4444` | Errors, destructive actions |

---

## Typography

**Font Pairing:** Tech Startup (Space Grotesk + DM Sans)

### Fonts

- **Headings:** Space Grotesk (400, 500, 600, 700)
- **Body:** DM Sans (400, 500, 700)

### Type Scale

| Element | Size | Weight | Line Height |
|---------|------|--------|-------------|
| H1 (Hero) | 48-60px | 700 | 1.1 |
| H2 (Section) | 30-36px | 600 | 1.2 |
| H3 (Card Title) | 20-24px | 600 | 1.3 |
| Body Large | 18-20px | 400 | 1.6 |
| Body | 16px | 400 | 1.6 |
| Small | 14px | 400 | 1.5 |
| Caption | 12px | 400 | 1.4 |

### Usage Guidelines

- **Minimum body text size:** 16px (never smaller on mobile)
- **Line length:** Max 65-75 characters per line for readability
- **Line height:** 1.5-1.75 for body text
- **Contrast ratio:** Minimum 4.5:1 for normal text, 3:1 for large text

---

## Layout & Spacing

### Container Widths

- **Max width:** 1280px (max-w-7xl)
- **Content width:** 1024px (max-w-6xl) for text-heavy sections
- **Narrow width:** 768px (max-w-3xl) for forms and focused content

### Spacing Scale

Based on Tailwind's 4px base unit:

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Tight spacing, icon gaps |
| sm | 8px | Component internal spacing |
| md | 16px | Default spacing between elements |
| lg | 24px | Section internal spacing |
| xl | 32px | Between major sections |
| 2xl | 48px | Large section spacing |
| 3xl | 64px | Hero/major section padding |

### Grid System

- **Mobile:** 1 column (< 768px)
- **Tablet:** 2-3 columns (768px - 1024px)
- **Desktop:** 4-6 columns (> 1024px)

---

## Components

### Buttons

#### Primary Button (CTA)
```jsx
<Button className="bg-orange-500 hover:bg-orange-600 text-white">
  Browse Skills
</Button>
```

#### Secondary Button
```jsx
<Button variant="outline" className="border-blue-500 text-blue-600 hover:bg-blue-50">
  Learn More
</Button>
```

#### Ghost Button
```jsx
<Button variant="ghost" className="hover:bg-slate-100">
  View All
</Button>
```

**Guidelines:**
- Minimum touch target: 44x44px
- Add `cursor-pointer` to all clickable elements
- Use 150-300ms transitions for hover states
- Disable buttons during async operations

### Cards

#### Skill Card
```jsx
<div className="p-6 rounded-xl border-2 border-slate-200 hover:border-blue-500 hover:shadow-lg transition-all duration-200 bg-white">
  {/* Card content */}
</div>
```

**Guidelines:**
- Use `border-2` for emphasis on interactive cards
- Add hover states with `hover:border-[color]` and `hover:shadow-lg`
- Smooth transitions: `transition-all duration-200`
- White background for cards on light backgrounds

### Search Bar

Prominent search functionality in hero section:
- Large input field (min 48px height)
- Clear placeholder text
- Search icon for visual clarity
- Responsive width (full width on mobile, max-w-2xl on desktop)

---

## Landing Page Structure

Based on **Marketplace/Directory** pattern:

### 1. Hero Section (Search-Focused)
- **Purpose:** Immediate skill discovery
- **Elements:**
  - Compelling headline with value proposition
  - Subheading explaining the platform
  - Prominent search bar
  - Primary CTA buttons
  - Trust badge/indicator
- **Background:** Gradient (blue-600 to blue-800) with subtle pattern

### 2. Trust Metrics Bar
- **Purpose:** Build credibility
- **Elements:**
  - 4 key metrics (skills, users, downloads, rating)
  - Icons + large numbers + labels
  - Light background (slate-50)

### 3. Categories Section
- **Purpose:** Browse by topic
- **Elements:**
  - 6-8 category cards with icons
  - Skill count per category
  - Hover effects for interactivity
  - Grid layout (2 cols mobile, 6 cols desktop)

### 4. Featured Skills
- **Purpose:** Showcase popular content
- **Elements:**
  - Section heading + "View all" link
  - 6 skill cards in grid
  - Ratings, stars, creator info

### 5. Features/Benefits
- **Purpose:** Explain platform value
- **Elements:**
  - 4 feature cards
  - Icon + heading + description
  - Center-aligned layout

### 6. Final CTA
- **Purpose:** Convert visitors
- **Elements:**
  - Compelling headline
  - Two CTA buttons (explore + contribute)
  - Gradient background matching hero

---

## Accessibility Guidelines

### Critical Requirements

1. **Color Contrast**
   - Text: Minimum 4.5:1 ratio
   - Large text (18px+): Minimum 3:1 ratio
   - Use `#1E293B` (slate-900) for body text on white
   - Avoid `#94A3B8` (slate-400) for body text

2. **Focus States**
   - Visible focus rings on all interactive elements
   - Use `focus:ring-2 focus:ring-blue-500`
   - Never use `outline-none` without replacement

3. **Touch Targets**
   - Minimum 44x44px for all clickable elements
   - Add padding to small buttons/links

4. **Keyboard Navigation**
   - Tab order matches visual order
   - All interactive elements keyboard accessible
   - Skip links for main content

5. **Alt Text**
   - Descriptive alt text for meaningful images
   - Empty alt (`alt=""`) for decorative images

6. **Form Labels**
   - Use `<label>` with `for` attribute
   - Visible labels (not just placeholders)
   - Error messages with `role="alert"`

7. **Reduced Motion**
   - Respect `prefers-reduced-motion` media query
   - Provide non-animated alternatives

---

## Interaction Patterns

### Hover States

- **Cards:** Border color change + shadow increase
- **Buttons:** Background color darkening
- **Links:** Underline or color change
- **Icons:** Scale transform (1.05-1.1)

**Example:**
```jsx
className="hover:border-blue-500 hover:shadow-lg transition-all duration-200"
```

### Loading States

- **Buttons:** Show spinner, disable interaction
- **Content:** Skeleton screens or loading indicators
- **Images:** Lazy loading with blur-up effect

### Animations

- **Duration:** 150-300ms for micro-interactions
- **Easing:** `ease-in-out` for most transitions
- **Properties:** Prefer `transform` and `opacity` over `width`/`height`

---

## Responsive Design

### Breakpoints

| Breakpoint | Width | Usage |
|------------|-------|-------|
| sm | 640px | Small tablets |
| md | 768px | Tablets |
| lg | 1024px | Small desktops |
| xl | 1280px | Large desktops |
| 2xl | 1536px | Extra large screens |

### Mobile-First Approach

1. Design for mobile (375px) first
2. Add complexity at larger breakpoints
3. Test at: 375px, 768px, 1024px, 1440px

### Common Patterns

```jsx
// Stack on mobile, row on desktop
className="flex flex-col md:flex-row gap-4"

// 1 col mobile, 2 col tablet, 4 col desktop
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"

// Responsive text sizes
className="text-2xl md:text-3xl lg:text-4xl"

// Responsive padding
className="px-4 md:px-6 lg:px-8"
```

---

## Icon Usage

### Guidelines

- **DO:** Use SVG icons from consistent libraries (Heroicons, Lucide)
- **DON'T:** Use emojis as UI icons (OK for decorative elements)
- **Size:** Consistent sizing (w-5 h-5 or w-6 h-6)
- **Color:** Match text color or use semantic colors

### Recommended Libraries

- **Heroicons** - Clean, modern icons
- **Lucide** - Extensive icon set
- **Simple Icons** - Brand logos

---

## Performance

### Image Optimization

- Use WebP format with fallbacks
- Implement lazy loading
- Use `srcset` for responsive images
- Reserve space to prevent layout shift

### Code Splitting

- Lazy load routes
- Dynamic imports for heavy components
- Minimize bundle size

### Loading Strategy

- Show skeleton screens for content
- Disable buttons during async operations
- Provide loading feedback within 100ms

---

## Dark Mode (Future)

When implementing dark mode:

1. **Background:** `#0F172A` (slate-900)
2. **Text:** `#F1F5F9` (slate-100)
3. **Borders:** `#334155` (slate-700)
4. **Cards:** `#1E293B` (slate-800)
5. **Maintain contrast ratios:** Test all text for readability

---

## Resources

### Design Tools

- **Figma:** For mockups and prototypes
- **Tailwind CSS:** Utility-first CSS framework
- **shadcn/ui:** Component library

### Testing Tools

- **WebAIM Contrast Checker:** Verify color contrast
- **axe DevTools:** Accessibility testing
- **Lighthouse:** Performance and accessibility audits

### References

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Google Fonts](https://fonts.google.com)

---

## Checklist: Pre-Delivery

Before deploying any UI changes:

### Visual Quality
- [ ] No emojis used as UI icons (use SVG instead)
- [ ] All icons from consistent icon set
- [ ] Hover states don't cause layout shift
- [ ] Consistent spacing throughout

### Interaction
- [ ] All clickable elements have `cursor-pointer`
- [ ] Hover states provide clear visual feedback
- [ ] Transitions are smooth (150-300ms)
- [ ] Focus states visible for keyboard navigation

### Accessibility
- [ ] Text contrast meets 4.5:1 minimum
- [ ] All images have alt text
- [ ] Form inputs have labels
- [ ] Keyboard navigation works
- [ ] `prefers-reduced-motion` respected

### Responsive
- [ ] Tested at 375px, 768px, 1024px, 1440px
- [ ] No horizontal scroll on mobile
- [ ] Touch targets minimum 44x44px
- [ ] Content readable at all sizes

### Performance
- [ ] Images optimized and lazy loaded
- [ ] No layout shift during load
- [ ] Loading states for async operations
- [ ] Bundle size optimized

---

## Version History

- **v1.0** (2026-01-22) - Initial design system based on UI/UX Pro Max recommendations
