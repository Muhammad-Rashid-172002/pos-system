import {
  Product,
  Customer,
  Supplier,
  SupplierPurchase,
  Sale,
  Expense,
  ShopSettings,
  StaffUser,
  ParkedCart,
  CustomerPaymentRecord,
  ReturnedItem,
  SaleReturnRecord,
  PaymentMethod,
} from '../types';
import { IMAGE_PATHS, getProductFallbackImage } from '../constants/imagePaths';

const STORAGE_KEYS = {
  PRODUCTS: 'zebaish_products_v1',
  CUSTOMERS: 'zebaish_customers_v1',
  SUPPLIERS: 'zebaish_suppliers_v1',
  PURCHASES: 'zebaish_purchases_v1',
  SALES: 'zebaish_sales_v1',
  EXPENSES: 'zebaish_expenses_v1',
  SETTINGS: 'zebaish_settings_v1',
  STAFF: 'zebaish_staff_v1',
  PARKED_CARTS: 'zebaish_parked_carts_v1',
  PAYMENTS: 'zebaish_customer_payments_v1',
  CATEGORIES: 'zebaish_categories_v1',
};

export const DEFAULT_CATEGORIES = [
  'Cosmetics & Makeup',
  'Jewelry & Artificial Jewelry',
  'Laces, Borders & Embroidery',
  'Hair Accessories',
  'Skincare Products',
  'Ladies Fashion Accessories',
];

const INITIAL_SETTINGS: ShopSettings = {
  shopName: 'Zebaish Ladies Boutique & Cosmetics',
  tagline: 'Bridal Jewellery, Luxury Cosmetics, Designer Laces & Accessories',
  logoUrl: IMAGE_PATHS.branding.logo,
  phone: '+92 300 4567890',
  whatsapp: '+92 321 9876543',
  email: 'info@zebaishboutique.pk',
  address: 'Shop #14, Ground Floor, Rabi Center 2, Main Gulberg / Tariq Road',
  city: 'Lahore, Pakistan',
  currencySymbol: '₨',
  taxRate: 0, // 0% standard retail default in small boutique, customizable
  receiptHeaderNotice: 'Thank you for shopping at Zebaish! Please retain this slip for returns or exchanges within 7 days.',
  receiptFooterNotice: 'Cut fabrics & unsealed cosmetics are non-refundable. Follow us on Instagram @zebaish.boutique',
  defaultLowStockThreshold: 5,
  allowNegativeStock: false,
  returnPolicyDays: 7,
};

