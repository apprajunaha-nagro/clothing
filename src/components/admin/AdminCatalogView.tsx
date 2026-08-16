import React, { useState, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import { Search, ChevronRight, ChevronDown, Plus, Edit2, Trash2, ToggleLeft, ToggleRight, X, ArrowRight, HelpCircle, Upload, Image as ImageIcon } from 'lucide-react';
import { Category, Subcategory, CategoryType, Product } from '../../types';

export const AdminCatalogView: React.FC = () => {
  const { categories, setCategories, products, setProducts, showToast } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Tree expanded states
  const [expandedCats, setExpandedCats] = useState<{ [id: string]: boolean }>({
    women: true, men: true // initially expand some for good visuals
  });
  const [expandedSubs, setExpandedSubs] = useState<{ [id: string]: boolean }>({});

  // Modal forms
  const [activeModal, setActiveModal] = useState<'category' | 'subcategory' | 'type' | null>(null);
  const [editTarget, setEditTarget] = useState<{ type: 'category' | 'subcategory' | 'type'; item: any } | null>(null);
  const categoryPhotoRef = useRef<HTMLInputElement>(null);
  
  // Form fields
  const [parentCatId, setParentCatId] = useState('');
  const [parentSubId, setParentSubId] = useState('');
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [banner, setBanner] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDesc, setMetaDesc] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  // Deletion guard warning modal state
  const [deleteWarning, setDeleteWarning] = useState<{
    type: 'subcategory' | 'type';
    itemId: string;
    parentIds: { catId?: string; subId?: string };
    productCount: number;
    linkedProducts: Product[];
  } | null>(null);

  const [reassignTargetId, setReassignTargetId] = useState('');

  const toggleCategory = (id: string) => {
    setExpandedCats(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleSubcategory = (id: string) => {
    setExpandedSubs(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Pre-computed product count maps (0ms O(1) lookup)
  const productCounts = React.useMemo(() => {
    const catMap = new Map<string, number>();
    const subMap = new Map<string, number>();
    const typeMap = new Map<string, number>();

    for (let i = 0; i < products.length; i++) {
      const p = products[i];
      if (p.categoryId) catMap.set(p.categoryId, (catMap.get(p.categoryId) || 0) + 1);
      if (p.subcategoryId) subMap.set(p.subcategoryId, (subMap.get(p.subcategoryId) || 0) + 1);
      if (p.typeId) typeMap.set(p.typeId, (typeMap.get(p.typeId) || 0) + 1);
    }

    return { catMap, subMap, typeMap };
  }, [products]);

  const getProductCountForType = (typeId: string) => productCounts.typeMap.get(typeId) || 0;
  const getProductCountForSub = (subId: string) => productCounts.subMap.get(subId) || 0;
  const getProductCountForCat = (catId: string) => productCounts.catMap.get(catId) || 0;

  // Auto slug generation helper
  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(val.toLowerCase().trim()
      .replace(/[^a-z0-9\s-]/g, '') // remove special chars
      .replace(/\s+/g, '-')       // spaces to dashes
      .replace(/-+/g, '-')        // double dashes to single
    );
  };

  // Trigger modal for creating subcategory under category
  const openAddSubcategory = (catId: string) => {
    resetForm();
    setParentCatId(catId);
    setActiveModal('subcategory');
  };

  // Trigger modal for creating type under subcategory
  const openAddType = (catId: string, subId: string) => {
    resetForm();
    setParentCatId(catId);
    setParentSubId(subId);
    setActiveModal('type');
  };

  const resetForm = () => {
    setName('');
    setSlug('');
    setDescription('');
    setImage('');
    setBanner('');
    setMetaTitle('');
    setMetaDesc('');
    setStatus('active');
    setParentCatId('');
    setParentSubId('');
    setEditTarget(null);
  };

  // Handle Create or Update Subcategory
  const handleSaveSubcategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editTarget) {
      // Edit mode
      const subId = editTarget.item.id;
      const updatedCategories = categories.map(cat => {
        if (cat.id !== editTarget.item.categoryId) return cat;
        return {
          ...cat,
          subcategories: cat.subcategories.map(sub => 
            sub.id === subId 
              ? { ...sub, name, slug, description, image, banner_image: banner, meta_title: metaTitle, meta_description: metaDesc, status }
              : sub
          )
        };
      });
      setCategories(updatedCategories);

      try {
        await fetch(`/api/admin/subcategories/${subId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, slug, description, image, banner_image: banner, meta_title: metaTitle, meta_description: metaDesc, status })
        });
      } catch (err) {
        console.error('Failed to update subcategory on server:', err);
      }

      showToast(`Subcategory "${name}" updated successfully.`);
    } else {
      // Add mode
      const newSubId = `sub-${Date.now()}`;
      const newSub: Subcategory = {
        id: newSubId,
        categoryId: parentCatId,
        name,
        slug,
        status,
        description,
        image: image || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=400&q=80',
        banner_image: banner,
        meta_title: metaTitle,
        meta_description: metaDesc,
        types: []
      };

      const updatedCategories = categories.map(cat => {
        if (cat.id !== parentCatId) return cat;
        return {
          ...cat,
          subcategories: [...cat.subcategories, newSub]
        };
      });
      setCategories(updatedCategories);

      try {
        await fetch('/api/admin/subcategories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ categoryId: parentCatId, name, slug, description, image, banner_image: banner, meta_title: metaTitle, meta_description: metaDesc, status })
        });
      } catch (err) {
        console.error('Failed to create subcategory on server:', err);
      }

      showToast(`Subcategory "${name}" created.`);
    }

    setActiveModal(null);
    resetForm();
  };

  // Handle Create or Update Style/Type
  const handleSaveType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editTarget) {
      // Edit mode
      const typeId = editTarget.item.id;
      const updatedCategories = categories.map(cat => {
        return {
          ...cat,
          subcategories: cat.subcategories.map(sub => {
            if (sub.id !== editTarget.item.subcategoryId) return sub;
            return {
              ...sub,
              types: sub.types.map(t => 
                t.id === typeId 
                  ? { ...t, name, slug, description, image, banner_image: banner, meta_title: metaTitle, meta_description: metaDesc, status }
                  : t
              )
            };
          })
        };
      });
      setCategories(updatedCategories);

      try {
        await fetch(`/api/admin/types/${typeId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, slug, description, image, banner_image: banner, meta_title: metaTitle, meta_description: metaDesc, status })
        });
      } catch (err) {
        console.error('Failed to update type on server:', err);
      }

      showToast(`Style Type "${name}" updated.`);
    } else {
      // Add mode
      const newTypeId = `type-${Date.now()}`;
      const newType: CategoryType = {
        id: newTypeId,
        subcategoryId: parentSubId,
        name,
        slug,
        status,
        description,
        image: image,
        banner_image: banner,
        meta_title: metaTitle,
        meta_description: metaDesc
      };

      const updatedCategories = categories.map(cat => {
        if (cat.id !== parentCatId) return cat;
        return {
          ...cat,
          subcategories: cat.subcategories.map(sub => {
            if (sub.id !== parentSubId) return sub;
            return {
              ...sub,
              types: [...sub.types, newType]
            };
          })
        };
      });
      setCategories(updatedCategories);

      try {
        await fetch('/api/admin/types', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subcategoryId: parentSubId, name, slug, description, image, banner_image: banner, meta_title: metaTitle, meta_description: metaDesc, status })
        });
      } catch (err) {
        console.error('Failed to create type on server:', err);
      }

      showToast(`Style Type "${name}" added.`);
    }

    setActiveModal(null);
    resetForm();
  };

  // Handle Save Main Category
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editTarget && editTarget.type === 'category') {
      const catId = editTarget.item.id;
      const updatedCategories = categories.map(cat => {
        if (cat.id !== catId) return cat;
        return {
          ...cat,
          name,
          slug,
          image: image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
          banner: banner || undefined,
          status
        };
      });
      setCategories(updatedCategories);

      try {
        await fetch(`/api/categories/${catId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, slug, image, banner, status })
        });
      } catch (err) {
        console.error('Failed to update category on server:', err);
      }

      showToast(`Category "${name}" updated successfully! Homepage tiles updated.`);
    }

    setActiveModal(null);
    resetForm();
  };

  // Device Photo Upload Handler for Category Image
  const handleCategoryPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImage(event.target.result as string);
        showToast('Category photo uploaded from device!');
      }
    };
    reader.readAsDataURL(file);
  };

  // Trigger edit for items
  const startEditCategory = (cat: Category) => {
    setEditTarget({ type: 'category', item: cat });
    setName(cat.name);
    setSlug(cat.slug);
    setDescription('');
    setImage(cat.image || '');
    setBanner(cat.banner || '');
    setStatus(cat.status);
    setActiveModal('category');
  };
  const startEditSubcategory = (sub: Subcategory) => {
    setEditTarget({ type: 'subcategory', item: sub });
    setName(sub.name);
    setSlug(sub.slug);
    setDescription(sub.description || '');
    setImage(sub.image || '');
    setBanner(sub.banner_image || '');
    setMetaTitle(sub.meta_title || '');
    setMetaDesc(sub.meta_description || '');
    setStatus(sub.status);
    setParentCatId(sub.categoryId);
    setActiveModal('subcategory');
  };

  const startEditType = (catId: string, subId: string, type: CategoryType) => {
    setEditTarget({ type: 'type', item: type });
    setName(type.name);
    setSlug(type.slug);
    setDescription(type.description || '');
    setImage(type.image || '');
    setBanner(type.banner_image || '');
    setMetaTitle(type.meta_title || '');
    setMetaDesc(type.meta_description || '');
    setStatus(type.status);
    setParentCatId(catId);
    setParentSubId(subId);
    setActiveModal('type');
  };

  // Toggle active status from Tree list directly
  const handleToggleSubStatus = async (catId: string, subId: string, current: 'active' | 'inactive') => {
    const nextStatus = current === 'active' ? 'inactive' : 'active';
    setCategories(prev => prev.map(cat => {
      if (cat.id !== catId) return cat;
      return {
        ...cat,
        subcategories: cat.subcategories.map(sub => 
          sub.id === subId ? { ...sub, status: nextStatus } : sub
        )
      };
    }));
    try {
      await fetch(`/api/admin/subcategories/${subId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
    } catch (err) {
      console.warn('Failed to update subcategory status on server:', err);
    }
    showToast(`Subcategory status set to ${nextStatus}.`);
  };

  const handleToggleTypeStatus = async (catId: string, subId: string, typeId: string, current: 'active' | 'inactive') => {
    const nextStatus = current === 'active' ? 'inactive' : 'active';
    setCategories(prev => prev.map(cat => {
      if (cat.id !== catId) return cat;
      return {
        ...cat,
        subcategories: cat.subcategories.map(sub => {
          if (sub.id !== subId) return sub;
          return {
            ...sub,
            types: sub.types.map(t => 
              t.id === typeId ? { ...t, status: nextStatus } : t
            )
          };
        })
      };
    }));
    try {
      await fetch(`/api/admin/types/${typeId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
    } catch (err) {
      console.warn('Failed to update type status on server:', err);
    }
    showToast(`Style type status set to ${nextStatus}.`);
  };

  // DELETE OPERATIONS WITH GUARDS
  const handleDeleteSubcategoryRequest = (catId: string, subId: string, name: string) => {
    const linked = products.filter(p => p.subcategoryId === subId);
    if (linked.length > 0) {
      // Need warning reassignment
      setDeleteWarning({
        type: 'subcategory',
        itemId: subId,
        parentIds: { catId },
        productCount: linked.length,
        linkedProducts: linked
      });
      // Suggest first other subcategory as default reassign target
      const otherSubs = categories.find(c => c.id === catId)?.subcategories.filter(s => s.id !== subId) || [];
      setReassignTargetId(otherSubs[0]?.id || '');
    } else {
      // Safe delete directly
      if (confirm(`Are you sure you want to delete the subcategory "${name}"? This cannot be undone.`)) {
        performDeleteSubcategory(catId, subId);
      }
    }
  };

  const handleDeleteTypeRequest = (catId: string, subId: string, typeId: string, name: string) => {
    const linked = products.filter(p => p.typeId === typeId);
    if (linked.length > 0) {
      setDeleteWarning({
        type: 'type',
        itemId: typeId,
        parentIds: { catId, subId },
        productCount: linked.length,
        linkedProducts: linked
      });
      // Suggest another style type under same subcategory
      const otherTypes = categories.find(c => c.id === catId)?.subcategories.find(s => s.id === subId)?.types.filter(t => t.id !== typeId) || [];
      setReassignTargetId(otherTypes[0]?.id || '');
    } else {
      if (confirm(`Are you sure you want to delete the style "${name}"?`)) {
        performDeleteType(catId, subId, typeId);
      }
    }
  };

  const performDeleteSubcategory = async (catId: string, subId: string) => {
    setCategories(prev => prev.map(cat => {
      if (cat.id !== catId) return cat;
      return {
        ...cat,
        subcategories: cat.subcategories.filter(s => s.id !== subId)
      };
    }));
    try {
      await fetch(`/api/admin/subcategories/${subId}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('Failed to delete subcategory on server:', err);
    }
    showToast('Subcategory deleted successfully.');
  };

  const performDeleteType = async (catId: string, subId: string, typeId: string) => {
    setCategories(prev => prev.map(cat => {
      if (cat.id !== catId) return cat;
      return {
        ...cat,
        subcategories: cat.subcategories.map(sub => {
          if (sub.id !== subId) return sub;
          return {
            ...sub,
            types: sub.types.filter(t => t.id !== typeId)
          };
        })
      };
    }));
    try {
      await fetch(`/api/admin/types/${typeId}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('Failed to delete type on server:', err);
    }
    showToast('Style Type deleted successfully.');
  };

  const handleExecuteSafetyReassignAndDelete = () => {
    if (!deleteWarning) return;

    const { type, itemId, parentIds, linkedProducts } = deleteWarning;

    if (type === 'subcategory') {
      if (!reassignTargetId) {
        alert('Please select a valid subcategory to transfer the products.');
        return;
      }
      // 1. Reassign products to selected subcategory
      setProducts(prev => prev.map(p => 
        p.subcategoryId === itemId ? { ...p, subcategoryId: reassignTargetId } : p
      ));
      // 2. Perform deletion of original subcategory
      performDeleteSubcategory(parentIds.catId!, itemId);
      showToast(`Transferred ${linkedProducts.length} products and deleted subcategory.`);
    } else {
      if (!reassignTargetId) {
        alert('Please select a valid style type to transfer the products.');
        return;
      }
      // 1. Reassign products
      setProducts(prev => prev.map(p => 
        p.typeId === itemId ? { ...p, typeId: reassignTargetId } : p
      ));
      // 2. Delete type
      performDeleteType(parentIds.catId!, parentIds.subId!, itemId);
      showToast(`Transferred ${linkedProducts.length} products and deleted style.`);
    }

    setDeleteWarning(null);
  };

  // Filter Catalog Tree live
  const filterCategories = () => {
    if (!searchQuery.trim()) return categories;
    const query = searchQuery.toLowerCase();

    return categories.map(cat => {
      const matchCat = cat.name.toLowerCase().includes(query);
      const filteredSubs = cat.subcategories.map(sub => {
        const matchSub = sub.name.toLowerCase().includes(query);
        const filteredTypes = sub.types.filter(t => t.name.toLowerCase().includes(query));

        if (matchSub || filteredTypes.length > 0 || matchCat) {
          return {
            ...sub,
            // If sub matched, keep all types; otherwise keep matched types
            types: matchSub || matchCat ? sub.types : filteredTypes
          };
        }
        return null;
      }).filter(Boolean) as Subcategory[];

      if (matchCat || filteredSubs.length > 0) {
        return {
          ...cat,
          subcategories: matchCat ? cat.subcategories : filteredSubs
        };
      }
      return null;
    }).filter(Boolean) as Category[];
  };

  const filteredTree = filterCategories();

  return (
    <div className="space-y-6 text-stone-800 animate-fade-in text-left">
      {/* HEADER SECTION */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-stone-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold font-serif text-stone-900">Unified Catalog Hierarchy</h2>
          <p className="text-xs text-stone-400">Fixed Top-Level Categories with complete dynamic Subcategories & Styles</p>
        </div>

        {/* Global Catalog Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search category, subcategory or style..."
            className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs outline-none focus:bg-white focus:border-[#C0654B] transition-colors"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-3 text-[10px] text-stone-400 hover:text-stone-700 cursor-pointer">✕</button>
          )}
        </div>
      </div>

      {/* TREE CONTENT */}
      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-sm overflow-hidden">
        <div className="bg-stone-50 p-3 sm:p-4 border-b border-stone-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 text-xs font-bold text-stone-500">
          <span>Catalog Tree Levels (Category → Subcategory → Style Type)</span>
          <span className="text-[11px] text-stone-400 font-medium">Tap chevron to expand levels</span>
        </div>

        <div className="divide-y divide-stone-100">
          {filteredTree.map(cat => {
            const isCatExpanded = expandedCats[cat.id];
            const catProdCount = getProductCountForCat(cat.id);

            return (
              <div key={cat.id} className="select-none">
                {/* 1. Category Row (Fixed Parent) */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-4 gap-3 bg-stone-50/40 hover:bg-stone-50 transition-colors">
                  <div className="flex items-center gap-2.5 sm:gap-3 cursor-pointer flex-1 min-w-0" onClick={() => toggleCategory(cat.id)}>
                    {isCatExpanded ? (
                      <ChevronDown className="w-5 h-5 text-[#C0654B] shrink-0" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-stone-400 shrink-0" />
                    )}
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border border-stone-300 shrink-0 bg-stone-100 shadow-2xs">
                      <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                        <span className="text-sm font-bold font-serif text-stone-900 truncate">{cat.name}</span>
                        <span className="text-[9px] sm:text-[10px] uppercase font-bold text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded">Core Category</span>
                      </div>
                      <span className="text-[10px] text-stone-400 font-mono block truncate">Homepage photo tile</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 self-start sm:self-center pl-7 sm:pl-0 w-full sm:w-auto">
                    <span className="font-mono text-xs font-bold text-stone-500 bg-stone-100/80 px-2 py-1 rounded-lg border border-stone-200/60 shrink-0">
                      {catProdCount} Products
                    </span>

                    {/* Edit Category Button */}
                    <button
                      onClick={() => startEditCategory(cat)}
                      className="px-3 py-1.5 bg-stone-800 hover:bg-stone-900 text-white text-[10px] sm:text-xs font-bold rounded-lg cursor-pointer transition-colors flex items-center gap-1 shadow-2xs"
                      title="Edit Category Name & Homepage Photo"
                    >
                      <Edit2 className="w-3 h-3 text-amber-300 shrink-0" />
                      <span>Edit Photo</span>
                    </button>

                    <button
                      onClick={() => openAddSubcategory(cat.id)}
                      className="px-3 py-1.5 bg-[#C0654B] hover:bg-[#8B4A38] text-white text-[10px] sm:text-xs font-bold rounded-lg cursor-pointer transition-colors flex items-center gap-1 shrink-0"
                    >
                      <Plus className="w-3 h-3 shrink-0" />
                      <span>+ Subcategory</span>
                    </button>
                  </div>
                </div>

                {/* 2. Subcategories Container */}
                {isCatExpanded && (
                  <div className="pl-3 sm:pl-6 bg-stone-50/10 border-l-2 border-stone-200">
                    {cat.subcategories.length === 0 ? (
                      <div className="p-4 text-xs text-stone-400 text-center font-medium">No Subcategories created under {cat.name} yet.</div>
                    ) : (
                      cat.subcategories.map(sub => {
                        const isSubExpanded = expandedSubs[sub.id];
                        const subProdCount = getProductCountForSub(sub.id);

                        return (
                          <div key={sub.id} className="border-t border-stone-100/80">
                            {/* Subcategory Row */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 sm:p-3 gap-2.5 hover:bg-stone-50/50 transition-colors">
                              <div className="flex items-center gap-2 cursor-pointer flex-1 min-w-0" onClick={() => toggleSubcategory(sub.id)}>
                                {isSubExpanded ? (
                                  <ChevronDown className="w-4.5 h-4.5 text-[#C0654B] shrink-0" />
                                ) : (
                                  <ChevronRight className="w-4.5 h-4.5 text-stone-400 shrink-0" />
                                )}
                                <div className="truncate text-xs flex-1">
                                  <span className="font-bold text-stone-800">{sub.name}</span>
                                  <span className="text-[10px] font-mono text-stone-400 ml-1.5">/{sub.slug}</span>
                                </div>
                                <span className={`w-2 h-2 rounded-full shrink-0 ${sub.status === 'active' ? 'bg-emerald-500' : 'bg-stone-300'}`}></span>
                              </div>

                              <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2 pl-6 sm:pl-0 w-full sm:w-auto">
                                <span className="font-mono text-[11px] font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
                                  {subProdCount} Prods
                                </span>

                                <div className="flex items-center gap-1">
                                  {/* Toggle Status */}
                                  <button 
                                    onClick={() => handleToggleSubStatus(cat.id, sub.id, sub.status)}
                                    className="p-1 text-stone-400 hover:text-[#C0654B] cursor-pointer"
                                    title="Toggle active/inactive status"
                                  >
                                    {sub.status === 'active' ? (
                                      <ToggleRight className="w-5 h-5 text-emerald-600" />
                                    ) : (
                                      <ToggleLeft className="w-5 h-5 text-stone-300" />
                                    )}
                                  </button>

                                  {/* Edit Sub */}
                                  <button 
                                    onClick={() => startEditSubcategory(sub)}
                                    className="p-1.5 text-stone-500 hover:text-[#C0654B] hover:bg-stone-100 rounded-lg cursor-pointer"
                                    title="Edit Subcategory Details"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>

                                  {/* Delete Sub */}
                                  <button 
                                    onClick={() => handleDeleteSubcategoryRequest(cat.id, sub.id, sub.name)}
                                    className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                                    title="Delete Subcategory"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>

                                  {/* Add Type Button */}
                                  <button
                                    onClick={() => openAddType(cat.id, sub.id)}
                                    className="px-2.5 py-1 border border-[#C0654B] hover:bg-[#C0654B]/5 text-[#C0654B] text-[10px] font-bold rounded-lg cursor-pointer flex items-center gap-0.5 ml-1"
                                  >
                                    <Plus className="w-2.5 h-2.5" /> Style
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* 3. Style Types Container */}
                            {isSubExpanded && (
                              <div className="pl-4 sm:pl-8 bg-stone-100/30 border-l border-dashed border-stone-200">
                                {sub.types.length === 0 ? (
                                  <div className="p-3 text-[11px] text-stone-400 font-medium">No Style Types registered here. Add your first Style Type!</div>
                                ) : (
                                  sub.types.map(type => {
                                    const typeProdCount = getProductCountForType(type.id);

                                    return (
                                      <div key={type.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-2 sm:p-2.5 gap-1.5 hover:bg-stone-50 text-xs border-t border-stone-100/60">
                                        <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                          <div className="w-1.5 h-1.5 rounded-full bg-[#C0654B]/60 shrink-0"></div>
                                          <span className="font-semibold text-stone-700 truncate">{type.name}</span>
                                          <span className="text-[9px] font-mono text-stone-400 truncate">/{type.slug}</span>
                                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${type.status === 'active' ? 'bg-emerald-500' : 'bg-stone-300'}`}></span>
                                        </div>

                                        <div className="flex items-center justify-between sm:justify-end gap-2 pl-3 sm:pl-0">
                                          <span className="font-mono text-[10px] text-stone-400">{typeProdCount} items</span>

                                          <div className="flex items-center gap-0.5">
                                            {/* Toggle Status */}
                                            <button 
                                              onClick={() => handleToggleTypeStatus(cat.id, sub.id, type.id, type.status)}
                                              className="p-1 text-stone-400 hover:text-stone-700 cursor-pointer"
                                            >
                                              {type.status === 'active' ? (
                                                <ToggleRight className="w-4.5 h-4.5 text-emerald-600" />
                                              ) : (
                                                <ToggleLeft className="w-4.5 h-4.5 text-stone-300" />
                                              )}
                                            </button>

                                            {/* Edit Type */}
                                            <button 
                                              onClick={() => startEditType(cat.id, sub.id, type)}
                                              className="p-1 text-stone-500 hover:text-stone-800 cursor-pointer"
                                            >
                                              <Edit2 className="w-3 h-3" />
                                            </button>

                                            {/* Delete Type */}
                                            <button 
                                              onClick={() => handleDeleteTypeRequest(cat.id, sub.id, type.id, type.name)}
                                              className="p-1 text-stone-400 hover:text-red-600 cursor-pointer"
                                            >
                                              <Trash2 className="w-3 h-3" />
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* CREATE/EDIT MODAL */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200 p-4 sm:p-6 space-y-4 animate-scale-in text-left">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-base font-bold font-serif text-stone-900">
                {editTarget ? 'Edit' : 'Create New'} {activeModal === 'category' ? 'Core Category' : activeModal === 'subcategory' ? 'Subcategory' : 'Style/Type'}
              </h3>
              <button onClick={() => { setActiveModal(null); resetForm(); }} className="text-stone-400 hover:text-stone-800 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={activeModal === 'category' ? handleSaveCategory : activeModal === 'subcategory' ? handleSaveSubcategory : handleSaveType} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Name (Required)</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder={activeModal === 'category' ? "e.g., Women's Fashion" : activeModal === 'subcategory' ? "e.g., Casual Shirts" : "e.g., Slim-Fit Linens"}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg outline-none focus:border-[#C0654B]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">URL Slug (Auto-generated)</label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 bg-stone-50 rounded-lg outline-none focus:border-[#C0654B] font-mono text-[11px]"
                  />
                </div>
              </div>

              {activeModal !== 'category' && (
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Description (Optional)</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe this category branch (useful for store layout descriptions and SEO)..."
                    rows={2}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg outline-none focus:border-[#C0654B]"
                  />
                </div>
              )}

              {/* IMAGE UPLOAD & URL SECTION */}
              <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-3">
                <span className="font-bold text-stone-900 block text-xs">Category Display Photo (Homepage Tile under Hero Banner)</span>
                
                <div className="flex items-center gap-4">
                  {image ? (
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#C0654B] bg-stone-100 shrink-0 shadow-sm">
                      <img src={image} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-full border-2 border-dashed border-stone-300 flex items-center justify-center bg-stone-100 shrink-0 text-stone-400">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                  )}

                  <div className="space-y-2 flex-1">
                    <input
                      type="file"
                      ref={categoryPhotoRef}
                      accept="image/*"
                      onChange={handleCategoryPhotoUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => categoryPhotoRef.current?.click()}
                      className="px-3.5 py-1.5 bg-stone-900 hover:bg-black text-white font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Upload className="w-3.5 h-3.5 text-[#C0654B]" />
                      Upload Photo from Device
                    </button>
                    <p className="text-[10px] text-stone-400">Upload custom round category photo directly from your device</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Or Image URL</label>
                    <input
                      type="text"
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-3 py-2 border border-stone-300 bg-white rounded-lg outline-none focus:border-[#C0654B]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Optional Banner Image URL</label>
                    <input
                      type="text"
                      value={banner}
                      onChange={(e) => setBanner(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-3 py-2 border border-stone-300 bg-white rounded-lg outline-none focus:border-[#C0654B]"
                    />
                  </div>
                </div>
              </div>

              {/* SEO parameters */}
              <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 space-y-3">
                <span className="font-bold text-stone-700 block uppercase tracking-wider text-[9px]">SEO Optimization Headers</span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-stone-500 mb-0.5">Meta Title</label>
                    <input
                      type="text"
                      value={metaTitle}
                      onChange={(e) => setMetaTitle(e.target.value)}
                      placeholder="SEO Title"
                      className="w-full px-2 py-1.5 border border-stone-300 bg-white rounded-lg outline-none text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-stone-500 mb-0.5">Meta Description</label>
                    <input
                      type="text"
                      value={metaDesc}
                      onChange={(e) => setMetaDesc(e.target.value)}
                      placeholder="SEO description hook"
                      className="w-full px-2 py-1.5 border border-stone-300 bg-white rounded-lg outline-none text-[11px]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-stone-100 pt-3">
                <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
                  <span className="font-bold text-stone-700">Display Status:</span>
                  <div className="flex bg-stone-100 p-0.5 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setStatus('active')}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${status === 'active' ? 'bg-[#C0654B] text-white shadow-xs' : 'text-stone-500 hover:text-stone-800'}`}
                    >
                      Active
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus('inactive')}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${status === 'inactive' ? 'bg-red-600 text-white shadow-xs' : 'text-stone-500 hover:text-stone-800'}`}
                    >
                      Inactive
                    </button>
                  </div>
                </div>

                <div className="flex flex-col-reverse sm:flex-row gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => { setActiveModal(null); resetForm(); }}
                    className="w-full sm:w-auto px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl cursor-pointer text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-5 py-2.5 bg-[#C0654B] hover:bg-[#8B4A38] text-white font-bold rounded-xl cursor-pointer shadow-md text-xs"
                  >
                    {editTarget ? 'Update Level' : 'Save & Add'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SAFETY REASSIGN MODAL */}
      {deleteWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-stone-200 p-6 space-y-4 animate-scale-in text-left">
            <div className="flex items-start gap-3">
              <div className="p-3 bg-red-50 text-red-600 rounded-full shrink-0">
                <HelpCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold font-serif text-stone-900">
                  Warning: Linked Products Detected!
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  You are trying to delete a catalog node that currently has <span className="font-bold text-red-600 font-mono">{deleteWarning.productCount}</span> active products linked to it. 
                </p>
              </div>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-600">
              <span className="font-bold block text-stone-700 mb-1">Transfer Destination Required:</span>
              <p className="text-[11px] text-stone-500 mb-3">To safeguard your storefront, select where these products should be moved before removing the old node:</p>
              
              {deleteWarning.type === 'subcategory' ? (
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Move to another Subcategory:</label>
                  <select
                    value={reassignTargetId}
                    onChange={(e) => setReassignTargetId(e.target.value)}
                    className="w-full p-2 bg-white border border-stone-300 rounded-lg outline-none font-semibold text-xs"
                  >
                    <option value="">-- Choose Subcategory --</option>
                    {categories.find(c => c.id === deleteWarning.parentIds.catId)?.subcategories
                      .filter(s => s.id !== deleteWarning.itemId)
                      .map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Move to another Style Type:</label>
                  <select
                    value={reassignTargetId}
                    onChange={(e) => setReassignTargetId(e.target.value)}
                    className="w-full p-2 bg-white border border-stone-300 rounded-lg outline-none font-semibold text-xs"
                  >
                    <option value="">-- Choose Style --</option>
                    {categories.find(c => c.id === deleteWarning.parentIds.catId)?.subcategories
                      .find(s => s.id === deleteWarning.parentIds.subId)?.types
                      .filter(t => t.id !== deleteWarning.itemId)
                      .map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                  </select>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 text-xs pt-2 border-t border-stone-100">
              <button
                onClick={() => setDeleteWarning(null)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl cursor-pointer"
              >
                Cancel Delete
              </button>
              <button
                onClick={handleExecuteSafetyReassignAndDelete}
                disabled={!reassignTargetId}
                className="px-5 py-2 bg-red-600 hover:bg-red-800 disabled:bg-stone-200 disabled:cursor-not-allowed text-white font-bold rounded-xl cursor-pointer shadow-md transition-colors flex items-center gap-1"
              >
                Move & Delete Node <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
