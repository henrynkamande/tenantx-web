# TenantX Design System

A comprehensive design system built with TailwindCSS focusing on usability, accessibility, and modern design principles.

## Color Palette

### Primary Colors
- **Blue**: `blue-50` to `blue-900` - Primary brand color for CTAs, links, and primary actions
- **Slate**: `slate-50` to `slate-900` - Neutral colors for text, borders, and backgrounds

### Semantic Colors
- **Success**: `emerald-50` to `emerald-900` - Success states, positive feedback
- **Warning**: `amber-50` to `amber-900` - Warning states, attention needed
- **Danger**: `red-50` to `red-900` - Error states, destructive actions  
- **Info**: `sky-50` to `sky-900` - Informational states, neutral feedback

### Background Colors
- **Primary Background**: `slate-50` - Main page background
- **Card Background**: `white` - Card and content backgrounds
- **Accent Background**: `slate-100` - Table headers, subtle backgrounds

## Typography

### Font Stack
- **Primary**: Inter, system-ui, sans-serif
- **Monospace**: ui-monospace, Menlo, Monaco, "Cascadia Code", "Source Code Pro", monospace

### Typography Scale
- **Display**: `text-4xl` (36px) - Page titles, hero text
- **Heading 1**: `text-3xl` (30px) - Main section headers
- **Heading 2**: `text-2xl` (24px) - Sub-section headers
- **Heading 3**: `text-xl` (20px) - Card titles, component headers
- **Heading 4**: `text-lg` (18px) - Small section headers
- **Body Large**: `text-base` (16px) - Important body text
- **Body**: `text-sm` (14px) - Standard body text
- **Caption**: `text-xs` (12px) - Helper text, labels

### Font Weights
- **Light**: `font-light` (300)
- **Regular**: `font-normal` (400) - Default body text
- **Medium**: `font-medium` (500) - Emphasized text, labels
- **Semibold**: `font-semibold` (600) - Section headers, important text
- **Bold**: `font-bold` (700) - Page titles, strong emphasis

## Spacing System

### Base Unit: 4px (0.25rem)
- **xs**: `2px` (0.5)
- **sm**: `4px` (1)
- **md**: `8px` (2)
- **lg**: `12px` (3)
- **xl**: `16px` (4)
- **2xl**: `20px` (5)
- **3xl**: `24px` (6)
- **4xl**: `32px` (8)
- **5xl**: `48px` (12)
- **6xl**: `64px` (16)

## Border Radius

- **None**: `rounded-none` (0px)
- **Small**: `rounded-sm` (2px) - Badges, small elements
- **Medium**: `rounded-md` (6px) - Buttons, inputs
- **Large**: `rounded-lg` (8px) - Cards, containers
- **Extra Large**: `rounded-xl` (12px) - Large cards, modals
- **Full**: `rounded-full` - Circular elements, avatars

## Component Specifications

### Buttons

#### Variants
- **Primary**: Blue background, white text - Main actions
- **Secondary**: Light gray background, dark text - Secondary actions  
- **Success**: Green background, white text - Positive actions
- **Warning**: Amber background, white text - Caution required
- **Danger**: Red background, white text - Destructive actions
- **Ghost**: Transparent background, colored text - Subtle actions
- **Outline**: Border only, colored text - Alternative secondary

#### Sizes
- **xs**: `px-3 py-1.5 text-xs` - Compact spaces, tables
- **sm**: `px-3 py-2 text-sm` - Tight layouts
- **md**: `px-4 py-2.5 text-sm` - Standard size (default)
- **lg**: `px-6 py-3 text-base` - Prominent actions
- **xl**: `px-8 py-4 text-lg` - Hero sections, important CTAs

### Cards

#### Structure
- **Background**: `bg-white`
- **Border**: `border border-slate-200`
- **Radius**: `rounded-xl`
- **Shadow**: `shadow-sm` (default), `shadow-md` (hover/focus)
- **Padding**: `p-6` (default), configurable

#### Hover States
- **Shadow**: Transitions to `shadow-md`
- **Border**: Transitions to `border-slate-300`
- **Duration**: `transition-all duration-200`

### Forms

#### Input Fields
- **Base**: `rounded-lg border border-slate-300`
- **Focus**: `focus:border-blue-500 focus:ring-1 focus:ring-blue-500`
- **Error**: `border-red-300 focus:border-red-500 focus:ring-red-500`
- **Disabled**: `bg-slate-50 text-slate-500 cursor-not-allowed`

