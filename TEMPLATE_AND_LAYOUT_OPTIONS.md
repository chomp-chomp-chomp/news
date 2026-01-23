# Template & Layout Expansion Options

This document outlines options for expanding the newsletter template and layout system.

## Current State

### Email Templates
- **Single template**: `src/emails/newsletter-template.tsx`
- **Block-based content**: story, promo, text, image, divider, footer
- **Fixed layout**: Header → Subject → Blocks → Footer
- **No visual editor**: Code-based configuration only

### Web Issue Display
- **Single renderer**: `src/components/IssueRenderer.tsx`
- **Same blocks as email**: Reuses block types
- **Fixed layout**: Breadcrumb → Title → Blocks → Subscribe CTA
- **No customization**: Layout is hardcoded

## Option 1: Multiple Email Templates (Recommended for MVP)

### What It Includes
Add pre-built email layout templates that users can choose from:

1. **Classic** (current) - Header with logo, blocks in sequence
2. **Digest** - Compact layout with smaller images, good for link roundups
3. **Feature** - Large hero image, focused on single main story
4. **Minimal** - Text-focused, no header image, clean typography
5. **Newsletter Grid** - Two-column layout for multiple stories side-by-side

### Implementation
```typescript
// New file: src/emails/templates/
// - classic.tsx (current template)
// - digest.tsx
// - feature.tsx
// - minimal.tsx
// - grid.tsx

// Template selector in publication settings
interface Publication {
  email_template: 'classic' | 'digest' | 'feature' | 'minimal' | 'grid'
}
```

### Pros
- ✅ No learning curve - pick from dropdown
- ✅ Fast to implement (1-2 weeks)
- ✅ Professional results immediately
- ✅ Email-safe (tested layouts)

### Cons
- ❌ Limited customization
- ❌ Can't create custom layouts without coding

---

## Option 2: Visual Email Builder (Most User-Friendly)

### What It Includes
Drag-and-drop email builder similar to Mailchimp/Beehiiv:

- **Section-based**: Drag sections (header, footer, content areas)
- **Component library**: Pre-built components (buttons, images, text, social)
- **Style controls**: Colors, fonts, spacing sliders
- **Live preview**: See changes in real-time
- **Device preview**: Toggle mobile/desktop view
- **Template library**: Start from templates, customize freely

