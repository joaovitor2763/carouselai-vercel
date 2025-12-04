
import { SlideType, Slide } from './types';

export const DEFAULT_AVATAR = "https://picsum.photos/200/200";

export const MOCK_SLIDES: Slide[] = [
  {
    id: '1',
    type: SlideType.COVER,
    content: "# The Secret to High-Ticket Sales\n\nIt isn't what you **think**.",
    showImage: false,
    imageUrl: '',
    imageScale: 50
  },
  {
    id: '2',
    type: SlideType.CONTENT,
    content: "Most people focus on the pitch.\n\nBut the real closers focus on the __environment__.",
    showImage: true,
    imageUrl: 'https://picsum.photos/800/800',
    imageScale: 55
  },
  {
    id: '3',
    type: SlideType.CTA,
    content: "Follow for more strategies on scaling your agency.",
    showImage: false,
    imageUrl: '',
    imageScale: 50
  }
];

export const MAX_SLIDES = 15;
export const MIN_SLIDES = 3;
