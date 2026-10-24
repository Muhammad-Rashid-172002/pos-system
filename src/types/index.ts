export type DefaultCategory =
  | 'Cosmetics & Makeup'
  | 'Jewelry & Artificial Jewelry'
  | 'Laces, Borders & Embroidery'
  | 'Hair Accessories'
  | 'Skincare Products'
  | 'Ladies Fashion Accessories';

export type ProductCategory = DefaultCategory | string;

export interface ProductVariant {
  id: string;
  name: string; // e.g. "Crimson Red / 50ml", "Golden / 9mm", "3-Piece Set"
  sku: string;
  barcode: string;
  purchasePrice: number;
  salePrice: number;
  stockQuantity: number;
  minStockThreshold: number;
}

export type ProductUnit = 'piece' | 'yard' | 'meter' | 'box' | 'set' | 'pair' | 'pack';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  unit: ProductUnit;
  sku: string;
  barcode: string;
  purchasePrice: number;
  salePrice: number;
  stockQuantity: number;
  minStockThreshold: number;
  image?: string;
  description?: string;
  supplierId?: string;
  supplierName?: string;
  variants?: ProductVariant[];
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  cartItemId: string; // unique cart row id
  productId: string;
  variantId?: string;
  name: string;
  variantName?: string;
  sku: string;
  barcode: string;
  unit: ProductUnit;
  unitPrice: number; // current selling unit price (can be discounted)
  originalPrice: number;
  purchasePrice: number;
  quantity: number;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  lineTotal: number;
}

export type PaymentMethod = 'cash' | 'bank_transfer' | 'card' | 'jazzcash_easypaisa' | 'credit';

export type PaymentStatus = 'paid' | 'partial' | 'unpaid';

export interface ReturnedItem {
  id: string;
  productId: string;
  variantId?: string;
  productName: string;
  quantity: number;
  unitRefundAmount: number;
  totalRefundAmount: number;
  reason: string;
  type: 'refund' | 'exchange';
  exchangedWithProductId?: string;
  exchangedWithProductName?: string;
}

export interface SaleReturnRecord {
  id: string;
  saleId: string;
  invoiceNumber: string;
  date: string;
  items: ReturnedItem[];
  totalRefundAmount: number;
  processedBy: string;
  notes?: string;
}

export interface Sale {
  id: string;
  invoiceNumber: string;
  date: string;
  items: CartItem[];
  subtotal: number;
  discountTotal: number;
  discountReason?: string;
  taxRate: number;
  taxTotal: number;
  grandTotal: number;
  paidAmount: number;
  changeAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  cashierId: string;
  cashierName: string;
  notes?: string;
  returnedItems?: ReturnedItem[];
  returnsHistory?: SaleReturnRecord[];
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  balance: number; // positive = customer owes store (credit/udhaar), negative = advance store owes customer
  totalSpent: number;
  visitsCount: number;
  notes?: string;
  createdAt: string;
}

export interface CustomerPaymentRecord {
  id: string;
  customerId: string;
  customerName: string;
  date: string;
  amount: number;
  paymentMethod: 'cash' | 'bank_transfer' | 'jazzcash_easypaisa';
  notes?: string;
  recordedBy: string;
}

export interface Supplier {
  id: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  email?: string;
  address: string;
  balanceDue: number; // amount shop owes to supplier
  totalPurchases: number;
  createdAt: string;
}

export interface SupplierPurchaseItem {
  productId: string;
  productName: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

export interface SupplierPurchase {
  id: string;
  purchaseOrderNumber: string;
  supplierId: string;
  supplierName: string;
  date: string;
  items: SupplierPurchaseItem[];
  totalAmount: number;
  paidAmount: number;
  paymentStatus: PaymentStatus;
  notes?: string;
}

export type ExpenseCategory =
  | 'Shop Rent'
  | 'Electricity & Utilities'
  | 'Staff Salaries'
  | 'Transport & Courier'
  | 'Packaging & Bags'
  | 'Shop Maintenance & Decor'
  | 'Marketing & Ads'
  | 'Tea & Refreshments'
  | 'Other';

export interface Expense {
  id: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  paymentMethod: 'cash' | 'bank_transfer';
  recordedBy: string;
  notes?: string;
}

export type UserRole = 'admin' | 'cashier';

export interface StaffUser {
  id: string;
  name: string;
  username: string;
  role: UserRole;
  phone?: string;
}

export interface ShopSettings {
  shopName: string;
  tagline: string;
  logoUrl?: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  city: string;
  currencySymbol: string;
  taxRate: number; // in percent, e.g. 0% or 5%
  receiptHeaderNotice: string;
  receiptFooterNotice: string;
  defaultLowStockThreshold: number;
  allowNegativeStock: boolean;
  returnPolicyDays: number;
}

export interface ParkedCart {
  id: string;
  parkedAt: string;
  customerName?: string;
  customerPhone?: string;
  items: CartItem[];
  notes?: string;
}
