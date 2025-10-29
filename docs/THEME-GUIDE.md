# Deep Tech Cipher Theme Guide

## Overview
This document describes the **Deep Tech Cipher** design system implemented across the PIRATES cybersecurity dashboard application.

## Color Palette

### Primary Colors
```css
/* Background */
bg-slate-950         /* Primary background - Deep space black */
bg-slate-900         /* Surface/Card background - Dark slate */

/* Text */
text-slate-200       /* Default text - Light gray */
text-slate-400       /* Secondary text - Muted gray */
text-slate-100       /* Emphasis text - Bright white-gray */

/* Accent - Cyan (Cyber theme) */
text-cyan-400        /* Accent text - Bright cyan */
bg-cyan-600          /* Accent background - Deep cyan */
hover:bg-cyan-500    /* Accent hover - Bright cyan */

/* Status Colors */
text-rose-500        /* Danger/Critical - Red */
text-emerald-400     /* Success - Green */
text-yellow-400      /* Warning - Yellow */
```

### Helper Classes
```css
.cyber-card              /* bg-slate-900 with slate-800 border */
.cyber-text-accent       /* text-cyan-400 */
.cyber-bg-accent         /* bg-cyan-600 hover:bg-cyan-500 */
.cyber-text-danger       /* text-rose-500 */
.cyber-text-success      /* text-emerald-400 */
```

## Universal Animations

### 1. Scroll-Triggered Fade-In (`useScrollFade` hook)

**Purpose:** Animate elements as they scroll into view.

**Implementation:**
```typescript
import { useScrollFade } from '@/hooks/use-scroll-fade';

function MyComponent() {
  const { ref, isVisible } = useScrollFade();

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
    >
      Content
    </div>
  );
}
```

**Options:**
```typescript
const { ref, isVisible } = useScrollFade({
  threshold: 0.1,              // % of element visible before triggering
  rootMargin: '0px 0px -50px 0px',  // Margin around viewport
  triggerOnce: true,           // Only trigger animation once
});
```

**Helper Classes:**
```css
.scroll-fade-enter     /* Base transition styles */
.scroll-fade-visible   /* opacity-100 translate-y-0 */
.scroll-fade-hidden    /* opacity-0 translate-y-10 */
```

### 2. 3D Push Hover Effect (`.push-hover` class)

**Purpose:** Buttons and interactive elements subtly push down on hover.

**Implementation:**
```jsx
<button className="push-hover bg-cyan-600 hover:bg-cyan-500 px-4 py-2">
  Click Me
</button>
```

**Behavior:**
- **Hover:** Translates down 2px with subtle shadow
- **Active:** Translates down 3px with darker shadow
- **Duration:** 150ms ease-in-out

**CSS:**
```css
.push-hover {
  @apply transition-all duration-150 ease-in-out;
}

.push-hover:hover {
  transform: translateY(2px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.push-hover:active {
  transform: translateY(3px);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
}
```

### 3. Pulse/Ripple Effect (`.pulse-ripple` class)

**Purpose:** Single ripple animation on button click.

**Implementation:**
```jsx
<button className="pulse-ripple bg-cyan-600 px-4 py-2">
  Submit
</button>
```

**Behavior:**
- Triggers on `:active` (click/tap)
- Creates a cyan ripple that scales from center
- Single animation, no repeat
- Duration: 600ms

**CSS:**
```css
@keyframes pulse-ripple {
  0% {
    transform: scale(0);
    opacity: 0.8;
  }
  50% {
    opacity: 0.4;
  }
  100% {
    transform: scale(2.5);
    opacity: 0;
  }
}

.pulse-ripple {
  @apply relative overflow-hidden;
}

.pulse-ripple::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(6, 182, 212, 0.5);  /* cyan-500 with opacity */
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.pulse-ripple:active::after {
  width: 100%;
  height: 100%;
  animation: pulse-ripple 0.6s ease-out;
}
```

## Component Patterns

