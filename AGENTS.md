# CarouselAI

Instagram carousel creator with AI-powered content and image generation.

## Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server at http://localhost:5173
npm run build        # Production build to /dist
npm run preview      # Preview production build
```

## Stack

- React 19 + TypeScript
- Vite 6
- Tailwind CSS (CDN)
- Google Gemini AI (@google/genai)
- html-to-image for PNG export

## Structure

```
App.tsx                     # Onboarding, style selection
components/Workspace.tsx    # Main editor, export logic
components/TwitterSlide.tsx # Twitter template
components/StorytellerSlide.tsx # Storyteller template
services/geminiService.ts   # Gemini API calls
types.ts                    # TypeScript interfaces
```

## Code Style

```tsx
// Functional components with hooks
const MyComponent: React.FC<Props> = ({ prop1, prop2 }) => {
  const [state, setState] = useState<Type>(initial);

  // Tailwind for styling
  return (
    <div className="flex items-center gap-4 p-6 bg-white rounded-lg">
      {content}
    </div>
  );
};
```

- TypeScript strict mode
- Tailwind CSS classes (no CSS files)
- `const` over `let`
- Descriptive names

## Key Types

```tsx
interface Slide {
  id: string;
  content: string;
  type: SlideType;
  showImage: boolean;
  imageUrl?: string;
  imageScale?: number;
}

type Theme = 'DARK' | 'LIGHT';
type AspectRatio = '1/1' | '4/5' | '9/16' | '16/9';
type CarouselStyle = 'TWITTER' | 'STORYTELLER';
```

## Export System

Uses `html-to-image` library:
```tsx
const dataUrl = await window.htmlToImage.toPng(element, {
  width: PREVIEW_WIDTH,
  height: previewHeight,
  backgroundColor: bgColor,
  pixelRatio: 1
});
```

No special handling needed - captures actual rendered pixels.

## AI Integration

```tsx
// Text generation
await generateCarouselContent(topic, numberOfSlides, model);

// Image generation
await generateSlideImage(prompt, aspectRatio);

// Image stylization
await stylizeImage(imageBase64, prompt, aspectRatio);
```

Models:
- Text: `gemini-2.5-pro-preview-05-06`, `gemini-2.0-flash`
- Image: `gemini-2.0-flash-exp-image-generation`

## Do Not

- Commit `.env.local` (API keys)
- Hardcode API keys
- Use html2canvas (use html-to-image instead)
- Create separate CSS files (use Tailwind)
- Forget `crossOrigin="anonymous"` on external images

## Testing

1. `npm run dev`
2. Create carousel (both styles)
3. Toggle themes (Light/Dark)
4. Export PNG - verify matches preview
5. Test AI image generation