const INITIAL_STAFF: StaffUser[] = [
  {
    id: 'staff-1',
    name: 'Mrs. Huma Rashid',
    username: 'admin',
    role: 'admin',
    phone: '+92 300 4567890',
  },
  {
    id: 'staff-2',
    name: 'Maria Noor',
    username: 'cashier',
    role: 'cashier',
    phone: '+92 312 3456789',
  },
];

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Royal Kundan Bridal Choker & Jhumka Set',
    category: 'Jewelry & Artificial Jewelry',
    unit: 'set',
    sku: 'JWL-KUN-001',
    barcode: '8901001001',
    purchasePrice: 4200,
    salePrice: 6850,
    stockQuantity: 8,
    minStockThreshold: 3,
    image: IMAGE_PATHS.products.kundanChoker,
    description: '24K antique micro-gold plated brass choker embellished with hand-cut faux rubies, uncut Kundan stones, and freshwater seed pearl clusters.',
    supplierId: 'sup-1',
    supplierName: 'Rajput Kundan Jewellers Anarkali',
    variants: [
      {
        id: 'var-1a',
        name: 'Ruby Red & Gold',
        sku: 'JWL-KUN-001-RED',
        barcode: '8901001001-R',
        purchasePrice: 4200,
        salePrice: 6850,
        stockQuantity: 5,
        minStockThreshold: 2,
      },
      {
        id: 'var-1b',
        name: 'Emerald Green & Gold',
        sku: 'JWL-KUN-001-GRN',
        barcode: '8901001001-G',
        purchasePrice: 4200,
        salePrice: 6850,
        stockQuantity: 3,
        minStockThreshold: 2,
      },
    ],
    createdAt: '2026-10-01T10:00:00Z',
    updatedAt: '2026-10-20T14:30:00Z',
  },
  {
    id: 'prod-2',
    name: 'Velvet Matte Long-Stay Liquid Lipstick',
    category: 'Cosmetics & Makeup',
    unit: 'piece',
    sku: 'COS-LIP-002',
    barcode: '8901002002',
    purchasePrice: 750,
    salePrice: 1450,
    stockQuantity: 28,
    minStockThreshold: 8,
    image: IMAGE_PATHS.products.matteLipstick,
    description: '16-hour smudge-proof hydrating liquid lipstick with Vitamin E and shea butter. Rich South Asian undertones.',
    supplierId: 'sup-2',
    supplierName: 'Kashees Cosmetics & Wholesale Hub',
    variants: [
      {
        id: 'var-2a',
        name: 'Shade 04 - Kashmiri Rose',
        sku: 'COS-LIP-002-ROS',
        barcode: '8901002002-4',
        purchasePrice: 750,
        salePrice: 1450,
        stockQuantity: 12,
        minStockThreshold: 4,
      },
      {
        id: 'var-2b',
        name: 'Shade 09 - Bridal Maroon',
        sku: 'COS-LIP-002-MAR',
        barcode: '8901002002-9',
        purchasePrice: 750,
        salePrice: 1450,
        stockQuantity: 10,
        minStockThreshold: 4,
      },
      {
        id: 'var-2c',
        name: 'Shade 14 - Warm Terracotta Nude',
        sku: 'COS-LIP-002-TER',
        barcode: '8901002002-14',
        purchasePrice: 750,
        salePrice: 1450,
        stockQuantity: 6,
        minStockThreshold: 3,
      },
    ],
    createdAt: '2026-10-02T11:00:00Z',
    updatedAt: '2026-10-22T09:15:00Z',
  },
  {
    id: 'prod-3',
    name: 'Embroidered Velvet Zari & Pearl Lace Border',
    category: 'Laces, Borders & Embroidery',
    unit: 'yard',
    sku: 'LCE-VEL-003',
    barcode: '8901003003',
    purchasePrice: 280,
    salePrice: 580,
    stockQuantity: 65,
    minStockThreshold: 15,
    image: IMAGE_PATHS.products.zariVelvetLace,
    description: '3.5 inch luxury bridal border lace on deep wine velvet with pure golden tilla wire embroidery and micro pearl edging. Ideal for lehengas, dupattas, and damans.',
    supplierId: 'sup-3',
    supplierName: 'Al-Madina Lace & Fancy Trimmings Tariq Road',
    createdAt: '2026-10-03T12:00:00Z',
    updatedAt: '2026-10-23T16:00:00Z',
  },
  {
    id: 'prod-4',
    name: 'Handcrafted Bridal Pearl & Crystal Hair Vine',
    category: 'Hair Accessories',
    unit: 'piece',
    sku: 'HAR-VIN-004',
    barcode: '8901004004',
    purchasePrice: 650,
    salePrice: 1250,
    stockQuantity: 14,
    minStockThreshold: 4,
    image: IMAGE_PATHS.products.bridalHairVine,
    description: 'Flexible bendable gold wire hair vine hand-woven with Swarovski crystals, floral brass charms, and ivory faux pearls for wedding updos.',
    supplierId: 'sup-1',
    supplierName: 'Rajput Kundan Jewellers Anarkali',
    createdAt: '2026-10-04T13:00:00Z',
    updatedAt: '2026-10-18T10:45:00Z',
  },
  {
    id: 'prod-5',
    name: 'Damask Rose Glow Facial Mist & Hyaluronic Toner',
    category: 'Skincare Products',
    unit: 'piece',
    sku: 'SKN-ROS-005',
    barcode: '8901005005',
    purchasePrice: 480,
    salePrice: 950,
    stockQuantity: 22,
    minStockThreshold: 6,
    image: IMAGE_PATHS.products.roseFacialMist,
    description: '100% steam-distilled Choa Saidan Shah damask rose water infused with multi-molecular hyaluronic acid and aloe vera for instant dewy hydration.',
    supplierId: 'sup-4',
    supplierName: 'Pure Botanicals Lahore',
    createdAt: '2026-10-05T14:00:00Z',
    updatedAt: '2026-10-21T11:20:00Z',
  },
  {
    id: 'prod-6',
    name: 'Cutwork Organza Golden Gota Border Lace',
    category: 'Laces, Borders & Embroidery',
    unit: 'yard',
    sku: 'LCE-GOT-006',
    barcode: '8901006006',
    purchasePrice: 140,
    salePrice: 320,
    stockQuantity: 4, // LOW STOCK TRIGGER FOR ALERT!
    minStockThreshold: 10,
    image: IMAGE_PATHS.products.gotaCutworkLace,
    description: '2-inch sheer organza scalloped cutwork border with metallic silver and gold gota patti work. Lightweight, crisp finish.',
    supplierId: 'sup-3',
    supplierName: 'Al-Madina Lace & Fancy Trimmings Tariq Road',
    createdAt: '2026-10-06T15:00:00Z',
    updatedAt: '2026-10-24T02:00:00Z',
  },
  {
    id: 'prod-7',
    name: 'Antique Gold-Plated Jhumkas with Seed Pearls',
    category: 'Jewelry & Artificial Jewelry',
    unit: 'pair',
    sku: 'JWL-JHM-007',
    barcode: '8901007007',
    purchasePrice: 980,
    salePrice: 1850,
    stockQuantity: 11,
    minStockThreshold: 4,
    image: IMAGE_PATHS.products.goldJhumkas,
    description: 'Traditional Pakistani chandelier bell jhumkas with filigree peacock carvings and cascading hanging pearls.',
    supplierId: 'sup-1',
    supplierName: 'Rajput Kundan Jewellers Anarkali',
    createdAt: '2026-10-07T16:00:00Z',
    updatedAt: '2026-10-19T17:10:00Z',
  },
  {
    id: 'prod-8',
    name: 'Silk Mulberry Satin Scrunchie Trio Box',
    category: 'Hair Accessories',
    unit: 'box',
    sku: 'HAR-SCR-008',
    barcode: '8901008008',
    purchasePrice: 380,
    salePrice: 790,
    stockQuantity: 19,
    minStockThreshold: 5,
    image: IMAGE_PATHS.products.silkScrunchies,
    description: 'Set of 3 anti-breakage pure silk touch scrunchies in Champagne, Rose Gold, and Blush Pink.',
    supplierId: 'sup-4',
    supplierName: 'Pure Botanicals Lahore',
    createdAt: '2026-10-08T09:30:00Z',
    updatedAt: '2026-10-22T13:40:00Z',
  },
  {
    id: 'prod-9',
    name: 'Flawless HD Radiant Liquid Foundation (35ml)',
    category: 'Cosmetics & Makeup',
    unit: 'piece',
    sku: 'COS-FND-009',
    barcode: '8901009009',
    purchasePrice: 1100,
    salePrice: 2200,
    stockQuantity: 15,
    minStockThreshold: 5,
    image: IMAGE_PATHS.products.radiantFoundation,
    description: 'High definition buildable medium-to-full coverage with golden undertones formulated for Pakistani climates.',
    supplierId: 'sup-2',
    supplierName: 'Kashees Cosmetics & Wholesale Hub',
    variants: [
      {
        id: 'var-9a',
        name: 'Ivory Warm 01',
        sku: 'COS-FND-009-01',
        barcode: '8901009009-1',
        purchasePrice: 1100,
        salePrice: 2200,
        stockQuantity: 5,
        minStockThreshold: 2,
      },
      {
        id: 'var-9b',
        name: 'Natural Beige 02',
        sku: 'COS-FND-009-02',
        barcode: '8901009009-2',
        purchasePrice: 1100,
        salePrice: 2200,
        stockQuantity: 6,
        minStockThreshold: 2,
      },
      {
        id: 'var-9c',
        name: 'Honey Caramel 03',
        sku: 'COS-FND-009-03',
        barcode: '8901009009-3',
        purchasePrice: 1100,
        salePrice: 2200,
        stockQuantity: 4,
        minStockThreshold: 2,
      },
    ],
    createdAt: '2026-10-09T10:15:00Z',
    updatedAt: '2026-10-23T11:00:00Z',
  },
  {
    id: 'prod-10',
    name: 'Hand-Embroidered Velvet Bridal Potli Bag',
    category: 'Ladies Fashion Accessories',
    unit: 'piece',
    sku: 'ACC-POT-010',
    barcode: '8901010010',
    purchasePrice: 1450,
    salePrice: 2850,
    stockQuantity: 2, // LOW STOCK
    minStockThreshold: 4,
    image: IMAGE_PATHS.products.embroideredPotliBag,
    description: 'Intricately stitched maroon velvet pouch with antique metal bead fringe, pearl drawstring tassels, and gold braided wrist handle.',
    supplierId: 'sup-3',
    supplierName: 'Al-Madina Lace & Fancy Trimmings Tariq Road',
    createdAt: '2026-10-10T12:00:00Z',
    updatedAt: '2026-10-24T01:30:00Z',
  },
  {
    id: 'prod-11',
    name: 'Golden Mirror-Work Daman & Neckline Trimming',
    category: 'Laces, Borders & Embroidery',
    unit: 'yard',
    sku: 'LCE-MIR-011',
    barcode: '8901011011',
    purchasePrice: 190,
    salePrice: 420,
    stockQuantity: 34,
    minStockThreshold: 10,
    image: IMAGE_PATHS.products.mirrorWorkLace,
    description: 'Hand-stitched genuine real mini glass mirrors bound with brass zari loops on cotton base. Traditional Sindhi & Punjabi ethnic flair.',
    supplierId: 'sup-3',
    supplierName: 'Al-Madina Lace & Fancy Trimmings Tariq Road',
    createdAt: '2026-10-11T14:00:00Z',
    updatedAt: '2026-10-20T15:20:00Z',
  },
  {
    id: 'prod-12',
    name: 'Hyderabadi Gold-Plated Bangle Set (6 Pcs)',
    category: 'Jewelry & Artificial Jewelry',
    unit: 'set',
    sku: 'JWL-BNG-012',
    barcode: '8901012012',
    purchasePrice: 1200,
    salePrice: 2400,
    stockQuantity: 0, // OUT OF STOCK TEST
    minStockThreshold: 3,
    image: IMAGE_PATHS.products.hyderabadiBangles,
    description: 'Finely engraved royal floral relief bangles with side screw lock. Hypoallergenic double gold finish.',
    supplierId: 'sup-1',
    supplierName: 'Rajput Kundan Jewellers Anarkali',
    createdAt: '2026-10-12T15:00:00Z',
    updatedAt: '2026-10-23T18:00:00Z',
  },
];