#### Labels
- **Style**: `text-sm font-medium text-slate-700`
- **Required**: `text-red-500` asterisk

### Tables

#### Header
- **Background**: `bg-slate-50`
- **Text**: `text-xs font-medium text-slate-500 uppercase tracking-wider`
- **Padding**: `px-6 py-3`

#### Rows
- **Hover**: `hover:bg-slate-50`
- **Border**: `divide-y divide-slate-200`
- **Padding**: `px-6 py-4`

#### Cells
- **Text**: `text-sm text-slate-900` (default)
- **Secondary**: `text-sm text-slate-500`
- **Alignment**: Left (default), center, right as needed

### Badges

#### Variants
- **Default**: `bg-slate-100 text-slate-700`
- **Primary**: `bg-blue-100 text-blue-800`
- **Success**: `bg-emerald-100 text-emerald-800`
- **Warning**: `bg-amber-100 text-amber-800`
- **Danger**: `bg-red-100 text-red-800`
- **Info**: `bg-sky-100 text-sky-800`

#### Sizes
- **xs**: `px-2 py-0.5 text-xs`
- **sm**: `px-2.5 py-0.5 text-xs` (default)
- **md**: `px-3 py-1 text-sm`
- **lg**: `px-4 py-1.5 text-sm`

## Layout Guidelines

### Grid System
- **Container**: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
- **Responsive Grids**: 
  - Mobile: `grid-cols-1`
  - Tablet: `md:grid-cols-2` or `md:grid-cols-3`
  - Desktop: `lg:grid-cols-4` or `lg:grid-cols-5` or `lg:grid-cols-6`

### Spacing
- **Section Padding**: `py-8` (pages), `py-6` (cards)
- **Element Spacing**: `space-y-6` (vertical), `space-x-4` (horizontal)
- **Gap**: `gap-6` (grids), `gap-4` (smaller elements)

## Accessibility

### Focus States
- **Ring**: `focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`
- **Outline**: `focus:outline-none` (when custom focus ring is provided)

### Color Contrast
- **Text on Light**: Minimum `slate-700` for body text
- **Text on Dark**: Minimum `slate-200` for readability
- **Interactive Elements**: Meet WCAG AA standards (4.5:1 ratio)

### Screen Reader Support
- **Labels**: Proper labeling for all form elements
- **Alt Text**: Descriptive text for images and icons
- **ARIA**: Appropriate ARIA labels and roles

## Performance

### Images
- **Optimization**: Use next-gen formats (WebP, AVIF)
- **Responsive**: Provide multiple sizes
- **Lazy Loading**: Implement for below-fold content

### CSS
- **Purging**: Remove unused Tailwind classes in production
- **Minification**: Compress CSS files
- **Critical CSS**: Inline critical styles

### JavaScript
- **Code Splitting**: Lazy load non-critical components
- **Tree Shaking**: Remove unused code
- **Bundle Size**: Monitor and optimize bundle sizes

## Mobile Responsiveness

### Breakpoints
- **sm**: `640px` - Small tablets
- **md**: `768px` - Tablets
- **lg**: `1024px` - Small desktops
- **xl**: `1280px` - Large desktops
- **2xl**: `1536px` - Extra large screens

### Mobile-First Approach
- Design for mobile first, enhance for larger screens
- Use responsive utility classes: `sm:`, `md:`, `lg:`, `xl:`
- Test on real devices and various screen sizes

### Touch Targets
- **Minimum Size**: 44x44px for tap targets
- **Spacing**: Adequate spacing between interactive elements
- **Gestures**: Support common mobile gestures

## Component Usage Examples

### Button
```vue
<BaseButton variant="primary" size="md" icon-left="plus">
  Add New Item
</BaseButton>
```

### Input
```vue
<BaseInput
  v-model="value"
  label="Email Address"
  type="email"
  placeholder="Enter your email"
  icon-left="envelope"
  required
/>
```

### Card
```vue
<BaseCard hover padding="lg">
  <h3 class="text-lg font-semibold text-slate-900">Card Title</h3>
  <p class="text-slate-600 mt-2">Card content goes here</p>
</BaseCard>
```

### Table
```vue
<BaseTable
  :columns="columns"
  :data="data"
  :loading="loading"
  paginated
  :page-size="25"
/>
```

### Badge
```vue
<BaseBadge variant="success" size="sm">
  Active
</BaseBadge>
```

This design system ensures consistency, accessibility, and maintainability across the TenantX application while providing a modern, professional user experience.