### Card Components
```jsx
<Card className="cyber-card border-2">
  <CardHeader>
    <CardTitle className="text-cyan-400">Card Title</CardTitle>
  </CardHeader>
  <CardContent>
    <p className="text-slate-300">Content here</p>
  </CardContent>
</Card>
```

### Primary Buttons
```jsx
<Button className="push-hover pulse-ripple bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-semibold">
  Primary Action
</Button>
```

### Danger Buttons
```jsx
<Button className="push-hover bg-rose-600 hover:bg-rose-500 text-white">
  Delete
</Button>
```

### Success Indicators
```jsx
<div className="flex items-center space-x-2">
  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
  <span className="cyber-text-success">Success message</span>
</div>
```

### Warning/Alert Indicators
```jsx
<div className="flex items-center space-x-2">
  <AlertCircle className="w-5 h-5 text-yellow-400" />
  <span className="text-yellow-400">Warning message</span>
</div>
```

## Page Structure Example

```jsx
"use client"

import { useScrollFade } from "@/hooks/use-scroll-fade"

export default function MyPage() {
  const section1Ref = useScrollFade()
  const section2Ref = useScrollFade()

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-100">Page Title</h1>
        <p className="text-slate-400">Page description</p>
      </header>

      {/* Section 1 */}
      <section
        ref={section1Ref.ref}
        className={`transition-all duration-700 ease-out ${
          section1Ref.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <Card className="cyber-card border-2">
          {/* Content */}
        </Card>
      </section>

      {/* Section 2 */}
      <section
        ref={section2Ref.ref}
        className={`transition-all duration-700 ease-out ${
          section2Ref.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <Card className="cyber-card">
          {/* Content */}
        </Card>
      </section>
    </div>
  )
}
```

## Best Practices

### When to Use Each Animation

**`useScrollFade`:**
- Major page sections
- Cards with significant content
- Results/output areas
- Forms and input groups

**`.push-hover`:**
- All buttons
- Clickable icons
- Interactive card elements
- Navigation items

**`.pulse-ripple`:**
- Primary action buttons
- Submit/confirm buttons
- Critical interactions
- "Call to action" elements

### Combining Animations

You can safely combine `.push-hover` and `.pulse-ripple`:

```jsx
<Button className="push-hover pulse-ripple bg-cyan-600 hover:bg-cyan-500">
  Submit Analysis
</Button>
```

### Accessibility Considerations

1. **Reduced Motion:** Consider using `prefers-reduced-motion` for users who prefer minimal animations
2. **Contrast:** All color combinations meet WCAG AA standards
3. **Focus States:** Ensure focus rings are visible on all interactive elements

## Docker Compatibility

All animations and styles are:
- ✅ Pure CSS/React (no external animation libraries)
- ✅ No server-side dependencies
- ✅ Works in Docker containers
- ✅ Compatible with Next.js App Router
- ✅ Client-side only (marked with "use client")

## File Locations

```
PIRATES/
├── app/
│   └── globals.css              # Animation CSS definitions
├── hooks/
│   └── use-scroll-fade.ts       # Scroll animation hook
└── docs/
    └── THEME-GUIDE.md           # This file
```

## Migration Checklist

To apply Deep Tech Cipher theme to a new page:

- [ ] Add `"use client"` directive if using `useScrollFade`
- [ ] Import `useScrollFade` hook for major sections
- [ ] Replace background colors with `bg-slate-950` / `bg-slate-900`
- [ ] Replace text colors with `text-slate-200` / `text-slate-400`
- [ ] Add `.cyber-card` to all Card components
- [ ] Add `text-cyan-400` to headings and accent text
- [ ] Add `.push-hover` to interactive elements
- [ ] Add `.pulse-ripple` to primary action buttons
- [ ] Test animations with scroll behavior
- [ ] Verify color contrast for accessibility

## Examples in Codebase

See **`app/policy-assistant/page.tsx`** for a complete implementation example featuring:
- Scroll-triggered section animations
- PDF drag-and-drop with Deep Tech Cipher colors
- Push hover on interactive elements
- Pulse ripple on primary action button
- Proper use of status colors (success/warning/danger)
