import React from 'react';
import { Search, X, Image as ImageIcon, Video, Layers } from 'lucide-react';
import { FileCategory, SortOption } from '../../types/navigation';

interface FilterSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: FileCategory;
  onSelectCategory: (cat: FileCategory) => void;
  sortOption: SortOption;
  onSortChange: (sort: SortOption) => void;
  isGridView: boolean;
  onToggleGridView: (grid: boolean) => void;
  totalCount: number;
}

export const FilterSearchBar: React.FC<FilterSearchBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  sortOption,
  onSortChange,
  totalCount,
}) => {
  const categories: Array<{ id: FileCategory; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'all', label: 'All', icon: Layers },
    { id: 'photos', label: 'Photos', icon: ImageIcon },
    { id: 'videos', label: 'Videos', icon: Video },
  ];

  return (
    <div className="space-y-3 mb-4">
      {/* Search Input Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search memories..."
          className="w-full pl-10 pr-9 py-2.5 bg-zinc-900/80 border border-zinc-800 rounded-2xl text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400/50 shadow-sm min-touch-target"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Clean Category Pills & Count */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`flex items-center gap-1.5 text-xs px-3.5 py-1.5 rounded-full font-bold transition-all min-touch-target whitespace-nowrap active:scale-95 ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-black shadow-gold-glow-sm'
                    : 'bg-zinc-900/80 text-zinc-400 border border-zinc-800 hover:text-white hover:border-zinc-700'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-black' : 'text-zinc-500'}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Sort & Count Pill */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() =>
              onSortChange(sortOption === 'newest' ? 'oldest' : 'newest')
            }
            className="text-[11px] font-semibold text-zinc-400 hover:text-amber-400 px-2 py-1 rounded-lg bg-zinc-900/60 border border-zinc-800/80 transition-colors"
            title="Toggle sort order"
          >
            {sortOption === 'newest' ? 'Newest' : 'Oldest'}
          </button>
          <span className="text-[11px] text-zinc-500 font-medium">
            {totalCount} {totalCount === 1 ? 'item' : 'items'}
          </span>
        </div>
      </div>
    </div>
  );
};
