import React, { useState, useEffect } from 'react';
import { Sale, Expense, Product, ShopSettings, StaffUser } from '../../types';
import { dataService } from '../../services/dataService';
import { formatCurrency, formatDate, formatDateTime } from '../../utils/formatters';
import {
  FileText,
  Printer,
  Calendar,
  DollarSign,
  TrendingUp,
  CreditCard,
  Download,
  Filter,
  BarChart3,
  Layers,
  RotateCcw,
} from 'lucide-react';

interface ReportsManagerProps {
  currentStaff: StaffUser;
  settings: ShopSettings;
}

export const ReportsManager: React.FC<ReportsManagerProps> = ({ currentStaff, settings }) => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<'sales' | 'pnl' | 'valuation' | 'returns'>('pnl');

  // Date Range filter
  const [dateRange, setDateRange] = useState<'today' | '7days' | 'month' | 'year' | 'all'>('month');

  useEffect(() => {
    const load = () => {
      setSales(dataService.getSales());
      setExpenses(dataService.getExpenses());
      setProducts(dataService.getProducts());
    };
    load();
    const unsub = dataService.subscribe(load);
    return () => unsub();
  }, []);

  // Filter calculations
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const sevenDaysAgo = startOfToday - 7 * 24 * 60 * 60 * 1000;
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const startOfYear = new Date(now.getFullYear(), 0, 1).getTime();

  const isDateInFilter = (dateStr: string) => {
    const time = new Date(dateStr).getTime();
    if (dateRange === 'today') return time >= startOfToday;
    if (dateRange === '7days') return time >= sevenDaysAgo;
    if (dateRange === 'month') return time >= startOfMonth;
    if (dateRange === 'year') return time >= startOfYear;
    return true;
  };

  const filteredSales = sales.filter((s) => isDateInFilter(s.date));
  const filteredExpenses = expenses.filter((e) => isDateInFilter(e.date));

  // Financial calculations
  const totalRevenue = filteredSales.reduce((sum, s) => sum + s.grandTotal, 0);
  const totalCOGS = filteredSales.reduce((sum, s) => {
    return sum + s.items.reduce((acc, it) => acc + it.purchasePrice * it.quantity, 0);
  }, 0);
  const totalDiscountsGiven = filteredSales.reduce((sum, s) => sum + s.discountTotal, 0);
  const grossProfit = totalRevenue - totalCOGS;
  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = grossProfit - totalExpenses;

  // Stock valuation
  const totalStockUnits = products.reduce((acc, p) => acc + p.stockQuantity, 0);
  const totalStockValuationCost = products.reduce((acc, p) => acc + p.purchasePrice * p.stockQuantity, 0);
  const totalStockValuationRetail = products.reduce((acc, p) => acc + p.salePrice * p.stockQuantity, 0);
  const projectedPotentialProfit = totalStockValuationRetail - totalStockValuationCost;

  // Returns list
  const returnsList: Array<{
    invoiceNumber: string;
    date: string;
    item: string;
    quantity: number;
    refundAmount: number;
    reason: string;
    type: string;
  }> = [];

  sales.forEach((s) => {
    if (s.returnedItems && s.returnedItems.length > 0) {
      s.returnedItems.forEach((r) => {
        returnsList.push({
          invoiceNumber: s.invoiceNumber,
          date: s.date,
          item: r.productName,
          quantity: r.quantity,
          refundAmount: r.totalRefundAmount,
          reason: r.reason,
          type: r.type,
        });
      });
    }
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-stone-50">
      {/* Top Header */}
      <div className="bg-white border-b border-stone-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-stone-900 tracking-tight font-serif-luxury">
            Financial & Sales Reports
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Profit & Loss statements, valuation reports, and audit trails
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Date Range Selector */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="px-3 py-1.5 border border-stone-300 rounded-lg text-xs bg-white text-stone-700"
          >
            <option value="today">Today</option>
            <option value="7days">Last 7 Days</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
            <option value="all">All-Time</option>
          </select>

          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Report Tabs (Segmented control) */}
      <div className="px-6 py-3 bg-white border-b border-stone-200 flex items-center gap-1 overflow-x-auto text-xs">
        {[
          { id: 'pnl', label: 'Profit & Loss Statement' },
          { id: 'sales', label: `Sales Summary (${filteredSales.length})` },
          { id: 'valuation', label: 'Stock Valuation Report' },
          { id: 'returns', label: `Returns & Exchanges (${returnsList.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Report Body */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* TAB 1: PROFIT & LOSS STATEMENT */}
        {activeTab === 'pnl' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs">
              <div className="border-b border-stone-200 pb-4 mb-5 flex justify-between items-center">
                <div>
                  <h3 className="text-base font-bold text-stone-900">Profit & Loss Statement</h3>
                  <p className="text-xs text-stone-500">
                    Period: <strong className="capitalize">{dateRange}</strong> · Store: {settings.shopName}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-stone-400">Net Profit</div>
                  <div className="text-xl font-bold text-emerald-700 font-mono-numbers">
                    {formatCurrency(netProfit, settings.currencySymbol)}
                  </div>
                </div>
              </div>

              {/* P&L Line Items */}
              <div className="space-y-4 text-xs">
                {/* 1. Revenue */}
                <div>
                  <div className="flex justify-between py-2 border-b border-stone-100 font-semibold text-stone-900 text-sm">
                    <span>1. Operating Revenue (Sales)</span>
                    <span className="font-mono-numbers">{formatCurrency(totalRevenue, settings.currencySymbol)}</span>
                  </div>
                  <div className="pl-4 py-1 text-stone-600 space-y-1">
                    <div className="flex justify-between">
                      <span>Gross Counter Sales ({filteredSales.length} bills)</span>
                      <span className="font-mono-numbers">{formatCurrency(totalRevenue, settings.currencySymbol)}</span>
                    </div>
                    {totalDiscountsGiven > 0 && (
                      <div className="flex justify-between text-rose-600">
                        <span>Discounts Deducted</span>
                        <span className="font-mono-numbers">
                          -{formatCurrency(totalDiscountsGiven, settings.currencySymbol)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Cost of Goods Sold */}
                <div>
                  <div className="flex justify-between py-2 border-b border-stone-100 font-semibold text-stone-900 text-sm">
                    <span>2. Cost of Goods Sold (Wholesale Purchase Cost)</span>
                    <span className="font-mono-numbers text-stone-700">
                      -{formatCurrency(totalCOGS, settings.currencySymbol)}
                    </span>
                  </div>
                </div>

                {/* Gross Profit Subtotal */}
                <div className="bg-stone-50 p-3 rounded-xl flex justify-between font-bold text-stone-900">
                  <span>Gross Profit</span>
                  <span className="font-mono-numbers text-emerald-800">
                    {formatCurrency(grossProfit, settings.currencySymbol)}
                  </span>
                </div>

                {/* 3. Operating Expenses */}
                <div>
                  <div className="flex justify-between py-2 border-b border-stone-100 font-semibold text-stone-900 text-sm">
                    <span>3. Operating Expenses ({filteredExpenses.length} entries)</span>
                    <span className="font-mono-numbers text-rose-700">
                      -{formatCurrency(totalExpenses, settings.currencySymbol)}
                    </span>
                  </div>
                  <div className="pl-4 py-1 text-stone-600 space-y-1.5">
                    {filteredExpenses.map((exp) => (
                      <div key={exp.id} className="flex justify-between">
                        <span>
                          {exp.title} ({exp.category})
                        </span>
                        <span className="font-mono-numbers">{formatCurrency(exp.amount, settings.currencySymbol)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Final Net Profit */}
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex justify-between items-center text-emerald-950 font-bold text-base mt-4">
                  <div>
                    <div>Net Commercial Profit</div>
                    <div className="text-xs font-normal text-emerald-700">
                      Margin: {totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0}% of gross revenue
                    </div>
                  </div>
                  <div className="text-2xl font-mono-numbers text-emerald-800">
                    {formatCurrency(netProfit, settings.currencySymbol)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DETAILED SALES REPORT */}
        {activeTab === 'sales' && (
          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-stone-200 flex justify-between items-center">
              <h3 className="font-semibold text-stone-900 text-sm">Itemized Sales Ledger</h3>
              <span className="text-xs text-stone-500 font-mono-numbers">
                Total: {formatCurrency(totalRevenue, settings.currencySymbol)}
              </span>
            </div>

            <table className="w-full text-left text-xs text-stone-600">
              <thead className="bg-stone-50 text-[11px] uppercase tracking-wider text-stone-500 border-b border-stone-200 font-semibold">
                <tr>
                  <th className="py-2.5 px-4">Invoice #</th>
                  <th className="py-2.5 px-4">Date</th>
                  <th className="py-2.5 px-4">Customer</th>
                  <th className="py-2.5 px-4">Items Summary</th>
                  <th className="py-2.5 px-4">Method</th>
                  <th className="py-2.5 px-4 font-mono-numbers">Subtotal</th>
                  <th className="py-2.5 px-4 font-mono-numbers">Discount</th>
                  <th className="py-2.5 px-4 font-mono-numbers text-right">Grand Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredSales.map((s) => (
                  <tr key={s.id} className="hover:bg-stone-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-stone-900">{s.invoiceNumber}</td>
                    <td className="py-3 px-4 text-stone-500">{formatDate(s.date)}</td>
                    <td className="py-3 px-4 font-medium text-stone-800">{s.customerName || 'Walk-in'}</td>
                    <td className="py-3 px-4 text-stone-500 line-clamp-1">
                      {s.items.map((i) => `${i.name} (x${i.quantity})`).join(', ')}
                    </td>
                    <td className="py-3 px-4 capitalize">{s.paymentMethod.replace('_', ' ')}</td>
                    <td className="py-3 px-4 font-mono-numbers">
                      {formatCurrency(s.subtotal, settings.currencySymbol)}
                    </td>
                    <td className="py-3 px-4 font-mono-numbers text-rose-600">
                      {s.discountTotal > 0 ? `-${formatCurrency(s.discountTotal, settings.currencySymbol)}` : '-'}
                    </td>
                    <td className="py-3 px-4 font-bold text-stone-900 font-mono-numbers text-right">
                      {formatCurrency(s.grandTotal, settings.currencySymbol)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3: STOCK VALUATION REPORT */}
        {activeTab === 'valuation' && (
          <div className="space-y-6 max-w-5xl mx-auto">
            {/* KPI Summary Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-stone-200">
                <span className="text-xs text-stone-500 font-medium">Stock Value at Cost (Purchase)</span>
                <div className="text-xl font-bold text-stone-900 font-mono-numbers mt-1">
                  {formatCurrency(totalStockValuationCost, settings.currencySymbol)}
                </div>
                <div className="text-[11px] text-stone-400 mt-1">{totalStockUnits} units in warehouse/shelves</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-stone-200">
                <span className="text-xs text-stone-500 font-medium">Stock Value at Retail (Selling)</span>
                <div className="text-xl font-bold text-stone-900 font-mono-numbers mt-1">
                  {formatCurrency(totalStockValuationRetail, settings.currencySymbol)}
                </div>
                <div className="text-[11px] text-stone-400 mt-1">Projected inventory sales potential</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-stone-200">
                <span className="text-xs text-stone-500 font-medium">Projected Inventory Margin</span>
                <div className="text-xl font-bold text-emerald-700 font-mono-numbers mt-1">
                  {formatCurrency(projectedPotentialProfit, settings.currencySymbol)}
                </div>
                <div className="text-[11px] text-emerald-600 mt-1">
                  +{totalStockValuationCost > 0 ? Math.round((projectedPotentialProfit / totalStockValuationCost) * 100) : 0}% potential ROI
                </div>
              </div>
            </div>

            {/* Valuation by product table */}
            <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs text-stone-600">
                <thead className="bg-stone-50 text-[11px] uppercase tracking-wider text-stone-500 border-b border-stone-200 font-semibold">
                  <tr>
                    <th className="py-2.5 px-4">Product Name</th>
                    <th className="py-2.5 px-4">Category</th>
                    <th className="py-2.5 px-4">In Stock</th>
                    <th className="py-2.5 px-4 font-mono-numbers">Cost / Unit</th>
                    <th className="py-2.5 px-4 font-mono-numbers">Retail / Unit</th>
                    <th className="py-2.5 px-4 font-mono-numbers">Total Cost Valuation</th>
                    <th className="py-2.5 px-4 font-mono-numbers text-right">Total Retail Valuation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {products.map((p) => {
                    const costTotal = p.purchasePrice * p.stockQuantity;
                    const retailTotal = p.salePrice * p.stockQuantity;

                    return (
                      <tr key={p.id} className="hover:bg-stone-50 transition-colors">
                        <td className="py-3 px-4 font-medium text-stone-900">{p.name}</td>
                        <td className="py-3 px-4 text-stone-500">{p.category}</td>
                        <td className="py-3 px-4 font-mono-numbers">
                          {p.stockQuantity} {p.unit}
                        </td>
                        <td className="py-3 px-4 font-mono-numbers">
                          {formatCurrency(p.purchasePrice, settings.currencySymbol)}
                        </td>
                        <td className="py-3 px-4 font-mono-numbers">
                          {formatCurrency(p.salePrice, settings.currencySymbol)}
                        </td>
                        <td className="py-3 px-4 font-mono-numbers font-medium text-stone-700">
                          {formatCurrency(costTotal, settings.currencySymbol)}
                        </td>
                        <td className="py-3 px-4 font-mono-numbers font-bold text-stone-900 text-right">
                          {formatCurrency(retailTotal, settings.currencySymbol)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: RETURNS & EXCHANGES AUDIT LOG */}
        {activeTab === 'returns' && (
          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-stone-200 flex justify-between items-center">
              <h3 className="font-semibold text-stone-900 text-sm">Customer Returns & Exchanges Log</h3>
              <span className="text-xs text-stone-500">{returnsList.length} items logged</span>
            </div>

            {returnsList.length === 0 ? (
              <div className="p-12 text-center text-stone-400 text-xs">
                <RotateCcw className="w-8 h-8 mx-auto mb-2 text-stone-300" />
                No returns or exchanges recorded in this period.
              </div>
            ) : (
              <table className="w-full text-left text-xs text-stone-600">
                <thead className="bg-stone-50 text-[11px] uppercase tracking-wider text-stone-500 border-b border-stone-200 font-semibold">
                  <tr>
                    <th className="py-2.5 px-4">Invoice #</th>
                    <th className="py-2.5 px-4">Date</th>
                    <th className="py-2.5 px-4">Returned Product</th>
                    <th className="py-2.5 px-4">Type</th>
                    <th className="py-2.5 px-4">Qty</th>
                    <th className="py-2.5 px-4 font-mono-numbers">Refund Amount</th>
                    <th className="py-2.5 px-4">Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {returnsList.map((r, idx) => (
                    <tr key={idx} className="hover:bg-stone-50 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-stone-900">{r.invoiceNumber}</td>
                      <td className="py-3 px-4 text-stone-500">{formatDate(r.date)}</td>
                      <td className="py-3 px-4 font-medium text-stone-900">{r.item}</td>
                      <td className="py-3 px-4 capitalize">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                            r.type === 'refund' ? 'bg-rose-50 text-rose-700' : 'bg-purple-50 text-purple-700'
                          }`}
                        >
                          {r.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono-numbers">{r.quantity}</td>
                      <td className="py-3 px-4 font-bold text-rose-700 font-mono-numbers">
                        {formatCurrency(r.refundAmount, settings.currencySymbol)}
                      </td>
                      <td className="py-3 px-4 text-stone-500">{r.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
