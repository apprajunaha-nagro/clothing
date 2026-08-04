import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  Star, MessageSquare, Check, Trash2, X, AlertTriangle, Edit2, 
  Eye, FileText, Globe, CheckCircle 
} from 'lucide-react';

interface StaticPage {
  id: string;
  title: string;
  slug: string;
  lastUpdated: string;
  content: string;
}

export const AdminReviewsView: React.FC = () => {
  const { products, showToast } = useStore();

  const [activeSubTab, setActiveSubTab] = useState<'reviews' | 'static_pages'>('reviews');

  // 1. REVIEWS MODERATION STATES (Simulated database logs)
  const [reviews, setReviews] = useState([
    {
      id: 'rev-1',
      productName: 'Banarasi Silk Brocade Saree',
      productId: 'p1',
      author: 'Aishwarya Roy',
      rating: 5,
      date: '2026-08-01',
      comment: 'Absolutely gorgeous saree! The gold zari work is extremely fine and matches the photo perfectly. Delivery was super fast within Kolkata.',
      status: 'pending'
    },
    {
      id: 'rev-2',
      productName: 'Earthy Clay Cotton Kurta Set',
      productId: 'p2',
      author: 'Vikram Seth',
      rating: 4,
      date: '2026-07-29',
      comment: 'Good fabric quality, feels genuine. Fits nicely on shoulders, though sleeves are slightly long. Overall very content.',
      status: 'approved'
    },
    {
      id: 'rev-3',
      productName: 'Traditional Boys Sherwani Set',
      productId: 'p4',
      author: 'Neeta Lulla',
      rating: 2,
      date: '2026-07-26',
      comment: 'Material is good but sizing runs very small. Had to exchange it, but customer care responded quickly.',
      status: 'pending'
    }
  ]);

  // 2. STATIC PAGES STATES (Rich Text Editor)
  const [staticPages, setStaticPages] = useState<StaticPage[]>([
    {
      id: 'sp-1',
      title: 'About Terra Ethnic Brand Story',
      slug: 'about-us',
      lastUpdated: '2026-05-15',
      content: `Welcome to Terra Ethnic (PGmart). We curate and celebrate traditional Indian handloom textile arts. 

Our clothing has a fixed structure of Men, Women, Kids, and Undergarments, handcrafted by master weavers in Bengal and Banaras. We combine raw earth colors, organic fibers, and premium contemporary silhouettes for everyday elegance.`
    },
    {
      id: 'sp-2',
      title: 'Sizing Guidelines Chart (Standard)',
      slug: 'sizing-chart',
      lastUpdated: '2026-06-20',
      content: `Our size matrix fits standard Indian apparel guidelines:
- Size S (36): Chest 36 inches, Waist 30 inches, Shoulders 14.5"
- Size M (38): Chest 38 inches, Waist 32 inches, Shoulders 15"
- Size L (40): Chest 40 inches, Waist 34 inches, Shoulders 15.5"
- Size XL (42): Chest 42 inches, Waist 36 inches, Shoulders 16"`
    },
    {
      id: 'sp-3',
      title: 'Refund & Returns Policy',
      slug: 'refund-policy',
      lastUpdated: '2026-07-01',
      content: `We accept exchange claims within 7 days of delivery for standard sizes. 
Items must be unworn, with all handloom tags attached. Return courier pick-ups are handled by Delhivery. In case of refunds, amount is directly credited back to source UPI/Bank account within 48 business hours.`
    }
  ]);

  const [editingPage, setEditingPage] = useState<StaticPage | null>(null);
  const [pageTitle, setPageTitle] = useState('');
  const [pageContent, setPageContent] = useState('');

  // REVIEWS LOGIC
  const handleApproveReview = (id: string) => {
    setReviews(prev => prev.map(r => r.id === id ? { ...r, status: 'approved' } : r));
    showToast('Review approved and displayed live on product detail card!');
  };

  const handleRejectReview = (id: string) => {
    setReviews(prev => prev.filter(r => r.id !== id));
    showToast('Review rejected and deleted.');
  };

  // STATIC PAGES LOGIC
  const handleOpenEditPage = (page: StaticPage) => {
    setEditingPage(page);
    setPageTitle(page.title);
    setPageContent(page.content);
  };

  const handleSavePage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPage) return;

    const updated: StaticPage = {
      ...editingPage,
      title: pageTitle,
      content: pageContent,
      lastUpdated: new Date().toISOString().split('T')[0]
    };

    setStaticPages(prev => prev.map(p => p.id === editingPage.id ? updated : p));
    setEditingPage(null);
    showToast(`Static Page "${pageTitle}" published successfully.`);
  };

  return (
    <div className="space-y-6 text-stone-800 animate-fade-in text-left">
      
      {/* HEADER SECTION WITH MINI TAB TOGGLE */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold font-serif text-stone-900">Reviews & Static Page Editor</h2>
          <p className="text-xs text-stone-400">Moderate product critiques and edit storefront informative policy cards</p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-stone-100 p-1 rounded-xl text-xs font-bold">
          <button
            onClick={() => { setActiveSubTab('reviews'); setEditingPage(null); }}
            className={`px-4 py-2 rounded-lg cursor-pointer transition-all ${
              activeSubTab === 'reviews' ? 'bg-[#C0654B] text-white shadow-sm' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Buyer Reviews ({reviews.filter(r => r.status === 'pending').length} pending)
          </button>
          <button
            onClick={() => setActiveSubTab('static_pages')}
            className={`px-4 py-2 rounded-lg cursor-pointer transition-all ${
              activeSubTab === 'static_pages' ? 'bg-[#C0654B] text-white shadow-sm' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Informative Pages ({staticPages.length})
          </button>
        </div>
      </div>

      {/* SUB-VIEW 1: REVIEWS MODERATION */}
      {activeSubTab === 'reviews' && (
        <div className="space-y-4">
          <div className="bg-amber-50 p-3.5 rounded-2xl border border-amber-200/40 text-xs text-amber-900 leading-relaxed flex items-start gap-2 font-medium">
            <AlertTriangle className="w-4.5 h-4.5 text-[#C0654B] shrink-0" />
            <span>Incoming reviews from storefront are quarantined automatically. They only build overall star-rating and show up publicly after admin manual validation.</span>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden divide-y divide-stone-100">
            {reviews.length === 0 ? (
              <div className="p-12 text-center text-stone-400">All buyer reviews moderated. Great job!</div>
            ) : (
              reviews.map(rev => (
                <div key={rev.id} className={`p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors ${
                  rev.status === 'pending' ? 'bg-[#C0654B]/5' : 'bg-white'
                }`}>
                  <div className="space-y-2 text-xs font-semibold text-stone-700 text-left flex-1">
                    {/* Rating stars & product name */}
                    <div className="flex items-center gap-2">
                      <div className="flex text-amber-500">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-current' : 'text-stone-200'}`} />
                        ))}
                      </div>
                      <span className="text-stone-400 font-medium">|</span>
                      <span className="font-bold text-stone-900 text-[11px]">{rev.productName}</span>
                    </div>

                    {/* Comment text */}
                    <p className="text-stone-700 italic font-medium leading-relaxed">"{rev.comment}"</p>

                    {/* Author and Date metadata */}
                    <div className="flex items-center gap-3 text-[10px] text-stone-400 font-medium font-mono uppercase">
                      <span>By: {rev.author}</span>
                      <span>•</span>
                      <span>Date: {rev.date}</span>
                    </div>
                  </div>

                  {/* Approve / Reject Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {rev.status === 'pending' ? (
                      <>
                        <button
                          onClick={() => handleApproveReview(rev.id)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-1 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button
                          onClick={() => handleRejectReview(rev.id)}
                          className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-xl cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> Published Live
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: STATIC PAGES EDITOR */}
      {activeSubTab === 'static_pages' && !editingPage && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {staticPages.map(page => (
            <div key={page.id} className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm text-left flex flex-col justify-between space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#C0654B]" />
                  <h4 className="font-extrabold text-stone-900 text-xs truncate">{page.title}</h4>
                </div>
                <p className="text-[10px] text-stone-400 font-mono">Slug route: /{page.slug}</p>
                <p className="text-[11px] text-stone-500 font-medium leading-relaxed line-clamp-3">
                  {page.content}
                </p>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-stone-100 text-[10px] text-stone-400 font-medium">
                <span>Updated: {page.lastUpdated}</span>
                <button
                  onClick={() => handleOpenEditPage(page)}
                  className="px-3.5 py-1.5 border border-[#C0654B] hover:bg-[#C0654B]/5 text-[#C0654B] font-bold rounded-lg cursor-pointer flex items-center gap-1"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit Page Content
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* STATIC PAGE EDITOR DRAWER */}
      {activeSubTab === 'static_pages' && editingPage && (
        <form onSubmit={handleSavePage} className="bg-white rounded-2xl border border-stone-200 p-6 shadow-md space-y-5 text-xs font-semibold text-stone-700 text-left animate-in fade-in zoom-in-95">
          <div className="flex justify-between items-center border-b border-stone-100 pb-3">
            <div>
              <span className="text-[10px] font-mono text-stone-400 font-bold uppercase block">Static Content Writer</span>
              <h3 className="text-sm font-bold font-serif text-stone-900">Edit "{editingPage.title}"</h3>
            </div>
            <button type="button" onClick={() => setEditingPage(null)} className="text-stone-400 hover:text-stone-700">✕</button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block font-bold text-stone-700 mb-1">Headline/Page Title</label>
              <input
                type="text"
                required
                value={pageTitle}
                onChange={(e) => setPageTitle(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-xl outline-none focus:border-[#C0654B] text-xs font-bold text-stone-900"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">HTML Markdown Page Content</label>
              <textarea
                required
                value={pageContent}
                onChange={(e) => setPageContent(e.target.value)}
                rows={10}
                className="w-full p-4 bg-stone-50 border border-stone-300 rounded-2xl font-mono text-xs leading-relaxed outline-none focus:bg-white focus:border-[#C0654B]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-stone-100 pt-4">
            <button
              type="button"
              onClick={() => setEditingPage(null)}
              className="px-4 py-2 bg-stone-100 text-stone-700 font-bold rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#C0654B] hover:bg-[#8B4A38] text-white font-bold rounded-xl cursor-pointer shadow-sm flex items-center gap-1"
            >
              <Globe className="w-4 h-4" /> Publish Content Site-Wide
            </button>
          </div>
        </form>
      )}

    </div>
  );
};
