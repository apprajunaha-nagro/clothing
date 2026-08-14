import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  Star, MessageSquare, Check, Trash2, X, AlertTriangle, Edit2, 
  Eye, FileText, Globe, CheckCircle, Plus, Sparkles, ShieldCheck, User, Package
} from 'lucide-react';
import { Review } from '../../types';

interface StaticPage {
  id: string;
  title: string;
  slug: string;
  lastUpdated: string;
  content: string;
}

export const AdminReviewsView: React.FC = () => {
  const { products, reviews, addReview, updateReviewStatus, deleteReview, showToast } = useStore();

  const [activeSubTab, setActiveSubTab] = useState<'reviews' | 'static_pages'>('reviews');
  const [filterStatus, setFilterStatus] = useState<'all' | 'approved' | 'pending'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State for creating a new review as admin
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newProductId, setNewProductId] = useState(products[0]?.id || 'w-1');
  const [newRating, setNewRating] = useState<number>(5);
  const [newTitle, setNewTitle] = useState('');
  const [newComment, setNewComment] = useState('');
  const [newIsVerified, setNewIsVerified] = useState(true);
  const [newStatus, setNewStatus] = useState<'approved' | 'pending'>('approved');

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

  // Handle create review submit
  const handleCreateReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerName.trim() || !newComment.trim()) {
      showToast('Please enter customer name and review comment');
      return;
    }

    addReview({
      productId: newProductId,
      customerName: newCustomerName.trim(),
      rating: newRating,
      title: newTitle.trim() || `${newRating} Star Experience`,
      comment: newComment.trim(),
      isVerifiedPurchase: newIsVerified,
      status: newStatus
    });

    // Reset form
    setNewCustomerName('');
    setNewTitle('');
    setNewComment('');
    setNewRating(5);
    setIsAddModalOpen(false);
  };

  const filteredReviews = reviews.filter(r => {
    if (filterStatus === 'all') return true;
    return r.status === filterStatus;
  });

  const approvedCount = reviews.filter(r => r.status === 'approved').length;
  const pendingCount = reviews.filter(r => r.status === 'pending').length;

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
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-stone-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold font-serif text-stone-900">Reviews & Homepage Testimonials</h2>
          <p className="text-xs text-stone-400">Post verified testimonials and moderate customer critiques (displayed live in Homepage Animated Strip)</p>
        </div>

        {/* Tab switcher */}
        <div className="flex flex-wrap bg-stone-100 p-1 rounded-xl text-xs font-bold w-full sm:w-auto">
          <button
            onClick={() => { setActiveSubTab('reviews'); setEditingPage(null); }}
            className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2 rounded-lg cursor-pointer transition-all ${
              activeSubTab === 'reviews' ? 'bg-[#C0654B] text-white shadow-sm' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Buyer Reviews ({reviews.length})
          </button>
          <button
            onClick={() => setActiveSubTab('static_pages')}
            className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2 rounded-lg cursor-pointer transition-all ${
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
          
          {/* Action and Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold w-full sm:w-auto">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
                  filterStatus === 'all' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                All ({reviews.length})
              </button>
              <button
                onClick={() => setFilterStatus('approved')}
                className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
                  filterStatus === 'approved' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                Approved & Live on Homepage ({approvedCount})
              </button>
              <button
                onClick={() => setFilterStatus('pending')}
                className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
                  filterStatus === 'pending' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                }`}
              >
                Pending ({pendingCount})
              </button>
            </div>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="w-full sm:w-auto px-4 py-2.5 bg-[#C0654B] hover:bg-[#8B4A38] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>+ Post Customer Review</span>
            </button>
          </div>

          <div className="bg-amber-50 p-3.5 rounded-2xl border border-amber-200/40 text-xs text-amber-900 leading-relaxed flex items-start gap-2 font-medium">
            <Sparkles className="w-4.5 h-4.5 text-[#C0654B] shrink-0 mt-0.5" />
            <span>All <strong>Approved</strong> reviews are dynamically streamed to the homepage in an animated right-to-left moving ticker just above the "Our Story" section!</span>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden divide-y divide-stone-100 shadow-xs">
            {filteredReviews.length === 0 ? (
              <div className="p-12 text-center text-stone-400 text-xs">
                No reviews found matching filter. Click <strong>"+ Post Customer Review"</strong> to create your first live customer review.
              </div>
            ) : (
              filteredReviews.map(rev => {
                const prod = products.find(p => p.id === rev.productId);
                return (
                  <div key={rev.id} className={`p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors ${
                    rev.status === 'pending' ? 'bg-[#C0654B]/5' : 'bg-white'
                  }`}>
                    <div className="space-y-2 text-xs font-semibold text-stone-700 text-left flex-1 w-full">
                      {/* Rating stars & product name */}
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="flex text-amber-500">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-current text-amber-400' : 'text-stone-200'}`} />
                          ))}
                        </div>
                        <span className="text-stone-400 font-medium">|</span>
                        <span className="font-bold text-stone-900 text-xs flex items-center gap-1.5">
                          <Package className="w-3.5 h-3.5 text-[#C0654B]" />
                          <span>{prod?.name || 'Handcrafted Apparel'}</span>
                        </span>
                        {rev.isVerifiedPurchase && (
                          <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" /> Verified Buyer
                          </span>
                        )}
                      </div>

                      {/* Title & Comment text */}
                      {rev.title && <h4 className="font-bold text-stone-900 text-xs">{rev.title}</h4>}
                      <p className="text-stone-700 italic font-medium leading-relaxed bg-stone-50/60 p-2.5 rounded-xl border border-stone-100">
                        "{rev.comment}"
                      </p>

                      {/* Author and Date metadata */}
                      <div className="flex flex-wrap items-center gap-3 text-[10px] text-stone-400 font-medium font-mono uppercase">
                        <span className="flex items-center gap-1 text-stone-700 font-bold">
                          <User className="w-3 h-3 text-stone-400" /> {rev.customerName}
                        </span>
                        <span>•</span>
                        <span>{new Date(rev.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        <span>•</span>
                        <span className={`font-bold ${rev.status === 'approved' ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {rev.status.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Approve / Reject Actions */}
                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      {rev.status === 'pending' ? (
                        <button
                          onClick={() => updateReviewStatus(rev.id, 'approved')}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer shadow-xs"
                        >
                          <Check className="w-3.5 h-3.5" /> Approve & Show on Homepage
                        </button>
                      ) : (
                        <button
                          onClick={() => updateReviewStatus(rev.id, 'pending')}
                          className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-[11px] font-bold rounded-xl cursor-pointer"
                          title="Move to pending"
                        >
                          Unpublish
                        </button>
                      )}
                      <button
                        onClick={() => deleteReview(rev.id)}
                        className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-xl cursor-pointer transition-colors"
                        title="Delete Review"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* POST NEW REVIEW MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200 p-4 sm:p-6 space-y-4 animate-scale-in text-left">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#C0654B]/10 flex items-center justify-center text-[#C0654B]">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-serif text-stone-900">Post Customer Review</h3>
                  <p className="text-[10px] text-stone-400">Add testimonial to be featured in Homepage Animated Marquee</p>
                </div>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-stone-400 hover:text-stone-800 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReview} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Customer Name *</label>
                  <input
                    type="text"
                    required
                    value={newCustomerName}
                    onChange={(e) => setNewCustomerName(e.target.value)}
                    placeholder="e.g. Radhika Sharma"
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl outline-none focus:border-[#C0654B]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Select Product *</label>
                  <select
                    value={newProductId}
                    onChange={(e) => setNewProductId(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl outline-none focus:border-[#C0654B] bg-white font-medium text-xs"
                  >
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Star Rating (1 to 5 Stars)</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      className="p-1 cursor-pointer transition-transform hover:scale-110"
                    >
                      <Star className={`w-6 h-6 ${star <= newRating ? 'fill-amber-400 text-amber-400' : 'text-stone-200'}`} />
                    </button>
                  ))}
                  <span className="ml-2 font-bold text-stone-700 text-sm font-mono">{newRating} / 5 Stars</span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Review Headline / Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Breathtaking quality & perfect fitting!"
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl outline-none focus:border-[#C0654B]"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Review Testimonial *</label>
                <textarea
                  required
                  rows={3}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share customer's genuine feedback and experience with the fabric, fitting, or delivery..."
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl outline-none focus:border-[#C0654B]"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 bg-stone-50 p-3 rounded-xl border border-stone-200">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newIsVerified}
                    onChange={(e) => setNewIsVerified(e.target.checked)}
                    className="accent-[#C0654B] w-4 h-4"
                  />
                  <span className="font-bold text-stone-800 text-xs">Mark as Verified Buyer</span>
                </label>

                <div className="flex items-center gap-2">
                  <span className="font-bold text-stone-600">Status:</span>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as 'approved' | 'pending')}
                    className="px-2.5 py-1 bg-white border border-stone-300 rounded-lg text-xs font-bold"
                  >
                    <option value="approved">Approved & Live</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="w-full sm:w-auto px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2.5 bg-[#C0654B] hover:bg-[#8B4A38] text-white font-bold rounded-xl cursor-pointer shadow-md"
                >
                  Post Review Live
                </button>
              </div>
            </form>
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
