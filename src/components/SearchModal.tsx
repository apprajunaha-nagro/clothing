import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Search, X, Flame, ArrowRight } from 'lucide-react';
import { getOptimizedImageUrl } from '../utils/imageOptimizer';

interface SearchModalProps {
  onNavigate: (path: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ onNavigate }) => {
  const { products, searchModalOpen, setSearchModalOpen, categories } = useStore();
  const [query, setQuery] = useState('');

  if (!searchModalOpen) return null;

  const filteredProducts = query.trim()
    ? products.filter(
        p =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.description.toLowerCase().includes(query.toLowerCase()) ||
          p.fabric.toLowerCase().includes(query.toLowerCase()) ||
          p.occasion.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 6)
    : [];

  const popularSearches = [
    'Banarasi Saree',
    'Chiffon Dupatta',
    'Men Kurta Pajama',
    'Linen Blazer',
    'Seamless Lingerie',
    'Kids Festive Wear',
    'Plus-Size Curves'
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchModalOpen(false);
      onNavigate(`/category/women?search=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-20 text-left">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={() => setSearchModalOpen(false)}
      />

      <div className="relative max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden animate-slide-down z-10">
        {/* INPUT FORM */}
        <form onSubmit={handleSearchSubmit} className="p-4 border-b border-stone-200 flex items-center gap-3 bg-stone-50">
          <Search className="w-5 h-5 text-[#C0654B]" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Sarees, Kurtas, Western Dresses, Innerwear..."
            className="flex-1 bg-transparent text-sm sm:text-base text-stone-900 focus:outline-none placeholder-stone-400 font-medium"
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} className="p-1 text-stone-400 hover:text-stone-700">
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setSearchModalOpen(false)}
            className="text-xs font-bold text-stone-500 hover:text-stone-900 px-2 py-1 rounded-md"
          >
            Esc
          </button>
        </form>

        {/* RESULTS OR POPULAR SEARCHES */}
        <div className="p-5 max-h-[70vh] overflow-y-auto">
          {query.trim() ? (
            <div>
              <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3">
                Matching Products ({filteredProducts.length})
              </p>
              {filteredProducts.length === 0 ? (
                <p className="text-sm text-stone-500 py-6 text-center">
                  No clothing items found matching "{query}". Try searching "Saree", "Kurta", or "Lingerie".
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredProducts.map((p) => {
                    const price = p.discountPrice || p.basePrice;
                    const img = getOptimizedImageUrl(
                      p.colors[0]?.images[0] || 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=400&q=80',
                      { width: 160, quality: 75 }
                    );
                    return (
                      <div
                        key={p.id}
                        onClick={() => {
                          setSearchModalOpen(false);
                          onNavigate(`/product/${p.id}`);
                        }}
                        className="flex items-center gap-3 p-2 rounded-xl border border-stone-100 hover:border-[#C0654B] bg-stone-50/50 hover:bg-stone-50 transition-all cursor-pointer"
                      >
                        <img
                          src={img}
                          alt={p.name}
                          className="w-14 h-16 object-cover object-top rounded-lg bg-white shrink-0"
                          loading="lazy"
                          decoding="async"
                        />
                        <div className="overflow-hidden">
                          <p className="text-xs font-bold text-stone-900 truncate">{p.name}</p>
                          <p className="text-[10px] text-[#C0654B] font-semibold">{p.brandName}</p>
                          <p className="text-xs font-bold text-stone-900 mt-0.5">₹{price.toLocaleString('en-IN')}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Popular Searches Tags */}
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
                        setQuery(tag);
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
          )}
        </div>
      </div>
    </div>
  );
};
