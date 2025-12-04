# CarouselAI - Context for Gemini

## About

CarouselAI creates Instagram carousels using Google Gemini AI for content and image generation. Built with React 19, TypeScript, Vite, and Tailwind CSS.

## Quick Commands

```bash
npm install          # Install dependencies
npm run dev          # Dev server → http://localhost:5173
npm run build        # Build to /dist
```

## File Overview

| File | Purpose |
|------|---------|
| `App.tsx` | Onboarding flow, style selection |
| `components/Workspace.tsx` | Main editor, sidebar, export |
| `components/TwitterSlide.tsx` | Twitter-style template |
| `components/StorytellerSlide.tsx` | Storyteller-style template |
| `services/geminiService.ts` | Gemini API integration |
| `types.ts` | TypeScript interfaces |

## Gemini Integration

This project uses `@google/genai` SDK:

```tsx
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey });

// Text generation
const response = await ai.models.generateContent({
  model: 'gemini-2.5-pro-preview-05-06',
  contents: prompt
});

// Image generation
const response = await ai.models.generateContent({
  model: 'gemini-2.0-flash-exp-image-generation',
  contents: prompt,
  config: { responseModalities: ['image', 'text'] }
});
```

### Supported Aspect Ratios for Images
- `1:1` - Square
- `4:5` - Portrait (Instagram)
- `9:16` - Stories/Reels
- `16:9` - Landscape

## Code Patterns

### React Components
```tsx
const Component: React.FC<Props> = ({ prop }) => {
  const [state, setState] = useState<Type>(initial);
  return <div className="tailwind-classes">{content}</div>;
};
```

### Styling
- Tailwind CSS only (loaded via CDN)
- No separate CSS files
- Dynamic values via inline styles when needed

## Key Types

```tsx
type Theme = 'DARK' | 'LIGHT';
type CarouselStyle = 'TWITTER' | 'STORYTELLER';
type AspectRatio = '1/1' | '4/5' | '9/16' | '16/9';

interface Slide {
  id: string;
  content: string;
  showImage: boolean;
  imageUrl?: string;
}
```

## Export System

Uses `html-to-image` for PNG export (captures actual rendered DOM):

```tsx
const dataUrl = await window.htmlToImage.toPng(element, {
  width, height, backgroundColor, pixelRatio: 1
});
```

## Constraints

- Never commit `.env.local` (contains API keys)
- Never hardcode secrets
- Always use `crossOrigin="anonymous"` on external images
- Use html-to-image, NOT html2canvas

## Verification Steps

1. Run dev server
2. Create carousel with both styles
3. Test Light and Dark themes
4. Export slides → verify PNG matches preview
5. Test image generation with different ratios
