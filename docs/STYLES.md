# FlashCards App Style Guide

## Design System

### Colors

#### Primary Colors
- Primary Blue: `#2563eb` - Main brand color, used for primary actions and highlights
- Primary Dark: `#1d4ed8` - Hover state for primary elements
- Accent Purple: `#7c3aed` - Secondary brand color, used for special elements

#### Neutral Colors
- White: `#ffffff` - Background, cards
- Light Gray: `#f3f4f6` - Secondary background, hover states
- Medium Gray: `#e5e7eb` - Borders, dividers
- Dark Gray: `#6b7280` - Secondary text
- Black: `#111827` - Primary text

#### Semantic Colors
- Success: `#10b981` - Positive actions, success states
- Warning: `#f59e0b` - Warnings, attention needed
- Error: `#ef4444` - Errors, destructive actions
- Info: `#3b82f6` - Information, neutral states

### Typography

#### Font Family
- Primary: `Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
- Monospace: `'JetBrains Mono', 'Fira Code', monospace` (for code blocks)

#### Font Sizes
- xs: `0.75rem` (12px) - Small labels, captions
- sm: `0.875rem` (14px) - Secondary text
- base: `1rem` (16px) - Body text
- lg: `1.125rem` (18px) - Subheadings
- xl: `1.25rem` (20px) - Headings
- 2xl: `1.5rem` (24px) - Large headings
- 3xl: `1.875rem` (30px) - Page titles

#### Font Weights
- Regular: `400` - Body text
- Medium: `500` - Emphasis
- Semibold: `600` - Headings
- Bold: `700` - Strong emphasis

### Spacing

#### Base Unit
- Base spacing unit: `0.25rem` (4px)

#### Spacing Scale
- xs: `0.25rem` (4px)
- sm: `0.5rem` (8px)
- md: `1rem` (16px)
- lg: `1.5rem` (24px)
- xl: `2rem` (32px)
- 2xl: `3rem` (48px)

### Border Radius
- sm: `0.125rem` (2px) - Small elements
- md: `0.375rem` (6px) - Default
- lg: `0.5rem` (8px) - Cards, modals
- xl: `1rem` (16px) - Large elements
- full: `9999px` - Pills, buttons

### Shadows
- sm: `0 1px 2px 0 rgb(0 0 0 / 0.05)`
- md: `0 4px 6px -1px rgb(0 0 0 / 0.1)`
- lg: `0 10px 15px -3px rgb(0 0 0 / 0.1)`

### Transitions
- Default: `0.2s ease-in-out`
- Fast: `0.15s ease-in-out`
- Slow: `0.3s ease-in-out`

## Component Styles

### Buttons

#### Primary Button
```css
.btn.primary {
    background-color: var(--btn-primary-bg); /* Themed */
    color: var(--btn-text); /* Themed */
    padding: 0.5rem 1rem; /* Or use spacing vars like var(--spacing-sm) var(--spacing-md) */
    border-radius: var(--radius-md);
    font-weight: 500;
    transition: background-color var(--transition-default);
}

.btn.primary:hover {
    background-color: var(--btn-primary-hover); /* Themed */
}
```

#### Secondary Button
```css
.btn:not(.primary) { /* Matches themes.css for secondary styling */
    background-color: var(--btn-secondary-bg); /* Themed */
    color: var(--btn-secondary-text); /* Themed */
    padding: 0.5rem 1rem; /* Or use spacing vars */
    border-radius: var(--radius-md);
    font-weight: 500;
    transition: background-color var(--transition-default);
}

.btn:not(.primary):hover {
    background-color: var(--btn-secondary-hover); /* Themed */
}
```

### Cards

#### Deck Card
```css
.deck-card {
    background: white;
    border-radius: var(--radius-lg);
    padding: var(--spacing-lg);
    box-shadow: var(--shadow-md);
    transition: transform var(--transition-default);
}

.deck-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
}
```

#### Study Card
```css
.study-card {
    background: white;
    border-radius: var(--radius-lg);
    padding: var(--spacing-xl);
    box-shadow: var(--shadow-lg);
    min-height: 300px;
    display: flex;
    align-items: center;
    justify-content: center;
}
```

### Forms

#### Input Fields
```css
.form-input {
    width: 100%;
    padding: 0.5rem 0.75rem;
    border: 1px solid var(--color-medium-gray);
    border-radius: var(--radius-md);
    font-size: var(--text-base);
    transition: border-color var(--transition-default);
}

.form-input:focus {
    border-color: var(--color-primary);
    outline: none;
    box-shadow: 0 0 0 2px var(--color-primary-light);
}
```

### Modals

#### Modal Container
```css
.modal {
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
}

.modal-content {
    background: white;
    border-radius: var(--radius-lg);
    padding: var(--spacing-xl);
    box-shadow: var(--shadow-lg);
    max-width: 500px;
    width: 90%;
}
```

## Layout

### Grid System
- Deck Grid: `grid-template-columns: repeat(auto-fill, minmax(280px, 1fr))`
- Card Grid: `grid-template-columns: repeat(auto-fill, minmax(200px, 1fr))`

### Container Widths
- Default: `max-width: 1200px`
- Narrow: `max-width: 800px`
- Wide: `max-width: 1400px`

## Responsive Breakpoints
- sm: `640px` - Mobile landscape
- md: `768px` - Tablet
- lg: `1024px` - Desktop
- xl: `1280px` - Large desktop
- 2xl: `1536px` - Extra large desktop

## Dark Mode

### Dark Theme Colors (aligns with themes.css)
- Background Primary: `#1a1b1e` (var(--bg-primary))
- Background Secondary: `#2c2e33` (var(--bg-secondary))
- Card Background: `#2c2e33` (var(--card-bg))
- Text Primary: `#e9ecef` (var(--text-primary))
- Text Secondary: `#adb5bd` (var(--text-secondary))
- Border Primary: `#373a40` (var(--border-primary))

## Accessibility

### Focus States
Input fields, textareas, and select elements currently use a `box-shadow` on `:focus` for visibility:
```css
/* Example for input fields from styles.css */
input:focus {
    border-color: var(--color-primary);
    outline: none;
    box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1); /* This shadow is themed via --input-focus-shadow */
}
```
Consideration for future enhancement could be to adopt `:focus-visible` more broadly for keyboard-only focus indication if desired, which might look like:
```css
:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
}
```

### Color Contrast
- Text: Minimum 4.5:1 contrast ratio
- Large Text: Minimum 3:1 contrast ratio
- UI Components: Minimum 3:1 contrast ratio

## Animation Guidelines

### Card Flip
```css
.card-flip {
    transform-style: preserve-3d;
    transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}
```

### Page Transitions
```css
.page-transition {
    transition: opacity 0.3s ease-in-out;
}
```

## Usage Examples

### Creating a New Component
1. Follow the spacing scale
2. Use the color system
3. Implement responsive design
4. Include dark mode support
5. Ensure accessibility

### Modifying Existing Components
1. Maintain consistent spacing
2. Use the defined color palette
3. Follow the typography scale
4. Preserve existing animations
5. Test in both light and dark modes 