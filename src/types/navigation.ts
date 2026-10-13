export type ActiveView =
  | 'home'
  | 'photos'
  | 'videos'
  | 'documents'
  | 'albums'
  | 'album_detail'
  | 'favourites'
  | 'trash'
  | 'settings'
  | 'privacy';

export type SortOption =
  | 'newest'
  | 'oldest'
  | 'name_asc'
  | 'name_desc'
  | 'size_desc'
  | 'size_asc';

export type FileCategory = 'all' | 'photos' | 'videos' | 'documents' | 'audio_other';
