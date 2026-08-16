import React, { useState, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  BookOpen, Plus, Pencil, Trash2, Eye, EyeOff, Search,
  X, Check, ChevronDown, Calendar, Clock, User, Tag,
  Save, ArrowLeft, ExternalLink, Image as ImageIcon, FileText
} from 'lucide-react';
import { BlogPost } from '../../types';

// ─── Types ─────────────────────────────────────────────────────────────────────
type BlogStatus = 'published' | 'draft';

interface ManagedPost extends BlogPost {
  status: BlogStatus;
}

const CATEGORIES: string[] = [
  'Styling Tips', 'Behind the Brand', 'Fabric Guide', 'Seasonal Edit', 'Our Story'
];

const emptyPost = (): Omit<ManagedPost, 'id'> => ({
  slug: '',
  title: '',
  excerpt: '',
  content: [''],
  category: 'Styling Tips',
  author: 'Priyam Ghoshal',
  authorRole: 'Founder & CEO, PGmart',
  authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  publishedDate: new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }),
  readTime: '4 min read',
  featuredImage: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80',
  relatedCategorySlug: 'women',
  tags: [],
  status: 'draft',
  isPublished: false
});

// ─── Helpers ────────────────────────────────────────────────────────────────────
const slugify = (str: string) =>
  str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// ─── Sub-components ─────────────────────────────────────────────────────────────

