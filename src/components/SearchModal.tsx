import React from 'react';
import { useStore } from '../context/StoreContext';
import { SearchBar } from './SearchBar';
import { Flame, ArrowRight, X } from 'lucide-react';

interface SearchModalProps {
  onNavigate: (path: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ onNavigate }) => {
  const { searchModalOpen, setSearchModalOpen, categories } = useStore();

  if (!searchModalOpen) return null;

  const popularSearches = [
    'Banarasi Saree',
    'Chiffon Dupatta',
    'Men Kurta Pajama',
    'Linen Blazer',
    'Seamless Lingerie',
    'Kids Festive Wear',
    'Plus-Size Curves'
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-3 sm:p-6 md:p-20 text-left">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={() => setSearchModalOpen(false)}
      />

      <div className="relative max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden animate-slide-down z-10">
        {/* MODAL HEADER WITH SEARCH BAR */}
        <div className="p-3 sm:p-4 border-b border-stone-200 bg-stone-50 flex items-center gap-2">
          <div className="flex-1 min-w-0">
            <SearchBar
              onNavigate={onNavigate}
              autoFocus={true}
              placeholder="Search Sarees, Kurtas, Western Dresses, Innerwear..."
              onCloseModal={() => setSearchModalOpen(false)}
            />
          </div>
          <button
            type="button"
            onClick={() => setSearchModalOpen(false)}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 rounded-lg transition-colors cursor-pointer shrink-0"
            aria-label="Close search"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* POPULAR SEARCHES & QUICK CATEGORIES */}
        <div className="p-4 sm:p-5 max-h-[70vh] overflow-y-auto space-y-6">
          {/* Trending Searches Tags */}
          <div>
            <p className="flex items-center gap-1.5 text-xs font-bold text-stone-400 uppercase tracking-wider mb-2.5">
              <Flame className="w-3.5 h-3.5 text-orange-500" />
              Trending Searches
            </p>
            <div className="flex flex-wrap gap-2">
              {popularSearches.map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    setSearchModalOpen(false);
                    onNavigate(`/search?q=${encodeURIComponent(tag)}`);
                  }}
                  className="text-xs bg-stone-100 hover:bg-[#F3E9E4] hover:text-[#C0654B] text-stone-700 px-3 py-1.5 rounded-full transition-colors cursor-pointer"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Category Jump */}
          <div>
            <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2.5">
              Top Categories
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {categories.slice(0, 4).map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setSearchModalOpen(false);
                    onNavigate(`/category/${c.slug}`);
                  }}
                  className="flex items-center justify-between p-2.5 bg-stone-50 hover:bg-[#F3E9E4] text-xs font-bold text-stone-800 rounded-lg transition-colors cursor-pointer text-left"
                >
                  <span>{c.name}</span>
                  <ArrowRight className="w-3 h-3 text-[#C0654B]" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
