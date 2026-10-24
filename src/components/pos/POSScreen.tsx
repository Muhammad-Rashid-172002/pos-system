import React, { useState, useEffect, useRef } from 'react';
import {
  CartItem,
  Customer,
  Product,
  ProductVariant,
  Sale,
  ShopSettings,
  StaffUser,
  ParkedCart,
} from '../../types';
import { dataService } from '../../services/dataService';
import { formatCurrency, getStockStatus } from '../../utils/formatters';
import { IMAGE_PATHS, getCategoryThumbnail, getProductFallbackImage } from '../../constants/imagePaths';
import { getFallbackImageForCategory } from '../../assets/images';
import { CheckoutModal } from './CheckoutModal';
import { ReceiptModal } from './ReceiptModal';
import { ReturnsModal } from './ReturnsModal';
import {
  Search,
  Barcode,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  Percent,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Layers,
  ChevronRight,
  User,
  AlertTriangle,
} from 'lucide-react';

interface POSScreenProps {
  currentStaff: StaffUser;
  settings: ShopSettings;
}

export const POSScreen: React.FC<POSScreenProps> = ({ currentStaff, settings }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');

  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [billDiscountType, setBillDiscountType] = useState<'percentage' | 'fixed'>('fixed');
  const [billDiscountValue, setBillDiscountValue] = useState<number>(0);
  const [showDiscountInput, setShowDiscountInput] = useState(false);

  // Variant selector modal state
  const [variantModalProduct, setVariantModalProduct] = useState<Product | null>(null);

  // Parked carts state
  const [parkedCarts, setParkedCarts] = useState<ParkedCart[]>([]);
  const [showParkedList, setShowParkedList] = useState(false);

  // Checkout & Receipt Modals
  const [showCheckout, setShowCheckout] = useState(false);
  const [activeReceiptSale, setActiveReceiptSale] = useState<Sale | null>(null);
  const [showReturnsModal, setShowReturnsModal] = useState(false);

  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // Load data & subscribe to changes
  useEffect(() => {
    const load = () => {
      setProducts(dataService.getProducts());
      setCategories(dataService.getCategories());
      setParkedCarts(dataService.getParkedCarts());
    };
    load();
    const unsubscribe = dataService.subscribe(load);
    return () => unsubscribe();
  }, []);

  // Filter products by category and search
  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      p.name.toLowerCase().includes(query) ||
      p.sku.toLowerCase().includes(query) ||
      p.barcode.includes(query) ||
      p.category.toLowerCase().includes(query) ||
      p.variants?.some(
        (v) =>
          v.name.toLowerCase().includes(query) ||
          v.sku.toLowerCase().includes(query) ||
          v.barcode.includes(query)
      );
    return matchesCat && matchesSearch;
  });

  // Handle barcode quick scan (via physical scanner or manual input)
  const handleBarcodeSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const code = barcodeInput.trim();
    if (!code) return;

    // Check parent product barcodes
    const directProduct = products.find((p) => p.barcode === code);
    if (directProduct) {
      if (directProduct.variants && directProduct.variants.length > 0) {
        setVariantModalProduct(directProduct);
      } else {
        addToCart(directProduct);
      }
      setBarcodeInput('');
      return;
    }

    // Check variants
    for (const p of products) {
      if (p.variants) {
        const foundVariant = p.variants.find((v) => v.barcode === code);
        if (foundVariant) {
          addToCart(p, foundVariant);
          setBarcodeInput('');
          return;
        }
      }
    }

    // If not exact match, fall back to searching
    setSearchQuery(code);
    setBarcodeInput('');
  };

  // Add item to cart
  const addToCart = (product: Product, variant?: ProductVariant) => {
    const isVariant = !!variant;
    const itemId = isVariant ? `${product.id}_${variant.id}` : product.id;
    const price = isVariant ? variant.salePrice : product.salePrice;
    const purchase = isVariant ? variant.purchasePrice : product.purchasePrice;
    const stock = isVariant ? variant.stockQuantity : product.stockQuantity;

    // Stock check warning
    if (stock <= 0 && !settings.allowNegativeStock) {
      alert(`"${product.name}${variant ? ` - ${variant.name}` : ''}" is currently out of stock!`);
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.cartItemId === itemId);
      if (existing) {
        const newQty = existing.quantity + 1;
        const lineTotal = calculateLineTotal(existing.unitPrice, newQty, existing.discountType, existing.discountValue);
        return prev.map((item) =>
          item.cartItemId === itemId
            ? { ...item, quantity: newQty, lineTotal }
            : item
        );
      }

      const initialDiscountType: 'fixed' | 'percentage' = 'fixed';
      const initialDiscountVal = 0;
      const lineTotal = calculateLineTotal(price, 1, initialDiscountType, initialDiscountVal);

      const newItem: CartItem = {
        cartItemId: itemId,
        productId: product.id,
        variantId: variant?.id,
        name: product.name,
        variantName: variant?.name,
        sku: variant?.sku || product.sku,
        barcode: variant?.barcode || product.barcode,
        unit: product.unit,
        unitPrice: price,
        originalPrice: price,
        purchasePrice: purchase,
        quantity: 1,
        discountType: initialDiscountType,
        discountValue: initialDiscountVal,
        lineTotal,
      };

      return [...prev, newItem];
    });

    if (variantModalProduct) {
      setVariantModalProduct(null);
    }
  };

  const calculateLineTotal = (
    unitPrice: number,
    qty: number,
    discType: 'percentage' | 'fixed',
    discVal: number
  ): number => {
    const gross = unitPrice * qty;
    if (discVal <= 0) return gross;
    if (discType === 'percentage') {
      const discount = (gross * discVal) / 100;
      return Math.max(0, gross - discount);
    }
    return Math.max(0, gross - discVal);
  };

  const updateQuantity = (cartItemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.cartItemId === cartItemId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            const lineTotal = calculateLineTotal(item.unitPrice, newQty, item.discountType, item.discountValue);
            return { ...item, quantity: newQty, lineTotal };
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const updateItemDiscount = (
    cartItemId: string,
    type: 'percentage' | 'fixed',
    val: number
  ) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.cartItemId === cartItemId) {
          const lineTotal = calculateLineTotal(item.unitPrice, item.quantity, type, val);
          return { ...item, discountType: type, discountValue: val, lineTotal };
        }
        return item;
      })
    );
  };

  const updateUnitPrice = (cartItemId: string, newPrice: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.cartItemId === cartItemId) {
          const lineTotal = calculateLineTotal(newPrice, item.quantity, item.discountType, item.discountValue);
          return { ...item, unitPrice: newPrice, lineTotal };
        }
        return item;
      })
    );
  };

  const removeCartItem = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  };

  const clearCart = () => {
    if (cart.length === 0) return;
    if (confirm('Clear the current cart?')) {
      setCart([]);
      setSelectedCustomer(null);
      setBillDiscountValue(0);
    }
  };

  // Cart Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const itemsDiscountTotal = cart.reduce((sum, item) => {
    const gross = item.unitPrice * item.quantity;
    return sum + (gross - item.lineTotal);
  }, 0);

  let overallBillDiscount = 0;
  if (billDiscountValue > 0) {
    if (billDiscountType === 'percentage') {
      overallBillDiscount = (subtotal * billDiscountValue) / 100;
    } else {
      overallBillDiscount = billDiscountValue;
    }
  }

  const discountTotal = itemsDiscountTotal + overallBillDiscount;
  const taxableAmount = Math.max(0, subtotal - discountTotal);
  const taxTotal = (taxableAmount * settings.taxRate) / 100;
  const grandTotal = Math.max(0, taxableAmount + taxTotal);

  // Park (Hold) Cart
  const handleParkCart = () => {
    if (cart.length === 0) return;
    const notes = prompt('Enter customer note for this parked cart (e.g. choosing more laces):') || '';
    dataService.parkCart({
      customerName: selectedCustomer?.name,
      customerPhone: selectedCustomer?.phone,
      items: cart,
      notes,
    });
    setCart([]);
    setSelectedCustomer(null);
    setBillDiscountValue(0);
  };

  const handleResumeCart = (parkedId: string) => {
    const resumed = dataService.resumeParkedCart(parkedId);
    if (resumed) {
      if (cart.length > 0) {
        if (!confirm('Active cart items will be replaced with held cart. Continue?')) {
          return;
        }
      }
      setCart(resumed.items);
      setShowParkedList(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden bg-stone-100/70">
      {/* LEFT AREA: Product Catalog & Fast POS Controls */}
      <div className="flex-1 flex flex-col min-w-0 h-full border-r border-stone-200 bg-white">
        {/* Top Search & Barcode Quick Bar */}
        <div className="p-3.5 border-b border-stone-200 bg-white space-y-2.5">
          <div className="flex items-center gap-2">
            {/* Barcode Laser Input */}
            <form onSubmit={handleBarcodeSubmit} className="relative flex-1 sm:max-w-xs">
              <Barcode className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                ref={barcodeInputRef}
                type="text"
                placeholder="Scan Barcode (F2)..."
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 border border-stone-200 rounded-lg text-xs font-mono bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 transition-all"
              />
            </form>

            {/* General Text Search */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Search products by name, SKU, or shade..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-1.5 border border-stone-200 rounded-lg text-xs bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs"
                >
                  ×
                </button>
              )}
            </div>

            {/* Returns & Exchange Trigger */}
            <button
              type="button"
              onClick={() => setShowReturnsModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-stone-200 hover:border-stone-300 text-stone-700 hover:bg-stone-50 rounded-lg text-xs font-medium transition-colors shrink-0"
              title="Return or Exchange an item"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
              <span className="hidden sm:inline">Returns</span>
            </button>
          </div>

          {/* Category Filter Pills (Button tabs per guidelines) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                selectedCategory === 'all'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
              }`}
            >
              <span>All Items</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${selectedCategory === 'all' ? 'bg-white/20' : 'bg-stone-200 text-stone-600 font-mono'}`}>
                {products.length}
              </span>
            </button>
            {categories.map((cat) => {
              const count = products.filter((p) => p.category === cat).length;
              const isSelected = selectedCategory === cat;
              const catThumb = getCategoryThumbnail(cat);
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${
                    isSelected
                      ? 'bg-rose-700 text-white shadow-xs'
                      : 'bg-stone-100 text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
                  }`}
                >
                  <img
                    src={catThumb}
                    alt={cat}
                    width={20}
                    height={20}
                    className="w-5 h-5 rounded-full object-cover border border-black/10 shrink-0"
                    loading="lazy"
                    decoding="async"
                  />
                  <span>{cat}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${isSelected ? 'bg-white/20' : 'bg-stone-200 text-stone-600'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="flex-1 overflow-y-auto p-4 bg-stone-50/40">
          {filteredProducts.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-stone-400">
              <ShoppingBag className="w-10 h-10 mb-2 stroke-1 text-stone-300" />
              <p className="text-sm font-medium text-stone-600">No products match your criteria</p>
              <p className="text-xs text-stone-400 mt-1">Try clearing filters or scanning a different barcode</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredProducts.map((product, idx) => {
                const stockInfo = getStockStatus(product.stockQuantity, product.minStockThreshold);
                const hasVariants = product.variants && product.variants.length > 0;
                const imageSrc = product.image || getProductFallbackImage(product.category);

                return (
                  <div
                    key={product.id}
                    onClick={() => {
                      if (hasVariants) {
                        setVariantModalProduct(product);
                      } else {
                        addToCart(product);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && (hasVariants ? setVariantModalProduct(product) : addToCart(product))}
                    className="group bg-white rounded-xl border border-stone-200 hover:border-rose-300 hover:shadow-md transition-all text-left flex flex-col overflow-hidden cursor-pointer active:scale-99"
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-4/3 w-full bg-stone-100 overflow-hidden">
                      <img
                        src={imageSrc}
                        alt={product.name}
                        width={280}
                        height={210}
                        loading={idx < 8 ? 'eager' : 'lazy'}
                        decoding="async"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />

                      {/* Stock status indicator */}
                      <div className="absolute top-2 left-2">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-md shadow-xs ${
                            product.stockQuantity <= 0
                              ? 'bg-rose-600 text-white'
                              : product.stockQuantity <= product.minStockThreshold
                              ? 'bg-amber-500 text-white'
                              : 'bg-white/90 backdrop-blur-xs text-stone-700 border border-stone-200'
                          }`}
                        >
                          {product.stockQuantity <= 0
                            ? 'Out of Stock'
                            : `${product.stockQuantity} ${product.unit}`}
                        </span>
                      </div>

                      {hasVariants && (
                        <div className="absolute top-2 right-2">
                          <span className="text-[10px] font-medium px-1.5 py-0.5 bg-stone-900/80 text-white backdrop-blur-xs rounded">
                            {product.variants?.length} Options
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-3 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="text-[10px] font-medium text-stone-400 uppercase tracking-wider truncate">
                          {product.category}
                        </div>
                        <h4 className="text-xs font-semibold text-stone-900 line-clamp-2 mt-0.5 group-hover:text-rose-700 transition-colors">
                          {product.name}
                        </h4>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-stone-100 flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold text-stone-900 font-mono-numbers">
                            {formatCurrency(product.salePrice, settings.currencySymbol)}
                          </div>
                          <div className="text-[10px] text-stone-400 font-mono">
                            {product.sku}
                          </div>
                        </div>

                        <span className="p-1.5 rounded-lg bg-stone-50 group-hover:bg-rose-50 text-stone-500 group-hover:text-rose-600 transition-colors">
                          <Plus className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT AREA: Fast Interactive Cart & Checkout Panel */}
      <div className="w-full lg:w-[410px] xl:w-[440px] h-full flex flex-col bg-white shrink-0 border-l border-stone-200 shadow-xs">
        {/* Cart Topbar */}
        <div className="p-4 border-b border-stone-200 bg-stone-50/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-rose-600" />
            <h3 className="font-semibold text-stone-900 text-sm">Customer Cart</h3>
            <span className="text-xs font-mono px-1.5 py-0.5 bg-stone-200 text-stone-700 rounded-full">
              {cart.reduce((sum, it) => sum + it.quantity, 0)}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Park Cart Button */}
            {cart.length > 0 && (
              <button
                type="button"
                onClick={handleParkCart}
                className="p-1.5 text-stone-500 hover:text-stone-800 hover:bg-stone-200/60 rounded-lg transition-colors text-xs flex items-center gap-1"
                title="Hold / Park this cart for later"
              >
                <Pause className="w-3.5 h-3.5" />
                <span className="text-[11px] hidden sm:inline">Hold</span>
              </button>
            )}

            {/* View Held Carts */}
            {parkedCarts.length > 0 && (
              <button
                type="button"
                onClick={() => setShowParkedList(!showParkedList)}
                className="relative px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-md text-[11px] font-medium flex items-center gap-1"
              >
                <Play className="w-3 h-3 text-amber-700" />
                <span>Held ({parkedCarts.length})</span>
              </button>
            )}

            {/* Clear Cart */}
            {cart.length > 0 && (
              <button
                type="button"
                onClick={clearCart}
                className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                title="Clear Cart"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Held Carts Dropdown Drawer */}
        {showParkedList && parkedCarts.length > 0 && (
          <div className="bg-amber-50/80 p-3 border-b border-amber-200 space-y-2 text-xs">
            <div className="flex justify-between items-center text-amber-900 font-semibold text-[11px]">
              <span>Parked / Held Customer Carts</span>
              <button
                type="button"
                onClick={() => setShowParkedList(false)}
                className="text-stone-400 hover:text-stone-600"
              >
                ×
              </button>
            </div>
            {parkedCarts.map((p) => (
              <div
                key={p.id}
                className="bg-white p-2.5 rounded-lg border border-amber-200 flex justify-between items-center shadow-xs"
              >
                <div>
                  <div className="font-medium text-stone-900">
                    {p.customerName || 'Held Walk-in Cart'} ({p.items.length} items)
                  </div>
                  {p.notes && <div className="text-[10px] text-stone-500 italic">{p.notes}</div>}
                  <div className="text-[10px] text-stone-400">
                    {new Date(p.parkedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleResumeCart(p.id)}
                    className="px-2.5 py-1 bg-stone-900 hover:bg-stone-800 text-white rounded text-[11px] font-medium"
                  >
                    Resume
                  </button>
                  <button
                    type="button"
                    onClick={() => dataService.deleteParkedCart(p.id)}
                    className="p-1 text-stone-400 hover:text-rose-600"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Customer Badge in Cart */}
        <div className="px-4 py-2 border-b border-stone-100 flex items-center justify-between text-xs bg-stone-50/30">
          <div className="flex items-center gap-1.5 text-stone-600 truncate">
            <User className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <span className="truncate">
              {selectedCustomer ? (
                <>
                  <strong className="text-stone-900">{selectedCustomer.name}</strong>
                  {selectedCustomer.balance > 0 && (
                    <span className="text-amber-700 ml-1 font-mono">
                      (Khata: {formatCurrency(selectedCustomer.balance, settings.currencySymbol)})
                    </span>
                  )}
                </>
              ) : (
                'General Walk-in Customer'
              )}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowCheckout(true)}
            className="text-[11px] text-rose-600 hover:text-rose-700 font-medium whitespace-nowrap"
          >
            {selectedCustomer ? 'Change' : '+ Select Customer'}
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 divide-y divide-stone-100 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-400">
              <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mb-3">
                <ShoppingBag className="w-6 h-6 text-stone-300" />
              </div>
              <p className="text-sm font-medium text-stone-600">Cart is empty</p>
              <p className="text-xs text-stone-400 max-w-[200px] mt-1">
                Scan a barcode or click any product to begin billing
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.cartItemId} className="pt-3 first:pt-0">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1">
                    <h5 className="text-xs font-semibold text-stone-900 leading-snug">{item.name}</h5>
                    {item.variantName && (
                      <span className="text-[11px] text-stone-500 font-medium block mt-0.5">
                        {item.variantName}
                      </span>
                    )}
                    <span className="text-[10px] text-stone-400 font-mono">{item.sku}</span>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold text-stone-900 font-mono-numbers">
                      {formatCurrency(item.lineTotal, settings.currencySymbol)}
                    </div>
                    {item.discountValue > 0 && (
                      <span className="text-[10px] text-rose-600 block line-through font-mono-numbers">
                        {formatCurrency(item.unitPrice * item.quantity, settings.currencySymbol)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Quantity & Item Discount Controls */}
                <div className="flex items-center justify-between mt-2.5 pt-1">
                  {/* Quantity Stepper */}
                  <div className="flex items-center border border-stone-200 rounded-lg overflow-hidden bg-stone-50">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.cartItemId, -1)}
                      className="px-2 py-1 text-stone-600 hover:bg-stone-200 transition-colors"
                      title="Decrease quantity"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="px-2.5 py-0.5 text-xs font-semibold font-mono text-stone-900">
                      {item.quantity} {item.unit}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.cartItemId, 1)}
                      className="px-2 py-1 text-stone-600 hover:bg-stone-200 transition-colors"
                      title="Increase quantity"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Inline Discount / Edit */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        const newDisc = prompt(
                          `Enter discount for "${item.name}" (Current: ${item.discountValue}${item.discountType === 'percentage' ? '%' : ' PKR'}):`,
                          item.discountValue.toString()
                        );
                        if (newDisc !== null) {
                          const parsed = parseFloat(newDisc) || 0;
                          updateItemDiscount(item.cartItemId, 'fixed', parsed);
                        }
                      }}
                      className="text-[11px] px-1.5 py-0.5 rounded text-stone-500 hover:text-stone-800 hover:bg-stone-100 flex items-center gap-0.5"
                      title="Item discount"
                    >
                      <Percent className="w-3 h-3 text-stone-400" />
                      <span>{item.discountValue > 0 ? `-${item.discountValue}` : 'Disc'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => removeCartItem(item.cartItemId)}
                      className="p-1 text-stone-400 hover:text-rose-600 rounded transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Cart Totals & Checkout Trigger */}
        <div className="p-4 border-t border-stone-200 bg-stone-50/80 space-y-3">
          {/* Subtotal & Discount rows */}
          <div className="space-y-1.5 text-xs text-stone-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-mono-numbers">{formatCurrency(subtotal, settings.currencySymbol)}</span>
            </div>

            {/* Bill Level Discount */}
            <div className="flex justify-between items-center text-[11px]">
              <button
                type="button"
                onClick={() => setShowDiscountInput(!showDiscountInput)}
                className="text-stone-500 hover:text-rose-600 flex items-center gap-1 font-medium"
              >
                <Percent className="w-3 h-3" />
                <span>{billDiscountValue > 0 ? `Bill Discount (${billDiscountValue})` : '+ Add Bill Discount'}</span>
              </button>

              {billDiscountValue > 0 && (
                <span className="text-rose-600 font-mono-numbers">
                  -{formatCurrency(discountTotal, settings.currencySymbol)}
                </span>
              )}
            </div>

            {showDiscountInput && (
              <div className="flex gap-2 p-2 bg-white rounded-lg border border-stone-200">
                <input
                  type="number"
                  min="0"
                  placeholder="Discount value..."
                  value={billDiscountValue || ''}
                  onChange={(e) => setBillDiscountValue(parseFloat(e.target.value) || 0)}
                  className="w-full px-2 py-1 border border-stone-300 rounded text-xs font-mono"
                />
                <select
                  value={billDiscountType}
                  onChange={(e) => setBillDiscountType(e.target.value as 'fixed' | 'percentage')}
                  className="px-2 py-1 border border-stone-300 rounded text-xs"
                >
                  <option value="fixed">PKR (Fixed)</option>
                  <option value="percentage">% Percent</option>
                </select>
              </div>
            )}

            {settings.taxRate > 0 && (
              <div className="flex justify-between">
                <span>Tax ({settings.taxRate}%)</span>
                <span className="font-mono-numbers">{formatCurrency(taxTotal, settings.currencySymbol)}</span>
              </div>
            )}

            <div className="flex justify-between text-base font-bold text-stone-900 pt-2 border-t border-stone-200">
              <span>Net Payable</span>
              <span className="text-rose-700 font-mono-numbers text-lg">
                {formatCurrency(grandTotal, settings.currencySymbol)}
              </span>
            </div>
          </div>

          {/* Big Checkout Action Button */}
          <button
            type="button"
            disabled={cart.length === 0}
            onClick={() => setShowCheckout(true)}
            className="w-full flex items-center justify-between px-5 py-3.5 bg-rose-600 hover:bg-rose-700 active:scale-99 disabled:opacity-50 disabled:pointer-events-none text-white rounded-xl font-semibold text-sm shadow-md shadow-rose-600/20 transition-all"
          >
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              <span>Charge / Payment</span>
            </div>
            <div className="flex items-center gap-1 font-mono-numbers">
              <span>{formatCurrency(grandTotal, settings.currencySymbol)}</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>
        </div>
      </div>

      {/* Product Variant Picker Modal */}
      {variantModalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={variantModalProduct.image || getProductFallbackImage(variantModalProduct.category)}
                  alt={variantModalProduct.name}
                  width={44}
                  height={44}
                  className="w-11 h-11 rounded-lg object-cover border border-stone-200 shrink-0"
                  loading="eager"
                  decoding="async"
                />
                <div>
                  <h3 className="font-semibold text-stone-900 text-sm">{variantModalProduct.name}</h3>
                  <p className="text-xs text-stone-500">Choose shade, size, or style variant</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setVariantModalProduct(null)}
                className="text-stone-400 hover:text-stone-700 p-1"
              >
                ×
              </button>
            </div>

            <div className="p-4 space-y-2 max-h-80 overflow-y-auto">
              {variantModalProduct.variants?.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => addToCart(variantModalProduct, v)}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-stone-200 hover:border-rose-400 hover:bg-rose-50/50 text-left transition-all group"
                >
                  <div>
                    <span className="font-semibold text-stone-900 text-xs group-hover:text-rose-700">
                      {v.name}
                    </span>
                    <div className="text-[11px] text-stone-400 font-mono mt-0.5">
                      SKU: {v.sku} · Barcode: {v.barcode}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-bold text-stone-900 text-xs font-mono-numbers">
                      {formatCurrency(v.salePrice, settings.currencySymbol)}
                    </span>
                    <div
                      className={`text-[10px] font-medium ${
                        v.stockQuantity <= 0
                          ? 'text-rose-600'
                          : v.stockQuantity <= v.minStockThreshold
                          ? 'text-amber-600'
                          : 'text-stone-500'
                      }`}
                    >
                      {v.stockQuantity} in stock
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckout && (
        <CheckoutModal
          cartItems={cart}
          subtotal={subtotal}
          discountTotal={discountTotal}
          taxTotal={taxTotal}
          taxRate={settings.taxRate}
          grandTotal={grandTotal}
          selectedCustomer={selectedCustomer}
          onSelectCustomer={setSelectedCustomer}
          currentStaff={currentStaff}
          settings={settings}
          onClose={() => setShowCheckout(false)}
          onSaleComplete={(sale) => {
            setShowCheckout(false);
            setCart([]);
            setSelectedCustomer(null);
            setBillDiscountValue(0);
            setActiveReceiptSale(sale);
          }}
        />
      )}

      {/* Receipt Preview Modal */}
      {activeReceiptSale && (
        <ReceiptModal
          sale={activeReceiptSale}
          settings={settings}
          onClose={() => setActiveReceiptSale(null)}
        />
      )}

      {/* Returns & Exchanges Modal */}
      {showReturnsModal && (
        <ReturnsModal
          currentStaff={currentStaff}
          currencySymbol={settings.currencySymbol}
          onClose={() => setShowReturnsModal(false)}
          onSuccess={(updatedSale) => {
            setActiveReceiptSale(updatedSale);
          }}
        />
      )}
    </div>
  );
};
