# CSS Architecture Documentation

## Overview

The Clicker Engine project uses a **modular CSS architecture** that is designed to be easily extensible, maintainable, and customizable. All styles are organized into separate, focused files that work together to create a cohesive design system.

## File Structure

```
src/styles/
├── main.css          # Main entry point (imports all other files)
├── variables.css     # CSS custom properties and design tokens
├── reset.css         # Browser reset and normalization
├── layout.css        # Page layout and grid systems
├── components.css    # Reusable UI components
├── game.css          # Game-specific components
└── utilities.css     # Helper/utility classes
```

## Importing Styles

All styles are imported in the main application entry point (`src/app.ts`):

```typescript
import './styles/main.css';
```

Webpack handles bundling all CSS files and injecting them into the page.

## CSS Variables

The design system is built on CSS custom properties (variables) defined in `variables.css`. This makes the entire theme easily customizable by changing values in one place.

### Key Variable Categories

1. **Colors**: Primary, secondary, accent, neutral, background, text, and border colors
2. **Spacing**: Consistent spacing scale from xs (4px) to 3xl (64px)
3. **Border Radius**: Predefined radius values for different UI elements
4. **Shadows**: Box shadow definitions for depth and elevation
5. **Typography**: Font families, sizes, weights, and line heights
6. **Transitions**: Consistent animation durations
7. **Z-Index**: Layering scale for overlays and modals
8. **Layout**: Container max-widths, sidebar widths, header heights

### Example Usage

```css
.my-component {
  padding: var(--spacing-md);
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  color: var(--text-primary);
  box-shadow: var(--shadow-md);
}
```

## Customizing the Theme

### Changing Colors

Edit `variables.css` to change the color scheme:

```css
:root {
  --primary-color: #your-color;
  --secondary-color: #your-color;
  /* ... */
}
```

### Dark Mode Support

The theme includes optional dark mode support via media queries:

```css
@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: var(--gray-900);
    --text-primary: var(--gray-100);
    /* ... */
  }
}
```

## Component Classes

### Layout Components

- `.game-container`: Main game wrapper
- `.game-header`: Header with title and stats
- `.game-sidebar`: Navigation sidebar
- `.game-content`: Main content area
- `.game-footer`: Footer bar
- `.grid`, `.grid--2-cols`, `.grid--auto-fit`: Grid layouts
- `.flex`, `.flex--column`, `.flex--center`: Flexbox utilities

### UI Components

- `.card`: Generic card component
- `.btn`, `.btn--primary`, `.btn--secondary`: Button variants
- `.badge`: Small label/indicator
- `.stat`: Statistic display
- `.progress`: Progress bar
- `.tabs`, `.tab`: Tab navigation
- `.section-heading`: Section title

### Game-Specific Components

- `.click-button`: Main clicker button
- `.currency-display`: Currency amount with icon
- `.upgrade-card`: Upgrade purchase card
- `.production-info`: Production rate indicator
- `.paradigm-card`: Paradigm shift card
- `.floating-number`: Animated floating numbers

### Utility Classes

See `utilities.css` for a complete list of helper classes:

- Spacing: `.m-auto`, `.p-0`, etc.
- Text: `.text-center`, `.text-lg`, `.font-bold`, etc.
- Display: `.hidden`, `.flex`, `.grid`, etc.
- Sizing: `.w-full`, `.h-auto`, etc.
- Flexbox: `.flex-1`, `.items-center`, `.justify-between`, etc.
- Borders: `.rounded-lg`, `.border`, etc.
- Effects: `.shadow-md`, `.opacity-50`, etc.

## Best Practices

### 1. Use CSS Variables

Always prefer CSS variables over hardcoded values:

```css
/* Good */
.my-element {
  color: var(--text-primary);
  padding: var(--spacing-md);
}

/* Avoid */
.my-element {
  color: #333;
  padding: 16px;
}
```

### 2. Follow the Naming Convention

- Layout: `.game-*` prefix
- Components: Descriptive names (`.card`, `.btn`)
- Modifiers: Double dash (`.btn--primary`, `.card--highlighted`)
- States: Double dash (`.upgrade-card--affordable`)
- Elements: Double underscore (`.card__header`, `.card__title`)

### 3. Use Existing Components

Before creating new styles, check if existing components can be reused:

```html
<!-- Reuse existing card component -->
<div class="card">
  <div class="card__header">
    <h3 class="card__title">Title</h3>
  </div>
  <div class="card__body">Content</div>
</div>
```

### 4. Layer-Based Organization

CSS files are ordered by specificity:
1. Variables (most general)
2. Reset
3. Layout
4. Components
5. Game-specific
6. Utilities (most specific)

### 5. Responsive Design

The system includes responsive breakpoints:

```css
@media (max-width: 1024px) { /* Tablet */ }
@media (max-width: 640px)  { /* Mobile */ }
```

## Extending the System

### Adding New Components

1. Add component styles to `components.css` or `game.css`
2. Use existing variables for consistency
3. Include hover/active states where appropriate
4. Add responsive behavior if needed

Example:

```css
.my-new-component {
  padding: var(--spacing-lg);
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  transition: all var(--transition-base);
}

.my-new-component:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}
```

### Adding New Variables

Add new variables to the `:root` selector in `variables.css`:

```css
:root {
  /* Existing variables... */
  
  /* Your new variables */
  --my-custom-color: #yourcolor;
  --my-custom-size: 1.5rem;
}
```

### Adding New Utilities

Add utility classes to `utilities.css`:

```css
.my-utility {
  /* styles */
}
```

## Performance Considerations

1. **CSS is bundled**: Webpack combines all CSS files into a single optimized bundle
2. **Minification**: Production builds minify CSS automatically
3. **No unused CSS**: Consider tools like PurgeCSS for production to remove unused styles
4. **Critical CSS**: Inline critical styles in HTML for faster initial render (optional)

## Browser Support

The CSS uses modern features supported by:
- Chrome/Edge 88+
- Firefox 85+
- Safari 14+

For broader support, consider using PostCSS with autoprefixer.

## Migration Guide

If upgrading from an older version:

1. Replace inline styles with CSS classes
2. Use CSS variables instead of hardcoded colors
3. Update component markup to match new structure
4. Test responsive behavior on different screen sizes

## Resources

- [CSS Custom Properties (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- [BEM Methodology](http://getbem.com/)
- [CSS Grid Guide](https://css-tricks.com/snippets/css/complete-guide-grid/)
- [Flexbox Guide](https://css-tricks.com/snippets/css/a-guide-to-flexbox/)