### Example Libraries
- [react-email-editor](https://github.com/unlayer/react-email-editor) - Full featured
- [grapesjs](https://grapesjs.com/) - Open source, very customizable
- Custom build with [dnd-kit](https://github.com/clauderic/dnd-kit)

### Pros
- ✅ Ultimate flexibility
- ✅ No coding required
- ✅ Matches user expectations from other platforms
- ✅ Can create unlimited variations

### Cons
- ❌ Complex to build (4-8 weeks)
- ❌ Requires learning curve for users
- ❌ Generated HTML may have email compatibility issues
- ❌ Significant testing needed

---

## Option 3: Flexible Block Layouts (Middle Ground)

### What It Includes
Keep block-based system but add layout options:

**New Block Types**:
- **Column Block**: 2 or 3 column layouts
- **Hero Block**: Full-width image with overlay text
- **CTA Block**: Prominent call-to-action buttons
- **Quote Block**: Pullquotes and testimonials
- **Spacer Block**: Adjustable whitespace
- **Video Block**: Embedded video with thumbnail
- **Social Links Block**: Icon-based social links

**Layout Controls Per Block**:
- Width: Full, Wide, Normal, Narrow
- Alignment: Left, Center, Right
- Background: Color or image
- Padding/Margin: Small, Medium, Large

**Block Arrangement**:
- Drag to reorder (already works)
- Nest blocks inside containers
- Templates save block arrangements

### Pros
- ✅ More flexibility than templates alone
- ✅ Moderate development time (2-3 weeks)
- ✅ Builds on existing system
- ✅ Still email-safe

### Cons
- ❌ Not as visual as full builder
- ❌ More complex than simple templates

---

## Option 4: Template System with Variables (Quick Win)

### What It Includes
Create templates with customizable variables:

```typescript
interface EmailTemplate {
  id: string
  name: string
  preview_image: string
  variables: {
    header_background: string
    accent_color: string
    font_family: string
    show_logo: boolean
    logo_position: 'left' | 'center' | 'right'
    footer_style: 'minimal' | 'full'
  }
}
```

Users can:
- Choose a base template
- Customize colors, fonts, logo placement
- Toggle header/footer components
- Set default styles for blocks

### Pros
- ✅ Fast to implement (1 week)
- ✅ Good balance of control and simplicity
- ✅ Works within existing block system
- ✅ Can add more variables over time

### Cons
- ❌ Still somewhat limited
- ❌ Not truly "custom" layouts

---

## Web Layout Options

### Should Web Match Email Exactly?

**No - Here's Why:**
1. **Email constraints**: Must work in Outlook 2007, Gmail, Apple Mail
2. **Web opportunities**: Can use modern CSS, animations, interactions
3. **Different contexts**: Email = quick scan, Web = deep reading

**Recommended Approach:**
- **Shared structure**: Same blocks, same order
- **Different styling**: Web uses better typography, spacing, effects
- **Consistency**: Same colors, fonts, branding feel
- **Example**: Email uses tables for layout, web uses CSS Grid

### Web-Specific Features to Add
1. **Reading experience**:
   - Table of contents for long issues
   - Sticky header with progress bar
   - "Share this issue" buttons
   - Print-friendly styles

2. **Interactive elements**:
   - Image lightboxes/zoom
   - Embedded videos (not just thumbnails)
   - Interactive charts/graphs
   - Comment sections (future)

3. **Layout options**:
   - Full-width images (edge-to-edge)
   - Sidebar layouts for archives
   - Grid layouts for image galleries
   - Magazine-style multi-column text

---

## My Recommendation: Phased Approach

### Phase 1: Quick Wins (1-2 weeks)
✅ **Recommended to start**
- Add 3-5 pre-built email templates
- Add template selector to publication settings
- Add customizable variables (colors, fonts)
- Keep same blocks, same editor

### Phase 2: Enhanced Blocks (2-3 weeks)
- Add new block types (hero, CTA, columns, quote)
- Add block-level styling options
- Improve drag-and-drop with nesting
- Add block templates/presets

### Phase 3: Web Enhancements (1-2 weeks)
- Add web-specific styling
- Table of contents for long issues
- Share buttons and social previews
- Print styles

### Phase 4: Visual Builder (Optional, 4-8 weeks)
- Only if needed after using Phase 1-3
- Consider third-party solutions first
- Build custom only if specific needs

---

## Implementation Priorities

### High Priority (Do These First):
1. ✅ Multiple email templates with selector
2. ✅ Template variable customization
3. ✅ New block types (hero, CTA, columns)

### Medium Priority:
4. Block-level styling controls
5. Web reading experience improvements
6. Template preview system

### Low Priority (Nice to Have):
7. Visual drag-and-drop builder
8. Custom HTML block (for advanced users)
9. A/B testing different templates

---

## Questions to Help Decide

1. **Usage Pattern**: Will you create many newsletters with different looks, or few with consistent branding?
   - Many different → Visual builder
   - Few consistent → Templates + variables

2. **Users**: Who will be creating emails?
   - Non-technical → Visual builder
   - Technical/comfortable → Enhanced blocks

3. **Uniqueness**: How custom do layouts need to be?
   - Very unique → Visual builder
   - Professional but standard → Templates

4. **Timeline**: When do you need this?
   - ASAP → Templates + variables (Phase 1)
   - Can wait → Consider builder

---

## Cost-Benefit Analysis

| Option | Dev Time | User Learning | Flexibility | Email Safety |
|--------|----------|---------------|-------------|--------------|
| **Templates** | 1-2 weeks | None | Low | ✅ High |
| **Templates + Variables** | 1 week | Very low | Medium | ✅ High |
| **Enhanced Blocks** | 2-3 weeks | Low | High | ✅ High |
| **Visual Builder** | 4-8 weeks | Medium | Very High | ⚠️ Medium |

---

## Next Steps

**To move forward, I need your input on:**

1. **Primary use case**:
   - Single publication with consistent branding?
   - Multiple publications with different looks?
   - Client-facing (need to hand off to others)?

2. **Priority**:
   - Speed (get something working fast)?
   - Flexibility (need lots of customization)?
   - Ease of use (non-technical users)?

3. **Scope**:
   - Email only?
   - Web only?
   - Both need equal attention?

**My recommendation**: Start with **Phase 1** (templates + variables). It's fast, proven, and you can always add more later. The visual builder is a massive project and might not be needed if templates work well.

Let me know your thoughts!