const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    name: 'Ayesha Fatima',
    phone: '0302-8419201',
    email: 'ayesha.fatima@gmail.com',
    address: 'House 42, Block G, Gulberg III, Lahore',
    balance: 0,
    totalSpent: 34200,
    visitsCount: 7,
    notes: 'Regular bridal client, prefers Kundan jewelry and Kashees shades',
    createdAt: '2026-09-15T10:00:00Z',
  },
  {
    id: 'cust-2',
    name: 'Dr. Sadia Tariq',
    phone: '0321-4902188',
    email: 'dr.sadia@shaukatkhanum.org.pk',
    address: 'DHA Phase 5, Lahore',
    balance: 3500, // owes ₨3,500 on store credit (Khata)
    totalSpent: 48900,
    visitsCount: 11,
    notes: 'Credit approved up to ₨15,000. Pays via Bank Transfer at month-end.',
    createdAt: '2026-09-01T12:00:00Z',
  },
  {
    id: 'cust-3',
    name: 'Nadia Qasim (Boutique Designer)',
    phone: '0333-7821940',
    email: 'nadia.couture@yahoo.com',
    address: 'Shadman Market, Lahore',
    balance: 8200, // owes ₨8,200 for bulk lace purchase
    totalSpent: 87500,
    visitsCount: 19,
    notes: 'Fashion designer buying laces and borders in bulk yards.',
    createdAt: '2026-08-20T14:00:00Z',
  },
  {
    id: 'cust-4',
    name: 'Zainab Bilal',
    phone: '0345-6677889',
    email: 'zainab.b@gmail.com',
    address: 'Johar Town, Lahore',
    balance: 0,
    totalSpent: 12400,
    visitsCount: 3,
    createdAt: '2026-10-05T16:00:00Z',
  },
];

