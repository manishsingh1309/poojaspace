import React from 'react';
import { Search, SlidersHorizontal, LayoutGrid, List } from 'lucide-react';
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
  isGridView,
  onToggleGridView,
  totalCount,
}) => {
  const categories: Array<{ id: FileCategory; label: string }> = [
    { id: 'all', label: 'All Vault' },
    { id: 'photos', label: 'Photos' },
    { id: 'videos', label: 'Cinema' },
    { id: 'documents', label: 'Documents' },
    { id: 'audio_other', label: 'Other' },
  ];

  return (
    <div className="space-y-3 mb-5">
      {/* Top search input & view toggles */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search files and memories..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#121216] border border-zinc-800 rounded-2xl text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400/50 shadow-sm min-touch-target"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500 hover:text-white p-1"
            >
              Clear
            </button>
          )}
        </div>

        {/* Sort select */}
        <div className="relative shrink-0">
          <select
            value={sortOption}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="appearance-none bg-[#121216] border border-zinc-800 rounded-2xl pl-3 pr-8 py-2.5 text-xs font-semibold text-zinc-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400 min-touch-target"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="name_asc">Name (A-Z)</option>
            <option value="name_desc">Name (Z-A)</option>
            <option value="size_desc">Largest size</option>
            <option value="size_asc">Smallest size</option>
          </select>
          <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Grid/List Toggle */}
        <div className="hidden sm:flex items-center bg-[#121216] border border-zinc-800 rounded-2xl p-1 shadow-sm">
          <button
            onClick={() => onToggleGridView(true)}
            aria-label="Grid view"
            className={`p-1.5 rounded-xl transition-colors ${
              isGridView ? 'bg-zinc-800 text-amber-400 font-bold' : 'text-zinc-500 hover:text-white'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => onToggleGridView(false)}
            aria-label="List view"
            className={`p-1.5 rounded-xl transition-colors ${
              !isGridView ? 'bg-zinc-800 text-amber-400 font-bold' : 'text-zinc-500 hover:text-white'
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Category Pills & Count */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none">
        <div className="flex items-center gap-2 shrink-0">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`text-xs px-3.5 py-1.5 rounded-full font-bold transition-all min-touch-target whitespace-nowrap ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-black shadow-gold-glow-sm'
                    : 'bg-[#121216] text-zinc-400 border border-zinc-800 hover:text-white hover:border-zinc-700'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        <span className="text-[11px] text-zinc-500 shrink-0 font-medium ml-2">
          {totalCount} item{totalCount === 1 ? '' : 's'}
        </span>
      </div>
    </div>
  );
};
