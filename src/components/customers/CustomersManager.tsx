import React, { useState, useEffect } from 'react';
import { Customer, CustomerPaymentRecord, Sale, ShopSettings, StaffUser } from '../../types';
import { dataService } from '../../services/dataService';
import { formatCurrency, formatDate, formatDateTime } from '../../utils/formatters';
import {
  Users,
  Search,
  UserPlus,
  Phone,
  MapPin,
  Clock,
  ArrowRight,
  DollarSign,
  CreditCard,
  CheckCircle2,
  X,
  FileText,
  Printer,
} from 'lucide-react';

interface CustomersManagerProps {
  currentStaff: StaffUser;
  settings: ShopSettings;
}

export const CustomersManager: React.FC<CustomersManagerProps> = ({ currentStaff, settings }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [payments, setPayments] = useState<CustomerPaymentRecord[]>([]);

  // Search
  const [search, setSearch] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Partial<Customer> | null>(null);

  // Selected customer profile drawer
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  // Payment Record Modal
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bank_transfer' | 'jazzcash_easypaisa'>('cash');
  const [paymentNotes, setPaymentNotes] = useState('');

  useEffect(() => {
    const load = () => {
      setCustomers(dataService.getCustomers());
      setSales(dataService.getSales());
      setPayments(dataService.getCustomerPayments());
    };
    load();
    const unsub = dataService.subscribe(load);
    return () => unsub();
  }, []);

  const filteredCustomers = customers.filter((c) => {
    const q = search.toLowerCase().trim();
    return !q || c.name.toLowerCase().includes(q) || c.phone.includes(q) || c.address?.toLowerCase().includes(q);
  });

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);
  const customerSales = sales.filter((s) => s.customerId === selectedCustomerId);
  const customerPayments = payments.filter((p) => p.customerId === selectedCustomerId);

  // Total outstanding credit khata
  const totalCreditOwed = customers.reduce((sum, c) => sum + Math.max(0, c.balance), 0);

  const handleOpenAdd = () => {
    setEditingCustomer({
      name: '',
      phone: '',
      email: '',
      address: '',
      balance: 0,
      notes: '',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (c: Customer) => {
    setEditingCustomer({ ...c });
    setIsAddModalOpen(true);
  };

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer || !editingCustomer.name || !editingCustomer.phone) return;

    dataService.saveCustomer({
      ...editingCustomer,
      name: editingCustomer.name.trim(),
      phone: editingCustomer.phone.trim(),
      balance: Number(editingCustomer.balance) || 0,
    } as any);

    setIsAddModalOpen(false);
    setEditingCustomer(null);
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || paymentAmount <= 0) return;

    dataService.recordCustomerPayment({
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      amount: paymentAmount,
      paymentMethod,
      notes: paymentNotes.trim() || undefined,
      recordedBy: currentStaff.name,
    });

    setIsRecordPaymentOpen(false);
    setPaymentAmount(0);
    setPaymentNotes('');
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-stone-50">
      {/* Top Header */}
      <div className="bg-white border-b border-stone-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-stone-900 tracking-tight font-serif-luxury">
            Customer Profiles & Khata Ledger
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Manage client contact history, credit balances, purchase records, and debt settlements
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add New Customer</span>
          </button>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-6 pb-2">
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <span className="text-xs text-stone-500 font-medium">Registered Clients</span>
          <div className="text-xl font-bold text-stone-900 font-mono-numbers mt-0.5">
            {customers.length} profiles
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <span className="text-xs text-amber-700 font-medium">Total Store Khata (Credit Outstanding)</span>
          <div className="text-xl font-bold text-amber-800 font-mono-numbers mt-0.5">
            {formatCurrency(totalCreditOwed, settings.currencySymbol)}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <span className="text-xs text-emerald-700 font-medium">Customers with Clean Balance</span>
          <div className="text-xl font-bold text-emerald-800 font-mono-numbers mt-0.5">
            {customers.filter((c) => c.balance <= 0).length} of {customers.length}
          </div>
        </div>
      </div>

      {/* Search & Main View Grid */}
      <div className="p-6 pt-2 flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
        {/* Left Side: Customers Table */}
        <div className="flex-1 flex flex-col bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
          <div className="p-3 border-b border-stone-200">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Search customers by name, phone, or address..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 border border-stone-200 rounded-lg text-xs bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left text-xs text-stone-600">
              <thead className="bg-stone-50 text-[11px] uppercase tracking-wider text-stone-500 border-b border-stone-200 font-semibold sticky top-0">
                <tr>
                  <th className="py-2.5 px-4">Customer Details</th>
                  <th className="py-2.5 px-4">Phone Number</th>
                  <th className="py-2.5 px-4 font-mono-numbers">Total Spent</th>
                  <th className="py-2.5 px-4 font-mono-numbers">Credit Balance (Khata)</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-stone-400">
                      No customer accounts found matching search.
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((c) => {
                    const isSelected = selectedCustomerId === c.id;
                    return (
                      <tr
                        key={c.id}
                        onClick={() => setSelectedCustomerId(c.id)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-rose-50/70' : 'hover:bg-stone-50'
                        }`}
                      >
                        <td className="py-3 px-4">
                          <div className="font-semibold text-stone-900">{c.name}</div>
                          {c.address && <div className="text-[11px] text-stone-400 line-clamp-1">{c.address}</div>}
                        </td>
                        <td className="py-3 px-4 font-mono text-stone-700">{c.phone}</td>
                        <td className="py-3 px-4 font-mono-numbers font-medium text-stone-900">
                          {formatCurrency(c.totalSpent, settings.currencySymbol)}
                        </td>
                        <td className="py-3 px-4">
                          {c.balance > 0 ? (
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 font-mono-numbers">
                              Owes {formatCurrency(c.balance, settings.currencySymbol)}
                            </span>
                          ) : (
                            <span className="text-emerald-700 font-medium text-[11px]">Clean</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEdit(c);
                            }}
                            className="text-stone-400 hover:text-stone-700 text-xs font-medium mr-2"
                          >
                            Edit
                          </button>
                          <span className="text-rose-600 font-medium text-xs">View →</span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side: Detailed Profile & Khata Drawer */}
        {selectedCustomer ? (
          <div className="w-full lg:w-96 flex flex-col bg-white rounded-2xl border border-stone-200 p-5 shadow-xs overflow-y-auto space-y-5">
            <div className="border-b border-stone-200 pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-stone-900 text-base">{selectedCustomer.name}</h3>
                  <div className="text-xs text-stone-500 font-mono mt-0.5">{selectedCustomer.phone}</div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedCustomerId(null)}
                  className="text-stone-400 hover:text-stone-600 text-xs"
                >
                  ×
                </button>
              </div>

              {selectedCustomer.address && (
                <div className="text-xs text-stone-500 mt-2 flex items-start gap-1">
                  <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                  <span>{selectedCustomer.address}</span>
                </div>
              )}

              {selectedCustomer.notes && (
                <div className="text-[11px] text-stone-600 bg-stone-50 p-2 rounded-lg mt-2 italic">
                  "{selectedCustomer.notes}"
                </div>
              )}
            </div>

            {/* Credit Balance Card & Settle Action */}
            <div className="p-4 rounded-xl bg-stone-900 text-white space-y-2">
              <div className="text-xs text-stone-400">Current Outstanding Khata Balance</div>
              <div className="text-2xl font-bold font-mono-numbers text-rose-400">
                {formatCurrency(selectedCustomer.balance, settings.currencySymbol)}
              </div>
              <button
                type="button"
                onClick={() => {
                  setPaymentAmount(selectedCustomer.balance > 0 ? selectedCustomer.balance : 0);
                  setIsRecordPaymentOpen(true);
                }}
                className="w-full mt-2 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
              >
                + Record Payment Received
              </button>
            </div>

            {/* Invoices Purchase History */}
            <div>
              <h4 className="text-xs font-semibold text-stone-900 mb-2">
                Purchase History ({customerSales.length} bills)
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto divide-y divide-stone-100">
                {customerSales.length === 0 ? (
                  <div className="text-stone-400 text-xs italic py-2">No invoices recorded yet.</div>
                ) : (
                  customerSales.map((s) => (
                    <div key={s.id} className="pt-2 first:pt-0 text-xs">
                      <div className="flex justify-between font-medium text-stone-900">
                        <span className="font-mono">{s.invoiceNumber}</span>
                        <span className="font-mono-numbers">{formatCurrency(s.grandTotal, settings.currencySymbol)}</span>
                      </div>
                      <div className="flex justify-between text-[11px] text-stone-500 mt-0.5">
                        <span>{formatDate(s.date)}</span>
                        <span className="capitalize">{s.paymentMethod.replace('_', ' ')}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Payment Ledger History */}
            <div>
              <h4 className="text-xs font-semibold text-stone-900 mb-2">Payment Receipts</h4>
              <div className="space-y-2 max-h-36 overflow-y-auto">
                {customerPayments.length === 0 ? (
                  <div className="text-stone-400 text-xs italic">No standalone payments logged.</div>
                ) : (
                  customerPayments.map((p) => (
                    <div key={p.id} className="p-2 bg-stone-50 rounded-lg text-xs flex justify-between">
                      <div>
                        <div className="font-semibold text-emerald-800 font-mono-numbers">
                          +{formatCurrency(p.amount, settings.currencySymbol)}
                        </div>
                        <div className="text-[10px] text-stone-400">{formatDate(p.date)} · by {p.recordedBy}</div>
                      </div>
                      <span className="text-[11px] capitalize text-stone-600">{p.paymentMethod.replace('_', ' ')}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="hidden lg:flex w-96 bg-white rounded-2xl border border-stone-200 p-6 flex-col items-center justify-center text-center text-stone-400">
            <Users className="w-10 h-10 text-stone-300 mb-2 stroke-1" />
            <h4 className="font-medium text-stone-700 text-sm">Select a Customer</h4>
            <p className="text-xs text-stone-400 max-w-[220px] mt-1">
              Click any customer row to inspect purchase history, record payments, and manage credit.
            </p>
          </div>
        )}
      </div>

      {/* Add / Edit Customer Modal */}
      {isAddModalOpen && editingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-stone-900 text-sm">
                {editingCustomer.id ? 'Edit Customer' : 'Add New Customer Profile'}
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-700 font-medium mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fatima Tariq"
                  value={editingCustomer.name || ''}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, name: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">Phone Number (WhatsApp) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 0321-4902188"
                  value={editingCustomer.phone || ''}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">Delivery / Home Address</label>
                <input
                  type="text"
                  placeholder="e.g. House 14, Block Y, DHA Phase 3, Lahore"
                  value={editingCustomer.address || ''}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, address: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">Opening Credit Balance (PKR)</label>
                <input
                  type="number"
                  min="0"
                  value={editingCustomer.balance || 0}
                  onChange={(e) =>
                    setEditingCustomer({ ...editingCustomer, balance: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">Special Preferences / Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Prefers bridal embroidery laces, allergic to certain synthetic jewelry..."
                  value={editingCustomer.notes || ''}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Payment Towards Credit Modal */}
      {isRecordPaymentOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div>
              <h3 className="font-semibold text-stone-900 text-sm">Record Khata Payment</h3>
              <p className="text-xs text-stone-500 mt-0.5">Customer: {selectedCustomer.name}</p>
            </div>

            <div className="bg-stone-50 p-2.5 rounded-lg border border-stone-200 text-xs">
              Current Outstanding: <strong>{formatCurrency(selectedCustomer.balance, settings.currencySymbol)}</strong>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-700 font-medium mb-1">Payment Received (PKR) *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={paymentAmount || ''}
                  onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm font-bold font-mono"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">Payment Channel</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs bg-white"
                >
                  <option value="cash">Cash Tender</option>
                  <option value="bank_transfer">Bank Transfer (HBL / Meezan)</option>
                  <option value="jazzcash_easypaisa">JazzCash / EasyPaisa QR</option>
                </select>
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">Transaction Ref / Notes</label>
                <input
                  type="text"
                  placeholder="e.g. TID-94829 or Cash received at Tariq Road branch"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsRecordPaymentOpen(false)}
                  className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs"
                >
                  Confirm & Deduct Balance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