/** Badge chip for status */
const StatusBadge: React.FC<{ status: BlogStatus }> = ({ status }) => (
  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
    status === 'published'
      ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
      : 'bg-amber-100 text-amber-700 border border-amber-200'
  }`}>
    {status === 'published' ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
    {status}
  </span>
);

// ─── Main Component ─────────────────────────────────────────────────────────────
export const AdminBlogView: React.FC = () => {
  const { blogPosts, saveBlogPost, deleteBlogPost, toggleBlogPostStatus, showToast: globalToast } = useStore();

  const posts: ManagedPost[] = (blogPosts || []).map(p => ({
    ...p,
    status: p.isPublished !== false ? 'published' : 'draft'
  }));

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');

  // Editor state
  type EditorMode = 'list' | 'create' | 'edit' | 'preview';
  const [mode, setMode] = useState<EditorMode>('list');
  const [editingPost, setEditingPost] = useState<ManagedPost | null>(null);
  const [draft, setDraft] = useState<Omit<ManagedPost, 'id'>>(emptyPost());
  const [tagInput, setTagInput] = useState('');
  const [contentLines, setContentLines] = useState<string[]>(['']);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const tagInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    if (globalToast) globalToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // ── Filtering ────────────────────────────────────────────────────────────────
  const filteredPosts = posts.filter(p => {
    const matchesSearch = searchQuery === '' ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.tags && p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));
    const matchesCat = filterCategory === 'All' || p.category === filterCategory;
    const matchesStatus = filterStatus === 'All' || p.status === filterStatus;
    return matchesSearch && matchesCat && matchesStatus;
  });

  // ── Actions ──────────────────────────────────────────────────────────────────
  const openCreate = () => {
    setDraft(emptyPost());
    setContentLines(['']);
    setTagInput('');
    setEditingPost(null);
    setMode('create');
  };

  const openEdit = (post: ManagedPost) => {
    setEditingPost(post);
    setDraft({ ...post });
    setContentLines(post.content && post.content.length > 0 ? [...post.content] : ['']);
    setTagInput('');
    setMode('edit');
  };

  const openPreview = (post: ManagedPost) => {
    setEditingPost(post);
    setMode('preview');
  };

  const handleSave = async () => {
    const finalSlug = draft.slug.trim() || slugify(draft.title);
    const isPub = draft.status === 'published';
    const payload = {
      ...draft,
      id: editingPost?.id,
      slug: finalSlug,
      content: contentLines.filter(l => l.trim() !== ''),
      isPublished: isPub,
      status: draft.status
    };

    const saved = await saveBlogPost(payload);
    if (saved) {
      showToast(`"${saved.title}" saved successfully to database & live storefront!`);
    } else {
      showToast(`"${draft.title}" saved!`);
    }
    setMode('list');
  };

  const handleDelete = async (id: string) => {
    const post = posts.find(p => p.id === id);
    await deleteBlogPost(id);
    setDeleteConfirmId(null);
    showToast(`"${post?.title || 'Post'}" deleted from database.`);
  };

  const toggleStatus = async (id: string) => {
    const post = posts.find(p => p.id === id);
    if (!post) return;
    const nextStatus = post.status === 'published' ? 'draft' : 'published';
    await toggleBlogPostStatus(id);
    showToast(`"${post.title}" set to ${nextStatus}.`);
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !draft.tags.includes(t)) {
      setDraft(prev => ({ ...prev, tags: [...prev.tags, t] }));
    }
    setTagInput('');
    tagInputRef.current?.focus();
  };

  const removeTag = (tag: string) =>
    setDraft(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));

  const addContentLine = () => setContentLines(prev => [...prev, '']);
  const updateContentLine = (idx: number, val: string) =>
    setContentLines(prev => prev.map((l, i) => i === idx ? val : l));
  const removeContentLine = (idx: number) =>
    setContentLines(prev => prev.filter((_, i) => i !== idx));

  // ── PREVIEW MODE ─────────────────────────────────────────────────────────────
  if (mode === 'preview' && editingPost) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMode('list')}
            className="flex items-center gap-2 text-stone-600 hover:text-[#C0654B] font-bold text-sm transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog Manager
          </button>
          <span className="text-stone-300">|</span>
          <StatusBadge status={editingPost.status} />
        </div>

        <div className="bg-white rounded-2xl border border-stone-200 shadow overflow-hidden">
          <div className="aspect-video overflow-hidden bg-stone-100">
            <img src={editingPost.featuredImage} alt={editingPost.title} className="w-full h-full object-cover" />
          </div>
          <div className="p-8 max-w-3xl space-y-4">
            <span className="text-xs font-bold text-[#C0654B] uppercase tracking-wider bg-[#F3E9E4] px-3 py-1 rounded-full">
              {editingPost.category}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-stone-900 leading-tight">
              {editingPost.title}
            </h1>
            <div className="flex items-center gap-4 text-xs text-stone-500 font-mono pb-4 border-b border-stone-100">
              <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> {editingPost.author}</span>
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {editingPost.publishedDate}</span>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {editingPost.readTime}</span>
            </div>
            <p className="text-stone-600 italic text-sm border-l-4 border-[#C0654B] pl-4 py-1 bg-[#F3E9E4]/40 rounded-r-lg">
              {editingPost.excerpt}
            </p>
            <div className="space-y-3">
              {editingPost.content.map((para, i) => para.startsWith('### ') ? (
                <h2 key={i} className="text-lg font-bold font-serif text-stone-900 pt-4">{para.replace('### ', '')}</h2>
              ) : (
                <p key={i} className="text-stone-700 text-sm leading-relaxed">{para}</p>
              ))}
            </div>
            <div className="pt-4 border-t border-stone-100 flex flex-wrap gap-2">
              {editingPost.tags.map(tag => (
                <span key={tag} className="bg-stone-100 text-stone-600 text-xs font-semibold px-3 py-1 rounded-full">#{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── EDITOR MODE (create / edit) ───────────────────────────────────────────────
  if (mode === 'create' || mode === 'edit') {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMode('list')}
              className="flex items-center gap-2 text-stone-600 hover:text-[#C0654B] font-bold text-sm transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Discard & Back
            </button>
            <span className="text-stone-300">|</span>
            <h2 className="text-lg font-extrabold text-stone-900 font-serif">
              {mode === 'create' ? '✍️ Create New Article' : `✏️ Editing: ${editingPost?.title?.slice(0, 40) || ''}...`}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={draft.status}
              onChange={e => setDraft(prev => ({ ...prev, status: e.target.value as BlogStatus }))}
              className="text-xs border border-stone-300 rounded-xl px-3 py-2 font-bold bg-white focus:border-[#C0654B] outline-none cursor-pointer"
            >
              <option value="draft">💾 Save as Draft</option>
              <option value="published">🌐 Publish Now</option>
            </select>
            <button
              onClick={handleSave}
              disabled={!draft.title.trim() || !draft.author.trim()}
              className="flex items-center gap-2 bg-[#C0654B] hover:bg-[#8B4A38] disabled:bg-stone-300 disabled:cursor-not-allowed text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-colors cursor-pointer shadow-sm"
            >
              <Save className="w-4 h-4" />
              Save Article
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* MAIN EDITOR */}
          <div className="lg:col-span-2 space-y-5">
            {/* Title */}
            <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-4">
              <h3 className="text-xs font-black text-stone-500 uppercase tracking-wider">Article Details</h3>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">Title *</label>
                <input
                  type="text"
                  value={draft.title}
                  onChange={e => {
                    setDraft(prev => ({
                      ...prev,
                      title: e.target.value,
                      slug: slugify(e.target.value),
                    }));
                  }}
                  placeholder="Enter article title..."
                  className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm font-bold text-stone-900 focus:border-[#C0654B] focus:ring-2 focus:ring-[#C0654B]/20 outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">URL Slug</label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-stone-400 font-mono">/blog/</span>
                  <input
                    type="text"
                    value={draft.slug}
                    onChange={e => setDraft(prev => ({ ...prev, slug: slugify(e.target.value) }))}
                    placeholder="auto-generated-from-title"
                    className="flex-1 px-4 py-2.5 border border-stone-200 rounded-xl text-xs font-mono text-stone-600 focus:border-[#C0654B] outline-none transition-all bg-stone-50"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">Excerpt / Summary *</label>
                <textarea
                  value={draft.excerpt}
                  onChange={e => setDraft(prev => ({ ...prev, excerpt: e.target.value }))}
                  placeholder="Brief summary shown on blog listing page..."
                  rows={3}
                  className="w-full px-4 py-3 border border-stone-200 rounded-xl text-xs text-stone-700 focus:border-[#C0654B] outline-none transition-all resize-none"
                />
              </div>
            </div>

            {/* Content Editor */}
            <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-stone-500 uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-[#C0654B]" /> Article Body
                </h3>
                <p className="text-[10px] text-stone-400 font-mono">Use "### Heading" to add section headings</p>
              </div>

              <div className="space-y-3">
                {contentLines.map((line, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-[10px] text-stone-400 font-mono mt-2.5 w-5 text-right shrink-0">{idx + 1}</span>
                    <textarea
                      value={line}
                      onChange={e => updateContentLine(idx, e.target.value)}
                      placeholder={idx === 0 ? 'Opening paragraph...' : line.startsWith('###') ? 'Section heading...' : 'Content paragraph...'}
                      rows={2}
                      className={`flex-1 px-3 py-2.5 border rounded-xl text-xs focus:border-[#C0654B] outline-none transition-all resize-none ${
                        line.startsWith('### ')
                          ? 'border-[#C0654B]/40 bg-[#F3E9E4]/30 font-bold text-stone-900'
                          : 'border-stone-200 text-stone-700 bg-white'
                      }`}
                    />
                    {contentLines.length > 1 && (
                      <button
                        onClick={() => removeContentLine(idx)}
                        className="mt-2 text-stone-300 hover:text-red-500 transition-colors cursor-pointer shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-2 border-t border-stone-100">
                <button
                  onClick={addContentLine}
                  className="flex items-center gap-1.5 text-xs font-bold text-[#C0654B] hover:bg-[#F3E9E4] px-3 py-2 rounded-xl transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Paragraph
                </button>
                <button
                  onClick={() => setContentLines(prev => [...prev, '### '])}
                  className="flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:bg-stone-100 px-3 py-2 rounded-xl transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Heading
                </button>
              </div>
            </div>
          </div>

          {/* SIDEBAR META */}
          <div className="space-y-5">
            {/* Featured Image */}
            <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-3">
              <h3 className="text-xs font-black text-stone-500 uppercase tracking-wider flex items-center gap-2">
                <ImageIcon className="w-3.5 h-3.5 text-[#C0654B]" /> Featured Image
              </h3>
              <div className="rounded-xl overflow-hidden aspect-video bg-stone-100 border border-stone-200">
                <img src={draft.featuredImage} alt="Featured" className="w-full h-full object-cover" />
              </div>
              <input
                type="text"
                value={draft.featuredImage}
                onChange={e => setDraft(prev => ({ ...prev, featuredImage: e.target.value }))}
                placeholder="Paste image URL..."
                className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs font-mono text-stone-600 focus:border-[#C0654B] outline-none bg-stone-50"
              />
            </div>

            {/* Category & Meta */}
            <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-4">
              <h3 className="text-xs font-black text-stone-500 uppercase tracking-wider">Categorization</h3>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700">Category</label>
                <div className="relative">
                  <select
                    value={draft.category}
                    onChange={e => setDraft(prev => ({ ...prev, category: e.target.value as BlogPost['category'] }))}
                    className="w-full appearance-none px-3 py-2.5 border border-stone-200 rounded-xl text-xs font-bold text-stone-700 focus:border-[#C0654B] outline-none bg-white cursor-pointer pr-8"
                  >
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-2.5 w-3.5 h-3.5 text-stone-400 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700">Related Category Slug</label>
                <input
                  type="text"
                  value={draft.relatedCategorySlug}
                  onChange={e => setDraft(prev => ({ ...prev, relatedCategorySlug: e.target.value }))}
                  placeholder="e.g. women, men, undergarments"
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs font-mono text-stone-600 focus:border-[#C0654B] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700">Read Time</label>
                  <input
                    type="text"
                    value={draft.readTime}
                    onChange={e => setDraft(prev => ({ ...prev, readTime: e.target.value }))}
                    placeholder="5 min read"
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs text-stone-700 focus:border-[#C0654B] outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700">Publish Date</label>
                  <input
                    type="text"
                    value={draft.publishedDate}
                    onChange={e => setDraft(prev => ({ ...prev, publishedDate: e.target.value }))}
                    placeholder="August 9, 2026"
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs text-stone-700 focus:border-[#C0654B] outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Author */}
            <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-4">
              <h3 className="text-xs font-black text-stone-500 uppercase tracking-wider flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-[#C0654B]" /> Author Info
              </h3>
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700">Name *</label>
                <input
                  type="text"
                  value={draft.author}
                  onChange={e => setDraft(prev => ({ ...prev, author: e.target.value }))}
                  placeholder="Author Name"
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs text-stone-700 focus:border-[#C0654B] outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700">Role / Designation</label>
                <input
                  type="text"
                  value={draft.authorRole}
                  onChange={e => setDraft(prev => ({ ...prev, authorRole: e.target.value }))}
                  placeholder="Head Stylist & Textile Curator"
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs text-stone-700 focus:border-[#C0654B] outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700">Avatar URL</label>
                <input
                  type="text"
                  value={draft.authorAvatar}
                  onChange={e => setDraft(prev => ({ ...prev, authorAvatar: e.target.value }))}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs font-mono text-stone-500 focus:border-[#C0654B] outline-none bg-stone-50"
                />
              </div>
            </div>

            {/* Tags */}
            <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-3">
              <h3 className="text-xs font-black text-stone-500 uppercase tracking-wider flex items-center gap-2">
                <Tag className="w-3.5 h-3.5 text-[#C0654B]" /> Tags
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {draft.tags.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1 bg-stone-100 text-stone-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                    #{tag}
                    <button onClick={() => removeTag(tag)} className="text-stone-400 hover:text-red-500 cursor-pointer">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  ref={tagInputRef}
                  type="text"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  placeholder="Add tag + Enter"
                  className="flex-1 px-3 py-2 border border-stone-200 rounded-xl text-xs text-stone-700 focus:border-[#C0654B] outline-none"
                />
                <button
                  onClick={addTag}
                  className="px-3 py-2 bg-[#C0654B] text-white rounded-xl text-xs font-bold cursor-pointer hover:bg-[#8B4A38]"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── LIST MODE ────────────────────────────────────────────────────────────────
  const publishedCount = posts.filter(p => p.status === 'published').length;
  const draftCount = posts.filter(p => p.status === 'draft').length;

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white text-xs font-bold px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom-4">
          <Check className="w-4 h-4 text-emerald-400" />
          {toast}
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full text-center space-y-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="font-bold text-stone-900">Delete Article?</h3>
            <p className="text-xs text-stone-500">This action cannot be undone. The article will be permanently removed from the blog.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 border border-stone-200 rounded-xl text-xs font-bold text-stone-700 hover:bg-stone-50 cursor-pointer"
              >Cancel</button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold cursor-pointer"
              >Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-stone-900 font-serif flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#C0654B]" />
            Blog Manager
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">Create, edit, publish and manage all PGmart Journal articles.</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-[#C0654B] hover:bg-[#8B4A38] text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-colors cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4" />
          New Article
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Articles', value: posts.length, color: 'text-stone-900', bg: 'bg-white' },
          { label: 'Published', value: publishedCount, color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
          { label: 'Drafts', value: draftCount, color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
        ].map(stat => (
          <div key={stat.label} className={`${stat.bg} border border-stone-200 rounded-2xl p-4 text-center shadow-xs`}>
            <p className={`text-2xl font-extrabold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs font-semibold text-stone-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 shadow-xs">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by title, author or tag..."
            className="w-full pl-9 pr-3 py-2 border border-stone-200 rounded-xl text-xs text-stone-700 focus:border-[#C0654B] outline-none bg-stone-50 focus:bg-white"
          />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="text-xs border border-stone-200 rounded-xl px-3 py-2 font-semibold text-stone-700 focus:border-[#C0654B] outline-none bg-white cursor-pointer"
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="text-xs border border-stone-200 rounded-xl px-3 py-2 font-semibold text-stone-700 focus:border-[#C0654B] outline-none bg-white cursor-pointer"
          >
            <option value="All">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      {/* Posts Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        {filteredPosts.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <BookOpen className="w-10 h-10 text-stone-300 mx-auto" />
            <p className="text-sm font-bold text-stone-500">No articles found</p>
            <p className="text-xs text-stone-400">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200">
                  <th className="text-left p-4 font-black text-stone-500 uppercase tracking-wider">Article</th>
                  <th className="text-left p-4 font-black text-stone-500 uppercase tracking-wider hidden md:table-cell">Author</th>
                  <th className="text-left p-4 font-black text-stone-500 uppercase tracking-wider hidden sm:table-cell">Category</th>
                  <th className="text-left p-4 font-black text-stone-500 uppercase tracking-wider">Status</th>
                  <th className="text-right p-4 font-black text-stone-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredPosts.map(post => (
                  <tr key={post.id} className="hover:bg-stone-50 transition-colors group">
                    {/* Article */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-10 rounded-lg overflow-hidden bg-stone-100 shrink-0 hidden sm:block">
                          <img src={post.featuredImage} alt={post.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-stone-900 line-clamp-1 leading-snug">{post.title}</p>
                          <p className="text-stone-400 font-mono text-[10px] mt-0.5">/blog/{post.slug}</p>
                        </div>
                      </div>
                    </td>
                    {/* Author */}
                    <td className="p-4 hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <img src={post.authorAvatar} alt={post.author} className="w-6 h-6 rounded-full object-cover border border-stone-200" />
                        <div>
                          <p className="font-semibold text-stone-800">{post.author}</p>
                          <p className="text-stone-400 text-[10px]">{post.publishedDate}</p>
                        </div>
                      </div>
                    </td>
                    {/* Category */}
                    <td className="p-4 hidden sm:table-cell">
                      <span className="bg-[#F3E9E4] text-[#C0654B] font-bold px-2.5 py-1 rounded-full text-[10px]">
                        {post.category}
                      </span>
                    </td>
                    {/* Status */}
                    <td className="p-4">
                      <button
                        onClick={() => toggleStatus(post.id)}
                        className="cursor-pointer hover:scale-105 transition-transform"
                        title={`Click to ${post.status === 'published' ? 'unpublish' : 'publish'}`}
                      >
                        <StatusBadge status={post.status} />
                      </button>
                    </td>
                    {/* Actions */}
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 justify-end">
                        <button
                          onClick={() => openPreview(post)}
                          title="Preview"
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-stone-400 hover:text-[#C0654B] hover:bg-[#F3E9E4] transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEdit(post)}
                          title="Edit"
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-stone-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(post.id)}
                          title="Delete"
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer count */}
        <div className="px-4 py-3 bg-stone-50 border-t border-stone-200 text-[10px] text-stone-400 font-mono">
          Showing {filteredPosts.length} of {posts.length} articles
        </div>
      </div>
    </div>
  );
};
