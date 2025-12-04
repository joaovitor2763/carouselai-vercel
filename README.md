# CarouselAI - Instagram Carousel Creator

Create beautiful Instagram carousels with AI-powered content generation and image creation.

## Features

- **AI Content Generation** - Generate carousel content using Google Gemini AI
- **AI Image Generation** - Create images for your slides with Gemini's image model
- **Multiple Styles** - Twitter-style and Storyteller-style templates
- **Theme Support** - Light and dark mode for both styles
- **Export to PNG** - Download individual slides or all slides as a ZIP

## Run Locally

**Prerequisites:** Node.js 18+

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up your API key:
   ```bash
   cp .env.example .env.local
   ```
   Then edit `.env.local` and add your [Gemini API key](https://aistudio.google.com/apikey)

3. Run the app:
   ```bash
   npm run dev
   ```

4. Open http://localhost:5173 in your browser

## Configuration

You can also set your API key directly in the app UI - click the "API Key" section in the sidebar.

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Google Gemini AI

## License

MIT