const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: 'sup-1',
    companyName: 'Rajput Kundan Jewellers Wholesale',
    contactPerson: 'Mian Tariq Rajput',
    phone: '0300-8432190',
    email: 'rajputjewellers@anarkali.pk',
    address: 'Shop 22, Chatta Bazar, Anarkali, Lahore',
    balanceDue: 24000,
    totalPurchases: 185000,
    createdAt: '2026-08-01T09:00:00Z',
  },
  {
    id: 'sup-2',
    companyName: 'Kashees Cosmetics & Wholesale Hub',
    contactPerson: 'Khurram Shehzad',
    phone: '0321-9988771',
    email: 'orders@kasheeswholesale.pk',
    address: 'Trade Center, Clifton, Karachi',
    balanceDue: 0,
    totalPurchases: 142000,
    createdAt: '2026-08-10T10:00:00Z',
  },
  {
    id: 'sup-3',
    companyName: 'Al-Madina Lace & Fancy Trimmings',
    contactPerson: 'Haji Abdul Qayyum',
    phone: '0333-2144556',
    email: 'almadinalaces@tariqroad.com',
    address: 'Rabi Center Basement, Tariq Road, Karachi',
    balanceDue: 12500,
    totalPurchases: 220000,
    createdAt: '2026-08-15T11:00:00Z',
  },
  {
    id: 'sup-4',
    companyName: 'Pure Botanicals Skincare Lab',
    contactPerson: 'Zehra Rizvi',
    phone: '0315-5544332',
    email: 'zehra@purebotanicals.pk',
    address: 'Plot 48, Sundar Industrial Estate, Lahore',
    balanceDue: 0,
    totalPurchases: 64000,
    createdAt: '2026-09-01T12:00:00Z',
  },
];

const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'exp-1',
    title: 'Shop Rent - Rabi Center Unit 14',
    category: 'Shop Rent',
    amount: 45000,
    date: '2026-10-01T10:00:00Z',
    paymentMethod: 'bank_transfer',
    recordedBy: 'Mrs. Huma Rashid',
    notes: 'October 2026 store space rental paid to plaza administration',
  },
  {
    id: 'exp-2',
    title: 'LESCO Commercial Electricity Bill',
    category: 'Electricity & Utilities',
    amount: 18450,
    date: '2026-10-08T12:00:00Z',
    paymentMethod: 'bank_transfer',
    recordedBy: 'Mrs. Huma Rashid',
    notes: 'Air conditioning and display lighting bill',
  },
  {
    id: 'exp-3',
    title: 'Custom Velvet Boutique Shopping Bags (500 Pcs)',
    category: 'Packaging & Bags',
    amount: 12500,
    date: '2026-10-14T15:00:00Z',
    paymentMethod: 'cash',
    recordedBy: 'Maria Noor',
    notes: 'Gold embossed branded shopping bags with ribbon handles',
  },
  {
    id: 'exp-4',
    title: 'Staff Monthly Tea & Refreshments',
    category: 'Tea & Refreshments',
    amount: 3800,
    date: '2026-10-20T17:00:00Z',
    paymentMethod: 'cash',
    recordedBy: 'Maria Noor',
    notes: 'Weekly milk, tea leaves, bakery snacks for visitors and staff',
  },
  {
    id: 'exp-5',
    title: 'Instagram & Facebook Bridal Campaign Ad Spend',
    category: 'Marketing & Ads',
    amount: 7500,
    date: '2026-10-22T14:30:00Z',
    paymentMethod: 'bank_transfer',
    recordedBy: 'Mrs. Huma Rashid',
    notes: 'Targeted bridal season reach for Lahore & Karachi',
  },
];

