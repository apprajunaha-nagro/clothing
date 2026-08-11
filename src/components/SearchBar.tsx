import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2, ArrowRight } from 'lucide-react';
import { Product } from '../types';
import { getOptimizedImageUrl } from '../utils/imageOptimizer';

interface SearchBarProps {
  onNavigate: (path: string) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
  onCloseModal?: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onNavigate,
  placeholder = "Search for sarees, kurtas, dresses, suits, innerwear...",
  className = "",
  autoFocus = false,
  onCloseModal,
}) => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 1. Debounce query input by 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [query]);

  // 2. Fetch live search results when debouncedQuery updates
  useEffect(() => {
    const trimmed = debouncedQuery.trim();
    if (!trimmed) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    fetch(`/api/products?search=${encodeURIComponent(trimmed)}`)
      .then((res) => {
        if (!res.ok) throw new Error('Search failed');
        return res.json();
      })
      .then((data: Product[]) => {
        if (isMounted) {
          setResults(Array.isArray(data) ? data.slice(0, 6) : []);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error('Search error:', err);
        if (isMounted) {
          setResults([]);
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [debouncedQuery]);

  // 3. Click outside handler to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 4. Keyboard navigation & Escape handler
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setQuery('');
      inputRef.current?.blur();
      if (onCloseModal) onCloseModal();
    }
  };

  // 5. Submit handler for Enter key / Search button click
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      setIsOpen(false);
      if (onCloseModal) onCloseModal();
      onNavigate(`/search?q=${encodeURIComponent(trimmed)}`);
    }
  };

  const handleSelectProduct = (productId: string) => {
    setIsOpen(false);
    setQuery('');
    if (onCloseModal) onCloseModal();
    onNavigate(`/product/${productId}`);
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <form
        onSubmit={handleSubmit}
        className="w-full flex items-center bg-stone-50 border border-stone-300 focus-within:border-[#C0654B] focus-within:ring-2 focus-within:ring-[#C0654B]/20 rounded-lg overflow-hidden transition-all shadow-2xs group"
      >
        <div className="flex-1 px-3 py-2 flex items-center gap-2 min-w-0">
          <Search className="w-4 h-4 text-stone-400 shrink-0 group-focus-within:text-[#C0654B] transition-colors" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            autoFocus={autoFocus}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full bg-transparent text-xs sm:text-sm text-stone-900 focus:outline-none placeholder-stone-400 font-medium truncate"
          />

          {/* Loading spinner */}
          {isLoading && (
            <Loader2 className="w-4 h-4 text-[#C0654B] animate-spin shrink-0" />
          )}

          {/* Clear query button */}
          {!isLoading && query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setResults([]);
                inputRef.current?.focus();
              }}
              className="text-stone-400 hover:text-stone-700 p-1 cursor-pointer shrink-0 transition-colors rounded-full hover:bg-stone-200/50"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Cmd+K visual key indicator */}
          {!query && !isLoading && (
            <kbd className="hidden lg:inline-block bg-stone-200/70 text-stone-500 text-[10px] px-1.5 py-0.5 rounded font-mono shrink-0 select-none">
              ⌘K
            </kbd>
          )}
        </div>

        <button
          type="submit"
          className="bg-[#C0654B] hover:bg-[#a85239] text-white px-4 py-2.5 flex items-center justify-center transition-colors cursor-pointer shrink-0 font-bold text-xs"
          aria-label="Submit search"
        >
          <Search className="w-4 h-4 text-white" />
        </button>
      </form>

      {/* LIVE DROPDOWN RESULTS */}
      {isOpen && query.trim().length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-stone-200 rounded-xl shadow-2xl z-50 overflow-hidden text-left max-h-[80vh] flex flex-col w-full animate-fade-in">
          {/* Header */}
          <div className="px-3 py-2 border-b border-stone-100 bg-stone-50 text-[10px] font-bold text-stone-500 uppercase tracking-wider flex items-center justify-between shrink-0">
            <span>
              {isLoading
                ? 'Searching catalog...'
                : `Matches (${results.length})`}
            </span>
            <span className="text-stone-400 font-normal">Press Enter to view all</span>
          </div>

          {/* Content */}
          <div className="overflow-y-auto divide-y divide-stone-100 flex-1">
            {isLoading ? (
              <div className="p-6 text-center text-xs text-stone-500 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 text-[#C0654B] animate-spin" />
                <span>Fetching products for "{query}"...</span>
              </div>
            ) : results.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-xs font-semibold text-stone-700">
                  No products found for "{query}"
                </p>
                <p className="text-[11px] text-stone-400 mt-1">
                  Try checking spelling or search for general terms like "saree", "kurta", or "dress".
                </p>
              </div>
            ) : (
              results.map((p) => {
                const mainImage =
                  p.colors?.[0]?.images?.[0] ||
                  'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=200&q=80';
                const img = getOptimizedImageUrl(mainImage, { width: 120, quality: 75 });
                const price = p.discountPrice || p.basePrice;

                return (
                  <div
                    key={p.id}
                    onClick={() => handleSelectProduct(p.id)}
                    className="flex items-center gap-3 p-3 hover:bg-[#F3E9E4]/60 cursor-pointer transition-colors group min-h-[52px]"
                  >
                    <img
                      src={img}
                      alt={p.name}
                      className="w-10 h-12 object-cover object-top rounded-lg bg-stone-100 shrink-0 border border-stone-200/60"
                      loading="lazy"
                    />
                    <div className="flex-1 overflow-hidden min-w-0">
                      <p className="text-xs font-bold text-stone-900 group-hover:text-[#C0654B] transition-colors truncate">
                        {p.name}
                      </p>
                      <p className="text-[10px] text-stone-500 truncate">
                        {p.brandName || 'PGmart'} • {p.fabric || 'Ethic Wear'}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-extrabold text-[#C0654B]">
                          ₹{price.toLocaleString('en-IN')}
                        </span>
                        {p.discountPrice && (
                          <span className="text-[10px] text-stone-400 line-through">
                            ₹{p.basePrice.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer View All Link */}
          {!isLoading && results.length > 0 && (
            <button
              onClick={handleSubmit}
              className="px-3 py-2.5 bg-stone-50 hover:bg-[#F3E9E4] text-[#C0654B] text-xs font-bold flex items-center justify-between border-t border-stone-100 transition-colors w-full cursor-pointer shrink-0"
            >
              <span>View all matching products for "{query}"</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
