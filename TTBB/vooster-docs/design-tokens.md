# Design Tokens - TTBB Brand Colors & Typography

This document describes the design tokens configured for the TTBB (티티빵빵) landing page project.

## Color Palette

### Brand Colors

| Token | Hex | Usage |
|-------|-----|-------|
| Primary | `#F6E6D0` | Main brand color (cream beige) |
| Secondary | `#FFFFFF` | White backgrounds |
| Accent | `#B67C5C` | Brown accent for CTAs and highlights |

### Grayscale

| Token | Hex | Usage |
|-------|-----|-------|
| Gray 100 | `#F6F6F6` | Light backgrounds, subtle sections |
| Gray 200 | `#E0E0E0` | Borders, dividers, separators |
| Gray 500 | `#A0A0A0` | Muted text, placeholders |
| Gray 900 | `#2C2C2C` | Primary text, headings |

## Typography

### Font Families

| Token | Font Stack | Usage |
|-------|-----------|-------|
| Primary | Pretendard | Default Korean text |
| Secondary | Noto Sans KR | Fallback Korean font |

### Configuration

```typescript
// tailwind.config.ts
fontFamily: {
  sans: ['Pretendard', 'system-ui', 'sans-serif'],
  pretendard: ['Pretendard', 'system-ui', 'sans-serif'],
  notoSansKr: ['Noto Sans KR', 'system-ui', 'sans-serif'],
}
```

## Usage Examples

### Color Classes

```tsx
// Primary brand color
<div className="bg-primary text-primary-foreground">
  Hero Section
</div>

// Accent color for CTAs
<button className="bg-accent text-accent-foreground hover:bg-accent/90">
  클래스 신청하기
</button>

// Grayscale backgrounds
<section className="bg-gray-100">
  <p className="text-gray-900">Primary text content</p>
  <p className="text-gray-500">Muted secondary text</p>
</section>

// Borders and dividers
<div className="border border-gray-200">
  Card with subtle border
</div>
```

### Typography Classes

```tsx
// Default sans font (Pretendard)
<p className="font-sans">
  티티빵빵은 울산에 위치한 홈베이킹 클래스입니다
</p>

// Explicit Pretendard
<h1 className="font-pretendard font-bold text-4xl">
  울산에서 가장 따뜻한 베이킹 클래스
</h1>

// Noto Sans KR fallback
<p className="font-notoSansKr">
  Alternative Korean font
</p>
```

### Combined Examples

```tsx
// Hero section with brand colors
<section className="bg-primary py-20">
  <h1 className="font-pretendard text-5xl font-bold text-gray-900">
    티티빵빵
  </h1>
  <p className="font-sans text-xl text-gray-500 mt-4">
    울산에서 가장 따뜻한 베이킹 클래스
  </p>
  <button className="mt-8 bg-accent text-white px-6 py-3 rounded-lg hover:bg-accent/90">
    클래스 신청하기
  </button>
</section>

// Card component
<div className="bg-white border border-gray-200 rounded-lg p-6">
  <h3 className="font-pretendard font-semibold text-gray-900 text-2xl">
    기초 베이킹 클래스
  </h3>
  <p className="text-gray-500 mt-2">
    베이킹을 처음 시작하는 분들을 위한 클래스
  </p>
  <div className="mt-4 pt-4 border-t border-gray-200">
    <button className="text-accent hover:text-accent/80">
      상세보기 →
    </button>
  </div>
</div>

// Gallery section with light background
<section className="bg-gray-100 py-16">
  <h2 className="font-pretendard text-4xl font-bold text-gray-900 text-center">
    수강생 작품 갤러리
  </h2>
  <div className="mt-8 grid grid-cols-3 gap-4">
    {/* Gallery items */}
  </div>
</section>
```

## Semantic Color System (shadcn/ui)

In addition to the direct color tokens, the project uses shadcn/ui's semantic color system via CSS variables. These adapt to light/dark modes automatically:

- `bg-background` / `text-foreground` - Base background and text
- `bg-primary` / `text-primary-foreground` - Primary brand actions
- `bg-secondary` / `text-secondary-foreground` - Secondary backgrounds
- `bg-accent` / `text-accent-foreground` - Accent highlights
- `bg-muted` / `text-muted-foreground` - Muted/subtle elements
- `border` - Standard border color
- `input` - Form input borders
- `ring` - Focus ring color

Example:
```tsx
<div className="bg-background text-foreground border border-border">
  Content that adapts to theme
</div>
```

## Best Practices

1. **Use semantic colors first**: Prefer `bg-primary`, `bg-accent` over direct grays for better theme consistency
2. **Grayscale for neutrals**: Use `gray-{100,200,500,900}` for backgrounds, borders, and text that shouldn't change with theme
3. **Font consistency**: Default `font-sans` applies Pretendard automatically
4. **Accessibility**: Ensure sufficient contrast (gray-900 text on light backgrounds, white text on accent)
5. **Hover states**: Use opacity modifiers like `hover:bg-accent/90` for interactive elements

## Implementation Details

All colors are defined in:
- `tailwind.config.ts` - Tailwind theme extension
- `src/app/globals.css` - CSS variables for semantic colors

Fonts are loaded from CDN in `src/app/globals.css`:
- Pretendard: https://cdn.jsdelivr.net/gh/orioncactus/pretendard
- Noto Sans KR: Google Fonts