const INITIAL_SALES: Sale[] = [
  {
    id: 'sale-1001',
    invoiceNumber: 'INV-2026-1001',
    date: '2026-10-23T11:30:00Z',
    items: [
      {
        cartItemId: 'item-1',
        productId: 'prod-1',
        name: 'Royal Kundan Bridal Choker & Jhumka Set',
        variantId: 'var-1a',
        variantName: 'Ruby Red & Gold',
        sku: 'JWL-KUN-001-RED',
        barcode: '8901001001-R',
        unit: 'set',
        unitPrice: 6850,
        originalPrice: 6850,
        purchasePrice: 4200,
        quantity: 1,
        discountType: 'fixed',
        discountValue: 350,
        lineTotal: 6500,
      },
      {
        cartItemId: 'item-2',
        productId: 'prod-2',
        name: 'Velvet Matte Long-Stay Liquid Lipstick',
        variantId: 'var-2b',
        variantName: 'Shade 09 - Bridal Maroon',
        sku: 'COS-LIP-002-MAR',
        barcode: '8901002002-9',
        unit: 'piece',
        unitPrice: 1450,
        originalPrice: 1450,
        purchasePrice: 750,
        quantity: 2,
        discountType: 'fixed',
        discountValue: 0,
        lineTotal: 2900,
      },
    ],
    subtotal: 9750,
    discountTotal: 350,
    taxRate: 0,
    taxTotal: 0,
    grandTotal: 9400,
    paidAmount: 9400,
    changeAmount: 600,
    paymentMethod: 'cash',
    paymentStatus: 'paid',
    customerId: 'cust-1',
    customerName: 'Ayesha Fatima',
    customerPhone: '0302-8419201',
    cashierId: 'staff-2',
    cashierName: 'Maria Noor',
    notes: 'Bridal function shopping',
  },
  {
    id: 'sale-1002',
    invoiceNumber: 'INV-2026-1002',
    date: '2026-10-23T14:45:00Z',
    items: [
      {
        cartItemId: 'item-3',
        productId: 'prod-3',
        name: 'Embroidered Velvet Zari & Pearl Lace Border',
        sku: 'LCE-VEL-003',
        barcode: '8901003003',
        unit: 'yard',
        unitPrice: 580,
        originalPrice: 580,
        purchasePrice: 280,
        quantity: 12,
        discountType: 'percentage',
        discountValue: 5,
        lineTotal: 6612,
      },
      {
        cartItemId: 'item-4',
        productId: 'prod-11',
        name: 'Golden Mirror-Work Daman & Neckline Trimming',
        sku: 'LCE-MIR-011',
        barcode: '8901011011',
        unit: 'yard',
        unitPrice: 420,
        originalPrice: 420,
        purchasePrice: 190,
        quantity: 6,
        discountType: 'fixed',
        discountValue: 0,
        lineTotal: 2520,
      },
    ],
    subtotal: 9480,
    discountTotal: 348,
    taxRate: 0,
    taxTotal: 0,
    grandTotal: 9132,
    paidAmount: 9132,
    changeAmount: 0,
    paymentMethod: 'bank_transfer',
    paymentStatus: 'paid',
    customerId: 'cust-3',
    customerName: 'Nadia Qasim (Boutique Designer)',
    customerPhone: '0333-7821940',
    cashierId: 'staff-1',
    cashierName: 'Mrs. Huma Rashid',
  },
  {
    id: 'sale-1003',
    invoiceNumber: 'INV-2026-1003',
    date: '2026-10-24T01:15:00Z', // Today's early transaction
    items: [
      {
        cartItemId: 'item-5',
        productId: 'prod-5',
        name: 'Damask Rose Glow Facial Mist & Hyaluronic Toner',
        sku: 'SKN-ROS-005',
        barcode: '8901005005',
        unit: 'piece',
        unitPrice: 950,
        originalPrice: 950,
        purchasePrice: 480,
        quantity: 1,
        discountType: 'fixed',
        discountValue: 0,
        lineTotal: 950,
      },
      {
        cartItemId: 'item-6',
        productId: 'prod-8',
        name: 'Silk Mulberry Satin Scrunchie Trio Box',
        sku: 'HAR-SCR-008',
        barcode: '8901008008',
        unit: 'box',
        unitPrice: 790,
        originalPrice: 790,
        purchasePrice: 380,
        quantity: 2,
        discountType: 'fixed',
        discountValue: 0,
        lineTotal: 1580,
      },
      {
        cartItemId: 'item-7',
        productId: 'prod-7',
        name: 'Antique Gold-Plated Jhumkas with Seed Pearls',
        sku: 'JWL-JHM-007',
        barcode: '8901007007',
        unit: 'pair',
        unitPrice: 1850,
        originalPrice: 1850,
        purchasePrice: 980,
        quantity: 1,
        discountType: 'fixed',
        discountValue: 150,
        lineTotal: 1700,
      },
    ],
    subtotal: 4380,
    discountTotal: 150,
    taxRate: 0,
    taxTotal: 0,
    grandTotal: 4230,
    paidAmount: 4230,
    changeAmount: 770,
    paymentMethod: 'jazzcash_easypaisa',
    paymentStatus: 'paid',
    cashierId: 'staff-2',
    cashierName: 'Maria Noor',
    notes: 'Walk-in customer payment confirmed via JazzCash QR',
  },
];

