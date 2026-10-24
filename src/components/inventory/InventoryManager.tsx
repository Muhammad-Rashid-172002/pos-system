import React, { useState, useEffect } from 'react';
import { Product, ProductVariant, ProductCategory, ShopSettings, StaffUser } from '../../types';
import { dataService } from '../../services/dataService';
import { formatCurrency, getStockStatus } from '../../utils/formatters';
import { IMAGE_PATHS, getProductFallbackImage } from '../../constants/imagePaths';
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  AlertTriangle,
  Barcode,
  Package,
  Layers,
  ArrowUpDown,
  Check,
  X,
  Printer,
  ChevronDown,
  Warehouse,
} from 'lucide-react';

interface InventoryManagerProps {
  currentStaff: StaffUser;
  settings: ShopSettings;
}

export const InventoryManager: React.FC<InventoryManagerProps> = ({ currentStaff, settings }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [suppliers, setSuppliers] = useState(dataService.getSuppliers());

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [stockStatusFilter, setStockStatusFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');

  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showAddCustomCat, setShowAddCustomCat] = useState(false);

  // Quick Stock Adjust Modal
  const [adjustModalProduct, setAdjustModalProduct] = useState<Product | null>(null);
  const [adjustDelta, setAdjustDelta] = useState<number>(0);
  const [adjustVariantId, setAdjustVariantId] = useState<string>('');

  // Barcode Label Print Modal
  const [barcodePrintProduct, setBarcodePrintProduct] = useState<Product | null>(null);

  useEffect(() => {
    const load = () => {
      setProducts(dataService.getProducts());
      setCategories(dataService.getCategories());
      setSuppliers(dataService.getSuppliers());
    };
    load();
    const unsub = dataService.subscribe(load);
    return () => unsub();
  }, []);

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchesCat = categoryFilter === 'all' || p.category === categoryFilter;
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.barcode.includes(q) ||
      p.category.toLowerCase().includes(q);

    let matchesStock = true;
    if (stockStatusFilter === 'out_of_stock') matchesStock = p.stockQuantity <= 0;
    if (stockStatusFilter === 'low_stock') matchesStock = p.stockQuantity > 0 && p.stockQuantity <= p.minStockThreshold;
    if (stockStatusFilter === 'in_stock') matchesStock = p.stockQuantity > p.minStockThreshold;

    return matchesCat && matchesSearch && matchesStock;
  });

  // KPI calculations
  const totalItemsCount = products.reduce((acc, p) => acc + p.stockQuantity, 0);
  const lowStockCount = products.filter((p) => p.stockQuantity > 0 && p.stockQuantity <= p.minStockThreshold).length;
  const outOfStockCount = products.filter((p) => p.stockQuantity <= 0).length;
  const totalValuationCost = products.reduce((acc, p) => acc + p.purchasePrice * p.stockQuantity, 0);
  const totalValuationRetail = products.reduce((acc, p) => acc + p.salePrice * p.stockQuantity, 0);

  const handleOpenAdd = () => {
    const defaultCat = categories[0] || 'Cosmetics & Makeup';
    setEditingProduct({
      name: '',
      category: defaultCat,
      unit: 'piece',
      sku: `SKU-${Date.now().toString().slice(-6)}`,
      barcode: `${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      purchasePrice: 0,
      salePrice: 0,
      stockQuantity: 10,
      minStockThreshold: settings.defaultLowStockThreshold,
      image: getProductFallbackImage(defaultCat),
      description: '',
      variants: [],
    });
    setIsEditModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct({ ...p });
    setIsEditModalOpen(true);
  };

  const handleDeleteProduct = (id: string, name: string) => {
    if (currentStaff.role !== 'admin') {
      alert('Only administrators can delete products.');
      return;
    }
    if (confirm(`Are you sure you want to delete "${name}" from inventory?`)) {
      dataService.deleteProduct(id);
    }
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !editingProduct.name) return;

    dataService.saveProduct({
      ...editingProduct,
      name: editingProduct.name.trim(),
      category: editingProduct.category || categories[0],
      purchasePrice: Number(editingProduct.purchasePrice) || 0,
      salePrice: Number(editingProduct.salePrice) || 0,
      stockQuantity: Number(editingProduct.stockQuantity) || 0,
      minStockThreshold: Number(editingProduct.minStockThreshold) || 5,
    } as any);

    setIsEditModalOpen(false);
    setEditingProduct(null);
  };

  const handleAddCustomCategory = () => {
    if (!newCategoryName.trim()) return;
    const updated = dataService.addCategory(newCategoryName.trim());
    setCategories(updated);
    if (editingProduct) {
      setEditingProduct({ ...editingProduct, category: newCategoryName.trim() });
    }
    setNewCategoryName('');
    setShowAddCustomCat(false);
  };

  const handleExecuteStockAdjust = () => {
    if (!adjustModalProduct || adjustDelta === 0) return;
    dataService.adjustStock(adjustModalProduct.id, adjustDelta, adjustVariantId || undefined);
    setAdjustModalProduct(null);
    setAdjustDelta(0);
    setAdjustVariantId('');
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-stone-50">
      {/* Top Header */}
      <div className="bg-white border-b border-stone-200 px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-stone-900 tracking-tight font-serif-luxury">
              Products & Inventory Catalog
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">
              Manage ladies' cosmetics, jewellery, laces, borders, and variants with real-time stock sync
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleOpenAdd}
              className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </button>
          </div>
        </div>

        {/* Quick KPI Cards Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          <div className="bg-stone-50 p-3 rounded-xl border border-stone-200">
            <span className="text-[11px] text-stone-500 font-medium">Total Products</span>
            <div className="text-lg font-bold text-stone-900 font-mono-numbers mt-0.5">
              {products.length} ({totalItemsCount} units)
            </div>
          </div>

          <div className="bg-stone-50 p-3 rounded-xl border border-stone-200">
            <span className="text-[11px] text-amber-700 font-medium flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> Low Stock Alerts
            </span>
            <div className="text-lg font-bold text-amber-800 font-mono-numbers mt-0.5">
              {lowStockCount} items
            </div>
          </div>

          <div className="bg-stone-50 p-3 rounded-xl border border-stone-200">
            <span className="text-[11px] text-rose-700 font-medium">Out of Stock</span>
            <div className="text-lg font-bold text-rose-800 font-mono-numbers mt-0.5">
              {outOfStockCount} items
            </div>
          </div>

          <div className="bg-stone-50 p-3 rounded-xl border border-stone-200">
            <span className="text-[11px] text-stone-500 font-medium">Inventory Valuation (Cost)</span>
            <div className="text-lg font-bold text-emerald-800 font-mono-numbers mt-0.5">
              {formatCurrency(totalValuationCost, settings.currencySymbol)}
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white border-b border-stone-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Search products by name, SKU, or barcode..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 border border-stone-300 rounded-lg text-xs bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 border border-stone-300 rounded-lg text-xs bg-white text-stone-700"
          >
            <option value="all">All Categories ({categories.length})</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={stockStatusFilter}
            onChange={(e) => setStockStatusFilter(e.target.value as any)}
            className="px-3 py-1.5 border border-stone-300 rounded-lg text-xs bg-white text-stone-700"
          >
            <option value="all">All Stock Statuses</option>
            <option value="in_stock">In Stock Only</option>
            <option value="low_stock">Low Stock Only</option>
            <option value="out_of_stock">Out of Stock Only</option>
          </select>
        </div>

        <div className="text-xs text-stone-500 font-medium">
          Showing {filteredProducts.length} of {products.length} products
        </div>
      </div>

      {/* Product Table */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs text-stone-600">
            <thead className="bg-stone-50/80 text-stone-700 border-b border-stone-200 font-semibold text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Product Details</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Cost (Purchase)</th>
                <th className="py-3 px-4">Sale Price</th>
                <th className="py-3 px-4">Stock Level</th>
                <th className="py-3 px-4">Barcode / SKU</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-stone-400">
                    <Package className="w-8 h-8 mx-auto mb-2 text-stone-300" />
                    No products found matching filters.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const stock = getStockStatus(p.stockQuantity, p.minStockThreshold);
                  const margin = p.salePrice - p.purchasePrice;
                  const marginPct = p.purchasePrice > 0 ? Math.round((margin / p.purchasePrice) * 100) : 0;
                  const hasVariants = p.variants && p.variants.length > 0;

                  return (
                    <tr key={p.id} className="hover:bg-stone-50/80 transition-colors">
                      {/* Product Name & Image */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.image || getProductFallbackImage(p.category)}
                            alt={p.name}
                            loading="lazy"
                            decoding="async"
                            width="40"
                            height="40"
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 rounded-lg object-cover border border-stone-200 shrink-0"
                          />
                          <div>
                            <div className="font-semibold text-stone-900 line-clamp-1">{p.name}</div>
                            <div className="text-[11px] text-stone-400 flex items-center gap-2 mt-0.5">
                              <span>Unit: {p.unit}</span>
                              {hasVariants && (
                                <span className="text-rose-600 font-medium">
                                  · {p.variants?.length} variants
                                </span>
                              )}
                              {p.supplierName && <span>· Supplier: {p.supplierName}</span>}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4">
                        <span className="font-medium text-stone-700">{p.category}</span>
                      </td>

                      {/* Cost */}
                      <td className="py-3 px-4 font-mono-numbers text-stone-600">
                        {formatCurrency(p.purchasePrice, settings.currencySymbol)}
                      </td>

                      {/* Sale Price & Margin */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-stone-900 font-mono-numbers">
                          {formatCurrency(p.salePrice, settings.currencySymbol)}
                        </div>
                        <div className="text-[10px] text-emerald-700 font-mono">
                          +{marginPct}% margin
                        </div>
                      </td>

                      {/* Stock Level */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-medium font-mono-numbers ${stock.badgeClass}`}
                          >
                            {stock.label}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setAdjustModalProduct(p);
                              setAdjustDelta(0);
                            }}
                            className="text-[10px] text-stone-500 hover:text-stone-900 underline"
                            title="Quick Adjust Stock"
                          >
                            Adjust
                          </button>
                        </div>
                      </td>

                      {/* Barcode & SKU */}
                      <td className="py-3 px-4 font-mono text-[11px]">
                        <div>{p.sku}</div>
                        <div className="text-stone-400">{p.barcode}</div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setBarcodePrintProduct(p)}
                            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
                            title="Generate Barcode Label"
                          >
                            <Barcode className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(p)}
                            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
                            title="Edit Product"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(p.id, p.name)}
                            className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
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
      </div>

      {/* Add / Edit Product Modal */}
      {isEditModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50/80">
              <h3 className="font-semibold text-stone-900 text-sm">
                {editingProduct.id ? 'Edit Product' : 'Add New Ladies Boutique Product'}
              </h3>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              {/* Product Name */}
              <div>
                <label className="block text-stone-700 font-medium mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kashees Matte Liquid Lipstick or Kundan Choker Set"
                  value={editingProduct.name || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
                />
              </div>

              {/* Category & Unit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-stone-700 font-medium">Category *</label>
                    <button
                      type="button"
                      onClick={() => setShowAddCustomCat(!showAddCustomCat)}
                      className="text-rose-600 text-[11px] hover:underline"
                    >
                      + Custom Category
                    </button>
                  </div>

                  {showAddCustomCat ? (
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        placeholder="New category..."
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        className="w-full px-2 py-1.5 border border-stone-300 rounded-lg text-xs"
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomCategory}
                        className="px-2.5 py-1.5 bg-stone-900 text-white rounded-lg text-xs font-medium"
                      >
                        Add
                      </button>
                    </div>
                  ) : (
                    <select
                      value={editingProduct.category || categories[0]}
                      onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs bg-white"
                    >
                      {categories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-stone-700 font-medium mb-1">Selling Unit</label>
                  <select
                    value={editingProduct.unit || 'piece'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, unit: e.target.value as any })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs bg-white"
                  >
                    <option value="piece">Piece (Cosmetics, Hairpin, Bag)</option>
                    <option value="yard">Yard (Laces, Borders, Trimmings)</option>
                    <option value="meter">Meter</option>
                    <option value="set">Set (Bridal Jewelry, Bangles)</option>
                    <option value="pair">Pair (Earrings, Latkan Tassels)</option>
                    <option value="box">Box (Scrunchie Set, Lash Box)</option>
                  </select>
                </div>
              </div>

              {/* Pricing & Stock */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Purchase Price (PKR)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editingProduct.purchasePrice ?? 0}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, purchasePrice: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-medium mb-1">Sale Price (PKR) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editingProduct.salePrice ?? 0}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, salePrice: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-medium mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    min="0"
                    value={editingProduct.stockQuantity ?? 0}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, stockQuantity: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-medium mb-1">Low Stock Alert At</label>
                  <input
                    type="number"
                    min="1"
                    value={editingProduct.minStockThreshold ?? 5}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, minStockThreshold: parseInt(e.target.value) || 5 })
                    }
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              {/* SKU & Barcode */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-medium mb-1">SKU Code</label>
                  <input
                    type="text"
                    value={editingProduct.sku || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-medium mb-1">Barcode</label>
                  <input
                    type="text"
                    value={editingProduct.barcode || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, barcode: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              {/* Supplier Selection */}
              <div>
                <label className="block text-stone-700 font-medium mb-1">Assigned Supplier</label>
                <select
                  value={editingProduct.supplierId || ''}
                  onChange={(e) => {
                    const sup = suppliers.find((s) => s.id === e.target.value);
                    setEditingProduct({
                      ...editingProduct,
                      supplierId: sup?.id,
                      supplierName: sup?.companyName,
                    });
                  }}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs bg-white"
                >
                  <option value="">None / Direct Wholesale Market</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.companyName} ({s.contactPerson})
                    </option>
                  ))}
                </select>
              </div>

              {/* Local Codebase Image Selector */}
              <div>
                <label className="block text-stone-700 font-medium mb-1">
                  Product Image (Loaded Instantly from Codebase)
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-1">
                  {[
                    { label: 'Kundan Choker', img: IMAGE_PATHS.products.kundanChoker },
                    { label: 'Gold Bangles', img: IMAGE_PATHS.products.hyderabadiBangles },
                    { label: 'Jhumkas', img: IMAGE_PATHS.products.goldJhumkas },
                    { label: 'Matte Lipstick', img: IMAGE_PATHS.products.matteLipstick },
                    { label: 'HD Foundation', img: IMAGE_PATHS.products.radiantFoundation },
                    { label: 'Zari Lace', img: IMAGE_PATHS.products.zariVelvetLace },
                    { label: 'Gota Lace', img: IMAGE_PATHS.products.gotaCutworkLace },
                    { label: 'Mirror Lace', img: IMAGE_PATHS.products.mirrorWorkLace },
                    { label: 'Hair Vine', img: IMAGE_PATHS.products.bridalHairVine },
                    { label: 'Scrunchies', img: IMAGE_PATHS.products.silkScrunchies },
                    { label: 'Rose Mist', img: IMAGE_PATHS.products.roseFacialMist },
                    { label: 'Potli Bag', img: IMAGE_PATHS.products.embroideredPotliBag },
                  ].map((item) => {
                    const isSelected = editingProduct.image === item.img;
                    return (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => setEditingProduct({ ...editingProduct, image: item.img })}
                        className={`flex flex-col items-center p-1.5 rounded-lg border text-center transition-all ${
                          isSelected
                            ? 'border-rose-600 bg-rose-50/70 ring-1 ring-rose-500'
                            : 'border-stone-200 bg-stone-50 hover:bg-stone-100'
                        }`}
                      >
                        <img
                          src={item.img}
                          alt={item.label}
                          loading="lazy"
                          decoding="async"
                          width="48"
                          height="40"
                          className="w-12 h-10 object-cover rounded-md mb-1 border border-stone-200"
                        />
                        <span className="text-[10px] text-stone-700 font-medium truncate w-full">
                          {item.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-stone-700 font-medium mb-1">Description / Notes</label>
                <textarea
                  rows={2}
                  value={editingProduct.description || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  placeholder="Details regarding stones, thread count, fabric base, or warranty..."
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
                />
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-stone-600 hover:text-stone-900 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Adjust Stock Modal */}
      {adjustModalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div>
              <h3 className="font-semibold text-stone-900 text-sm">Stock Adjustment</h3>
              <p className="text-xs text-stone-500 mt-0.5">{adjustModalProduct.name}</p>
            </div>

            <div className="text-xs bg-stone-50 p-2.5 rounded-lg border border-stone-200">
              Current stock: <strong>{adjustModalProduct.stockQuantity} {adjustModalProduct.unit}</strong>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Quantity Change (+ to Add, - to Deduct)
              </label>
              <input
                type="number"
                placeholder="e.g. 5 or -2"
                value={adjustDelta || ''}
                onChange={(e) => setAdjustDelta(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm font-bold font-mono"
              />
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setAdjustDelta(10)}
                  className="px-2 py-1 bg-stone-100 hover:bg-stone-200 rounded text-[11px] font-mono"
                >
                  +10 Received
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustDelta(25)}
                  className="px-2 py-1 bg-stone-100 hover:bg-stone-200 rounded text-[11px] font-mono"
                >
                  +25 Received
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustDelta(-1)}
                  className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded text-[11px] font-mono"
                >
                  -1 Damaged
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200">
              <button
                type="button"
                onClick={() => setAdjustModalProduct(null)}
                className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={adjustDelta === 0}
                onClick={handleExecuteStockAdjust}
                className="px-4 py-1.5 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white rounded-lg text-xs font-medium"
              >
                Apply Adjustment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Barcode Sticker Label Generator Modal */}
      {barcodePrintProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-stone-900 text-sm">Print Barcode Sticker Label</h3>
              <button
                type="button"
                onClick={() => setBarcodePrintProduct(null)}
                className="text-stone-400 hover:text-stone-700 text-xs"
              >
                ×
              </button>
            </div>

            {/* Simulated 40x25mm shelf barcode sticker */}
            <div className="border-2 border-dashed border-stone-300 p-4 rounded-xl flex flex-col items-center justify-center text-center bg-stone-50">
              <span className="text-[10px] font-bold text-stone-800 uppercase tracking-tight">
                {settings.shopName}
              </span>
              <span className="text-xs font-semibold text-stone-900 mt-0.5 line-clamp-1">
                {barcodePrintProduct.name}
              </span>

              {/* Barcode bars */}
              <div className="my-2 h-10 w-36 flex items-center justify-center space-x-0.5 py-1">
                <div className="h-full w-1 bg-black" />
                <div className="h-full w-0.5 bg-black" />
                <div className="h-full w-1.5 bg-black" />
                <div className="h-full w-0.5 bg-black" />
                <div className="h-full w-2 bg-black" />
                <div className="h-full w-0.5 bg-black" />
                <div className="h-full w-1 bg-black" />
                <div className="h-full w-1.5 bg-black" />
                <div className="h-full w-0.5 bg-black" />
                <div className="h-full w-2 bg-black" />
                <div className="h-full w-1 bg-black" />
              </div>

              <div className="text-[10px] font-mono tracking-widest text-stone-700">
                {barcodePrintProduct.barcode}
              </div>

              <div className="text-sm font-bold text-stone-900 font-mono-numbers mt-1">
                {formatCurrency(barcodePrintProduct.salePrice, settings.currencySymbol)}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setBarcodePrintProduct(null)}
                className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Sticker</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
