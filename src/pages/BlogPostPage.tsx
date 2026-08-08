import React, { useState } from 'react';
import { initialBlogPosts, BlogPost } from '../data/blogPosts';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';
import { Calendar, Clock, ArrowLeft, Share2, Check, Instagram, ArrowRight, Bookmark, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface BlogPostPageProps {
  onNavigate: (path: string) => void;
  slug: string;
}

export const BlogPostPage: React.FC<BlogPostPageProps> = ({ onNavigate, slug }) => {
  const { products, showToast } = useStore();
  const [copied, setCopied] = useState(false);

  const post = initialBlogPosts.find(p => p.slug === slug) || initialBlogPosts[0];

  // Related products from store catalog matching post category
  const relatedProducts = products
    .filter(p => p.categoryId === post.relatedCategorySlug || p.subcategoryId.includes(post.relatedCategorySlug))
    .slice(0, 4);

  // Related posts (excluding current post)
  const relatedPosts = initialBlogPosts
    .filter(p => p.id !== post.id)
    .slice(0, 3);

  const pageUrl = window.location.href;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(pageUrl);
    setCopied(true);
    showToast('Article link copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(`Check out this story on PGmart Journal: ${post.title} - ${pageUrl}`)}`;

  return (
    <article className="min-h-screen bg-[#FAF7F5] font-sans text-left pb-16">
      {/* 1. TOP BACK BAR */}
      <div className="bg-stone-900 text-stone-300 py-3 px-4 sm:px-6 lg:px-8 border-b border-stone-800">
        <div className="max-w-4xl mx-auto flex items-center justify-between text-xs">
          <button
            onClick={() => onNavigate('/blog')}
            className="flex items-center gap-2 text-stone-300 hover:text-white font-bold transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#C0654B]" />
            <span>Back to All Articles</span>
          </button>
          <span className="text-stone-500 hidden sm:inline">PGmart Journal • {post.category}</span>
        </div>
      </div>

      {/* 2. ARTICLE HERO SECTION */}
      <header className="bg-white border-b border-stone-200 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-2 text-xs">
            <span className="bg-[#F3E9E4] text-[#C0654B] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
              {post.category}
            </span>
            <span className="text-stone-400">•</span>
            <span className="text-stone-500 font-mono flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-stone-400" /> {post.publishedDate}
            </span>
            <span className="text-stone-400">•</span>
            <span className="text-stone-500 font-mono flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-stone-400" /> {post.readTime}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold font-serif text-stone-900 leading-tight">
            {post.title}
          </h1>

          {/* AUTHOR & SOCIAL SHARE BAR */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-stone-100">
            <div className="flex items-center gap-3">
              <img
                src={post.authorAvatar}
                alt={post.author}
                className="w-11 h-11 rounded-full object-cover border-2 border-[#C0654B]/30"
              />
              <div>
                <p className="font-bold text-stone-900 text-sm">{post.author}</p>
                <p className="text-xs text-stone-500">{post.authorRole}</p>
              </div>
            </div>

            {/* Social Share Icons */}
            <div className="flex items-center gap-2 text-xs font-bold text-stone-700">
              <span className="text-stone-400 text-[11px] uppercase tracking-wider mr-1">Share:</span>
              
              {/* WhatsApp Share */}
              <a
                href={whatsappShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white flex items-center justify-center shadow-xs transition-transform hover:scale-105"
                title="Share on WhatsApp"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.572-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </svg>
              </a>

              {/* Copy Link */}
              <button
                onClick={handleCopyLink}
                className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center transition-colors cursor-pointer"
                title="Copy Link"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 3. FEATURED IMAGE BANNER */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-2 my-8">
        <div className="rounded-3xl overflow-hidden shadow-xl border border-stone-200/80 aspect-16/9 bg-stone-100">
          <img
            src={post.featuredImage}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* 4. BODY CONTENT */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 space-y-6 text-stone-800 leading-relaxed text-sm sm:text-base">
        {post.content.map((paragraph, index) => {
          if (paragraph.startsWith('### ')) {
            return (
              <h2 key={index} className="text-xl sm:text-2xl font-bold font-serif text-stone-900 pt-4 border-t border-stone-200/60 mt-6">
                {paragraph.replace('### ', '')}
              </h2>
            );
          }
          return (
            <p key={index} className="text-stone-700 leading-relaxed font-normal">
              {paragraph}
            </p>
          );
        })}

        {/* Pull Quote Box */}
        <div className="bg-[#F3E9E4]/60 border-l-4 border-[#C0654B] p-6 rounded-r-2xl my-8 space-y-2">
          <p className="font-serif italic text-base sm:text-lg text-stone-900 leading-relaxed">
            "Authentic Indian fashion is a harmony of ancient handloom heritage and contemporary functional ease."
          </p>
          <p className="text-xs font-bold text-[#C0654B] uppercase tracking-wider">— PGmart Curators</p>
        </div>

        {/* Tags */}
        <div className="pt-6 border-t border-stone-200 flex flex-wrap gap-2 items-center text-xs">
          <span className="font-bold text-stone-500 mr-2">Tags:</span>
          {post.tags.map((tag) => (
            <span key={tag} className="bg-stone-200/70 text-stone-700 font-semibold px-3 py-1 rounded-full">
              #{tag}
            </span>
          ))}
        </div>
      </main>

      {/* 5. RELATED PRODUCTS STRIP */}
      {relatedProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-12 border-t border-stone-200 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-[#C0654B] uppercase tracking-widest">SHOP THE STORY</span>
              <h2 className="text-xl sm:text-2xl font-bold font-serif text-stone-900">Featured In This Guide</h2>
            </div>
            <button
              onClick={() => onNavigate(`/category/${post.relatedCategorySlug}`)}
              className="text-[#C0654B] font-bold text-xs hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View All Collection</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {relatedProducts.map((product) => (
              <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
            ))}
          </div>
        </section>
      )}

      {/* 6. RELATED ARTICLES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-12 border-t border-stone-200 space-y-6">
        <h2 className="text-xl sm:text-2xl font-bold font-serif text-stone-900">Related Journal Stories</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {relatedPosts.map((relPost) => (
            <div
              key={relPost.id}
              onClick={() => onNavigate(`/blog/${relPost.slug}`)}
              className="bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-sm hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="aspect-16/10 overflow-hidden bg-stone-100">
                <img
                  src={relPost.featuredImage}
                  alt={relPost.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-[#C0654B] uppercase tracking-wider">
                    {relPost.category}
                  </span>
                  <h3 className="font-serif font-bold text-stone-900 text-sm line-clamp-2 group-hover:text-[#C0654B] transition-colors mt-1">
                    {relPost.title}
                  </h3>
                </div>
                <p className="text-stone-500 text-[11px] font-mono">{relPost.readTime}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </article>
  );
};