class DataService {
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.ensureInitialized();
  }

  private ensureInitialized() {
    const existingProductsStr = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (!existingProductsStr) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    } else {
      // Sync stored products so their image references resolve to the local bundled assets
      try {
        const stored: Product[] = JSON.parse(existingProductsStr);
        let updated = false;
        stored.forEach((p) => {
          const initialMatch = INITIAL_PRODUCTS.find((init) => init.id === p.id);
          if (initialMatch && initialMatch.image && p.image !== initialMatch.image) {
            p.image = initialMatch.image;
            updated = true;
          } else if (!p.image || p.image.startsWith('http') || p.image.startsWith('/src/')) {
            const fallback = getProductFallbackImage(p.category);
            if (p.image !== fallback) {
              p.image = fallback;
              updated = true;
            }
          }
        });
        if (updated) {
          localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(stored));
        }
      } catch {
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
      }
    }

    if (!localStorage.getItem(STORAGE_KEYS.CUSTOMERS)) {
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(INITIAL_CUSTOMERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SUPPLIERS)) {
      localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(INITIAL_SUPPLIERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.EXPENSES)) {
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(INITIAL_EXPENSES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SALES)) {
      localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(INITIAL_SALES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.STAFF)) {
      localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(INITIAL_STAFF));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PURCHASES)) {
      localStorage.setItem(STORAGE_KEYS.PURCHASES, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PARKED_CARTS)) {
      localStorage.setItem(STORAGE_KEYS.PARKED_CARTS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PAYMENTS)) {
      localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify([]));
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (err) {
        console.error('Error notifying data service listener', err);
      }
    });
  }

  // --- PRODUCTS ---
  public getProducts(): Product[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public getProductById(id: string): Product | undefined {
    return this.getProducts().find((p) => p.id === id);
  }

  public saveProduct(product: Partial<Product> & { name: string; category: string; salePrice: number; purchasePrice: number }): Product {
    const products = this.getProducts();
    const now = new Date().toISOString();

    if (product.id) {
      // update
      const index = products.findIndex((p) => p.id === product.id);
      if (index !== -1) {
        products[index] = {
          ...products[index],
          ...product,
          image: product.image || products[index].image || getProductFallbackImage(product.category),
          updatedAt: now,
        } as Product;
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
        this.notify();
        return products[index];
      }
    }

    // create new
    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      name: product.name,
      category: product.category,
      unit: product.unit || 'piece',
      sku: product.sku || `SKU-${Date.now().toString().slice(-6)}`,
      barcode: product.barcode || `${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      purchasePrice: Number(product.purchasePrice) || 0,
      salePrice: Number(product.salePrice) || 0,
      stockQuantity: Number(product.stockQuantity) || 0,
      minStockThreshold: Number(product.minStockThreshold) || 5,
      image: product.image || getProductFallbackImage(product.category),
      description: product.description || '',
      supplierId: product.supplierId,
      supplierName: product.supplierName,
      variants: product.variants || [],
      createdAt: now,
      updatedAt: now,
    };

    products.unshift(newProduct);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    this.notify();
    return newProduct;
  }

  public deleteProduct(id: string): boolean {
    const products = this.getProducts();
    const filtered = products.filter((p) => p.id !== id);
    if (filtered.length !== products.length) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(filtered));
      this.notify();
      return true;
    }
    return false;
  }

  public adjustStock(productId: string, quantityDelta: number, variantId?: string): void {
    const products = this.getProducts();
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    if (variantId && product.variants && product.variants.length > 0) {
      const v = product.variants.find((item) => item.id === variantId);
      if (v) {
        v.stockQuantity = Math.max(0, v.stockQuantity + quantityDelta);
      }
      // Recompute parent total stock as sum of variants
      product.stockQuantity = product.variants.reduce((acc, curr) => acc + curr.stockQuantity, 0);
    } else {
      product.stockQuantity = Math.max(0, product.stockQuantity + quantityDelta);
    }
    product.updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    this.notify();
  }

  // --- CATEGORIES ---
  public getCategories(): string[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      return data ? JSON.parse(data) : DEFAULT_CATEGORIES;
    } catch {
      return DEFAULT_CATEGORIES;
    }
  }

  public addCategory(name: string): string[] {
    const trimmed = name.trim();
    if (!trimmed) return this.getCategories();
    const categories = this.getCategories();
    if (!categories.includes(trimmed)) {
      categories.push(trimmed);
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
      this.notify();
    }
    return categories;
  }

  // --- SALES & POS ---
  public getSales(): Sale[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SALES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public getSaleById(id: string): Sale | undefined {
    return this.getSales().find((s) => s.id === id || s.invoiceNumber === id);
  }

  public recordSale(saleData: Omit<Sale, 'id' | 'invoiceNumber' | 'date'> & { date?: string }): Sale {
    const sales = this.getSales();
    const invoiceNum = `INV-${new Date().getFullYear()}-${1000 + sales.length + 1}`;
    const newSale: Sale = {
      ...saleData,
      id: `sale-${Date.now()}`,
      invoiceNumber: invoiceNum,
      date: saleData.date || new Date().toISOString(),
    };

    // 1. Decrement inventory for each sold item
    saleData.items.forEach((item) => {
      this.adjustStock(item.productId, -item.quantity, item.variantId);
    });

    // 2. If customer is attached, update customer visits, totalSpent, and credit balance (if partial or credit)
    if (newSale.customerId) {
      const customers = this.getCustomers();
      const customer = customers.find((c) => c.id === newSale.customerId);
      if (customer) {
        customer.visitsCount += 1;
        customer.totalSpent += newSale.grandTotal;

        // Credit sale or partial payment
        const unpaidDifference = newSale.grandTotal - newSale.paidAmount;
        if (unpaidDifference > 0) {
          customer.balance += unpaidDifference;
        }

        localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
      }
    }

    sales.unshift(newSale);
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));
    this.notify();
    return newSale;
  }

  public processReturn(returnRecord: {
    saleId: string;
    items: ReturnedItem[];
    totalRefundAmount: number;
    processedBy: string;
    notes?: string;
  }): Sale | undefined {
    const sales = this.getSales();
    const sale = sales.find((s) => s.id === returnRecord.saleId);
    if (!sale) return undefined;

    const returnId = `ret-${Date.now()}`;
    const returnHistoryEntry: SaleReturnRecord = {
      id: returnId,
      saleId: sale.id,
      invoiceNumber: sale.invoiceNumber,
      date: new Date().toISOString(),
      items: returnRecord.items,
      totalRefundAmount: returnRecord.totalRefundAmount,
      processedBy: returnRecord.processedBy,
      notes: returnRecord.notes,
    };

    if (!sale.returnsHistory) {
      sale.returnsHistory = [];
    }
    sale.returnsHistory.push(returnHistoryEntry);

    if (!sale.returnedItems) {
      sale.returnedItems = [];
    }
    sale.returnedItems.push(...returnRecord.items);

    // Re-adjust stock: Put returned items back into inventory
    returnRecord.items.forEach((item) => {
      this.adjustStock(item.productId, item.quantity, item.variantId);
    });

    // If customer had outstanding balance or refund, update customer balance
    if (sale.customerId && returnRecord.totalRefundAmount > 0) {
      const customers = this.getCustomers();
      const cust = customers.find((c) => c.id === sale.customerId);
      if (cust) {
        // Decrease credit balance or give store credit
        cust.balance = Math.max(0, cust.balance - returnRecord.totalRefundAmount);
        localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
      }
    }

    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));
    this.notify();
    return sale;
  }

  // --- CUSTOMERS ---
  public getCustomers(): Customer[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public saveCustomer(cust: Partial<Customer> & { name: string; phone: string }): Customer {
    const customers = this.getCustomers();
    if (cust.id) {
      const index = customers.findIndex((c) => c.id === cust.id);
      if (index !== -1) {
        customers[index] = { ...customers[index], ...cust };
        localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
        this.notify();
        return customers[index];
      }
    }

    const newCustomer: Customer = {
      id: `cust-${Date.now()}`,
      name: cust.name,
      phone: cust.phone,
      email: cust.email || '',
      address: cust.address || '',
      balance: Number(cust.balance) || 0,
      totalSpent: 0,
      visitsCount: 0,
      notes: cust.notes || '',
      createdAt: new Date().toISOString(),
    };
    customers.unshift(newCustomer);
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
    this.notify();
    return newCustomer;
  }

  public recordCustomerPayment(record: Omit<CustomerPaymentRecord, 'id' | 'date'>): CustomerPaymentRecord {
    const payments: CustomerPaymentRecord[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.PAYMENTS) || '[]');
    const newRecord: CustomerPaymentRecord = {
      ...record,
      id: `pay-${Date.now()}`,
      date: new Date().toISOString(),
    };
    payments.unshift(newRecord);
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));

    // Reduce customer balance
    const customers = this.getCustomers();
    const customer = customers.find((c) => c.id === record.customerId);
    if (customer) {
      customer.balance = Math.max(0, customer.balance - record.amount);
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
    }

    this.notify();
    return newRecord;
  }

  public getCustomerPayments(customerId?: string): CustomerPaymentRecord[] {
    try {
      const payments: CustomerPaymentRecord[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.PAYMENTS) || '[]');
      if (customerId) {
        return payments.filter((p) => p.customerId === customerId);
      }
      return payments;
    } catch {
      return [];
    }
  }

  // --- SUPPLIERS & PURCHASES ---
  public getSuppliers(): Supplier[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SUPPLIERS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public saveSupplier(sup: Partial<Supplier> & { companyName: string; phone: string }): Supplier {
    const suppliers = this.getSuppliers();
    if (sup.id) {
      const index = suppliers.findIndex((s) => s.id === sup.id);
      if (index !== -1) {
        suppliers[index] = { ...suppliers[index], ...sup };
        localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(suppliers));
        this.notify();
        return suppliers[index];
      }
    }

    const newSupplier: Supplier = {
      id: `sup-${Date.now()}`,
      companyName: sup.companyName,
      contactPerson: sup.contactPerson || '',
      phone: sup.phone,
      email: sup.email || '',
      address: sup.address || '',
      balanceDue: Number(sup.balanceDue) || 0,
      totalPurchases: 0,
      createdAt: new Date().toISOString(),
    };
    suppliers.unshift(newSupplier);
    localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(suppliers));
    this.notify();
    return newSupplier;
  }

  public recordSupplierPurchase(purchase: Omit<SupplierPurchase, 'id' | 'purchaseOrderNumber' | 'date'>): SupplierPurchase {
    const purchases: SupplierPurchase[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.PURCHASES) || '[]');
    const poNum = `PO-${new Date().getFullYear()}-${500 + purchases.length + 1}`;
    const newPurchase: SupplierPurchase = {
      ...purchase,
      id: `po-${Date.now()}`,
      purchaseOrderNumber: poNum,
      date: new Date().toISOString(),
    };

    // 1. Automatically increment stock in inventory
    purchase.items.forEach((item) => {
      this.adjustStock(item.productId, item.quantity);
    });

    // 2. Update supplier balance and total purchases
    const suppliers = this.getSuppliers();
    const sup = suppliers.find((s) => s.id === purchase.supplierId);
    if (sup) {
      sup.totalPurchases += purchase.totalAmount;
      const unpaid = purchase.totalAmount - purchase.paidAmount;
      if (unpaid > 0) {
        sup.balanceDue += unpaid;
      }
      localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(suppliers));
    }

    purchases.unshift(newPurchase);
    localStorage.setItem(STORAGE_KEYS.PURCHASES, JSON.stringify(purchases));
    this.notify();
    return newPurchase;
  }

  public getSupplierPurchases(): SupplierPurchase[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PURCHASES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  // --- EXPENSES ---
  public getExpenses(): Expense[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.EXPENSES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public saveExpense(exp: Omit<Expense, 'id'> & { id?: string }): Expense {
    const expenses = this.getExpenses();
    if (exp.id) {
      const index = expenses.findIndex((e) => e.id === exp.id);
      if (index !== -1) {
        expenses[index] = { ...expenses[index], ...exp } as Expense;
        localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
        this.notify();
        return expenses[index];
      }
    }

    const newExpense: Expense = {
      ...exp,
      id: `exp-${Date.now()}`,
    };
    expenses.unshift(newExpense);
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
    this.notify();
    return newExpense;
  }

  public deleteExpense(id: string): boolean {
    const expenses = this.getExpenses();
    const filtered = expenses.filter((e) => e.id !== id);
    if (filtered.length !== expenses.length) {
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(filtered));
      this.notify();
      return true;
    }
    return false;
  }

  // --- PARKED / HELD CARTS ---
  public getParkedCarts(): ParkedCart[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PARKED_CARTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public parkCart(cart: Omit<ParkedCart, 'id' | 'parkedAt'>): ParkedCart {
    const carts = this.getParkedCarts();
    const newCart: ParkedCart = {
      ...cart,
      id: `parked-${Date.now()}`,
      parkedAt: new Date().toISOString(),
    };
    carts.unshift(newCart);
    localStorage.setItem(STORAGE_KEYS.PARKED_CARTS, JSON.stringify(carts));
    this.notify();
    return newCart;
  }

  public resumeParkedCart(id: string): ParkedCart | undefined {
    const carts = this.getParkedCarts();
    const target = carts.find((c) => c.id === id);
    if (target) {
      const filtered = carts.filter((c) => c.id !== id);
      localStorage.setItem(STORAGE_KEYS.PARKED_CARTS, JSON.stringify(filtered));
      this.notify();
    }
    return target;
  }

  public deleteParkedCart(id: string): void {
    const carts = this.getParkedCarts();
    const filtered = carts.filter((c) => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.PARKED_CARTS, JSON.stringify(filtered));
    this.notify();
  }

  // --- SETTINGS & STAFF ---
  public getSettings(): ShopSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? JSON.parse(data) : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  }

  public saveSettings(settings: ShopSettings): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    this.notify();
  }

  public getStaff(): StaffUser[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STAFF);
      return data ? JSON.parse(data) : INITIAL_STAFF;
    } catch {
      return INITIAL_STAFF;
    }
  }

  // Reset to initial demo data
  public resetToDemoData(): void {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(INITIAL_CUSTOMERS));
    localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(INITIAL_SUPPLIERS));
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(INITIAL_EXPENSES));
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(INITIAL_SALES));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
    localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(INITIAL_STAFF));
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
    localStorage.setItem(STORAGE_KEYS.PURCHASES, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.PARKED_CARTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify([]));
    this.notify();
  }

  // Export full JSON backup
  public exportDataJSON(): string {
    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      products: this.getProducts(),
      customers: this.getCustomers(),
      suppliers: this.getSuppliers(),
      sales: this.getSales(),
      expenses: this.getExpenses(),
      settings: this.getSettings(),
      categories: this.getCategories(),
      purchases: this.getSupplierPurchases(),
    };
    return JSON.stringify(backup, null, 2);
  }

  // Import backup JSON
  public importDataJSON(jsonStr: string): boolean {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.products) localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(parsed.products));
      if (parsed.customers) localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(parsed.customers));
      if (parsed.suppliers) localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(parsed.suppliers));
      if (parsed.sales) localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(parsed.sales));
      if (parsed.expenses) localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(parsed.expenses));
      if (parsed.settings) localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(parsed.settings));
      if (parsed.categories) localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(parsed.categories));
      this.notify();
      return true;
    } catch {
      return false;
    }
  }
}

export const dataService = new DataService();
