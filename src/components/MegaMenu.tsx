import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Sparkles, Flame, Tag, ChevronRight, ChevronDown, Award, MapPin, Gift, Crown } from 'lucide-react';
import { getOptimizedImageUrl } from '../utils/imageOptimizer';

interface MegaMenuProps {
  onNavigate: (path: string) => void;
}

export const MegaMenu: React.FC<MegaMenuProps> = ({ onNavigate }) => {
  const { categories } = useStore();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const occasions = [
    { name: 'Ethnic & Festive', slug: 'Ethnic Wear', icon: '✨' },
    { name: 'Party & Evening', slug: 'Party Wear', icon: '💃' },
    { name: 'Work & Formals', slug: 'Work Wear', icon: '💼' },
    { name: 'Active & Loungewear', slug: 'Active & Loungewear', icon: '🧘' },
    { name: 'Wedding Collection', slug: 'Wedding Wear', icon: '💍' },
    { name: 'Winter Essentials', slug: 'Winter Wear', icon: '❄️' },
  ];

  const kidsAgeBands = [
    { label: 'Infant (0–12 M)', slug: 'baby-infant' },
    { label: 'Toddler (1–3 Y)', slug: 'toddler' },
    { label: 'Kids (4–8 Y)', slug: 'kids-4-8' },
    { label: 'Junior (9–14 Y)', slug: 'junior' },
  ];

  return (
    <nav className="relative border-b border-stone-200 bg-white shadow-xs select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12 text-xs font-bold tracking-wider uppercase">
          {/* Main Category Nav Links (Pantaloons Style) */}
          <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto no-scrollbar py-0.5">
            {categories.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <div
                  key={cat.id}
                  className="nav-category-item group static inline-block py-1"
                  onMouseEnter={() => setActiveCategory(cat.id)}
                  onMouseLeave={() => setActiveCategory(null)}
                >
                  <button
                    onClick={() => onNavigate(`/category/${cat.slug}`)}
                    className={`relative flex items-center gap-1 px-3 py-2 transition-all duration-200 whitespace-nowrap cursor-pointer text-xs font-bold ${
                      isActive
                        ? 'text-[#C0654B] font-extrabold'
                        : 'text-stone-800 hover:text-[#C0654B]'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <ChevronDown className={`w-3.5 h-3.5 text-stone-400 transition-transform duration-200 ${isActive ? 'rotate-180 text-[#C0654B]' : ''}`} />

                    {cat.id === 'undergarments' && (
                      <span className="text-[9px] bg-rose-500 text-white font-extrabold px-1.5 py-0.2 rounded-full uppercase tracking-normal">
                        SOFT
                      </span>
                    )}

                    {cat.id === 'women' && (
                      <span className="text-[9px] bg-emerald-600 text-white font-bold px-1.5 py-0.2 rounded-xs uppercase tracking-normal">
                        NEW
                      </span>
                    )}
                  </button>

                  {/* FULL-WIDTH MEGA MENU CONTAINER */}
                  {cat.subcategories && cat.subcategories.length > 0 && (
                    <div
                      className={`absolute top-full left-0 right-0 w-full bg-white border-t border-b border-stone-200 shadow-2xl z-50 transition-all duration-200 ease-out ${
                        isActive
                          ? 'opacity-100 visible pointer-events-auto translate-y-0'
                          : 'opacity-0 invisible pointer-events-none translate-y-1 group-hover:opacity-100 group-hover:visible group-hover:pointer-events-auto group-hover:translate-y-0'
                      }`}
                    >
                      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-4 gap-8 text-left normal-case tracking-normal">
                        {/* Column 1 & 2: Subcategories & Product Types */}
                        <div className="col-span-2 grid grid-cols-2 gap-6 border-r border-stone-100 pr-6">
                          {(cat.subcategories || []).map((sub) => (
                            <div key={sub.id} className="space-y-2">
                              <button
                                onClick={() => onNavigate(`/category/${cat.slug}?sub=${sub.id}`)}
                                className="font-extrabold text-stone-900 hover:text-[#C0654B] text-xs uppercase tracking-wider block border-b-2 border-[#C0654B]/20 pb-1 w-full text-left cursor-pointer transition-colors"
                              >
                                {sub.name}
                              </button>
                              <ul className="space-y-1.5 text-xs text-stone-600">
                                {(sub.types || []).map((type) => (
                                  <li key={type.id}>
                                    <button
                                      onClick={() => onNavigate(`/category/${cat.slug}?sub=${sub.id}&type=${type.id}`)}
                                      className="hover:text-[#C0654B] hover:translate-x-1 transition-all py-0.5 block w-full text-left cursor-pointer text-stone-700 font-medium"
                                    >
                                      {type.name}
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}

                          <div className="col-span-2 pt-2 border-t border-stone-100">
                            <button
                              onClick={() => onNavigate(`/category/${cat.slug}`)}
                              className="text-xs font-bold text-[#C0654B] hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <span>Explore All {cat.name} Products</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                      {/* Column 3: Shop By Occasion / Smart Rail */}
                      <div className="space-y-3 bg-stone-50/80 p-3.5 rounded-lg border border-stone-100">
                        <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider text-[#C0654B]">
                          <Sparkles className="w-3.5 h-3.5 text-[#C0654B]" />
                          <span>Shop By Occasion</span>
                        </div>
                        <ul className="space-y-1.5 text-xs text-stone-700">
                          {occasions.map((occ) => (
                            <li key={occ.name}>
                              <button
                                onClick={() => onNavigate(`/category/${cat.slug}?occasion=${encodeURIComponent(occ.slug)}`)}
                                className="flex items-center gap-2 hover:text-[#C0654B] transition-colors py-0.5 cursor-pointer w-full text-left font-medium"
                              >
                                <span>{occ.icon}</span>
                                <span>{occ.name}</span>
                              </button>
                            </li>
                          ))}
                        </ul>

                        {cat.id === 'kids' && (
                          <div className="pt-2 border-t border-stone-200">
                            <p className="font-bold text-[10px] uppercase tracking-wider text-stone-500 mb-1">
                              Age Band Filter
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {kidsAgeBands.map((band) => (
                                <button
                                  key={band.label}
                                  onClick={() => onNavigate(`/category/kids?age=${band.slug}`)}
                                  className="text-[10px] bg-white border border-stone-200 hover:border-[#C0654B] hover:text-[#C0654B] text-stone-700 px-2 py-0.5 rounded-xs cursor-pointer font-medium"
                                >
                                  {band.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Column 4: Curated Rails & Featured Offer Banner */}
                      <div className="space-y-3 flex flex-col justify-between">
                        <div className="space-y-2">
                          <span className="font-bold text-xs uppercase tracking-wider text-stone-900 block border-b border-stone-100 pb-1">
                            Highlights
                          </span>
                          <div className="space-y-1.5 text-xs">
                            <button
                              onClick={() => onNavigate(`/category/${cat.slug}?tag=new_arrival`)}
                              className="flex items-center gap-2 text-stone-700 hover:text-[#C0654B] w-full text-left cursor-pointer font-medium"
                            >
                              <Flame className="w-3.5 h-3.5 text-orange-500" />
                              <span>New Arrivals</span>
                            </button>
                            <button
                              onClick={() => onNavigate(`/category/${cat.slug}?tag=bestseller`)}
                              className="flex items-center gap-2 text-stone-700 hover:text-[#C0654B] w-full text-left cursor-pointer font-medium"
                            >
                              <Award className="w-3.5 h-3.5 text-amber-500" />
                              <span>Best Sellers</span>
                            </button>
                            <button
                              onClick={() => onNavigate(`/category/${cat.slug}?tag=curves_plus_size`)}
                              className="flex items-center justify-between text-xs font-bold bg-[#F3E9E4] text-[#C0654B] px-2.5 py-1.5 rounded-md w-full text-left cursor-pointer hover:bg-rose-100 transition-colors"
                            >
                              <span>CURVES (Plus Size)</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Pantaloons Featured Visual Promo Card */}
                        <div
                          className="relative rounded-lg overflow-hidden h-28 group/card cursor-pointer border border-stone-200 shadow-xs"
                          onClick={() => onNavigate(`/category/${cat.slug}`)}
                        >
                          <img
                            src={getOptimizedImageUrl(cat.image, { width: 400, quality: 75 })}
                            alt={cat.name}
                            className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-300"
                            loading="lazy"
                            decoding="async"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-2.5 flex flex-col justify-end text-white">
                            <span className="text-[9px] bg-[#C0654B] text-white font-extrabold px-1.5 py-0.5 rounded-xs w-max uppercase tracking-wider mb-1">
                              FESTIVE SPECIAL
                            </span>
                            <p className="text-xs font-bold leading-tight">{cat.name} Trends</p>
                            <p className="text-[10px] text-stone-200">Flat 40%–60% OFF</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  )}
                </div>
              );
            })}

            {/* Pantaloons Red Hot Sale Tab */}
            <button
              onClick={() => onNavigate('/category/sale?tag=sale')}
              className="px-3 py-1.5 rounded-md text-red-600 font-extrabold bg-red-50 hover:bg-red-100 transition-colors whitespace-nowrap cursor-pointer text-xs flex items-center gap-1.5 border border-red-200/60 shadow-2xs"
            >
              <Flame className="w-3.5 h-3.5 text-red-500 animate-bounce" />
              <span className="tracking-widest">SALE & OFFERS</span>
              <span className="text-[9px] bg-red-600 text-white font-bold px-1.5 py-0.2 rounded-full uppercase ml-0.5">
                HOT
              </span>
            </button>

            {/* Blog Tab */}
            <button
              onClick={() => onNavigate('/blog')}
              className="px-3 py-1.5 rounded-md text-stone-800 hover:text-[#C0654B] hover:bg-stone-50 transition-colors whitespace-nowrap cursor-pointer text-xs font-bold flex items-center gap-1.5"
            >
              <span className="tracking-widest">BLOG</span>
            </button>
          </div>

          {/* Right Utilities */}
          <div className="hidden xl:flex items-center gap-4 text-[11px] text-stone-600 font-medium normal-case tracking-normal">
            <button
              onClick={() => onNavigate('/category/sale?tag=sale')}
              className="hover:text-[#C0654B] font-bold text-[#C0654B] transition-colors cursor-pointer flex items-center gap-1 bg-[#F3E9E4] px-2.5 py-1 rounded-full border border-[#C0654B]/30"
            >
              <Flame className="w-3 h-3 text-[#C0654B]" />
              <span>Special Offers</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

