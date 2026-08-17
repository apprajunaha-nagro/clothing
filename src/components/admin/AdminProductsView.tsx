import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import { supabase } from '../../lib/supabaseClient';
import { 
  Plus, Search, Edit3, Trash2, Copy, Eye, SlidersHorizontal, Check, X, 
  ArrowLeft, ArrowRight, Download, Upload, RefreshCw, Archive, Sparkles, Image as ImageIcon
} from 'lucide-react';
import { Product, ProductVariant, ColorVariant, ProductTag, Category, KidsSizeVariant } from '../../types';
import * as XLSX from 'xlsx';

export const AdminProductsView: React.FC = () => {
  const { products, setProducts, categories, settings, showToast, createProduct, updateProduct, deleteProduct } = useStore();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [filterSub, setFilterSub] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterStock, setFilterStock] = useState<'all' | 'instock' | 'lowstock' | 'out'>('all');
  const [filterTag, setFilterTag] = useState('');

  // Bulk operation states
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState('');
  const [bulkDiscountVal, setBulkDiscountVal] = useState(10); // flat %

  // Soft delete "Recently Deleted Bin"
  const [recentlyDeleted, setRecentlyDeleted] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('terra_recently_deleted_products');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('terra_recently_deleted_products', JSON.stringify(recentlyDeleted));
  }, [recentlyDeleted]);

  // Guided Product Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const [editProduct, setEditProduct] = useState<Product | null>(null);

  // Form Fields
  const [pCategoryId, setPCategoryId] = useState('');
  const [pSubcategoryId, setPSubcategoryId] = useState('');
  const [pTypeId, setPTypeId] = useState('');
  const [pName, setPName] = useState('');
  const [pBrand, setPBrand] = useState('Terra Ethnic');
  const [pDescription, setPDescription] = useState('');
  const [pFabric, setPFabric] = useState('Cotton Blend');
  const [pFit, setPFit] = useState('Regular Fit');
  const [pOccasion, setPOccasion] = useState('Everyday');
  const [pHsn, setPHsn] = useState('5407');
  const [pGst, setPGst] = useState(5);
  const [pBasePrice, setPBasePrice] = useState(1999);
  const [pDiscPrice, setPDiscPrice] = useState(1499);
  const [pTags, setPTags] = useState<ProductTag[]>(['new_arrival']);
  const [pStatus, setPStatus] = useState<'published' | 'draft'>('published');

  // Multi-variant sizing state (Allows selecting BOTH standard and manual size options)
  const [enableStandardSizes, setEnableStandardSizes] = useState<boolean>(true);
  const [selectedSizes, setSelectedSizes] = useState<string[]>(['S', 'M', 'L', 'XL']);
  
  const [enableManualSizes, setEnableManualSizes] = useState<boolean>(false);
  const [kidsSizeRows, setKidsSizeRows] = useState<KidsSizeVariant[]>([
    { ageLabel: 'Size 38 (M)', measurement: 96, unit: 'cm', stock: 15 },
    { ageLabel: 'Size 40 (L)', measurement: 102, unit: 'cm', stock: 20 }
  ]);

  const isKidsCategory = React.useMemo(() => {
    if (!pCategoryId) return false;
    const cat = categories.find(c => c.id === pCategoryId);
    const catSlug = cat ? cat.slug.toLowerCase() : pCategoryId.toLowerCase();
    const catName = cat ? cat.name.toLowerCase() : '';
    return catSlug === 'kids' || catSlug.includes('kids') || catName.includes('kids');
  }, [pCategoryId, categories]);
  
  // Custom expandable colors selection list
  const [availableColors, setAvailableColors] = useState<{ name: string; hex: string }[]>([
    { name: 'Rose Clay', hex: '#C0654B' },
    { name: 'Sand Gold', hex: '#E6D5B8' },
    { name: 'Teal Green', hex: '#005F54' },
    { name: 'Midnight Black', hex: '#1C1C1C' },
    { name: 'Royal Crimson', hex: '#8B0000' },
    { name: 'Mustard Yellow', hex: '#E1AD01' },
    { name: 'Indigo Blue', hex: '#1A365D' },
    { name: 'Olive Green', hex: '#556B2F' },
    { name: 'Maroon Red', hex: '#800000' },
    { name: 'Ivory White', hex: '#FFFFF0' },
    { name: 'Pista Green', hex: '#93C572' },
    { name: 'Rust Orange', hex: '#B7410E' },
    { name: 'Magenta Pink', hex: '#CA1F7B' },
    { name: 'Peach Fuzz', hex: '#FFBE98' },
    { name: 'Wine Purple', hex: '#4C2F48' }
  ]);
  const [selectedColors, setSelectedColors] = useState<{ name: string; hex: string }[]>([
    { name: 'Teal Green', hex: '#005F54' },
    { name: 'Rose Clay', hex: '#C0654B' }
  ]);
  const [customColorName, setCustomColorName] = useState('');
  const [customColorHex, setCustomColorHex] = useState('#C0654B');

  const [variantsMatrix, setVariantsMatrix] = useState<ProductVariant[]>([]);

  // CSV Import State
  const [csvText, setCsvText] = useState('');
  const [showCsvImport, setShowCsvImport] = useState(false);
  const csvFileInputRef = useRef<HTMLInputElement>(null);

  // Photo Upload & Product Images State
  const photoFileInputRef = useRef<HTMLInputElement>(null);
  const [productImages, setProductImages] = useState<string[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState('');

  const handleDevicePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    (Array.from(files) as File[]).forEach((file: File) => {
      if (!file.type.startsWith('image/')) {
        showToast('Please select valid image files.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event: ProgressEvent<FileReader>) => {
        if (event.target?.result) {
          const dataUrl = event.target.result as string;
          setProductImages(prev => [...prev, dataUrl]);
          showToast(`Uploaded "${file.name}" from device.`);
        }
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  // Auto generate variants matrix when sizes or colors change
  useEffect(() => {
    if (!isFormOpen) return;
    if (formStep === 3 && variantsMatrix.length === 0) {
      const rows: ProductVariant[] = [];
      
      selectedColors.forEach(color => {
        // 1. Standard Sizes (if enabled)
        if (enableStandardSizes && selectedSizes.length > 0) {
          selectedSizes.forEach(size => {
            rows.push({
              id: `v-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              productId: editProduct?.id || 'new-product-id',
              size,
              color: color.name,
              colorHex: color.hex,
              sku: `${(pName || 'PROD').slice(0, 3).toUpperCase()}-${color.name.slice(0, 2).toUpperCase()}-${size.replace(/[^a-zA-Z0-9]/g, '')}`,
              price: pBasePrice,
              discountPrice: pDiscPrice || undefined,
              stock: 25,
              images: [
                color.hex === '#C0654B' 
                  ? 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80'
                  : 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&q=80'
              ]
            });
          });
        }

        // 2. Manual Measurement Sizes (if enabled)
        if (enableManualSizes && kidsSizeRows.length > 0) {
          kidsSizeRows.forEach(ks => {
            if (!ks.ageLabel.trim()) return;
            const sizeLabel = `${ks.ageLabel} (${ks.measurement} ${ks.unit})`;
            rows.push({
              id: `v-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              productId: editProduct?.id || 'new-product-id',
              size: sizeLabel,
              color: color.name,
              colorHex: color.hex,
              sku: `${(pName || (isKidsCategory ? 'KID' : 'PROD')).slice(0, 3).toUpperCase()}-${color.name.slice(0, 2).toUpperCase()}-${ks.ageLabel.replace(/[^a-zA-Z0-9]/g, '')}`,
              price: pBasePrice,
              discountPrice: pDiscPrice || undefined,
              stock: ks.stock || 15,
              kidsSize: ks,
              images: [
                color.hex === '#C0654B' 
                  ? 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80'
                  : 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&q=80'
              ]
            });
          });
        }
      });

      setVariantsMatrix(rows);
    }
  }, [formStep, enableStandardSizes, selectedSizes, enableManualSizes, kidsSizeRows, selectedColors, isKidsCategory]);

  // Synchronize available colors if editing a product with custom variants
  useEffect(() => {
    if (editProduct && editProduct.colors) {
      const missing = editProduct.colors.filter(
        col => !availableColors.some(c => c.name.toLowerCase() === col.name.toLowerCase())
      );
      if (missing.length > 0) {
        setAvailableColors(prev => [...prev, ...missing.map(m => ({ name: m.name, hex: m.hex }))]);
      }
    }
  }, [editProduct]);

  // "Copy first row to all" shortcut
  const handleCopyFirstRow = () => {
    if (variantsMatrix.length < 2) return;
    const template = variantsMatrix[0];
    const copied = variantsMatrix.map((row, idx) => {
      if (idx === 0) return row;
      return {
        ...row,
        price: template.price,
        discountPrice: template.discountPrice,
        stock: template.stock
      };
    });
    setVariantsMatrix(copied);
    showToast('Applied price and stock configuration to all matrix variants.');
  };

  // Safe Filter list calculation
  const getSubcategoriesForCategory = (catId: string) => {
    return categories.find(c => c.id === catId)?.subcategories || [];
  };

  const getTypesForSubcategory = (catId: string, subId: string) => {
    return getSubcategoriesForCategory(catId).find(s => s.id === subId)?.types || [];
  };

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(30);
  const ITEMS_PER_PAGE = itemsPerPage;

  // Memoized Filtering products for maximum performance
  const filteredProducts = React.useMemo(() => {
    return products.filter(p => {
      const matchesSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            (p.variants && p.variants.some(v => v.sku.toLowerCase().includes(searchQuery.toLowerCase())));
      const matchesCat = filterCat ? p.categoryId === filterCat : true;
      const matchesSub = filterSub ? p.subcategoryId === filterSub : true;
      const matchesType = filterType ? p.typeId === filterType : true;
      const matchesStatus = filterStatus ? p.status === filterStatus : true;
      const matchesTag = filterTag ? p.tags.includes(filterTag as ProductTag) : true;
      
      let matchesStock = true;
      const totalStock = p.variants?.reduce((sum, v) => sum + v.stock, 0) || 0;
      if (filterStock === 'instock') matchesStock = totalStock > 10;
      else if (filterStock === 'lowstock') matchesStock = totalStock > 0 && totalStock <= 10;
      else if (filterStock === 'out') matchesStock = totalStock === 0;

      return matchesSearch && matchesCat && matchesSub && matchesType && matchesStatus && matchesStock && matchesTag;
    });
  }, [products, searchQuery, filterCat, filterSub, filterType, filterStatus, filterStock, filterTag]);

  // Reset to page 1 when search or filter options change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterCat, filterSub, filterType, filterStatus, filterStock, filterTag]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) || 1;
  const pagedProducts = React.useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  // Toggle selection
  const handleSelectProduct = (id: string) => {
    setSelectedProductIds(prev => 
      prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedProductIds.length === filteredProducts.length) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(filteredProducts.map(p => p.id));
    }
  };

  // INLINE QUICK EDITS
  const handleInlinePriceChange = (id: string, basePrice: number, discPrice?: number) => {
    const discountPrice = discPrice || undefined;
    const discountPercent = (discountPrice && basePrice > discountPrice) ? Math.round(((basePrice - discountPrice) / basePrice) * 100) : undefined;
    setProducts(prev => prev.map(p => {
      if (p.id !== id) return p;
      return {
        ...p,
        basePrice,
        discountPrice,
        discountPercent,
        variants: p.variants.map(v => ({
          ...v,
          price: basePrice,
          discountPrice
        }))
      };
    }));
    updateProduct(id, { basePrice, discountPrice, discountPercent });
    showToast('Base price and variants synced successfully.');
  };

  const handleInlineStockChange = (id: string, newStock: number) => {
    const target = products.find(p => p.id === id);
    if (!target) return;
    const updatedVariants = target.variants.map(v => ({ ...v, stock: Math.max(0, newStock) }));
    setProducts(prev => prev.map(p => {
      if (p.id !== id) return p;
      return {
        ...p,
        variants: updatedVariants
      };
    }));
    updateProduct(id, { variants: updatedVariants });
    showToast('Direct stock levels adjusted.');
  };

  const handleInlineStatusToggle = (id: string, current: Product['status']) => {
    const nextStatus: Product['status'] = current === 'published' ? 'draft' : 'published';
    setProducts(prev => prev.map(p => p.id === id ? { ...p, status: nextStatus } : p));
    updateProduct(id, { status: nextStatus });
    showToast(`Product set to ${nextStatus}.`);
  };

  // CLONE / DUPLICATE
  const handleDuplicateProduct = (prod: Product) => {
    const uniqueSuffix = Date.now().toString().slice(-4);
    const cloned: Product = {
      ...prod,
      id: `p-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: prod.name, // Clean product title, without "(Copy)"
      slug: `${prod.slug}-${uniqueSuffix}`,
      created_at: new Date().toISOString(),
      variants: prod.variants.map(v => ({
        ...v,
        id: `v-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        sku: `${v.sku}-${uniqueSuffix}`
      }))
    };
    createProduct(cloned);
    showToast(`Product "${prod.name}" duplicated & published successfully!`);
  };

  // SOFT DELETE WORKFLOW
  const handleSoftDeleteProduct = (prod: Product) => {
    // 1. Add to recentlyDeleted
    setRecentlyDeleted(prev => [prod, ...prev]);
    // 2. Remove from active product state and delete from db
    setProducts(prev => prev.filter(p => p.id !== prod.id));
    deleteProduct(prod.id);
    showToast(`"${prod.name}" moved to Recently Deleted Bin.`);
  };

  const handleRestoreProduct = (prod: Product) => {
    setProducts(prev => [prod, ...prev]);
    setRecentlyDeleted(prev => prev.filter(p => p.id !== prod.id));
    createProduct(prod);
    showToast(`"${prod.name}" has been fully restored to active storefront!`);
  };

  const handlePermanentDelete = (prodId: string) => {
    if (confirm("Are you sure you want to permanently delete this product? Historical orders will use archived copy, but this item will be destroyed.")) {
      setRecentlyDeleted(prev => prev.filter(p => p.id !== prodId));
      deleteProduct(prodId);
      showToast('Permanently deleted.');
    }
  };

  // BULK ACTIONS
  const handleExecuteBulkAction = async () => {
    if (selectedProductIds.length === 0) return;

    if (bulkAction === 'delete') {
      const prodsToSoftDelete = products.filter(p => selectedProductIds.includes(p.id));
      setRecentlyDeleted(prev => [...prodsToSoftDelete, ...prev]);
      setProducts(prev => prev.filter(p => !selectedProductIds.includes(p.id)));
      for (const id of selectedProductIds) {
        deleteProduct(id);
      }
      showToast(`Deleted ${selectedProductIds.length} products from storefront and database.`);
    } else if (bulkAction === 'activate') {
      setProducts(prev => prev.map(p => selectedProductIds.includes(p.id) ? { ...p, status: 'published' } : p));
      for (const id of selectedProductIds) {
        updateProduct(id, { status: 'published' });
      }
      showToast(`Activated ${selectedProductIds.length} products.`);
    } else if (bulkAction === 'deactivate') {
      setProducts(prev => prev.map(p => selectedProductIds.includes(p.id) ? { ...p, status: 'draft' } : p));
      for (const id of selectedProductIds) {
        updateProduct(id, { status: 'draft' });
      }
      showToast(`Drafted ${selectedProductIds.length} products.`);
    } else if (bulkAction === 'apply_discount') {
      setProducts(prev => prev.map(p => {
        if (!selectedProductIds.includes(p.id)) return p;
        const discountPrice = Math.round(p.basePrice * (1 - bulkDiscountVal / 100));
        return {
          ...p,
          discountPrice,
          discountPercent: bulkDiscountVal,
          variants: p.variants.map(v => ({
            ...v,
            discountPrice
          }))
        };
      }));
      for (const id of selectedProductIds) {
        const prod = products.find(p => p.id === id);
        if (prod) {
          const discountPrice = Math.round(prod.basePrice * (1 - bulkDiscountVal / 100));
          updateProduct(id, { discountPrice, discountPercent: bulkDiscountVal });
        }
      }
      showToast(`Applied bulk ${bulkDiscountVal}% discount to selected products.`);
    }

    setSelectedProductIds([]);
    setBulkAction('');
  };

  // GUIDED FORM SAVE (Add / Edit)
  const handleOpenCreateForm = () => {
    setEditProduct(null);
    setFormStep(1);
    // Reset Form
    setPCategoryId('women');
    setPSubcategoryId('');
    setPTypeId('');
    setPName('');
    setPBrand('Terra Ethnic');
    setPDescription('');
    setPFabric('Cotton Blend');
    setPFit('Regular Fit');
    setPOccasion('Everyday');
    setPHsn('5407');
    setPGst(5);
    setPBasePrice(1999);
    setPDiscPrice(1499);
    setPTags(['new_arrival']);
    setPStatus('published');

    if (isKidsCategory) {
      setEnableStandardSizes(false);
      setSelectedSizes(['S', 'M', 'L', 'XL']);
      setEnableManualSizes(true);
      setKidsSizeRows([
        { ageLabel: '2-3 Years', measurement: 54, unit: 'cm', stock: 15 },
        { ageLabel: '4-5 Years', measurement: 60, unit: 'cm', stock: 20 }
      ]);
    } else {
      setEnableStandardSizes(true);
      setSelectedSizes(['S', 'M', 'L', 'XL']);
      setEnableManualSizes(false);
      setKidsSizeRows([
        { ageLabel: 'Size 38 (M)', measurement: 96, unit: 'cm', stock: 15 },
        { ageLabel: 'Size 40 (L)', measurement: 102, unit: 'cm', stock: 20 }
      ]);
    }

    setSelectedColors([
      { name: 'Teal Green', hex: '#005F54' },
      { name: 'Rose Clay', hex: '#C0654B' }
    ]);
    setProductImages([
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80'
    ]);
    setVariantsMatrix([]);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (prod: Product) => {
    setEditProduct(prod);
    setFormStep(1);
    setPCategoryId(prod.categoryId);
    setPSubcategoryId(prod.subcategoryId);
    setPTypeId(prod.typeId || '');
    setPName(prod.name);
    setPBrand(prod.brandName || 'Terra Ethnic');
    setPDescription(prod.description);
    setPFabric(prod.fabric);
    setPFit(prod.fit);
    setPOccasion(prod.occasion);
    setPHsn(prod.hsnCode);
    setPGst(prod.gstPercent);
    setPBasePrice(prod.basePrice);
    setPDiscPrice(prod.discountPrice || 0);
    setPTags(prod.tags);
    setPStatus(prod.status === 'published' ? 'published' : 'draft');

    const hasKidsSizes = Boolean(prod.kidsSizes && prod.kidsSizes.length > 0);
    const nonKidSizes = (prod.availableSizes || []).filter(s => 
      !hasKidsSizes || !prod.kidsSizes?.some(k => s.includes(k.ageLabel) || s === `${k.ageLabel} (${k.measurement} ${k.unit})`)
    );

    if (nonKidSizes.length > 0) {
      setEnableStandardSizes(true);
      setSelectedSizes(nonKidSizes);
    } else if (!hasKidsSizes) {
      setEnableStandardSizes(true);
      setSelectedSizes(prod.availableSizes || ['S', 'M', 'L', 'XL']);
    } else {
      setEnableStandardSizes(false);
      setSelectedSizes(['S', 'M', 'L', 'XL']);
    }

    if (hasKidsSizes) {
      setEnableManualSizes(true);
      setKidsSizeRows(prod.kidsSizes || []);
    } else {
      setEnableManualSizes(false);
      setKidsSizeRows([
        { ageLabel: 'Size 38 (M)', measurement: 96, unit: 'cm', stock: 15 },
        { ageLabel: 'Size 40 (L)', measurement: 102, unit: 'cm', stock: 20 }
      ]);
    }
    setSelectedColors(prod.colors || [
      { name: 'Teal Green', hex: '#005F54' },
      { name: 'Rose Clay', hex: '#C0654B' }
    ]);
    const existingImgs = (prod.colors || []).flatMap(c => c.images).filter(Boolean);
    setProductImages(existingImgs.length > 0 ? existingImgs : [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80'
    ]);
    setVariantsMatrix(prod.variants);
    setIsFormOpen(true);
  };

  const handleSaveProductForm = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!pName.trim()) {
      showToast('Please provide a Product Title in Step 2.');
      setFormStep(2);
      return;
    }
    if (!pSubcategoryId) {
      showToast('Please select a Subcategory in Step 1.');
      setFormStep(1);
      return;
    }
    if (!pTypeId) {
      showToast('Please select a Style Type in Step 1.');
      setFormStep(1);
      return;
    }

    const activeStdSizes = enableStandardSizes ? selectedSizes : [];
    const activeManualRows = enableManualSizes ? kidsSizeRows.filter(r => r.ageLabel.trim()) : [];

    if (activeStdSizes.length === 0 && activeManualRows.length === 0) {
      showToast('Please enable and select at least one Standard Size or Manual Measurement Size in Step 3.');
      setFormStep(3);
      return;
    }

    if (enableManualSizes) {
      if (kidsSizeRows.length === 0) {
        showToast('Please add at least one row under Manual Measurement Sizes or disable the option.');
        setFormStep(3);
        return;
      }
      for (let i = 0; i < kidsSizeRows.length; i++) {
        const row = kidsSizeRows[i];
        if (!row.ageLabel || !row.ageLabel.trim()) {
          showToast(`Manual Size Row ${i + 1}: Please enter a Size/Fit Label (e.g. Size 38, Chest 40, 2-3 Years).`);
          setFormStep(3);
          return;
        }
        if (!row.measurement || Number(row.measurement) <= 0) {
          showToast(`Manual Size Row ${i + 1}: Measurement value must be a positive number.`);
          setFormStep(3);
          return;
        }
      }
    }

    const savedColors: ColorVariant[] = selectedColors.map(c => ({
      name: c.name,
      hex: c.hex,
      images: productImages.length > 0 ? productImages : [
        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80'
      ]
    }));

    const finalAvailableSizes = [
      ...activeStdSizes,
      ...activeManualRows.map(k => `${k.ageLabel} (${k.measurement} ${k.unit})`)
    ];

    const finalKidsSizes = activeManualRows.length > 0 ? activeManualRows : undefined;

    if (editProduct) {
      // Edit save
      const updated: Product = {
        ...editProduct,
        name: pName,
        categoryId: pCategoryId,
        subcategoryId: pSubcategoryId,
        typeId: pTypeId,
        brandName: pBrand,
        description: pDescription,
        fabric: pFabric,
        fit: pFit,
        occasion: pOccasion,
        hsnCode: pHsn,
        gstPercent: pGst,
        basePrice: Number(pBasePrice),
        discountPrice: pDiscPrice ? Number(pDiscPrice) : undefined,
        tags: pTags,
        status: pStatus as any,
        variants: variantsMatrix,
        colors: savedColors,
        availableSizes: finalAvailableSizes,
        kidsSizes: finalKidsSizes
      };

      setProducts(prev => prev.map(p => p.id === editProduct.id ? updated : p));
      updateProduct(editProduct.id, updated);
      showToast(`Product "${pName}" updated successfully.`);
    } else {
      // Create new save
      const newProd: Product = {
        id: `p-${Date.now()}`,
        name: pName,
        slug: pName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        categoryId: pCategoryId,
        subcategoryId: pSubcategoryId,
        typeId: pTypeId,
        brandName: pBrand,
        description: pDescription,
        fabric: pFabric,
        fit: pFit,
        occasion: pOccasion,
        hsnCode: pHsn,
        gstPercent: pGst,
        basePrice: Number(pBasePrice),
        discountPrice: pDiscPrice ? Number(pDiscPrice) : undefined,
        tags: pTags,
        status: pStatus as any,
        variants: variantsMatrix,
        colors: savedColors,
        availableSizes: finalAvailableSizes,
        kidsSizes: finalKidsSizes,
        rating: 5,
        reviewCount: 0,
        created_at: new Date().toISOString()
      };

      createProduct(newProd);
      showToast(`New Product "${pName}" successfully created and placed live.`);
    }

    setIsFormOpen(false);
  };

  // EXPORT PRODUCTS TO CSV
  const handleExportCSV = () => {
    let csv = "Product ID,Name,Category,Subcategory,Style,Base Price,Discount Price,SKU,Stock,Fabric,Fit,Occasion,Status\n";
    const escapeCsv = (val: any) => `"${String(val ?? '').replace(/"/g, '""')}"`;

    products.forEach(p => {
      if (p.variants && p.variants.length > 0) {
        p.variants.forEach(v => {
          csv += `${escapeCsv(p.id)},${escapeCsv(p.name)},${escapeCsv(p.categoryId)},${escapeCsv(p.subcategoryId)},${escapeCsv(p.typeId || '')},${p.basePrice},${p.discountPrice || ''},${escapeCsv(v.sku)},${v.stock},${escapeCsv(p.fabric)},${escapeCsv(p.fit)},${escapeCsv(p.occasion)},${escapeCsv(p.status)}\n`;
        });
      } else {
        csv += `${escapeCsv(p.id)},${escapeCsv(p.name)},${escapeCsv(p.categoryId)},${escapeCsv(p.subcategoryId)},${escapeCsv(p.typeId || '')},${p.basePrice},${p.discountPrice || ''},${escapeCsv(`SKU-${p.id}`)},${(p as any).stock || 25},${escapeCsv(p.fabric)},${escapeCsv(p.fit)},${escapeCsv(p.occasion)},${escapeCsv(p.status)}\n`;
      }
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `pgmart_products_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Successfully exported ${products.length} products to CSV file!`);
  };

  // Helper to resolve any raw Category, Subcategory & Style/Type input to valid database foreign key IDs
  const resolveCatalogHierarchy = (rawCat: string, rawSub: string, rawType: string, productName: string = '') => {
    const cleanCat = String(rawCat || '').trim().toLowerCase();
    const cleanSub = String(rawSub || '').trim().toLowerCase();
    const cleanType = String(rawType || '').trim().toLowerCase();
    const cleanName = String(productName || '').trim().toLowerCase();

    // 1. Resolve Category
    let resolvedCat = categories.find(c => c.id.toLowerCase() === cleanCat || c.slug.toLowerCase() === cleanCat || c.name.toLowerCase() === cleanCat);
    if (!resolvedCat && cleanCat) {
      resolvedCat = categories.find(c => cleanCat.includes(c.id.toLowerCase()) || c.name.toLowerCase().includes(cleanCat) || cleanCat.includes(c.slug.toLowerCase()));
    }
    if (!resolvedCat && cleanName) {
      if (cleanName.includes('saree') || cleanName.includes('lehenga') || cleanName.includes('kurti') || cleanName.includes('dress') || cleanName.includes('women')) {
        resolvedCat = categories.find(c => c.id === 'women');
      } else if (cleanName.includes('kurta') || cleanName.includes('sherwani') || cleanName.includes('men') || cleanName.includes('shirt')) {
        resolvedCat = categories.find(c => c.id === 'men');
      } else if (cleanName.includes('boy') || cleanName.includes('girl') || cleanName.includes('kid') || cleanName.includes('baby')) {
        resolvedCat = categories.find(c => c.id === 'kids');
      } else if (cleanName.includes('bra') || cleanName.includes('panty') || cleanName.includes('brief') || cleanName.includes('innerwear')) {
        resolvedCat = categories.find(c => c.id === 'undergarments');
      }
    }
    const cat = resolvedCat || categories[0] || { id: 'women', subcategories: [] };
    const catId = cat.id;

    // 2. Resolve Subcategory strictly under catId
    const validSubs = cat.subcategories || [];
    let resolvedSub = validSubs.find(s => s.id.toLowerCase() === cleanSub || s.slug.toLowerCase() === cleanSub || s.name.toLowerCase() === cleanSub);
    if (!resolvedSub && cleanSub) {
      resolvedSub = validSubs.find(s => cleanSub.includes(s.id.toLowerCase()) || s.name.toLowerCase().includes(cleanSub) || cleanSub.includes(s.slug.toLowerCase()) || s.slug.toLowerCase().includes(cleanSub));
    }
    if (!resolvedSub && cleanName) {
      resolvedSub = validSubs.find(s => cleanName.includes(s.slug.toLowerCase()) || s.name.toLowerCase().includes(cleanName) || cleanName.includes(s.name.toLowerCase().split(' ')[0]));
    }
    const sub = resolvedSub || validSubs[0] || { id: 'w-ethnic', types: [] };
    const subId = sub.id;

    // 3. Resolve Style/Type strictly under subId
    const validTypes = sub.types || [];
    let resolvedType = validTypes.find(t => t.id.toLowerCase() === cleanType || t.slug.toLowerCase() === cleanType || t.name.toLowerCase() === cleanType);
    if (!resolvedType && cleanType) {
      resolvedType = validTypes.find(t => cleanType.includes(t.id.toLowerCase()) || t.name.toLowerCase().includes(cleanType) || cleanType.includes(t.slug.toLowerCase()) || t.slug.toLowerCase().includes(cleanType));
    }
    if (!resolvedType && cleanName) {
      resolvedType = validTypes.find(t => cleanName.includes(t.slug.toLowerCase()) || t.name.toLowerCase().includes(cleanName) || cleanName.includes(t.slug.toLowerCase().split('-')[0]));
    }
    const typeId = resolvedType?.id || validTypes[0]?.id || 'wt-saree';

    return { catId, subId, typeId };
  };

  // DOWNLOAD SAMPLE CSV TEMPLATE
  const handleDownloadSampleCSV = () => {
    let sampleCsv = "Name,Category,Subcategory,Style,BasePrice,DiscountPrice,SKU,Stock,Fabric,Occasion,Image,Tags\n";
    sampleCsv += '"Peach Banarasi Zari Silk Saree","Women\'s Fashion","Ethnic & Traditional Wear","Saree",4999,3999,"BZS-RED-01",50,"Banarasi Silk","Bridal","https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80","new_arrival,deal_of_the_day"\n';
    sampleCsv += '"Designer Georgette Anarkali Kurta Set","Women\'s Fashion","Ethnic & Traditional Wear","Anarkali Suits",2999,2299,"AKS-BLU-02",35,"Georgette","Festival","https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80","new_arrival"\n';
    sampleCsv += '"Royal Heritage Raw Silk Sherwani Set","Men\'s Fashion","Ethnic Wear","Sherwani",8999,7499,"RHS-GLD-03",20,"Raw Silk","Wedding","https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&w=600&q=80","bestseller"\n';

    const blob = new Blob([sampleCsv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "pgmart_sample_import_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Sample CSV template downloaded!");
  };

  // DOWNLOAD SAMPLE EXCEL (.XLSX) TEMPLATE
  const handleDownloadSampleExcel = () => {
    const sampleData = [
      {
        "Name": "Peach Banarasi Zari Silk Saree",
        "Category": "Women's Fashion",
        "Subcategory": "Ethnic & Traditional Wear",
        "Style": "Saree",
        "BasePrice": 4999,
        "DiscountPrice": 3999,
        "SKU": "BZS-RED-01",
        "Stock": 50,
        "Fabric": "Banarasi Silk",
        "Occasion": "Bridal",
        "Image": "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80",
        "Tags": "new_arrival, deal_of_the_day"
      },
      {
        "Name": "Designer Georgette Anarkali Kurta Set",
        "Category": "Women's Fashion",
        "Subcategory": "Ethnic & Traditional Wear",
        "Style": "Anarkali Suits",
        "BasePrice": 2999,
        "DiscountPrice": 2299,
        "SKU": "AKS-BLU-02",
        "Stock": 35,
        "Fabric": "Georgette",
        "Occasion": "Festival",
        "Image": "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80",
        "Tags": "new_arrival"
      },
      {
        "Name": "Royal Heritage Raw Silk Sherwani Set",
        "Category": "Men's Fashion",
        "Subcategory": "Ethnic Wear",
        "Style": "Sherwani",
        "BasePrice": 8999,
        "DiscountPrice": 7499,
        "SKU": "RHS-GLD-03",
        "Stock": 20,
        "Fabric": "Raw Silk",
        "Occasion": "Wedding",
        "Image": "https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&w=600&q=80",
        "Tags": "bestseller"
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Products");
    XLSX.writeFile(workbook, "pgmart_sample_import_template.xlsx");
    showToast("Sample Excel (.xlsx) template downloaded!");
  };

  // UPLOAD EXCEL (.XLSX, .XLS) OR CSV FILE FROM DEVICE
  const handleExcelOrCSVFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();
    const reader = new FileReader();

    if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      reader.onload = (event) => {
        try {
          const data = new Uint8Array(event.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
          setCsvText(csvOutput);
          showToast(`📊 Excel file "${file.name}" loaded! Click "Parse & Import Data into Database" below.`);
        } catch (err) {
          alert('Failed to parse Excel workbook. Please check file format.');
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          setCsvText(content);
          showToast(`Loaded CSV file "${file.name}". Click "Parse & Import Data into Database" below.`);
        }
      };
      reader.readAsText(file);
    }
  };

  // PARSE & IMPORT EXCEL/CSV DATA INTO CATALOG & DATABASE
  const handleImportCSVText = async () => {
    if (!csvText.trim()) {
      showToast('Please paste CSV text or upload an Excel / CSV file first.');
      return;
    }
    try {
      const rawLines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
      if (rawLines.length === 0) return;

      // Extract header line
      let headerCols: string[] = [];
      let startIndex = 0;
      const firstLine = rawLines[0];
      const parsedFirst = (firstLine.match(/(?:[^\s",]+|"[^"]*")+/g) || firstLine.split(',')).map(c => c.trim().replace(/^"|"$/g, '').toLowerCase());

      if (parsedFirst.some(c => c.includes('name') || c.includes('title') || c.includes('price') || c.includes('cat') || c.includes('sku') || c.includes('product'))) {
        headerCols = parsedFirst;
        startIndex = 1;
      }

      const getColIndex = (names: string[]): number => {
        return headerCols.findIndex(h => names.some(n => h.includes(n)));
      };

      const nameIdx = getColIndex(['name', 'title', 'product']);
      const catIdx = getColIndex(['category', 'cat', 'department']);
      const subIdx = getColIndex(['subcategory', 'sub', 'section']);
      const typeIdx = getColIndex(['type', 'style']);
      const basePriceIdx = getColIndex(['base', 'price', 'mrp', 'cost']);
      const discPriceIdx = getColIndex(['discount', 'sale', 'offer']);
      const skuIdx = getColIndex(['sku', 'code', 'barcode']);
      const stockIdx = getColIndex(['stock', 'qty', 'quantity', 'inventory']);
      const fabricIdx = getColIndex(['fabric', 'material']);
      const fitIdx = getColIndex(['fit']);
      const occasionIdx = getColIndex(['occasion']);
      const imgIdx = getColIndex(['image', 'photo', 'url', 'img', 'picture']);
      const tagsIdx = getColIndex(['tags', 'tag', 'keywords', 'labels']);

      const newProds: Product[] = [];
      const sbBatch: any[] = [];

      for (let i = startIndex; i < rawLines.length; i++) {
        const line = rawLines[i];
        const rawCols = line.match(/(?:[^\s",]+|"[^"]*")+/g) || line.split(',');
        if (rawCols.length >= 2) {
          const cols = rawCols.map(c => c.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));

          const name = (nameIdx >= 0 && cols[nameIdx]) ? cols[nameIdx] : (cols[0] || '');
          if (!name) continue;

          const rawCat = (catIdx >= 0 && cols[catIdx]) ? cols[catIdx] : (cols[1] || '');
          const rawSub = (subIdx >= 0 && cols[subIdx]) ? cols[subIdx] : (cols[2] || '');
          const rawType = (typeIdx >= 0 && cols[typeIdx]) ? cols[typeIdx] : (cols[3] || '');

          const { catId, subId, typeId } = resolveCatalogHierarchy(rawCat, rawSub, rawType, name);

          const rawBasePrice = (basePriceIdx >= 0 && cols[basePriceIdx]) ? cols[basePriceIdx] : (cols[4] || '1999');
          const bPrice = Number(String(rawBasePrice).replace(/[^0-9.]/g, '')) || 1999;

          const rawDiscPrice = (discPriceIdx >= 0 && cols[discPriceIdx]) ? cols[discPriceIdx] : (cols[5] || '');
          const dPrice = rawDiscPrice ? Number(String(rawDiscPrice).replace(/[^0-9.]/g, '')) : undefined;

          const skuVal = (skuIdx >= 0 && cols[skuIdx]) ? cols[skuIdx] : (cols[6] || `PGM-IMP-${Date.now().toString().slice(-4)}-${i}`);
          const rawStock = (stockIdx >= 0 && cols[stockIdx]) ? cols[stockIdx] : (cols[7] || '25');
          const pStock = Number(String(rawStock).replace(/[^0-9]/g, '')) || 25;

          const fabric = (fabricIdx >= 0 && cols[fabricIdx]) ? cols[fabricIdx] : (cols[8] || 'Cotton Silk Blend');
          const fit = (fitIdx >= 0 && cols[fitIdx]) ? cols[fitIdx] : 'Regular Fit';
          const occasion = (occasionIdx >= 0 && cols[occasionIdx]) ? cols[occasionIdx] : (cols[9] || 'Festive / Casual');
          const imgUrl = (imgIdx >= 0 && cols[imgIdx]) ? cols[imgIdx] : 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80';

          const tagsVal: ProductTag[] = (tagsIdx >= 0 && cols[tagsIdx])
            ? (cols[tagsIdx].split(/[,;]/).map(t => t.trim().toLowerCase().replace(/\s+/g, '_') as ProductTag).filter(Boolean))
            : ['new_arrival'];

          const discountPercent = (dPrice && bPrice > dPrice) ? Math.round(((bPrice - dPrice) / bPrice) * 100) : undefined;
          const isDeal = tagsVal.includes('deal_of_the_day' as any);
          const prodId = `p-imp-${Date.now()}-${i}`;
          const nowIso = new Date().toISOString();

          const prodData: Product = {
            id: prodId,
            name: name.trim(),
            slug: name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `item-${Date.now()}-${i}`,
            categoryId: catId,
            subcategoryId: subId,
            typeId: typeId,
            brandName: settings.storeName || 'PGmart',
            description: `${name.trim()} - Premium quality fabric crafted with high precision and luxury finish.`,
            basePrice: bPrice,
            discountPrice: dPrice,
            discountPercent,
            fabric,
            fit,
            occasion,
            status: 'published',
            isDealOfTheDay: isDeal,
            tags: tagsVal.length > 0 ? tagsVal : ['new_arrival'],
            variants: [{
              id: `v-${prodId}-1`,
              productId: prodId,
              size: 'Free Size',
              color: 'Default',
              colorHex: settings.primaryColor || '#C0654B',
              sku: skuVal,
              price: bPrice,
              discountPrice: dPrice,
              stock: pStock,
              images: [imgUrl]
            }],
            colors: [{ name: 'Default', hex: settings.primaryColor || '#C0654B', images: [imgUrl] }],
            availableSizes: ['Free Size'],
            hsnCode: '5407',
            gstPercent: 5,
            rating: 5,
            reviewCount: 1,
            created_at: nowIso
          };

          newProds.push(prodData);

          sbBatch.push({
            id: prodData.id,
            name: prodData.name,
            slug: prodData.slug,
            categoryId: prodData.categoryId,
            subcategoryId: prodData.subcategoryId,
            typeId: prodData.typeId,
            brandName: prodData.brandName,
            description: prodData.description,
            fabric: prodData.fabric,
            fit: prodData.fit,
            occasion: prodData.occasion,
            hsnCode: prodData.hsnCode,
            gstPercent: prodData.gstPercent,
            basePrice: prodData.basePrice,
            discountPrice: prodData.discountPrice || null,
            discountPercent: prodData.discountPercent || null,
            tags: JSON.stringify(prodData.tags),
            isDealOfTheDay: prodData.isDealOfTheDay,
            status: prodData.status,
            variants: JSON.stringify(prodData.variants),
            colors: JSON.stringify(prodData.colors),
            availableSizes: JSON.stringify(prodData.availableSizes),
            rating: prodData.rating,
            reviewCount: prodData.reviewCount,
            created_at: prodData.created_at,
            updated_at: nowIso
          });
        }
      }

      if (newProds.length > 0) {
        // 1. Direct Supabase batch upsert
        try {
          const { error: sbErr } = await supabase.from('Product').upsert(sbBatch);
          if (sbErr) {
            console.warn('Supabase batch import error:', sbErr);
          }
        } catch (sbEx) {
          console.warn('Supabase batch import exception:', sbEx);
        }

        // 2. Immediately update storefront state
        setProducts(prev => [...newProds, ...prev]);

        // 3. Background server REST API sync
        for (const p of newProds) {
          fetch('/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(p)
          }).catch(() => {});
        }

        showToast(`🎉 Bulk imported & published ${newProds.length} products to database & storefront!`);
        setCsvText('');
        setShowCsvImport(false);
        alert('Could not parse any valid product rows. Please check table formatting.');
      }
    } catch (err: any) {
      alert('Error parsing Excel / CSV file. Please verify formatting.');
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 text-stone-800 animate-fade-in text-left">
      {/* HEADER CONTROLS */}
      {!isFormOpen && (
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-stone-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold font-serif text-stone-900">Apparel Style Manager</h2>
            <p className="text-[11px] sm:text-xs text-stone-400">Total catalog products list, soft deletes, and bulk imports/exports</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setShowCsvImport(!showCsvImport)}
              className="flex-1 sm:flex-none justify-center px-3 sm:px-4 py-2 border border-stone-200 hover:bg-stone-50 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Upload className="w-3.5 h-3.5 text-stone-500" />
              <span>Bulk CSV</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="flex-1 sm:flex-none justify-center px-3 sm:px-4 py-2 border border-stone-200 hover:bg-stone-50 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-[#C0654B]" />
              <span>Export</span>
            </button>

            <button
              onClick={handleOpenCreateForm}
              className="w-full sm:w-auto justify-center px-4 sm:px-5 py-2.5 bg-[#C0654B] hover:bg-[#8B4A38] text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" /> Add Product Wizard
            </button>
          </div>
        </div>
      )}

      {/* EXCEL / CSV IMPORT POP-PANEL */}
      {showCsvImport && (
        <div className="bg-stone-50 border border-stone-200 p-4 sm:p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <div>
              <span className="text-xs sm:text-sm font-bold text-stone-900 block">Bulk Import Products via Excel (.xlsx / .xls) or CSV</span>
              <p className="text-[10.5px] sm:text-[11px] text-stone-500 mt-0.5">
                Upload an Excel sheet (.xlsx, .xls) or CSV file from your device, or paste CSV rows below.
              </p>
            </div>
            <button onClick={() => setShowCsvImport(false)} className="text-stone-400 hover:text-stone-700 text-lg p-1">✕</button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2.5 bg-white p-3 rounded-xl border border-stone-200">
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <input
                type="file"
                ref={csvFileInputRef}
                accept=".xlsx,.xls,.csv,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                onChange={handleExcelOrCSVFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => csvFileInputRef.current?.click()}
                className="w-full sm:w-auto px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Upload className="w-3.5 h-3.5 text-emerald-300" />
                Select File from Device
              </button>

              <button
                type="button"
                onClick={handleDownloadSampleExcel}
                className="flex-1 sm:flex-none px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer border border-emerald-200"
              >
                <Download className="w-3 h-3 text-emerald-700" />
                Sample .xlsx
              </button>

              <button
                type="button"
                onClick={handleDownloadSampleCSV}
                className="flex-1 sm:flex-none px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3 h-3 text-stone-600" />
                Sample .csv
              </button>
            </div>

            <span className="text-[10px] text-stone-400 font-mono hidden sm:inline-block">
              Supports .xlsx, .xls, and .csv
            </span>
          </div>

          <textarea
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            placeholder="Paste raw CSV rows or select a .csv file above..."
            rows={4}
            className="w-full p-3 bg-white border border-stone-300 rounded-xl text-xs font-mono"
          />

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-1">
            <button onClick={() => setCsvText('')} className="px-3 py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold rounded-xl text-xs cursor-pointer text-center">
              Clear Text
            </button>
            <button onClick={handleImportCSVText} className="px-5 py-2.5 bg-[#C0654B] hover:bg-[#8B4A38] text-white font-bold rounded-xl text-xs cursor-pointer shadow-md flex items-center justify-center gap-1.5">
              <Upload className="w-4 h-4" />
              Parse & Import Data into Database
            </button>
          </div>
        </div>
      )}

      {/* MULTI-FILTER PANEL */}
      {!isFormOpen && (
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-stone-200/80 shadow-sm space-y-3 sm:space-y-4 text-xs font-medium text-stone-500">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2.5 sm:gap-3">
            {/* Live Search */}
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search style names or SKUs..."
                className="w-full pl-9 pr-3 py-2 border border-stone-200 rounded-xl bg-stone-50 focus:bg-white focus:border-[#C0654B] outline-none font-semibold text-stone-700 text-xs transition-all"
              />
            </div>

            {/* Placement Category & Status Selects (Responsive Grid on Mobile) */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2">
              <select
                value={filterCat}
                onChange={(e) => { setFilterCat(e.target.value); setFilterSub(''); setFilterType(''); }}
                className="w-full sm:w-auto p-2 border border-stone-200 rounded-xl outline-none bg-white font-bold text-stone-700 text-[11px] sm:text-xs"
              >
                <option value="">All Categories</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>

              <select
                value={filterSub}
                onChange={(e) => { setFilterSub(e.target.value); setFilterType(''); }}
                disabled={!filterCat}
                className="w-full sm:w-auto p-2 border border-stone-200 rounded-xl outline-none bg-white font-bold text-stone-700 disabled:bg-stone-50 disabled:text-stone-300 text-[11px] sm:text-xs"
              >
                <option value="">All Subcategories</option>
                {getSubcategoriesForCategory(filterCat).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                disabled={!filterSub}
                className="w-full sm:w-auto p-2 border border-stone-200 rounded-xl outline-none bg-white font-bold text-stone-700 disabled:bg-stone-50 disabled:text-stone-300 text-[11px] sm:text-xs"
              >
                <option value="">All Style Types</option>
                {getTypesForSubcategory(filterCat, filterSub).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full sm:w-auto p-2 border border-stone-200 rounded-xl bg-white font-bold text-stone-700 text-[11px] sm:text-xs"
              >
                <option value="">All Statuses</option>
                <option value="published">Published</option>
                <option value="draft">Drafts</option>
              </select>

              <select
                value={filterStock}
                onChange={(e) => setFilterStock(e.target.value as any)}
                className="col-span-2 sm:col-span-1 p-2 border border-stone-200 rounded-xl bg-white font-bold text-stone-700 text-[11px] sm:text-xs"
              >
                <option value="all">All Stocks</option>
                <option value="instock">In Stock (&gt;10)</option>
                <option value="lowstock">Low Stock (1-10)</option>
                <option value="out">Out of Stock (0)</option>
              </select>

              {/* Reset Button */}
              {(filterCat || filterSub || filterType || filterStatus || filterStock !== 'all' || searchQuery || filterTag) && (
                <button
                  onClick={() => {
                    setFilterCat(''); setFilterSub(''); setFilterType('');
                    setFilterStatus(''); setFilterStock('all'); setSearchQuery(''); setFilterTag('');
                  }}
                  className="col-span-2 sm:col-span-1 px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-bold cursor-pointer text-center text-[11px] sm:text-xs"
                >
                  Reset Filters
                </button>
              )}
            </div>
          </div>

          {/* Quick filter by tags */}
          <div className="flex items-center gap-2 border-t border-stone-100 pt-2.5 overflow-x-auto no-scrollbar">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider shrink-0">Filter Tags:</span>
            <div className="flex items-center gap-1.5 shrink-0">
              {['new_arrival', 'bestseller', 'trending', 'sale', 'online_exclusive', 'curves_plus_size'].map(tag => (
                <button
                  key={tag}
                  onClick={() => setFilterTag(filterTag === tag ? '' : tag)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold capitalize transition-colors cursor-pointer shrink-0 ${
                    filterTag === tag 
                      ? 'bg-[#C0654B] text-white' 
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {tag.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* BULK ACTIONS BANNER */}
      {!isFormOpen && selectedProductIds.length > 0 && (
        <div className="bg-[#2B2620] text-white p-3 sm:p-3.5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg border border-stone-700 animate-in fade-in duration-150">
          <div className="flex items-center gap-2.5 text-xs font-semibold">
            <span className="w-5 h-5 bg-[#C0654B] rounded-full flex items-center justify-center font-bold text-[10px] font-mono">{selectedProductIds.length}</span>
            <span>Products Selected</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs w-full sm:w-auto">
            <select
              value={bulkAction}
              onChange={(e) => setBulkAction(e.target.value)}
              className="flex-1 sm:flex-none p-2 bg-stone-800 text-white border border-stone-700 rounded-xl outline-none font-bold cursor-pointer text-xs"
            >
              <option value="">-- Apply Bulk Action --</option>
              <option value="activate">Publish Selection</option>
              <option value="deactivate">Unpublish (Set to Draft)</option>
              <option value="apply_discount">Apply Bulk % Discount</option>
              <option value="delete">Soft Delete Selection</option>
            </select>

            {bulkAction === 'apply_discount' && (
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={bulkDiscountVal}
                  onChange={(e) => setBulkDiscountVal(Number(e.target.value))}
                  className="w-12 p-2 bg-stone-800 text-white text-center font-bold rounded-xl border border-stone-700 text-xs"
                />
                <span className="text-stone-400 font-bold">%</span>
              </div>
            )}

            <button
              onClick={handleExecuteBulkAction}
              disabled={!bulkAction}
              className="px-4 py-2 bg-[#C0654B] hover:bg-[#8B4A38] disabled:bg-stone-700 disabled:cursor-not-allowed text-white font-bold rounded-xl cursor-pointer shadow-sm transition-colors text-xs"
            >
              Apply
            </button>
          </div>
        </div>
      )}

      {/* PRODUCTS DISPLAY: DESKTOP TABLE & MOBILE PRODUCT CARDS */}
      {!isFormOpen && (
        <div className="bg-white rounded-2xl border border-stone-200/80 shadow-sm overflow-hidden">
          
          {/* 1. DESKTOP DATA TABLE (Visible on md+ screens) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-stone-50 text-stone-500 font-bold border-b border-stone-200">
                <tr>
                  <th className="p-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={selectedProductIds.length === filteredProducts.length && filteredProducts.length > 0}
                      onChange={handleSelectAll}
                      className="rounded cursor-pointer"
                    />
                  </th>
                  <th className="p-3 min-w-[220px]">Product details</th>
                  <th className="p-3 min-w-[120px]">Category Hierarchy</th>
                  <th className="p-3 min-w-[100px]">Base Price</th>
                  <th className="p-3 min-w-[100px]">Discount Price</th>
                  <th className="p-3 min-w-[90px]">Total Stock</th>
                  <th className="p-3 min-w-[90px]">Status</th>
                  <th className="p-3 min-w-[100px] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-semibold text-stone-700">
                {pagedProducts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-12 text-center text-stone-400">
                      No products match your search criteria. Create a new one!
                    </td>
                  </tr>
                ) : (
                  pagedProducts.map(prod => {
                    const totalStock = prod.variants?.reduce((sum, v) => sum + v.stock, 0) || 0;
                    const isSelected = selectedProductIds.includes(prod.id);

                    return (
                      <tr key={prod.id} className={`hover:bg-stone-50/40 ${isSelected ? 'bg-stone-50' : ''}`}>
                        <td className="p-3 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectProduct(prod.id)}
                            className="rounded cursor-pointer"
                          />
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <img 
                              src={prod.colors[0]?.images[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=120&q=80'} 
                              alt={prod.name} 
                              className="w-10 h-10 object-cover rounded-xl border border-stone-200 bg-stone-50 shrink-0"
                              referrerPolicy="no-referrer"
                            />
                            <div className="min-w-0 max-w-[220px]">
                              <h4 className="font-bold text-stone-900 truncate">{prod.name}</h4>
                              <p className="text-[10px] text-stone-400 font-mono truncate">SKU: {prod.variants[0]?.sku || 'None'}</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {prod.tags.map(t => (
                                  <span key={t} className="text-[8px] bg-stone-100 text-stone-500 px-1 rounded-md lowercase">{t.replace(/_/g, ' ')}</span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="text-stone-800 text-[11px] capitalize font-bold">{prod.categoryId}</div>
                          <div className="text-[10px] text-stone-400 font-mono font-medium">{prod.subcategoryId}</div>
                        </td>
                        <td className="p-3">
                          <input
                            type="number"
                            value={prod.basePrice}
                            onChange={(e) => handleInlinePriceChange(prod.id, Number(e.target.value), prod.discountPrice)}
                            className="w-20 px-2 py-1 border border-stone-200 rounded-lg text-stone-800 font-mono text-center font-bold outline-none bg-stone-50 focus:bg-white"
                          />
                        </td>
                        <td className="p-3">
                          <input
                            type="number"
                            value={prod.discountPrice || ''}
                            placeholder="None"
                            onChange={(e) => handleInlinePriceChange(prod.id, prod.basePrice, e.target.value ? Number(e.target.value) : undefined)}
                            className="w-20 px-2 py-1 border border-stone-200 rounded-lg text-stone-800 font-mono text-center font-bold outline-none bg-stone-50 focus:bg-white"
                          />
                        </td>
                        <td className="p-3">
                          <input
                            type="number"
                            value={totalStock}
                            onChange={(e) => handleInlineStockChange(prod.id, Number(e.target.value))}
                            className={`w-16 px-1.5 py-1 border rounded-lg font-mono text-center font-bold outline-none ${
                              totalStock === 0 ? 'bg-red-50 text-red-600 border-red-200' :
                              totalStock <= 10 ? 'bg-amber-50 text-amber-600 border-amber-200' :
                              'bg-stone-50 text-stone-800 border-stone-200'
                            }`}
                          />
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => handleInlineStatusToggle(prod.id, prod.status)}
                            className={`px-2 py-1 rounded-lg text-[10px] uppercase font-bold tracking-wider cursor-pointer ${
                              prod.status === 'published' ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-100 text-stone-500'
                            }`}
                          >
                            {prod.status}
                          </button>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleDuplicateProduct(prod)}
                              className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg cursor-pointer"
                              title="Clone Product"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleOpenEditForm(prod)}
                              className="p-1.5 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-lg cursor-pointer"
                              title="Edit Product Details"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleSoftDeleteProduct(prod)}
                              className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                              title="Soft Delete to Recovery Bin"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* 2. MOBILE-OPTIMIZED PRODUCT CARDS VIEW (Visible on Phone/Small screens) */}
          <div className="md:hidden divide-y divide-stone-100">
            {pagedProducts.length === 0 ? (
              <div className="p-8 text-center text-stone-400 text-xs">
                No products match your search criteria. Create a new one!
              </div>
            ) : (
              pagedProducts.map(prod => {
                const totalStock = prod.variants?.reduce((sum, v) => sum + v.stock, 0) || 0;
                const isSelected = selectedProductIds.includes(prod.id);

                return (
                  <div key={prod.id} className={`p-3.5 sm:p-4 space-y-3 transition-colors ${isSelected ? 'bg-stone-50/90' : 'bg-white'}`}>
                    {/* Top Row: Checkbox + Photo + Title & Hierarchy */}
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectProduct(prod.id)}
                        className="mt-1 rounded cursor-pointer shrink-0"
                      />
                      <img 
                        src={prod.colors[0]?.images[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=160&q=80'} 
                        alt={prod.name} 
                        className="w-14 h-14 object-cover rounded-xl border border-stone-200 bg-stone-50 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-stone-900 text-xs leading-snug line-clamp-2">{prod.name}</h4>
                        <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-stone-500 font-mono">
                          <span className="truncate">SKU: {prod.variants[0]?.sku || 'None'}</span>
                          <span>•</span>
                          <span className="capitalize font-sans text-stone-700 font-semibold">{prod.categoryId}</span>
                        </div>
                        {prod.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {prod.tags.map(t => (
                              <span key={t} className="text-[8px] bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded-md font-semibold capitalize">
                                {t.replace(/_/g, ' ')}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Price & Stock Stats Bar */}
                    <div className="grid grid-cols-3 gap-2 p-2.5 bg-stone-50 rounded-xl border border-stone-200/70 text-center text-xs">
                      <div>
                        <span className="text-[9px] font-bold text-stone-400 block uppercase">Base Price</span>
                        <span className="font-mono font-bold text-stone-900 text-xs">₹{prod.basePrice}</span>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-stone-400 block uppercase">Sale Price</span>
                        <span className="font-mono font-bold text-[#C0654B] text-xs">
                          {prod.discountPrice ? `₹${prod.discountPrice}` : '—'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-stone-400 block uppercase">Total Stock</span>
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                          totalStock === 0 ? 'bg-red-100 text-red-700' :
                          totalStock <= 10 ? 'bg-amber-100 text-amber-800' :
                          'bg-emerald-100 text-emerald-800'
                        }`}>
                          {totalStock} units
                        </span>
                      </div>
                    </div>

                    {/* Quick Status Toggle & Actions */}
                    <div className="flex items-center justify-between gap-2 pt-0.5">
                      <button
                        onClick={() => handleInlineStatusToggle(prod.id, prod.status)}
                        className={`px-3 py-1.5 rounded-xl text-[10px] uppercase font-bold tracking-wider cursor-pointer border transition-colors ${
                          prod.status === 'published' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : 'bg-stone-100 text-stone-600 border-stone-200'
                        }`}
                      >
                        ● {prod.status}
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleDuplicateProduct(prod)}
                          className="px-2.5 py-1.5 text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                          title="Clone Product"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span className="text-[10px]">Copy</span>
                        </button>

                        <button
                          onClick={() => handleOpenEditForm(prod)}
                          className="px-3 py-1.5 bg-[#C0654B] hover:bg-[#8B4A38] text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer shadow-xs transition-colors"
                          title="Edit Product Details"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span className="text-[10px]">Edit</span>
                        </button>

                        <button
                          onClick={() => handleSoftDeleteProduct(prod)}
                          className="p-1.5 text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-xl cursor-pointer transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* TABLE PAGINATION FOOTER */}
          {totalPages > 1 && (
            <div className="p-3 sm:p-3.5 bg-stone-50 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs font-semibold">
              <span className="text-stone-500 text-[11px] sm:text-xs">
                Showing {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filteredProducts.length)} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length)} of {filteredProducts.length} items
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 bg-white border border-stone-200 hover:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed text-stone-700 font-bold rounded-xl cursor-pointer text-xs"
                >
                  PREV
                </button>
                <span className="px-2 font-mono text-stone-600 text-xs">Page {currentPage} of {totalPages}</span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 bg-white border border-stone-200 hover:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed text-stone-700 font-bold rounded-xl cursor-pointer text-xs"
                >
                  NEXT
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* RECENTLY DELETED BIN */}
      {!isFormOpen && recentlyDeleted.length > 0 && (
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-stone-200/80 shadow-sm space-y-4 text-left">
          <div className="flex items-center justify-between border-b border-stone-100 pb-2">
            <div className="flex items-center gap-2">
              <Archive className="w-5 h-5 text-red-600 animate-pulse" />
              <h3 className="text-xs sm:text-sm font-bold font-serif text-stone-900">Recently Deleted Bin (Safeguard)</h3>
            </div>
            <span className="text-[10px] font-bold bg-red-100 text-red-700 px-2.5 py-0.5 rounded-full uppercase">Soft-Deleted</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs font-semibold text-stone-700">
            {recentlyDeleted.map(prod => (
              <div key={prod.id} className="border border-stone-200 p-3 sm:p-3.5 rounded-xl bg-stone-50 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <img src={prod.colors[0]?.images[0]} alt="" className="w-10 h-10 object-cover rounded-lg bg-white shrink-0" referrerPolicy="no-referrer" />
                  <div className="min-w-0">
                    <h4 className="font-bold text-stone-800 truncate text-xs">{prod.name}</h4>
                    <span className="text-[9px] text-stone-400 font-mono uppercase">ID: {prod.id}</span>
                  </div>
                </div>

                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => handleRestoreProduct(prod)}
                    className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg cursor-pointer transition-colors text-[10px]"
                  >
                    Restore
                  </button>
                  <button
                    onClick={() => handlePermanentDelete(prod.id)}
                    className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* GUIDED ADD/EDIT PRODUCT WIZARD (FULLY RESPONSIVE ON PHONES & TABLETS) */}
      {isFormOpen && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xl p-4 sm:p-6 space-y-5 sm:space-y-6 text-left">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div>
              <span className="text-[10px] font-bold text-[#C0654B] uppercase tracking-wider font-mono">Step {formStep} of 4</span>
              <h3 className="text-sm sm:text-base font-bold font-serif text-stone-900 leading-tight">
                {editProduct ? `Edit "${editProduct.name}"` : 'Guided Product Placement Wizard'}
              </h3>
            </div>
            <button onClick={() => setIsFormOpen(false)} className="text-stone-400 hover:text-stone-700 p-1.5 rounded-lg text-lg">✕</button>
          </div>

          {/* Steps Indicator Progress bar */}
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4].map(stepNum => (
              <div 
                key={stepNum} 
                className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                  formStep >= stepNum ? 'bg-[#C0654B]' : 'bg-stone-100'
                }`}
              />
            ))}
          </div>

          <form onSubmit={handleSaveProductForm} className="space-y-5 sm:space-y-6 text-xs text-stone-700 font-medium">
            
            {/* STEP 1: CATEGORY PLACEMENT */}
            {formStep === 1 && (
              <div className="space-y-4">
                <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl">
                  <span className="font-bold text-stone-800 block mb-1">Store Placement:</span>
                  <p className="text-[10.5px] text-stone-500 leading-snug">
                    Select precisely where in the store's deep category tree this apparel should live. This structures storefront filters, sizes charts, and menus automatically.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">1. Choose Core Category</label>
                    <select
                      value={pCategoryId}
                      onChange={(e) => { setPCategoryId(e.target.value); setPSubcategoryId(''); setPTypeId(''); }}
                      className="w-full p-2.5 bg-white border border-stone-300 rounded-xl outline-none focus:border-[#C0654B] text-xs font-bold text-stone-800"
                    >
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">2. Choose Subcategory</label>
                    <select
                      value={pSubcategoryId}
                      onChange={(e) => { setPSubcategoryId(e.target.value); setPTypeId(''); }}
                      required
                      className="w-full p-2.5 bg-white border border-stone-300 rounded-xl outline-none focus:border-[#C0654B] text-xs font-bold text-stone-800"
                    >
                      <option value="">-- Choose Subcategory --</option>
                      {getSubcategoriesForCategory(pCategoryId).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">3. Choose Style Type (Searchable)</label>
                    <select
                      value={pTypeId}
                      onChange={(e) => setPTypeId(e.target.value)}
                      required
                      className="w-full p-2.5 bg-white border border-stone-300 rounded-xl outline-none focus:border-[#C0654B] text-xs font-bold text-stone-800"
                    >
                      <option value="">-- Choose Style Type --</option>
                      {getTypesForSubcategory(pCategoryId, pSubcategoryId).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Apparel Brand Name</label>
                    <input
                      type="text"
                      value={pBrand}
                      onChange={(e) => setPBrand(e.target.value)}
                      placeholder="e.g. Terra Ethnic, Clay Urban"
                      className="w-full px-3 py-2.5 border border-stone-300 rounded-xl outline-none text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Target Status</label>
                    <select
                      value={pStatus}
                      onChange={(e) => setPStatus(e.target.value as any)}
                      className="w-full p-2.5 bg-white border border-stone-300 rounded-xl outline-none font-bold text-stone-800 text-xs"
                    >
                      <option value="published">Published instantly</option>
                      <option value="draft">Draft (hidden from storefront)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: BASIC INFO & FABRIC SPECS */}
            {formStep === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Product Title / Name (Required)</label>
                  <input
                    type="text"
                    required
                    value={pName}
                    onChange={(e) => setPName(e.target.value)}
                    placeholder="e.g. Traditional Hand-Woven Banarasi Silk Saree"
                    className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl outline-none focus:border-[#C0654B] text-xs font-semibold text-stone-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Short Description / Rich Text</label>
                  <textarea
                    value={pDescription}
                    onChange={(e) => setPDescription(e.target.value)}
                    placeholder="Detail material specifics, design motifs, elegance, matching styling accessories..."
                    rows={4}
                    className="w-full p-3 border border-stone-300 rounded-xl outline-none focus:border-[#C0654B] text-xs leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Fabric Material</label>
                    <input
                      type="text"
                      value={pFabric}
                      onChange={(e) => setPFabric(e.target.value)}
                      placeholder="e.g. Pure Georgette Silk"
                      className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Clothing Fit</label>
                    <input
                      type="text"
                      value={pFit}
                      onChange={(e) => setPFit(e.target.value)}
                      placeholder="e.g. Slim / Regular Fit"
                      className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Ideal Occasion</label>
                    <input
                      type="text"
                      value={pOccasion}
                      onChange={(e) => setPOccasion(e.target.value)}
                      placeholder="e.g. Festive / Ceremonial"
                      className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-stone-50 p-3 sm:p-4 rounded-xl border border-stone-200">
                  <div>
                    <label className="block font-bold text-stone-600 mb-1">GST/HSN Code (Accounting)</label>
                    <input
                      type="text"
                      value={pHsn}
                      onChange={(e) => setPHsn(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-stone-600 mb-1">GST Tax Percentage (%)</label>
                    <input
                      type="number"
                      value={pGst}
                      onChange={(e) => setPGst(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-white font-mono text-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: SIZE x COLOR VARIANT MATRIX */}
            {formStep === 3 && (
              <div className="space-y-4">
                <div className="p-3.5 bg-[#C0654B]/5 rounded-xl border border-[#C0654B]/10 space-y-1">
                  <span className="font-bold text-[#C0654B] block text-xs">Aesthetic Color & Size Matrix</span>
                  <p className="text-[10.5px] text-stone-500 leading-snug">
                    Pick target apparel sizes and color combinations. The wizard will automatically generate unique SKUs and coordinate price/stock tables down below.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {/* SIZES SELECTION */}
                  <div className="space-y-4 p-3.5 sm:p-4 bg-stone-50/70 rounded-xl border border-stone-200">
                    <div className="border-b border-stone-200 pb-2">
                      <span className="font-bold text-stone-800 block text-xs">Product Sizing Options</span>
                      <p className="text-[10px] text-stone-500">You can select Standard Sizes, Manual Measurement Sizes (cm & in), or both simultaneously.</p>
                    </div>

                    {/* 1. STANDARD SIZES OPTION */}
                    <div className={`p-3 rounded-xl border transition-all ${enableStandardSizes ? 'bg-white border-stone-200 shadow-2xs' : 'bg-stone-100/60 border-dashed border-stone-200'}`}>
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={enableStandardSizes}
                          onChange={(e) => {
                            setEnableStandardSizes(e.target.checked);
                            setVariantsMatrix([]);
                          }}
                          className="w-4 h-4 text-[#C0654B] rounded border-stone-300 focus:ring-[#C0654B] cursor-pointer"
                        />
                        <span className="text-xs font-bold text-stone-800">Enable Standard Sizes</span>
                        <span className="text-[10px] font-semibold text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded">e.g. S, M, L, XL, Free Size</span>
                      </label>

                      {enableStandardSizes && (
                        <div className="mt-2.5 space-y-2 pt-2 border-t border-stone-100">
                          <span className="text-[11px] font-bold text-stone-600 block">Select Target Sizes:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'Free Size'].map(sz => {
                              const hasSz = selectedSizes.includes(sz);
                              return (
                                <button
                                  key={sz}
                                  type="button"
                                  onClick={() => {
                                    setSelectedSizes(prev => hasSz ? prev.filter(s => s !== sz) : [...prev, sz]);
                                    setVariantsMatrix([]);
                                  }}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                    hasSz 
                                      ? 'bg-[#C0654B] text-white shadow-xs' 
                                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                                  }`}
                                >
                                  {sz}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 2. MANUAL MEASUREMENT SIZES OPTION */}
                    <div className={`p-3 rounded-xl border transition-all ${enableManualSizes ? 'bg-white border-stone-200 shadow-2xs' : 'bg-stone-100/60 border-dashed border-stone-200'}`}>
                      <div className="flex items-center justify-between gap-2">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={enableManualSizes}
                            onChange={(e) => {
                              setEnableManualSizes(e.target.checked);
                              setVariantsMatrix([]);
                            }}
                            className="w-4 h-4 text-[#C0654B] rounded border-stone-300 focus:ring-[#C0654B] cursor-pointer"
                          />
                          <span className="text-xs font-bold text-stone-800">Enable Manual Measurement Sizing (cm & in)</span>
                        </label>
                        {enableManualSizes && (
                          <button
                            type="button"
                            onClick={() => {
                              setKidsSizeRows(prev => [...prev, { ageLabel: '', measurement: 96, unit: 'cm', stock: 15 }]);
                              setVariantsMatrix([]);
                            }}
                            className="px-2.5 py-1 bg-[#C0654B] hover:bg-[#8B4A38] text-white rounded-lg text-[10px] font-bold transition-colors cursor-pointer shadow-xs shrink-0"
                          >
                            + Add Size Row
                          </button>
                        )}
                      </div>

                      {enableManualSizes && (
                        <div className="mt-2.5 space-y-2.5 pt-2 border-t border-stone-100">
                          {/* Presets */}
                          <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                            <span className="text-stone-500 font-bold">Quick Presets:</span>
                            <button
                              type="button"
                              onClick={() => {
                                setKidsSizeRows([
                                  { ageLabel: 'Size 36 (S)', measurement: 91, unit: 'cm', stock: 15 },
                                  { ageLabel: 'Size 38 (M)', measurement: 96, unit: 'cm', stock: 20 },
                                  { ageLabel: 'Size 40 (L)', measurement: 102, unit: 'cm', stock: 20 },
                                  { ageLabel: 'Size 42 (XL)', measurement: 107, unit: 'cm', stock: 15 },
                                  { ageLabel: 'Size 44 (XXL)', measurement: 112, unit: 'cm', stock: 10 }
                                ]);
                                setVariantsMatrix([]);
                              }}
                              className="px-2 py-0.5 bg-stone-100 hover:bg-stone-200 border border-stone-200 rounded text-stone-700 font-semibold cursor-pointer"
                            >
                              Kurtis (36-44)
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setKidsSizeRows([
                                  { ageLabel: 'Size 38 (M)', measurement: 96, unit: 'cm', stock: 15 },
                                  { ageLabel: 'Size 40 (L)', measurement: 102, unit: 'cm', stock: 20 },
                                  { ageLabel: 'Size 42 (XL)', measurement: 107, unit: 'cm', stock: 15 },
                                  { ageLabel: 'Size 44 (XXL)', measurement: 112, unit: 'cm', stock: 10 }
                                ]);
                                setVariantsMatrix([]);
                              }}
                              className="px-2 py-0.5 bg-stone-100 hover:bg-stone-200 border border-stone-200 rounded text-stone-700 font-semibold cursor-pointer"
                            >
                              Mens (38-44)
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setKidsSizeRows([
                                  { ageLabel: '2-3 Years', measurement: 54, unit: 'cm', stock: 15 },
                                  { ageLabel: '4-5 Years', measurement: 60, unit: 'cm', stock: 20 },
                                  { ageLabel: '6-7 Years', measurement: 66, unit: 'cm', stock: 15 },
                                  { ageLabel: '8-9 Years', measurement: 72, unit: 'cm', stock: 10 }
                                ]);
                                setVariantsMatrix([]);
                              }}
                              className="px-2 py-0.5 bg-stone-100 hover:bg-stone-200 border border-stone-200 rounded text-stone-700 font-semibold cursor-pointer"
                            >
                              Kids (2-9Y)
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setKidsSizeRows([
                                  { ageLabel: 'Free Size (5.5m + Blouse)', measurement: 550, unit: 'cm', stock: 25 }
                                ]);
                                setVariantsMatrix([]);
                              }}
                              className="px-2 py-0.5 bg-stone-100 hover:bg-stone-200 border border-stone-200 rounded text-stone-700 font-semibold cursor-pointer"
                            >
                              Saree / Free Size
                            </button>
                          </div>

                          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                            {kidsSizeRows.map((row, idx) => (
                              <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-2 p-2 bg-stone-50 rounded-xl border border-stone-200 shadow-2xs">
                                <div className="flex-1 min-w-0">
                                  <label className="text-[9px] font-bold text-stone-500 block uppercase">Size / Fit Label</label>
                                  <input
                                    type="text"
                                    placeholder="e.g. Size 38 (M), Chest 40, 2-3 Years"
                                    value={row.ageLabel}
                                    onChange={(e) => {
                                      const updated = [...kidsSizeRows];
                                      updated[idx].ageLabel = e.target.value;
                                      setKidsSizeRows(updated);
                                      setVariantsMatrix([]);
                                    }}
                                    className="w-full px-2 py-1.5 border border-stone-300 rounded-lg text-xs font-bold text-stone-800 outline-none focus:border-[#C0654B] bg-white"
                                  />
                                </div>

                                <div className="flex items-center gap-2">
                                  <div className="w-18">
                                    <label className="text-[9px] font-bold text-stone-500 block uppercase">Measure</label>
                                    <input
                                      type="number"
                                      min={1}
                                      placeholder="96"
                                      value={row.measurement || ''}
                                      onChange={(e) => {
                                        const updated = [...kidsSizeRows];
                                        updated[idx].measurement = Math.max(1, Number(e.target.value));
                                        setKidsSizeRows(updated);
                                        setVariantsMatrix([]);
                                      }}
                                      className="w-full px-1.5 py-1.5 border border-stone-300 rounded-lg text-xs font-mono font-bold text-stone-800 text-center outline-none focus:border-[#C0654B] bg-white"
                                    />
                                  </div>

                                  <div>
                                    <label className="text-[9px] font-bold text-stone-500 block uppercase">Unit</label>
                                    <div className="flex border border-stone-300 rounded-lg overflow-hidden font-bold text-[10px] bg-white">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const updated = [...kidsSizeRows];
                                          updated[idx].unit = 'cm';
                                          setKidsSizeRows(updated);
                                          setVariantsMatrix([]);
                                        }}
                                        className={`px-2 py-1.5 cursor-pointer ${row.unit === 'cm' ? 'bg-[#C0654B] text-white' : 'bg-stone-100 text-stone-600'}`}
                                      >
                                        cm
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const updated = [...kidsSizeRows];
                                          updated[idx].unit = 'inch';
                                          setKidsSizeRows(updated);
                                          setVariantsMatrix([]);
                                        }}
                                        className={`px-2 py-1.5 cursor-pointer ${row.unit === 'inch' ? 'bg-[#C0654B] text-white' : 'bg-stone-100 text-stone-600'}`}
                                      >
                                        in
                                      </button>
                                    </div>
                                  </div>

                                  <div className="w-16">
                                    <label className="text-[9px] font-bold text-stone-500 block uppercase">Stock</label>
                                    <input
                                      type="number"
                                      min={0}
                                      value={row.stock}
                                      onChange={(e) => {
                                        const updated = [...kidsSizeRows];
                                        updated[idx].stock = Math.max(0, Number(e.target.value));
                                        setKidsSizeRows(updated);
                                        setVariantsMatrix([]);
                                      }}
                                      className="w-full px-1.5 py-1.5 border border-stone-300 rounded-lg text-xs font-mono text-center font-bold text-stone-800 outline-none bg-white"
                                    />
                                  </div>

                                  {kidsSizeRows.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setKidsSizeRows(prev => prev.filter((_, i) => i !== idx));
                                        setVariantsMatrix([]);
                                      }}
                                      className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg cursor-pointer mt-3 shrink-0"
                                      title="Remove Size Row"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Colors selection */}
                  <div className="space-y-3">
                    <span className="font-bold text-stone-700 block">Select Color Palette:</span>
                    <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto p-1 border border-stone-100 rounded-xl bg-stone-50/30">
                      {availableColors.map(col => {
                        const hasCol = selectedColors.some(c => c.name === col.name);
                        return (
                          <button
                            key={col.name}
                            type="button"
                            onClick={() => {
                              setSelectedColors(prev => 
                                hasCol ? prev.filter(c => c.name !== col.name) : [...prev, col]
                              );
                              setVariantsMatrix([]);
                            }}
                            className={`flex items-center gap-1.5 px-2.5 py-1.5 border rounded-xl font-bold transition-all cursor-pointer text-xs ${
                              hasCol ? 'border-[#C0654B] bg-[#C0654B]/5 text-[#C0654B]' : 'border-stone-200 text-stone-600 bg-white hover:bg-stone-50'
                            }`}
                          >
                            <span className="w-3 h-3 rounded-full border border-stone-200/50 shrink-0" style={{ backgroundColor: col.hex }} />
                            <span>{col.name}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Quick Custom Color Adder */}
                    <div className="border border-stone-200 p-2.5 sm:p-3 rounded-xl bg-stone-50/50 space-y-2 mt-1">
                      <span className="font-bold text-stone-600 block text-[10px] uppercase tracking-wider">Add Custom Saree / Apparel Color Option</span>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <input
                          type="text"
                          placeholder="Color name (e.g. Saffron Gold)"
                          value={customColorName}
                          onChange={(e) => setCustomColorName(e.target.value)}
                          className="flex-1 px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs outline-none bg-white font-semibold focus:border-[#C0654B]"
                        />
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            value={customColorHex}
                            onChange={(e) => setCustomColorHex(e.target.value)}
                            className="w-8 h-8 rounded-lg border border-stone-300 cursor-pointer p-0 shrink-0 bg-transparent"
                          />
                          <input
                            type="text"
                            placeholder="#HEX"
                            value={customColorHex}
                            onChange={(e) => setCustomColorHex(e.target.value)}
                            className="w-16 px-1.5 py-1.5 border border-stone-300 rounded-lg text-[10px] font-mono font-bold text-center bg-white outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (!customColorName.trim()) {
                                showToast('Please provide a descriptive color name.');
                                return;
                              }
                              const formattedName = customColorName.trim();
                              const exists = availableColors.some(c => c.name.toLowerCase() === formattedName.toLowerCase());
                              if (exists) {
                                showToast(`"${formattedName}" already exists in the palette.`);
                                return;
                              }
                              const newCol = { name: formattedName, hex: customColorHex };
                              setAvailableColors(prev => [...prev, newCol]);
                              setSelectedColors(prev => [...prev, newCol]);
                              setVariantsMatrix([]);
                              setCustomColorName('');
                              showToast(`"${formattedName}" color option added and selected.`);
                            }}
                            className="flex-1 sm:flex-none px-3 py-1.5 bg-[#C0654B] hover:bg-[#8B4A38] text-white font-bold rounded-lg text-xs transition-colors cursor-pointer text-center"
                          >
                            + Add Color
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Variants Matrix Section */}
                {variantsMatrix.length > 0 && (
                  <div className="space-y-2 border-t border-stone-100 pt-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <span className="font-bold text-stone-800 text-xs">Stock Combinations ({variantsMatrix.length} Variants):</span>
                      <button
                        type="button"
                        onClick={handleCopyFirstRow}
                        className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-[10px] font-bold cursor-pointer self-start sm:self-auto"
                      >
                        Copy First Row Settings to All rows
                      </button>
                    </div>

                    {/* Scrollable table container */}
                    <div className="max-h-64 overflow-y-auto overflow-x-auto border border-stone-200 rounded-xl text-[11px]">
                      <table className="w-full text-left min-w-[500px]">
                        <thead className="bg-stone-50 font-bold border-b border-stone-200 text-stone-500 sticky top-0">
                          <tr>
                            <th className="p-2 min-w-[110px]">Variant Style</th>
                            <th className="p-2 min-w-[120px]">SKU Barcode</th>
                            <th className="p-2 min-w-[70px]">Price (₹)</th>
                            <th className="p-2 min-w-[75px]">Sale Price (₹)</th>
                            <th className="p-2 min-w-[65px]">Stock</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                          {variantsMatrix.map((v, idx) => (
                            <tr key={v.id} className="hover:bg-stone-50/50">
                              <td className="p-2 font-bold flex items-center gap-1.5">
                                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: v.colorHex }} />
                                <span className="truncate">{v.color} / {v.size}</span>
                              </td>
                              <td className="p-2 font-mono">
                                <input
                                  type="text"
                                  value={v.sku}
                                  onChange={(e) => {
                                    const next = [...variantsMatrix];
                                    next[idx].sku = e.target.value;
                                    setVariantsMatrix(next);
                                  }}
                                  className="p-1 border border-stone-200 rounded w-full font-mono bg-white text-xs"
                                />
                              </td>
                              <td className="p-2 font-mono">
                                <input
                                  type="number"
                                  value={v.price}
                                  onChange={(e) => {
                                    const next = [...variantsMatrix];
                                    next[idx].price = Number(e.target.value);
                                    setVariantsMatrix(next);
                                  }}
                                  className="p-1 border border-stone-200 rounded w-16 text-center bg-white font-bold text-xs"
                                />
                              </td>
                              <td className="p-2 font-mono">
                                <input
                                  type="number"
                                  value={v.discountPrice || ''}
                                  placeholder="None"
                                  onChange={(e) => {
                                    const next = [...variantsMatrix];
                                    next[idx].discountPrice = e.target.value ? Number(e.target.value) : undefined;
                                    setVariantsMatrix(next);
                                  }}
                                  className="p-1 border border-stone-200 rounded w-16 text-center bg-white text-xs"
                                />
                              </td>
                              <td className="p-2 font-mono">
                                <input
                                  type="number"
                                  value={v.stock}
                                  onChange={(e) => {
                                    const next = [...variantsMatrix];
                                    next[idx].stock = Number(e.target.value);
                                    setVariantsMatrix(next);
                                  }}
                                  className="p-1 border border-stone-200 rounded w-14 text-center bg-white font-bold text-xs"
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 4: IMAGES & PRICE SCHEDULERS */}
            {formStep === 4 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {/* Photo Upload Section */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-stone-800 text-xs block">Product Imagery ({productImages.length} Photos)</span>
                        <p className="text-[10px] text-stone-400">Upload photos from device or paste image URLs</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => photoFileInputRef.current?.click()}
                        className="px-3 py-1.5 bg-[#C0654B] hover:bg-[#8B4A38] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors shrink-0"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload</span>
                      </button>
                    </div>

                    <input
                      ref={photoFileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleDevicePhotoUpload}
                      className="hidden"
                    />

                    {/* Drag & Drop / Click Zone */}
                    <div
                      onClick={() => photoFileInputRef.current?.click()}
                      className="border-2 border-dashed border-stone-300 hover:border-[#C0654B] bg-stone-50 hover:bg-[#C0654B]/5 p-4 sm:p-5 rounded-2xl text-center cursor-pointer transition-colors space-y-1.5"
                    >
                      <div className="w-10 h-10 bg-[#C0654B]/10 text-[#C0654B] rounded-full flex items-center justify-center mx-auto">
                        <ImageIcon className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-bold text-stone-800">
                        Tap here to select photos from your device camera/gallery
                      </p>
                      <p className="text-[10px] text-stone-400">
                        Supports JPG, PNG, WEBP, or SVG
                      </p>
                    </div>

                    {/* Image URL Adder */}
                    <div className="flex gap-2">
                      <input
                        type="url"
                        placeholder="Or paste direct image URL (https://...)"
                        value={imageUrlInput}
                        onChange={(e) => setImageUrlInput(e.target.value)}
                        className="flex-1 px-3 py-2 border border-stone-300 rounded-xl text-xs outline-none focus:border-[#C0654B]"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (imageUrlInput.trim()) {
                            setProductImages(prev => [...prev, imageUrlInput.trim()]);
                            setImageUrlInput('');
                            showToast('Image URL added to gallery.');
                          }
                        }}
                        className="px-3 py-2 bg-stone-800 text-white font-bold rounded-xl text-xs hover:bg-stone-900 cursor-pointer shrink-0"
                      >
                        + Add URL
                      </button>
                    </div>

                    {/* Live Gallery Thumbnail Grid */}
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-1">
                      {productImages.map((img, idx) => (
                        <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-stone-200 bg-white shadow-2xs">
                          <img src={img} alt={`Product thumbnail ${idx + 1}`} className="w-full h-full object-cover object-center" />
                          {idx === 0 ? (
                            <span className="absolute top-1 left-1 bg-emerald-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow-xs">
                              PRIMARY
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setProductImages(prev => [img, ...prev.filter((_, i) => i !== idx)]);
                                showToast('Set as primary thumbnail.');
                              }}
                              className="absolute top-1 left-1 bg-black/70 hover:bg-black text-white text-[8px] font-bold px-1.5 py-0.5 rounded transition-opacity cursor-pointer"
                            >
                              Make Primary
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setProductImages(prev => prev.filter((_, i) => i !== idx));
                              showToast('Photo removed.');
                            }}
                            className="absolute top-1 right-1 w-5 h-5 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center text-[10px] font-bold shadow-xs cursor-pointer"
                            title="Remove Photo"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pricing and Tax overrides */}
                  <div className="space-y-3 bg-stone-50 p-3.5 sm:p-4 rounded-xl border border-stone-200">
                    <span className="font-bold text-stone-800 block text-xs">Standard Store Pricing Setup</span>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-stone-600 mb-0.5">Base Retail Price (₹)</label>
                        <input
                          type="number"
                          value={pBasePrice}
                          onChange={(e) => setPBasePrice(Number(e.target.value))}
                          className="w-full p-2 border border-stone-300 rounded-lg bg-white font-mono font-bold text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-stone-600 mb-0.5">Active Sale Price (₹)</label>
                        <input
                          type="number"
                          value={pDiscPrice}
                          onChange={(e) => setPDiscPrice(Number(e.target.value))}
                          className="w-full p-2 border border-stone-300 rounded-lg bg-white font-mono text-xs"
                        />
                      </div>
                    </div>

                    <div className="space-y-1 pt-1">
                      <span className="text-[10px] text-stone-400 block font-bold uppercase tracking-wider">Highlight Tags on site:</span>
                      <div className="flex flex-wrap gap-1">
                        {['new_arrival', 'bestseller', 'trending', 'sale', 'online_exclusive', 'deal_of_the_day'].map(tag => {
                          const hasT = pTags.includes(tag as any);
                          return (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => setPTags(prev => hasT ? prev.filter(t => t !== tag) : [...prev, tag as any])}
                              className={`px-2 py-1 rounded-md text-[9px] font-bold transition-all capitalize ${
                                hasT ? 'bg-[#C0654B] text-white' : 'bg-white border border-stone-200 text-stone-500'
                              }`}
                            >
                              {tag === 'deal_of_the_day' ? '🔥 Deal of the Day' : tag.replace(/_/g, ' ')}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* BUTTON CONTROLS */}
            <div className="flex flex-col-reverse sm:flex-row gap-2.5 sm:items-center sm:justify-between border-t border-stone-100 pt-4">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="w-full sm:w-auto px-4 py-2.5 border border-stone-200 hover:bg-stone-50 text-stone-700 font-bold rounded-xl cursor-pointer text-center text-xs"
              >
                Cancel & Close
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {formStep > 1 && (
                  <button
                    type="button"
                    onClick={() => setFormStep(prev => prev - 1)}
                    className="flex-1 sm:flex-none px-4 py-2.5 border border-stone-200 hover:bg-stone-50 text-stone-700 font-bold rounded-xl cursor-pointer flex items-center justify-center gap-1 text-xs"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                )}

                {formStep < 4 ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (formStep === 1 && !pSubcategoryId) {
                        alert('Please select a Subcategory to proceed.');
                        return;
                      }
                      setFormStep(prev => prev + 1);
                    }}
                    className="flex-1 sm:flex-none px-5 py-2.5 bg-[#C0654B] hover:bg-[#8B4A38] text-white font-bold rounded-xl cursor-pointer shadow-sm flex items-center justify-center gap-1 text-xs"
                  >
                    Next <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSaveProductForm()}
                    className="flex-1 sm:flex-none px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl cursor-pointer shadow-md flex items-center justify-center gap-1.5 transition-colors text-xs"
                  >
                    <Check className="w-4 h-4" /> Confirm & Place Live
                  </button>
                )}
              </div>
            </div>

          </form>
        </div>
      )}

    </div>
  );
};
