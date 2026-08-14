import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  Plus, Search, Edit3, Trash2, Copy, Eye, SlidersHorizontal, Check, X, 
  ArrowLeft, ArrowRight, Download, Upload, RefreshCw, Archive, Sparkles, Image as ImageIcon
} from 'lucide-react';
import { Product, ProductVariant, ColorVariant, ProductTag, Category, KidsSizeVariant } from '../../types';
import * as XLSX from 'xlsx';

export const AdminProductsView: React.FC = () => {
  const { products, setProducts, categories, settings, showToast, createProduct, updateProduct } = useStore();

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

  // Multi-variant selection state
  const [selectedSizes, setSelectedSizes] = useState<string[]>(['S', 'M', 'L', 'XL']);
  
  // Kids Category Sizing state
  const [kidsSizeRows, setKidsSizeRows] = useState<KidsSizeVariant[]>([
    { ageLabel: '2-3 Years', measurement: 54, unit: 'cm', stock: 15 },
    { ageLabel: '4-5 Years', measurement: 60, unit: 'cm', stock: 20 }
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
        if (isKidsCategory) {
          kidsSizeRows.forEach(ks => {
            const sizeLabel = `${ks.ageLabel} (${ks.measurement} ${ks.unit})`;
            rows.push({
              id: `v-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              productId: editProduct?.id || 'new-product-id',
              size: sizeLabel,
              color: color.name,
              colorHex: color.hex,
              sku: `${(pName || 'KID').slice(0, 3).toUpperCase()}-${color.name.slice(0, 2).toUpperCase()}-${ks.ageLabel.replace(/[^a-zA-Z0-9]/g, '')}`,
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
        } else {
          selectedSizes.forEach(size => {
            rows.push({
              id: `v-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              productId: editProduct?.id || 'new-product-id',
              size,
              color: color.name,
              colorHex: color.hex,
              sku: `${(pName || 'PROD').slice(0, 3).toUpperCase()}-${color.name.slice(0, 2).toUpperCase()}-${size}`,
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
      });
      setVariantsMatrix(rows);
    }
  }, [formStep, selectedSizes, selectedColors, isKidsCategory, kidsSizeRows]);

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
    setProducts(prev => prev.map(p => {
      if (p.id !== id) return p;
      return {
        ...p,
        basePrice,
        discountPrice: discPrice || undefined,
        variants: p.variants.map(v => ({
          ...v,
          price: basePrice,
          discountPrice: discPrice || undefined
        }))
      };
    }));
    showToast('Base price and variants synced successfully.');
  };

  const handleInlineStockChange = (id: string, newStock: number) => {
    setProducts(prev => prev.map(p => {
      if (p.id !== id) return p;
      return {
        ...p,
        variants: p.variants.map(v => ({ ...v, stock: Math.max(0, newStock) }))
      };
    }));
    showToast('Direct stock levels adjusted.');
  };

  const handleInlineStatusToggle = (id: string, current: Product['status']) => {
    const nextStatus: Product['status'] = current === 'published' ? 'draft' : 'published';
    setProducts(prev => prev.map(p => p.id === id ? { ...p, status: nextStatus } : p));
    showToast(`Product set to ${nextStatus}.`);
  };

  // CLONE / DUPLICATE
  const handleDuplicateProduct = (prod: Product) => {
    const cloned: Product = {
      ...prod,
      id: `p-${Date.now()}`,
      name: `${prod.name} (Copy)`,
      slug: `${prod.slug}-copy-${Date.now().toString().slice(-4)}`,
      created_at: new Date().toISOString(),
      variants: prod.variants.map(v => ({
        ...v,
        id: `v-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        sku: `${v.sku}-COPY`
      }))
    };
    setProducts(prev => [cloned, ...prev]);
    showToast(`Duplicated "${prod.name}" successfully.`);
  };

  // SOFT DELETE WORKFLOW
  const handleSoftDeleteProduct = (prod: Product) => {
    // 1. Add to recentlyDeleted
    setRecentlyDeleted(prev => [prod, ...prev]);
    // 2. Remove from active product state
    setProducts(prev => prev.filter(p => p.id !== prod.id));
    showToast(`"${prod.name}" moved to Recently Deleted Bin (30-day restore safety net active)`);
  };

  const handleRestoreProduct = (prod: Product) => {
    setProducts(prev => [prod, ...prev]);
    setRecentlyDeleted(prev => prev.filter(p => p.id !== prod.id));
    showToast(`"${prod.name}" has been fully restored to active storefront!`);
  };

  const handlePermanentDelete = (prodId: string) => {
    if (confirm("Are you sure you want to permanently delete this product? Historical orders will use archived copy, but this item will be destroyed.")) {
      setRecentlyDeleted(prev => prev.filter(p => p.id !== prodId));
      showToast('Permanently deleted.');
    }
  };

  // BULK ACTIONS
  const handleExecuteBulkAction = () => {
    if (selectedProductIds.length === 0) return;

    if (bulkAction === 'delete') {
      const prodsToSoftDelete = products.filter(p => selectedProductIds.includes(p.id));
      setRecentlyDeleted(prev => [...prodsToSoftDelete, ...prev]);
      setProducts(prev => prev.filter(p => !selectedProductIds.includes(p.id)));
      showToast(`Moved ${selectedProductIds.length} products to Recently Deleted Bin.`);
    } else if (bulkAction === 'activate') {
      setProducts(prev => prev.map(p => selectedProductIds.includes(p.id) ? { ...p, status: 'published' } : p));
      showToast(`Activated ${selectedProductIds.length} products.`);
    } else if (bulkAction === 'deactivate') {
      setProducts(prev => prev.map(p => selectedProductIds.includes(p.id) ? { ...p, status: 'draft' } : p));
      showToast(`Drafted ${selectedProductIds.length} products.`);
    } else if (bulkAction === 'apply_discount') {
      setProducts(prev => prev.map(p => {
        if (!selectedProductIds.includes(p.id)) return p;
        const discountPrice = Math.round(p.basePrice * (1 - bulkDiscountVal / 100));
        return {
          ...p,
          discountPrice,
          variants: p.variants.map(v => ({
            ...v,
            discountPrice
          }))
        };
      }));
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
    setSelectedSizes(['S', 'M', 'L', 'XL']);
    setKidsSizeRows([
      { ageLabel: '2-3 Years', measurement: 54, unit: 'cm', stock: 15 },
      { ageLabel: '4-5 Years', measurement: 60, unit: 'cm', stock: 20 }
    ]);
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
    setSelectedSizes(prod.availableSizes || ['S', 'M', 'L', 'XL']);
    if (prod.kidsSizes && prod.kidsSizes.length > 0) {
      setKidsSizeRows(prod.kidsSizes);
    } else {
      setKidsSizeRows([
        { ageLabel: '2-3 Years', measurement: 54, unit: 'cm', stock: 15 },
        { ageLabel: '4-5 Years', measurement: 60, unit: 'cm', stock: 20 }
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

    if (isKidsCategory) {
      if (!kidsSizeRows || kidsSizeRows.length === 0) {
        showToast('At least one Kids size row is required for Kids category.');
        setFormStep(3);
        return;
      }
      for (let i = 0; i < kidsSizeRows.length; i++) {
        const row = kidsSizeRows[i];
        if (!row.ageLabel || !row.ageLabel.trim()) {
          showToast(`Kids Size Row ${i + 1}: Please enter an Age Range label (e.g. 2-3 Years).`);
          setFormStep(3);
          return;
        }
        if (!row.measurement || Number(row.measurement) <= 0) {
          showToast(`Kids Size Row ${i + 1}: Measurement value must be a positive number.`);
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

    const finalAvailableSizes = isKidsCategory
      ? kidsSizeRows.map(k => `${k.ageLabel} (${k.measurement} ${k.unit})`)
      : selectedSizes;

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
        kidsSizes: isKidsCategory ? kidsSizeRows : undefined
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
        kidsSizes: isKidsCategory ? kidsSizeRows : undefined,
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

  // DOWNLOAD SAMPLE CSV TEMPLATE
  const handleDownloadSampleCSV = () => {
    let sampleCsv = "Name,CategoryId,SubcategoryId,TypeId,BasePrice,DiscountPrice,SKU,Stock,Fabric,Occasion\n";
    sampleCsv += '"Banarasi Zari Silk Saree","women","women-ethnic","saree",4999,3999,"BZS-RED-01",50,"Banarasi Silk","Bridal"\n';
    sampleCsv += '"Designer Anarkali Kurta Set","women","women-ethnic","anarkali-suits",2999,2299,"AKS-BLU-02",35,"Georgette","Festival"\n';
    sampleCsv += '"Royal Heritage Sherwani Set","men","men-executive","sherwani",8999,7499,"RHS-GLD-03",20,"Raw Silk","Wedding"\n';

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
        "Name": "Banarasi Zari Silk Saree",
        "CategoryId": "women",
        "SubcategoryId": "women-ethnic",
        "TypeId": "saree",
        "BasePrice": 4999,
        "DiscountPrice": 3999,
        "SKU": "BZS-RED-01",
        "Stock": 50,
        "Fabric": "Banarasi Silk",
        "Occasion": "Bridal"
      },
      {
        "Name": "Designer Anarkali Kurta Set",
        "CategoryId": "women",
        "SubcategoryId": "women-ethnic",
        "TypeId": "anarkali-suits",
        "BasePrice": 2999,
        "DiscountPrice": 2299,
        "SKU": "AKS-BLU-02",
        "Stock": 35,
        "Fabric": "Georgette",
        "Occasion": "Festival"
      },
      {
        "Name": "Royal Heritage Sherwani Set",
        "CategoryId": "men",
        "SubcategoryId": "men-executive",
        "TypeId": "sherwani",
        "BasePrice": 8999,
        "DiscountPrice": 7499,
        "SKU": "RHS-GLD-03",
        "Stock": 20,
        "Fabric": "Raw Silk",
        "Occasion": "Wedding"
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
          showToast(`📊 Excel Sheet "${file.name}" (${firstSheetName}) parsed! Click "Parse & Import Data" to process.`);
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
          showToast(`Loaded file "${file.name}". Click "Parse & Import Data" to process.`);
        }
      };
      reader.readAsText(file);
    }
  };

  // PARSE & IMPORT CSV DATA INTO CATALOG & DATABASE
  const handleImportCSVText = async () => {
    if (!csvText.trim()) {
      showToast('Please paste CSV text or select a CSV file first.');
      return;
    }
    try {
      const rawLines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
      if (rawLines.length === 0) return;

      let startIndex = 0;
      const firstLineLower = rawLines[0].toLowerCase();
      if (firstLineLower.includes('name') || firstLineLower.includes('category') || firstLineLower.includes('price')) {
        startIndex = 1;
      }

      let importedCount = 0;

      for (let i = startIndex; i < rawLines.length; i++) {
        const line = rawLines[i];
        const cols = line.match(/(?:[^\s",]+|"[^"]*")+/g) || line.split(',');
        if (cols.length >= 3) {
          const cleanCols = cols.map(c => c.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
          const [name, categoryId, subcategoryId, typeId, basePrice, discountPrice, sku, stock, fabric, occasion] = cleanCols;

          if (name && basePrice) {
            const bPrice = Number(basePrice) || 1999;
            const dPrice = discountPrice ? Number(discountPrice) : undefined;
            const pStock = stock ? Number(stock) : 30;

            const prodData: Partial<Product> = {
              name: name.trim(),
              slug: name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'),
              categoryId: categoryId || 'women',
              subcategoryId: subcategoryId || 'women-ethnic',
              typeId: typeId || 'saree',
              basePrice: bPrice,
              discountPrice: dPrice,
              fabric: fabric || 'Cotton Blend',
              occasion: occasion || 'Festive',
              status: 'published',
              variants: [{
                id: `v-imp-${Date.now()}-${i}`,
                productId: `p-imp-${Date.now()}-${i}`,
                size: 'Free Size',
                color: 'Default',
                colorHex: settings.primaryColor || '#C0654B',
                sku: sku || `SKU-IMP-${Date.now().toString().slice(-4)}-${i}`,
                price: bPrice,
                discountPrice: dPrice,
                stock: pStock,
                images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80']
              }],
              colors: [{ name: 'Default', hex: settings.primaryColor || '#C0654B', images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80'] }],
              availableSizes: ['Free Size']
            };

            await createProduct(prodData);
            importedCount++;
          }
        }
      }

      if (importedCount > 0) {
        showToast(`🎉 Bulk imported & saved ${importedCount} products into database!`);
        setCsvText('');
        setShowCsvImport(false);
      } else {
        alert('Could not parse any valid product rows. Please check format.');
      }
    } catch (err: any) {
      alert('Error parsing CSV file. Please verify CSV formatting.');
    }
  };

  return (
    <div className="space-y-6 text-stone-800 animate-fade-in text-left">
      {/* HEADER CONTROLS */}
      {!isFormOpen && (
        <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold font-serif text-stone-900">Apparel Style Manager</h2>
            <p className="text-xs text-stone-400">Total catalog products list, soft deletes, and bulk imports/exports</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowCsvImport(!showCsvImport)}
              className="px-4 py-2 border border-stone-200 hover:bg-stone-50 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Upload className="w-4 h-4 text-stone-500" />
              Bulk CSV Import
            </button>

            <button
              onClick={handleExportCSV}
              className="px-4 py-2 border border-stone-200 hover:bg-stone-50 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Download className="w-4 h-4 text-[#C0654B]" />
              Export Catalog
            </button>

            <button
              onClick={handleOpenCreateForm}
              className="px-5 py-2 bg-[#C0654B] hover:bg-[#8B4A38] text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" /> Add Product Wizard
            </button>
          </div>
        </div>
      )}

      {/* EXCEL / CSV IMPORT POP-PANEL */}
      {showCsvImport && (
        <div className="bg-stone-50 border border-stone-200 p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <div>
              <span className="text-sm font-bold text-stone-900 block">Bulk Import Products via Excel (.xlsx / .xls) or CSV</span>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Upload an Excel sheet (.xlsx, .xls) or CSV file from your device, or paste CSV rows below. Click "Parse & Import Data" to save into catalog.
              </p>
            </div>
            <button onClick={() => setShowCsvImport(false)} className="text-stone-400 hover:text-stone-700 text-lg">✕</button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-stone-200">
            <div className="flex flex-wrap items-center gap-2">
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
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Upload className="w-4 h-4 text-emerald-300" />
                Select Excel (.xlsx) / CSV File from Device
              </button>

              <button
                type="button"
                onClick={handleDownloadSampleExcel}
                className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer border border-emerald-200"
              >
                <Download className="w-3.5 h-3.5 text-emerald-700" />
                Download Sample Excel (.xlsx)
              </button>

              <button
                type="button"
                onClick={handleDownloadSampleCSV}
                className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-stone-600" />
                Download Sample CSV
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
            rows={5}
            className="w-full p-3 bg-white border border-stone-300 rounded-xl text-xs font-mono"
          />

          <div className="flex items-center justify-between pt-1">
            <button onClick={() => setCsvText('')} className="px-3 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold rounded-lg text-xs cursor-pointer">
              Clear Text
            </button>
            <button onClick={handleImportCSVText} className="px-5 py-2 bg-[#C0654B] hover:bg-[#8B4A38] text-white font-bold rounded-xl text-xs cursor-pointer shadow-md flex items-center gap-1.5">
              <Upload className="w-4 h-4" />
              Parse & Import Data into Database
            </button>
          </div>
        </div>
      )}

      {/* MULTI-FILTER PANEL */}
      {!isFormOpen && (
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-sm space-y-4 text-xs font-medium text-stone-500">
          <div className="flex flex-wrap items-center gap-3">
            {/* Live Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search style names or SKUs..."
                className="w-full pl-9 pr-3 py-2 border border-stone-200 rounded-xl bg-stone-50 focus:bg-white focus:border-[#C0654B] outline-none font-semibold text-stone-700 text-xs transition-all"
              />
            </div>

            {/* Placement Category Select */}
            <select
              value={filterCat}
              onChange={(e) => { setFilterCat(e.target.value); setFilterSub(''); setFilterType(''); }}
              className="p-2 border border-stone-200 rounded-xl outline-none bg-white font-bold text-stone-700"
            >
              <option value="">All Categories</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>

            {/* Subcategory Filter */}
            <select
              value={filterSub}
              onChange={(e) => { setFilterSub(e.target.value); setFilterType(''); }}
              disabled={!filterCat}
              className="p-2 border border-stone-200 rounded-xl outline-none bg-white font-bold text-stone-700 disabled:bg-stone-50 disabled:text-stone-300"
            >
              <option value="">All Subcategories</option>
              {getSubcategoriesForCategory(filterCat).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>

            {/* Type/Style Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              disabled={!filterSub}
              className="p-2 border border-stone-200 rounded-xl outline-none bg-white font-bold text-stone-700 disabled:bg-stone-50 disabled:text-stone-300"
            >
              <option value="">All Style Types</option>
              {getTypesForSubcategory(filterCat, filterSub).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>

            {/* Status Select */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="p-2 border border-stone-200 rounded-xl bg-white font-bold text-stone-700"
            >
              <option value="">All Statuses</option>
              <option value="published">Published</option>
              <option value="draft">Drafts</option>
            </select>

            {/* Stock Level Selector */}
            <select
              value={filterStock}
              onChange={(e) => setFilterStock(e.target.value as any)}
              className="p-2 border border-stone-200 rounded-xl bg-white font-bold text-stone-700"
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
                className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-bold cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>

          {/* Quick filter by tags */}
          <div className="flex items-center gap-2 border-t border-stone-100 pt-3">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Filter Tags:</span>
            {['new_arrival', 'bestseller', 'trending', 'sale', 'online_exclusive', 'curves_plus_size'].map(tag => (
              <button
                key={tag}
                onClick={() => setFilterTag(filterTag === tag ? '' : tag)}
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold capitalize transition-colors cursor-pointer ${
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
      )}

      {/* BULK ACTIONS BANNER */}
      {!isFormOpen && selectedProductIds.length > 0 && (
        <div className="bg-[#2B2620] text-white p-3.5 rounded-2xl flex items-center justify-between shadow-lg border border-stone-700 animate-in fade-in duration-150">
          <div className="flex items-center gap-2.5 text-xs font-semibold">
            <span className="w-5 h-5 bg-[#C0654B] rounded-full flex items-center justify-center font-bold text-[10px] font-mono">{selectedProductIds.length}</span>
            <span>Products Selected</span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <select
              value={bulkAction}
              onChange={(e) => setBulkAction(e.target.value)}
              className="p-1.5 bg-stone-800 text-white border border-stone-700 rounded-lg outline-none font-bold cursor-pointer"
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
                  className="w-12 p-1.5 bg-stone-800 text-white text-center font-bold rounded-lg border border-stone-700"
                />
                <span className="text-stone-400 font-bold">%</span>
              </div>
            )}

            <button
              onClick={handleExecuteBulkAction}
              disabled={!bulkAction}
              className="px-4 py-1.5 bg-[#C0654B] hover:bg-[#8B4A38] disabled:bg-stone-700 disabled:cursor-not-allowed text-white font-bold rounded-lg cursor-pointer shadow-sm transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
      )}

      {/* PRODUCTS TABLE */}
      {!isFormOpen && (
        <div className="bg-white rounded-2xl border border-stone-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
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
                  <th className="p-3">Product details</th>
                  <th className="p-3">Category Hierarchy</th>
                  <th className="p-3">Base Price</th>
                  <th className="p-3">Discount Price</th>
                  <th className="p-3">Total Stock</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
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
                              className="w-10 h-10 object-cover rounded-xl border border-stone-200 bg-stone-50"
                              referrerPolicy="no-referrer"
                            />
                            <div className="min-w-0 max-w-[200px]">
                              <h4 className="font-bold text-stone-900 truncate">{prod.name}</h4>
                              <p className="text-[10px] text-stone-400 font-mono truncate">SKU template: {prod.variants[0]?.sku || 'None'}</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {prod.tags.map(t => (
                                  <span key={t} className="text-[8px] bg-stone-100 text-stone-500 px-1 rounded-md lowercase">{t.replace(/_/g, ' ')}</span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="text-stone-800 text-[11px] capitalize">{prod.categoryId}</div>
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

          {/* TABLE PAGINATION FOOTER */}
          {totalPages > 1 && (
            <div className="p-3 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-xs font-semibold">
              <span className="text-stone-500">
                Showing {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filteredProducts.length)} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length)} of {filteredProducts.length} items
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-white border border-stone-200 hover:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed text-stone-700 font-bold rounded-lg cursor-pointer"
                >
                  PREV
                </button>
                <span className="px-2 font-mono text-stone-600">Page {currentPage} of {totalPages}</span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 bg-white border border-stone-200 hover:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed text-stone-700 font-bold rounded-lg cursor-pointer"
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
        <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm space-y-4 text-left">
          <div className="flex items-center justify-between border-b border-stone-100 pb-2">
            <div className="flex items-center gap-2">
              <Archive className="w-5 h-5 text-red-600 animate-pulse" />
              <h3 className="text-sm font-bold font-serif text-stone-900">Recently Deleted Bin (Safeguard)</h3>
            </div>
            <span className="text-[10px] font-bold bg-red-100 text-red-700 px-2.5 py-0.5 rounded-full uppercase">Soft-Deleted Items</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-semibold text-stone-700">
            {recentlyDeleted.map(prod => (
              <div key={prod.id} className="border border-stone-200 p-3.5 rounded-xl bg-stone-50 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <img src={prod.colors[0]?.images[0]} alt="" className="w-10 h-10 object-cover rounded-lg bg-white shrink-0" referrerPolicy="referrer" />
                  <div className="min-w-0">
                    <h4 className="font-bold text-stone-800 truncate">{prod.name}</h4>
                    <span className="text-[9px] text-stone-400 font-mono uppercase">ID: {prod.id}</span>
                  </div>
                </div>

                <div className="flex gap-1">
                  <button
                    onClick={() => handleRestoreProduct(prod)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg cursor-pointer transition-colors text-[10px]"
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

      {/* GUIDED ADD/EDIT PRODUCT WIZARD */}
      {isFormOpen && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xl p-6 space-y-6 text-left">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div>
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider font-mono">Step {formStep} of 4</span>
              <h3 className="text-base font-bold font-serif text-stone-900">
                {editProduct ? `Edit "${editProduct.name}"` : 'Guided Product Placement Wizard'}
              </h3>
            </div>
            <button onClick={() => setIsFormOpen(false)} className="text-stone-400 hover:text-stone-700">✕</button>
          </div>

          {/* Steps Indicator Progress bar */}
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4].map(stepNum => (
              <div 
                key={stepNum} 
                className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                  formStep >= stepNum ? 'bg-[#C0654B]' : 'bg-stone-100'
                }`}
              />
            ))}
          </div>

          <form onSubmit={handleSaveProductForm} className="space-y-6 text-xs text-stone-700 font-medium">
            
            {/* STEP 1: CATEGORY PLACEMENT */}
            {formStep === 1 && (
              <div className="space-y-4">
                <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl">
                  <span className="font-bold text-stone-800 block mb-1">Store Placement:</span>
                  <p className="text-[10px] text-stone-400 leading-snug">Select precisely where in the store's deep category tree this apparel should live. This structures storefront filters, sizes charts, and menus automatically.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Apparel Brand Name</label>
                    <input
                      type="text"
                      value={pBrand}
                      onChange={(e) => setPBrand(e.target.value)}
                      placeholder="e.g. Terra Ethnic, Clay Urban"
                      className="w-full px-3 py-2 border border-stone-300 rounded-xl outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Target Status</label>
                    <select
                      value={pStatus}
                      onChange={(e) => setPStatus(e.target.value as any)}
                      className="w-full p-2.5 bg-white border border-stone-300 rounded-xl outline-none font-bold text-stone-800"
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
                    className="w-full px-4 py-2.5 border border-stone-300 rounded-xl outline-none focus:border-[#C0654B] text-xs font-semibold text-stone-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Short Description / Rich Text</label>
                  <textarea
                    value={pDescription}
                    onChange={(e) => setPDescription(e.target.value)}
                    placeholder="Detail material specifics, design motifs, elegance, matching styling accessories..."
                    rows={4}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl outline-none focus:border-[#C0654B]"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Fabric Material</label>
                    <input
                      type="text"
                      value={pFabric}
                      onChange={(e) => setPFabric(e.target.value)}
                      placeholder="e.g. Pure Georgette Silk"
                      className="w-full px-3 py-2 border border-stone-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Clothing Fit</label>
                    <input
                      type="text"
                      value={pFit}
                      onChange={(e) => setPFit(e.target.value)}
                      placeholder="e.g. Slim / Regular Fit"
                      className="w-full px-3 py-2 border border-stone-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Ideal Occasion</label>
                    <input
                      type="text"
                      value={pOccasion}
                      onChange={(e) => setPOccasion(e.target.value)}
                      placeholder="e.g. Festive / Ceremonial"
                      className="w-full px-3 py-2 border border-stone-300 rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-stone-50 p-3 rounded-xl border border-stone-200">
                  <div>
                    <label className="block font-bold text-stone-600 mb-1">GST/HSN Code (Accounting)</label>
                    <input
                      type="text"
                      value={pHsn}
                      onChange={(e) => setPHsn(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-stone-600 mb-1">Gst Tax Percentage (%)</label>
                    <input
                      type="number"
                      value={pGst}
                      onChange={(e) => setPGst(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-white font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: SIZE x COLOR VARIANT MATRIX */}
            {formStep === 3 && (
              <div className="space-y-4">
                <div className="p-3.5 bg-[#C0654B]/5 rounded-xl border border-[#C0654B]/10 space-y-2">
                  <span className="font-bold text-[#C0654B] block text-xs">Aesthetic Color & Size Matrix</span>
                  <p className="text-[10.5px] text-stone-500 leading-snug">
                    Pick target apparel sizes and color combinations. The wizard will automatically generate unique SKUs and coordinate price/stock tables down below.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Sizes Selection: Conditional Rendering for Kids vs Standard */}
                  {isKidsCategory ? (
                    <div className="space-y-3 p-4 bg-amber-50/70 rounded-xl border border-amber-200/80">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-bold text-amber-900 block text-xs">Kids Custom Sizing Matrix</span>
                          <p className="text-[10px] text-amber-700">Enter age range, measurement value, unit (cm/inch), and stock per size variant.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setKidsSizeRows(prev => [...prev, { ageLabel: '', measurement: 50, unit: 'cm', stock: 10 }]);
                            setVariantsMatrix([]);
                          }}
                          className="px-3 py-1.5 bg-[#C0654B] hover:bg-[#8B4A38] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs"
                        >
                          + Add Size Row
                        </button>
                      </div>

                      <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                        {kidsSizeRows.map((row, idx) => (
                          <div key={idx} className="flex flex-wrap items-center gap-2 p-2.5 bg-white rounded-xl border border-stone-200 shadow-2xs">
                            <div className="flex-1 min-w-[120px]">
                              <label className="text-[9px] font-bold text-stone-500 block uppercase">Age Range Label</label>
                              <input
                                type="text"
                                placeholder="e.g. 2-3 Years"
                                value={row.ageLabel}
                                onChange={(e) => {
                                  const updated = [...kidsSizeRows];
                                  updated[idx].ageLabel = e.target.value;
                                  setKidsSizeRows(updated);
                                  setVariantsMatrix([]);
                                }}
                                className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs font-bold text-stone-800 outline-none focus:border-[#C0654B]"
                              />
                            </div>

                            <div className="w-24">
                              <label className="text-[9px] font-bold text-stone-500 block uppercase">Chest/Height</label>
                              <input
                                type="number"
                                min={1}
                                placeholder="54"
                                value={row.measurement || ''}
                                onChange={(e) => {
                                  const updated = [...kidsSizeRows];
                                  updated[idx].measurement = Math.max(1, Number(e.target.value));
                                  setKidsSizeRows(updated);
                                  setVariantsMatrix([]);
                                }}
                                className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs font-mono font-bold text-stone-800 text-center outline-none focus:border-[#C0654B]"
                              />
                            </div>

                            <div>
                              <label className="text-[9px] font-bold text-stone-500 block uppercase">Unit</label>
                              <div className="flex border border-stone-300 rounded-lg overflow-hidden font-bold text-[10px]">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = [...kidsSizeRows];
                                    updated[idx].unit = 'cm';
                                    setKidsSizeRows(updated);
                                    setVariantsMatrix([]);
                                  }}
                                  className={`px-2.5 py-1.5 cursor-pointer ${row.unit === 'cm' ? 'bg-[#C0654B] text-white' : 'bg-stone-100 text-stone-600'}`}
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
                                  className={`px-2.5 py-1.5 cursor-pointer ${row.unit === 'inch' ? 'bg-[#C0654B] text-white' : 'bg-stone-100 text-stone-600'}`}
                                >
                                  inch
                                </button>
                              </div>
                            </div>

                            <div className="w-20">
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
                                className="w-full px-2 py-1.5 border border-stone-300 rounded-lg text-xs font-mono text-center font-bold text-stone-800 outline-none"
                              />
                            </div>

                            {kidsSizeRows.length > 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  setKidsSizeRows(prev => prev.filter((_, i) => i !== idx));
                                  setVariantsMatrix([]);
                                }}
                                className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg cursor-pointer mt-3"
                                title="Remove Size Row"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <span className="font-bold text-stone-700 block">Select Available Sizes:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'Free Size'].map(sz => {
                          const hasSz = selectedSizes.includes(sz);
                          return (
                            <button
                              key={sz}
                              type="button"
                              onClick={() => {
                                setSelectedSizes(prev => hasSz ? prev.filter(s => s !== sz) : [...prev, sz]);
                                setVariantsMatrix([]); // reset so auto-regenerates
                              }}
                              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                                hasSz 
                                  ? 'bg-[#C0654B] text-white shadow-sm' 
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

                  {/* Colors selection */}
                  <div className="space-y-3">
                    <span className="font-bold text-stone-700 block">Select Color Palette:</span>
                    <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-1 border border-stone-100 rounded-xl bg-stone-50/30">
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
                            className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-xl font-bold transition-all cursor-pointer ${
                              hasCol ? 'border-[#C0654B] bg-[#C0654B]/5 text-[#C0654B]' : 'border-stone-200 text-stone-600 bg-white hover:bg-stone-50'
                            }`}
                          >
                            <span className="w-3.5 h-3.5 rounded-full border border-stone-200/50" style={{ backgroundColor: col.hex }} />
                            <span>{col.name}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Quick Custom Color Adder */}
                    <div className="border border-stone-200 p-3 rounded-xl bg-stone-50/50 space-y-2 mt-1">
                      <span className="font-bold text-stone-600 block text-[10px] uppercase tracking-wider">Add Custom Saree / Apparel Color Option</span>
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="flex-1 min-w-[140px]">
                          <input
                            type="text"
                            placeholder="Color name (e.g. Saffron Gold)"
                            value={customColorName}
                            onChange={(e) => setCustomColorName(e.target.value)}
                            className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs outline-none bg-white font-semibold focus:border-[#C0654B]"
                          />
                        </div>
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
                        </div>
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
                          className="px-3 py-1.5 bg-[#C0654B] hover:bg-[#8B4A38] text-white font-bold rounded-lg text-xs transition-colors cursor-pointer"
                        >
                          + Add Color
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Variants Matrix Table with instant inputs */}
                {variantsMatrix.length > 0 && (
                  <div className="space-y-2 border-t border-stone-100 pt-4">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-800">Review Auto-Generated Stock Combinations ({variantsMatrix.length}):</span>
                      <button
                        type="button"
                        onClick={handleCopyFirstRow}
                        className="px-3 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-[10px] font-bold cursor-pointer"
                      >
                        Copy First Row Settings to All rows
                      </button>
                    </div>

                    <div className="max-h-64 overflow-y-auto overflow-x-auto border border-stone-200 rounded-xl text-[11px] touch-scroll">
                      <table className="w-full text-left min-w-[520px]">
                        <thead className="bg-stone-50 font-bold border-b border-stone-200 text-stone-500 sticky top-0">
                          <tr>
                            <th className="p-2 min-w-[120px]">Variant Style</th>
                            <th className="p-2 min-w-[130px]">SKU Barcode</th>
                            <th className="p-2 min-w-[70px]">Price (₹)</th>
                            <th className="p-2 min-w-[80px]">Sale Price (₹)</th>
                            <th className="p-2 min-w-[70px]">Stock Level</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                          {variantsMatrix.map((v, idx) => (
                            <tr key={v.id} className="hover:bg-stone-50/50">
                              <td className="p-2 font-bold flex items-center gap-1.5">
                                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: v.colorHex }} />
                                <span>{v.color} / {v.size}</span>
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
                                  className="p-1 border border-stone-200 rounded w-full font-mono bg-white"
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
                                  className="p-1 border border-stone-200 rounded w-16 text-center bg-white font-bold"
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
                                  className="p-1 border border-stone-200 rounded w-16 text-center bg-white"
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
                                  className="p-1 border border-stone-200 rounded w-14 text-center bg-white font-bold"
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Photo Upload Section */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-stone-800 text-xs block">Product Gallery Imagery ({productImages.length} Photos)</span>
                        <p className="text-[10px] text-stone-400">Upload photos from device or paste image URLs</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => photoFileInputRef.current?.click()}
                        className="px-3 py-1.5 bg-[#C0654B] hover:bg-[#8B4A38] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload from Device</span>
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
                      className="border-2 border-dashed border-stone-300 hover:border-[#C0654B] bg-stone-50 hover:bg-[#C0654B]/5 p-5 rounded-2xl text-center cursor-pointer transition-colors space-y-1.5"
                    >
                      <div className="w-10 h-10 bg-[#C0654B]/10 text-[#C0654B] rounded-full flex items-center justify-center mx-auto">
                        <ImageIcon className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-bold text-stone-800">
                        Click here to add photos from your device
                      </p>
                      <p className="text-[10px] text-stone-400">
                        Select JPG, PNG, WEBP, or SVG files from computer or smartphone
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
                        className="px-3 py-2 bg-stone-800 text-white font-bold rounded-xl text-xs hover:bg-stone-900 cursor-pointer"
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
                              className="absolute top-1 left-1 bg-black/70 hover:bg-black text-white text-[8px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
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
                  <div className="space-y-3 bg-stone-50 p-4 rounded-xl border border-stone-200">
                    <span className="font-bold text-stone-800 block text-xs">Standard Store Pricing Setup</span>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-stone-600 mb-0.5">Base Retail Price (₹)</label>
                        <input
                          type="number"
                          value={pBasePrice}
                          onChange={(e) => setPBasePrice(Number(e.target.value))}
                          className="w-full p-2 border border-stone-300 rounded-lg bg-white font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-stone-600 mb-0.5">Active Sale Price (₹)</label>
                        <input
                          type="number"
                          value={pDiscPrice}
                          onChange={(e) => setPDiscPrice(Number(e.target.value))}
                          className="w-full p-2 border border-stone-300 rounded-lg bg-white font-mono"
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

                {/* SEO fields */}
                <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-2xl space-y-2">
                  <span className="font-bold text-stone-800 text-[11px] block uppercase tracking-wider">SEO Google Headers Preview</span>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-stone-500 mb-0.5">Meta Title override</label>
                      <input
                        type="text"
                        placeholder="Royal Handloom Cotton Sarees | PGmart"
                        className="w-full p-2 bg-white border border-stone-300 rounded-lg outline-none text-[11px]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-stone-500 mb-0.5">Meta Description override</label>
                      <input
                        type="text"
                        placeholder="Get premium quality Handloom Cotton Sarees with 5% GST billing..."
                        className="w-full p-2 bg-white border border-stone-300 rounded-lg outline-none text-[11px]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* BUTTON CONTROLS */}
            <div className="flex items-center justify-between border-t border-stone-100 pt-4">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2 border border-stone-200 hover:bg-stone-50 text-stone-700 font-bold rounded-xl cursor-pointer"
              >
                Cancel & Close
              </button>

              <div className="flex gap-2">
                {formStep > 1 && (
                  <button
                    type="button"
                    onClick={() => setFormStep(prev => prev - 1)}
                    className="px-4 py-2 border border-stone-200 hover:bg-stone-50 text-stone-700 font-bold rounded-xl cursor-pointer flex items-center gap-1"
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
                    className="px-5 py-2 bg-[#C0654B] hover:bg-[#8B4A38] text-white font-bold rounded-xl cursor-pointer shadow-sm flex items-center gap-1"
                  >
                    Next <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSaveProductForm()}
                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl cursor-pointer shadow-md flex items-center gap-1.5 transition-colors"
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
