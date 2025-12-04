
export enum SlideType {
  COVER = 'COVER',
  CONTENT = 'CONTENT',
  CTA = 'CTA'
}

export enum CarouselStyle {
  TWITTER = 'TWITTER',
  APPLE_NOTES = 'APPLE_NOTES',
  STORYTELLER = 'STORYTELLER'
}

export type AspectRatio = '1/1' | '4/5' | '9/16' | '16/9';

export type Theme = 'LIGHT' | 'DARK';

export interface Profile {
  name: string;
  handle: string;
  avatarUrl: string;
}

export interface Slide {
  id: string;
  type: SlideType;
  content: string;
  imageUrl?: string;
  showImage: boolean;
  imagePrompt?: string; // For AI regeneration
  imageScale?: number; // Percentage height of the image (10-90)
  overlayImage?: boolean; // For Storyteller mode: true = text over image, false = split view
  imageOffsetY?: number; // 0-100, Vertical alignment/cropping of the image
  gradientHeight?: number; // 0-100, Height/Intensity of the gradient overlay
}

export interface CarouselProject {
  id: string;
  style: CarouselStyle;
  aspectRatio: AspectRatio;
  profile: Profile;
  slides: Slide[];
}

export type AppStep = 'FORMAT_SELECT' | 'ASPECT_RATIO_SELECT' | 'PROFILE_INPUT' | 'METHOD_SELECT' | 'AI_INPUT' | 'WORKSPACE';
