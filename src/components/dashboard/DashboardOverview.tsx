import React, { useState, useEffect } from 'react';
import { Sale, Expense, Product, Customer, ShopSettings, StaffUser } from '../../types';
import { dataService } from '../../services/dataService';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { getCategoryThumbnail, getProductFallbackImage } from '../../constants/imagePaths';
import { ReceiptModal } from '../pos/ReceiptModal';
import {
  TrendingUp,
  CreditCard,
  DollarSign,
  AlertTriangle,
  Receipt,
  ShoppingBag,
  ArrowUpRight,
  PlusCircle,
  FileText,
  Calendar,
  Sparkles,
  PieChart,
} from 'lucide-react';

interface DashboardOverviewProps {
  currentStaff: StaffUser;
  settings: ShopSettings;
  onNavigateToPOS: () => void;
  onNavigateToInventory: () => void;
  onNavigateToExpenses: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  currentStaff,
  settings,
  onNavigateToPOS,
  onNavigateToInventory,
  onNavigateToExpenses,
}) => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [dateFilter, setDateFilter] = useState<'today' | '7days' | 'month' | 'year' | 'all'>('today');
  const [selectedReceiptSale, setSelectedReceiptSale] = useState<Sale | null>(null);

  useEffect(() => {
    const load = () => {
      setSales(dataService.getSales());
      setExpenses(dataService.getExpenses());
      setProducts(dataService.getProducts());
      setCustomers(dataService.getCustomers());
    };
    load();
    const unsub = dataService.subscribe(load);
    return () => unsub();
  }, []);

  // Filter sales & expenses by date filter
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const sevenDaysAgo = startOfToday - 7 * 24 * 60 * 60 * 1000;
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const startOfYear = new Date(now.getFullYear(), 0, 1).getTime();

  const isDateInFilter = (dateStr: string) => {
    const time = new Date(dateStr).getTime();
    if (dateFilter === 'today') return time >= startOfToday;
    if (dateFilter === '7days') return time >= sevenDaysAgo;
    if (dateFilter === 'month') return time >= startOfMonth;
    if (dateFilter === 'year') return time >= startOfYear;
    return true;
  };

  const filteredSales = sales.filter((s) => isDateInFilter(s.date));
  const filteredExpenses = expenses.filter((e) => isDateInFilter(e.date));

  // Calculations
  const totalRevenue = filteredSales.reduce((acc, s) => acc + s.grandTotal, 0);
  const totalPaid = filteredSales.reduce((acc, s) => acc + s.paidAmount, 0);
  
  // Cost of goods sold (COGS)
  const totalCOGS = filteredSales.reduce((acc, s) => {
    return (
      acc +
      s.items.reduce((itemAcc, item) => itemAcc + item.purchasePrice * item.quantity, 0)
    );
  }, 0);

  const grossProfit = totalRevenue - totalCOGS;
  const totalExpenseAmount = filteredExpenses.reduce((acc, e) => acc + e.amount, 0);
  const netProfit = grossProfit - totalExpenseAmount;

  // Outstanding Customer Khata credit across store
  const totalCustomerCreditOwed = customers.reduce((acc, c) => acc + Math.max(0, c.balance), 0);

  // Low Stock Items
  const lowStockCount = products.filter((p) => p.stockQuantity <= p.minStockThreshold).length;

  // Best-Selling Products Calculation
  const productSalesMap: {
    [productId: string]: {
      id: string;
      name: string;
      qty: number;
      revenue: number;
      image?: string;
      category?: string;
    };
  } = {};

  sales.forEach((s) => {
    s.items.forEach((item) => {
      if (!productSalesMap[item.productId]) {
        const p = products.find((prod) => prod.id === item.productId);
        productSalesMap[item.productId] = {
          id: item.productId,
          name: item.name,
          qty: 0,
          revenue: 0,
          image: p?.image,
          category: p?.category,
        };
      }
      productSalesMap[item.productId].qty += item.quantity;
      productSalesMap[item.productId].revenue += item.lineTotal;
    });
  });

  const topProducts = Object.values(productSalesMap)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  // Category sales breakdown
  const categorySalesMap: { [cat: string]: number } = {};
  sales.forEach((s) => {
    s.items.forEach((item) => {
      const p = products.find((prod) => prod.id === item.productId);
      const cat = p?.category || 'Other Accessories';
      categorySalesMap[cat] = (categorySalesMap[cat] || 0) + item.lineTotal;
    });
  });

  const totalCatSales = Object.values(categorySalesMap).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-stone-50">
      {/* Top Welcome & Date Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs text-rose-700 font-semibold uppercase tracking-wider">
            Zebaish Retail Dashboard
          </span>
          <h1 className="text-2xl font-bold text-stone-900 font-serif-luxury mt-0.5">
            Store Performance Overview
          </h1>
          <p className="text-xs text-stone-500">
            Real-time sales, profit margins, expense ledger, and stock health
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-stone-200/70 rounded-xl text-xs font-medium self-start sm:self-auto">
          {(
            [
              { id: 'today', label: 'Today' },
              { id: '7days', label: 'Last 7 Days' },
              { id: 'month', label: 'This Month' },
              { id: 'year', label: 'Yearly' },
              { id: 'all', label: 'All-Time' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setDateFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                dateFilter === tab.id
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-medium">Gross Revenue</span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-stone-900 font-mono-numbers">
            {formatCurrency(totalRevenue, settings.currencySymbol)}
          </div>
          <div className="text-[11px] text-stone-400 mt-1 flex items-center justify-between">
            <span>{filteredSales.length} Transactions</span>
            <span className="text-emerald-600 font-medium">Cash & Digital</span>
          </div>
        </div>

        {/* Net Profit */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-medium">Estimated Net Profit</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-700 font-mono-numbers">
            {formatCurrency(netProfit, settings.currencySymbol)}
          </div>
          <div className="text-[11px] text-stone-400 mt-1 flex items-center justify-between">
            <span>COGS: {formatCurrency(totalCOGS, settings.currencySymbol)}</span>
            <span>Margin: {totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0}%</span>
          </div>
        </div>

        {/* Expenses */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-medium">Recorded Expenses</span>
            <div className="p-2 bg-amber-50 text-amber-700 rounded-lg">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-stone-900 font-mono-numbers">
            {formatCurrency(totalExpenseAmount, settings.currencySymbol)}
          </div>
          <div className="text-[11px] text-stone-400 mt-1 flex items-center justify-between">
            <span>{filteredExpenses.length} Expense entries</span>
            <button
              type="button"
              onClick={onNavigateToExpenses}
              className="text-rose-600 hover:underline font-medium"
            >
              Log Expense →
            </button>
          </div>
        </div>

        {/* Customer Khata Balance (Credit Owed) */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-medium">Customer Credit (Khata)</span>
            <div className="p-2 bg-purple-50 text-purple-700 rounded-lg">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-stone-900 font-mono-numbers">
            {formatCurrency(totalCustomerCreditOwed, settings.currencySymbol)}
          </div>
          <div className="text-[11px] text-stone-400 mt-1 flex items-center justify-between">
            <span>Pending from clients</span>
            {lowStockCount > 0 && (
              <span className="text-amber-700 font-semibold flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> {lowStockCount} Low stock
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Quick Launchpad Strip */}
      <div className="bg-stone-900 text-white rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div>
          <h3 className="font-semibold text-sm">Quick Retail Actions</h3>
          <p className="text-xs text-stone-400">Jump directly into daily cashier and inventory workflows</p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onNavigateToPOS}
            className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Open POS Terminal</span>
          </button>
          <button
            type="button"
            onClick={onNavigateToInventory}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-medium transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Manage Stock</span>
          </button>
          <button
            type="button"
            onClick={onNavigateToExpenses}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-medium transition-colors"
          >
            <FileText className="w-4 h-4" />
            <span>Record Shop Expense</span>
          </button>
        </div>
      </div>

      {/* Middle Grid: Category Distribution & Best Selling Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-stone-900 text-sm">Category-Wise Sales Contribution</h3>
              <span className="text-xs text-stone-400">Revenue split</span>
            </div>

            <div className="space-y-3.5">
              {Object.entries(categorySalesMap).map(([category, amount]) => {
                const pct = Math.round((amount / totalCatSales) * 100);
                const catThumb = getCategoryThumbnail(category);
                return (
                  <div key={category} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <img
                          src={catThumb}
                          alt={category}
                          width={24}
                          height={24}
                          loading="lazy"
                          decoding="async"
                          className="w-6 h-6 rounded-md object-cover border border-stone-200 shrink-0"
                        />
                        <span className="font-medium text-stone-800">{category}</span>
                      </div>
                      <span className="font-mono-numbers text-stone-600">
                        {formatCurrency(amount, settings.currencySymbol)} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-rose-500 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-100 text-[11px] text-stone-500">
            Total sales analyzed across {sales.length} historical invoices
          </div>
        </div>

        {/* Top 5 Best-Selling Products */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-stone-900 text-sm">Top 5 Best-Selling Products</h3>
            <span className="text-xs text-stone-400">By quantity sold</span>
          </div>

          <div className="divide-y divide-stone-100">
            {topProducts.map((p, idx) => {
              const productImg = p.image || getProductFallbackImage(p.category);
              return (
                <div key={p.name} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-stone-100 text-stone-700 text-xs font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <img
                      src={productImg}
                      alt={p.name}
                      width={36}
                      height={36}
                      loading="lazy"
                      decoding="async"
                      className="w-9 h-9 rounded-lg object-cover border border-stone-200 shrink-0"
                    />
                    <div>
                      <h5 className="text-xs font-semibold text-stone-900 line-clamp-1">{p.name}</h5>
                      <div className="text-[11px] text-stone-400 font-mono-numbers">
                        {p.qty} units sold
                      </div>
                    </div>
                  </div>

                  <div className="text-right font-mono-numbers text-xs font-bold text-stone-900">
                    {formatCurrency(p.revenue, settings.currencySymbol)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Invoices Table */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-stone-900 text-sm">Recent Counter Invoices</h3>
            <p className="text-xs text-stone-400">View details and reprint receipts</p>
          </div>
          <button
            type="button"
            onClick={onNavigateToPOS}
            className="text-xs text-rose-600 hover:text-rose-700 font-medium"
          >
            Create New Bill →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-600">
            <thead className="text-[11px] uppercase tracking-wider text-stone-500 border-b border-stone-200 bg-stone-50/50">
              <tr>
                <th className="py-2.5 px-3">Invoice #</th>
                <th className="py-2.5 px-3">Date & Time</th>
                <th className="py-2.5 px-3">Customer</th>
                <th className="py-2.5 px-3">Items</th>
                <th className="py-2.5 px-3">Payment</th>
                <th className="py-2.5 px-3 font-mono-numbers">Grand Total</th>
                <th className="py-2.5 px-3 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {sales.slice(0, 5).map((s) => (
                <tr key={s.id} className="hover:bg-stone-50/80 transition-colors">
                  <td className="py-3 px-3 font-mono font-semibold text-stone-900">{s.invoiceNumber}</td>
                  <td className="py-3 px-3">{formatDateTime(s.date)}</td>
                  <td className="py-3 px-3">
                    <span className="font-medium text-stone-800">{s.customerName || 'Walk-in'}</span>
                  </td>
                  <td className="py-3 px-3">{s.items.length} items</td>
                  <td className="py-3 px-3">
                    <span className="capitalize">{s.paymentMethod.replace('_', ' ')}</span>
                  </td>
                  <td className="py-3 px-3 font-bold text-stone-900 font-mono-numbers">
                    {formatCurrency(s.grandTotal, settings.currencySymbol)}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedReceiptSale(s)}
                      className="px-2.5 py-1 text-xs font-medium text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-md transition-colors"
                    >
                      Slip
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reprint Receipt Modal */}
      {selectedReceiptSale && (
        <ReceiptModal
          sale={selectedReceiptSale}
          settings={settings}
          onClose={() => setSelectedReceiptSale(null)}
        />
      )}
    </div>
  );
};
