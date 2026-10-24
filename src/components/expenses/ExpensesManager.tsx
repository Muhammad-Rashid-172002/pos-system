import React, { useState, useEffect } from 'react';
import { Expense, ExpenseCategory, ShopSettings, StaffUser } from '../../types';
import { dataService } from '../../services/dataService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  CreditCard,
  Plus,
  Search,
  Calendar,
  Trash2,
  PieChart,
  Tag,
  DollarSign,
  X,
  Building,
  Zap,
} from 'lucide-react';

interface ExpensesManagerProps {
  currentStaff: StaffUser;
  settings: ShopSettings;
}

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Shop Rent',
  'Electricity & Utilities',
  'Staff Salaries',
  'Transport & Courier',
  'Packaging & Bags',
  'Shop Maintenance & Decor',
  'Marketing & Ads',
  'Tea & Refreshments',
  'Other',
];

export const ExpensesManager: React.FC<ExpensesManagerProps> = ({ currentStaff, settings }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Add / Edit Modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Electricity & Utilities');
  const [amount, setAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bank_transfer'>('cash');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const load = () => {
      setExpenses(dataService.getExpenses());
    };
    load();
    const unsub = dataService.subscribe(load);
    return () => unsub();
  }, []);

  const filteredExpenses = expenses.filter((e) => {
    const matchesCat = selectedCategory === 'all' || e.category === selectedCategory;
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q || e.title.toLowerCase().includes(q) || e.category.toLowerCase().includes(q) || e.notes?.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  const totalExpenseSum = filteredExpenses.reduce((acc, curr) => acc + curr.amount, 0);

  // Category breakdown for summary
  const categoryTotals: { [cat: string]: number } = {};
  expenses.forEach((e) => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || amount <= 0) return;

    dataService.saveExpense({
      title: title.trim(),
      category,
      amount,
      date: new Date(date).toISOString(),
      paymentMethod,
      recordedBy: currentStaff.name,
      notes: notes.trim() || undefined,
    });

    setIsAddOpen(false);
    setTitle('');
    setAmount(0);
    setNotes('');
  };

  const handleDelete = (id: string, expTitle: string) => {
    if (confirm(`Delete expense entry "${expTitle}"?`)) {
      dataService.deleteExpense(id);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-stone-50">
      {/* Top Header */}
      <div className="bg-white border-b border-stone-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-stone-900 tracking-tight font-serif-luxury">
            Shop Expenses Ledger
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Record shop rent, electricity, courier, packaging, and tea expenses to compute true net profit
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Record New Expense</span>
        </button>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-6 pb-2">
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <span className="text-xs text-stone-500 font-medium">Total Recorded Expenses</span>
          <div className="text-xl font-bold text-stone-900 font-mono-numbers mt-0.5">
            {formatCurrency(totalExpenseSum, settings.currencySymbol)}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <span className="text-xs text-stone-500 font-medium">Highest Expense Category</span>
          <div className="text-base font-bold text-rose-800 mt-0.5 truncate">
            {Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None'}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <span className="text-xs text-stone-500 font-medium">Total Entries</span>
          <div className="text-xl font-bold text-stone-900 font-mono-numbers mt-0.5">
            {expenses.length} vouchers logged
          </div>
        </div>
      </div>

      {/* Filter and Table Container */}
      <div className="p-6 pt-2 flex-1 flex flex-col overflow-hidden">
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs flex-1 flex flex-col">
          {/* Filter Bar */}
          <div className="p-3 border-b border-stone-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  placeholder="Search expenses by title or note..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 border border-stone-200 rounded-lg text-xs bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-1.5 border border-stone-200 rounded-lg text-xs bg-white text-stone-700"
              >
                <option value="all">All Categories ({EXPENSE_CATEGORIES.length})</option>
                {EXPENSE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-xs text-stone-500 font-mono-numbers">
              Subtotal: <strong>{formatCurrency(totalExpenseSum, settings.currencySymbol)}</strong>
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left text-xs text-stone-600">
              <thead className="bg-stone-50 text-[11px] uppercase tracking-wider text-stone-500 border-b border-stone-200 font-semibold sticky top-0">
                <tr>
                  <th className="py-2.5 px-4">Date</th>
                  <th className="py-2.5 px-4">Title / Description</th>
                  <th className="py-2.5 px-4">Category</th>
                  <th className="py-2.5 px-4">Payment Channel</th>
                  <th className="py-2.5 px-4 font-mono-numbers">Amount</th>
                  <th className="py-2.5 px-4">Recorded By</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-stone-400">
                      No expense records found.
                    </td>
                  </tr>
                ) : (
                  filteredExpenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-stone-50 transition-colors">
                      <td className="py-3 px-4 text-stone-500">{formatDate(exp.date)}</td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-stone-900">{exp.title}</div>
                        {exp.notes && <div className="text-[11px] text-stone-400 line-clamp-1">{exp.notes}</div>}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[11px] bg-stone-100 text-stone-700 font-medium">
                          {exp.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 capitalize text-stone-600">
                        {exp.paymentMethod.replace('_', ' ')}
                      </td>
                      <td className="py-3 px-4 font-bold text-stone-900 font-mono-numbers">
                        {formatCurrency(exp.amount, settings.currencySymbol)}
                      </td>
                      <td className="py-3 px-4 text-stone-500">{exp.recordedBy}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleDelete(exp.id, exp.title)}
                          className="p-1 text-stone-400 hover:text-rose-600 transition-colors"
                          title="Delete entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Record Expense Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-stone-900 text-sm">Record Store Expense</h3>
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveExpense} className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-700 font-medium mb-1">Expense Title / Reason *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. October Shop Rent or LESCO Bill"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs bg-white"
                  >
                    {EXPENSE_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-stone-700 font-medium mb-1">Amount (PKR) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={amount || ''}
                    onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-medium mb-1">Paid Via</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs bg-white"
                  >
                    <option value="cash">Cash in Drawer</option>
                    <option value="bank_transfer">Bank Transfer / Cheque</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">Receipt / Voucher Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Paid to plaza guard / paid via online banking ref #84920"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
