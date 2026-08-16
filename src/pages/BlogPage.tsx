import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { initialBlogPosts, BlogPost } from '../data/blogPosts';
import { Sparkles, Calendar, Clock, ArrowRight, User, Filter, BookOpen } from 'lucide-react';
import { motion } from 'motion/react';

interface BlogPageProps {
  onNavigate: (path: string) => void;
}

export const BlogPage: React.FC<BlogPageProps> = ({ onNavigate }) => {
  const { blogPosts } = useStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [visibleCount, setVisibleCount] = useState<number>(6);

  const activePosts = (blogPosts && blogPosts.length > 0) 
    ? blogPosts.filter(p => p.isPublished !== false) 
    : initialBlogPosts;

  const categories = ['All', 'Our Story', 'Styling Tips', 'Behind the Brand', 'Fabric Guide', 'Seasonal Edit'];

  const filteredPosts = selectedCategory === 'All'
    ? activePosts
    : activePosts.filter(p => p.category === selectedCategory);

  const displayedPosts = filteredPosts.slice(0, visibleCount);

  const featuredPost = activePosts[0] || initialBlogPosts[0];

  return (
    <div className="min-h-screen bg-[#FAF7F5] font-sans text-left">
      {/* 1. HERO HEADER */}
      <section className="bg-[#2B2620] text-white py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden border-b border-stone-800">
        <div className="absolute inset-0 bg-gradient-to-r from-[#C0654B]/20 via-transparent to-stone-900/40 pointer-events-none" />
        <div className="max-w-7xl mx-auto space-y-4 relative z-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 bg-[#C0654B]/20 text-[#C0654B] border border-[#C0654B]/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            <span>FASHION & HERITAGE INSIGHTS</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold font-serif tracking-wide leading-tight text-stone-100">
            The PGmart Journal
          </h1>
          <p className="text-xs sm:text-sm text-stone-300 max-w-2xl leading-relaxed">
            Discover expert styling guides, artisanal handloom stories, fabric care tips, and contemporary Indian fashion trends curated by master craftsmen and stylists.
          </p>
        </div>
      </section>

      {/* MAIN CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        
        {/* 2. CATEGORY FILTER CHIPS */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 border-b border-stone-200">
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5 shrink-0 mr-2">
            <Filter className="w-3.5 h-3.5 text-[#C0654B]" /> Filter By:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                selectedCategory === cat
                  ? 'bg-[#C0654B] text-white border-[#C0654B] shadow-md'
                  : 'bg-white text-stone-700 border-stone-300 hover:border-[#C0654B] hover:text-[#C0654B]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 3. FEATURED POST BANNER (Shown when 'All' category is selected) */}
        {selectedCategory === 'All' && featuredPost && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-3xl overflow-hidden shadow-xl border border-stone-200/80 grid grid-cols-1 lg:grid-cols-12 gap-0 group cursor-pointer"
            onClick={() => onNavigate(`/blog/${featuredPost.slug}`)}
          >
            <div className="lg:col-span-7 relative overflow-hidden aspect-16/10 sm:aspect-16/9 lg:aspect-auto">
              <img
                src={featuredPost.featuredImage}
                alt={featuredPost.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-4 left-4 bg-[#C0654B] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                Featured Article
              </span>
            </div>

            <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-[11px] text-stone-500 font-medium">
                  <span className="bg-[#F3E9E4] text-[#C0654B] font-bold px-2.5 py-0.5 rounded-full text-[10px]">
                    {featuredPost.category}
                  </span>
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-stone-400" /> {featuredPost.publishedDate}</span>
                </div>
                
                <h2 className="text-xl sm:text-2xl font-bold font-serif text-stone-900 group-hover:text-[#C0654B] transition-colors leading-snug">
                  {featuredPost.title}
                </h2>

                <p className="text-stone-600 text-xs sm:text-sm line-clamp-3 leading-relaxed">
                  {featuredPost.excerpt}
                </p>
              </div>

              <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img
                    src={featuredPost.authorAvatar}
                    alt={featuredPost.author}
                    className="w-8 h-8 rounded-full object-cover border border-stone-300"
                  />
                  <div>
                    <p className="font-bold text-xs text-stone-900">{featuredPost.author}</p>
                    <p className="text-[10px] text-stone-500">{featuredPost.authorRole}</p>
                  </div>
                </div>

                <span className="text-[#C0654B] font-bold text-xs flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Read Article</span>
                  <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* 4. POSTS GRID (2 Cols Mobile, 3 Cols Desktop) */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold font-serif text-stone-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#C0654B]" />
              <span>{selectedCategory === 'All' ? 'Latest Stories & Guides' : `${selectedCategory} Articles`}</span>
            </h2>
            <span className="text-xs text-stone-500 font-mono">{filteredPosts.length} Articles</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedPosts.map((post, idx) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: idx * 0.05 }}
                onClick={() => onNavigate(`/blog/${post.slug}`)}
                className="bg-white rounded-2xl overflow-hidden border border-stone-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group cursor-pointer"
              >
                {/* Image Container */}
                <div className="relative overflow-hidden aspect-16/10 bg-stone-100">
                  <img
                    src={post.featuredImage}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 bg-[#2B2620]/90 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    {post.category}
                  </span>
                </div>

                {/* Content Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 text-[10px] text-stone-500 font-mono">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-stone-400" /> {post.publishedDate}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-stone-400" /> {post.readTime}</span>
                    </div>

                    <h3 className="font-bold text-stone-900 font-serif text-base leading-snug group-hover:text-[#C0654B] transition-colors line-clamp-2">
                      {post.title}
                    </h3>

                    <p className="text-stone-600 text-xs line-clamp-2 leading-relaxed">
                      {post.excerpt}
                    </p>
                  </div>

                  {/* Card Footer */}
                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <img
                        src={post.authorAvatar}
                        alt={post.author}
                        className="w-6 h-6 rounded-full object-cover border border-stone-200"
                      />
                      <span className="font-semibold text-stone-700 text-[11px]">{post.author}</span>
                    </div>

                    <span className="text-[#C0654B] font-bold text-[11px] group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                      <span>Read</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* 5. LOAD MORE CONTROL */}
        {visibleCount < filteredPosts.length && (
          <div className="text-center pt-6">
            <button
              onClick={() => setVisibleCount(prev => prev + 3)}
              className="bg-[#2B2620] hover:bg-[#C0654B] text-white font-bold text-xs px-8 py-3 rounded-full transition-colors shadow-md cursor-pointer inline-flex items-center gap-2"
            >
              <span>Load More Stories</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
