export interface MemoryPhoto {
  id: string;
  src: string;
  title: string;
  year?: string;
  category: 'portrait' | 'festive' | 'candid' | 'family';
  caption: string;
}

export const POOJA_HERO_IMAGE = '/assets/hero.jpg';
export const POOJA_SPECIAL_IMAGE = '/assets/special one.jpg';

export const PERSONAL_MEMORY_PHOTOS: MemoryPhoto[] = [
  {
    id: 'mem-hero',
    src: '/assets/hero.jpg',
    title: 'Pooja Didi ✨',
    category: 'portrait',
    caption: 'Radiant smile and endless warmth',
  },
  {
    id: 'mem-special',
    src: '/assets/special one.jpg',
    title: 'Special One ❤️',
    category: 'festive',
    caption: 'Cherished festival moments and happiness',
  },
  {
    id: 'mem-7746',
    src: '/assets/IMG_7746.jpg',
    title: 'Graceful Moments',
    category: 'candid',
    caption: 'Memories etched in time',
  },
  {
    id: 'mem-7434',
    src: '/assets/IMG_7434.jpg',
    title: 'Festive Joy',
    year: '2023',
    category: 'festive',
    caption: 'Colors, celebration and joy',
  },
  {
    id: 'mem-7530',
    src: '/assets/IMG_7530.jpg',
    title: 'Golden Hour Smile',
    category: 'portrait',
    caption: 'Peaceful and beautiful afternoon',
  },
  {
    id: 'mem-b4ca',
    src: '/assets/b4ca1cd3-c29b-41a0-94c2-3d06aaeee1ae.JPG',
    title: 'Candid Glimpse',
    category: 'candid',
    caption: 'Unforgettable moments with family',
  },
  {
    id: 'mem-3952',
    src: '/assets/3952b094-5577-4cd2-8386-e8796e343657.JPG',
    title: 'Bright Horizons',
    category: 'portrait',
    caption: 'Always spreading joy around',
  },
  {
    id: 'mem-e55f',
    src: '/assets/e55fa66b-6900-4def-8fbc-20d92f608269.JPG',
    title: 'Celebration Days',
    category: 'festive',
    caption: 'Sweet laughter and sweet memories',
  },
  {
    id: 'mem-wa2021',
    src: '/assets/IMG-20210723-WA0024_Original.jpg',
    title: 'July 2021 Memory',
    year: '2021',
    category: 'candid',
    caption: 'Saved from the memory lane',
  },
  {
    id: 'mem-wa2022',
    src: '/assets/IMG-20220206-WA0031_Original.jpg',
    title: 'February 2022 Memory',
    year: '2022',
    category: 'family',
    caption: 'Treasured days with family',
  },
  {
    id: 'mem-wa2019',
    src: '/assets/IMG-20190905-WA0072_Original.jpg',
    title: 'September 2019 Days',
    year: '2019',
    category: 'candid',
    caption: 'Where the journey continues',
  },
];
