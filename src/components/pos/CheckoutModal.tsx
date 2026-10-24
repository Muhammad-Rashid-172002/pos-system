import React, { useState, useEffect } from 'react';
import { CartItem, Customer, PaymentMethod, Sale, ShopSettings, StaffUser } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { dataService } from '../../services/dataService';
import {
  Banknote,
  CreditCard,
  Building2,
  Smartphone,
  BookOpen,
  X,
  UserPlus,
  AlertCircle,
  Receipt,
  Check,
} from 'lucide-react';

interface CheckoutModalProps {
  cartItems: CartItem[];
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  taxRate: number;
  grandTotal: number;
  selectedCustomer: Customer | null;
  onSelectCustomer: (cust: Customer | null) => void;
  currentStaff: StaffUser;
  settings: ShopSettings;
  onClose: () => void;
  onSaleComplete: (sale: Sale) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  cartItems,
  subtotal,
  discountTotal,
  taxTotal,
  taxRate,
  grandTotal,
  selectedCustomer,
  onSelectCustomer,
  currentStaff,
  settings,
  onClose,
  onSaleComplete,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [tenderedAmount, setTenderedAmount] = useState<number>(grandTotal);
  const [notes, setNotes] = useState('');
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const customers = dataService.getCustomers();

  // Recalculate tendered amount when grandTotal changes
  useEffect(() => {
    setTenderedAmount(grandTotal);
  }, [grandTotal]);

  const changeAmount = Math.max(0, tenderedAmount - grandTotal);
  const unpaidBalance = Math.max(0, grandTotal - tenderedAmount);

  const handleQuickCash = (amount: number) => {
    setTenderedAmount(amount);
  };

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim() || !newCustPhone.trim()) {
      setError('Please provide customer name and phone number.');
      return;
    }
    const created = dataService.saveCustomer({
      name: newCustName.trim(),
      phone: newCustPhone.trim(),
    });
    onSelectCustomer(created);
    setShowAddCustomer(false);
    setNewCustName('');
    setNewCustPhone('');
    setError(null);
  };

  const handleProcessSale = () => {
    setError(null);

    // Validation: If credit sale or partial payment, customer MUST be selected
    if (unpaidBalance > 0 && !selectedCustomer) {
      setError(
        `Remaining balance is ${formatCurrency(
          unpaidBalance,
          settings.currencySymbol
        )}. Please select or add a customer to record to their credit Khata.`
      );
      return;
    }

    if (paymentMethod === 'credit' && !selectedCustomer) {
      setError('A registered customer must be selected for Credit (Udhaar) sales.');
      return;
    }

    setIsProcessing(true);

    try {
      const paid = paymentMethod === 'credit' ? 0 : Math.min(tenderedAmount, grandTotal);
      const paymentStatus =
        paid >= grandTotal ? 'paid' : paid > 0 ? 'partial' : 'unpaid';

      const sale = dataService.recordSale({
        items: cartItems,
        subtotal,
        discountTotal,
        taxRate,
        taxTotal,
        grandTotal,
        paidAmount: paid,
        changeAmount: paymentMethod === 'cash' ? changeAmount : 0,
        paymentMethod,
        paymentStatus,
        customerId: selectedCustomer?.id,
        customerName: selectedCustomer?.name,
        customerPhone: selectedCustomer?.phone,
        cashierId: currentStaff.id,
        cashierName: currentStaff.name,
        notes: notes.trim() || undefined,
      });

      onSaleComplete(sale);
    } catch (err) {
      setError('Failed to process transaction. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-100 text-rose-700 rounded-lg">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-semibold text-stone-900 text-sm">Checkout & Payment</h2>
              <p className="text-xs text-stone-500">
                {cartItems.length} items · Total: {formatCurrency(grandTotal, settings.currencySymbol)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200/50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 text-rose-800 border border-rose-200 rounded-xl text-xs font-medium">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Customer Selection Strip */}
          <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-stone-800">Customer (Optional or for Khata Credit)</span>
              <button
                type="button"
                onClick={() => setShowAddCustomer(!showAddCustomer)}
                className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-medium"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{showAddCustomer ? 'Cancel Add' : 'New Customer'}</span>
              </button>
            </div>

            {showAddCustomer ? (
              <form onSubmit={handleCreateCustomer} className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Full Name *"
                  required
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  className="px-3 py-1.5 border border-stone-300 rounded-lg text-xs"
                />
                <input
                  type="text"
                  placeholder="Phone Number *"
                  required
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  className="px-3 py-1.5 border border-stone-300 rounded-lg text-xs font-mono"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-stone-900 text-white rounded-lg text-xs font-medium hover:bg-stone-800 transition-colors"
                >
                  Save & Select
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-2">
                <select
                  value={selectedCustomer?.id || ''}
                  onChange={(e) => {
                    const cust = customers.find((c) => c.id === e.target.value) || null;
                    onSelectCustomer(cust);
                  }}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                >
                  <option value="">Walk-in Customer (General Counter)</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} — {c.phone} {c.balance > 0 ? `(Owes ₨${c.balance})` : ''}
                    </option>
                  ))}
                </select>

                {selectedCustomer && (
                  <button
                    type="button"
                    onClick={() => onSelectCustomer(null)}
                    className="p-2 text-stone-400 hover:text-stone-600 text-xs"
                    title="Clear Customer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}

            {selectedCustomer && (
              <div className="mt-2 text-[11px] text-stone-600 flex items-center justify-between bg-white p-2 rounded-lg border border-stone-200">
                <span>
                  <strong>Selected:</strong> {selectedCustomer.name} ({selectedCustomer.phone})
                </span>
                {selectedCustomer.balance > 0 ? (
                  <span className="text-amber-700 font-semibold font-mono-numbers">
                    Previous Credit: {formatCurrency(selectedCustomer.balance, settings.currencySymbol)}
                  </span>
                ) : (
                  <span className="text-emerald-700 font-medium">Khata Clean</span>
                )}
              </div>
            )}
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-semibold text-stone-800 mb-2.5">
              Select Payment Method
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { id: 'cash', label: 'Cash', icon: Banknote },
                { id: 'bank_transfer', label: 'Bank Transfer', icon: Building2 },
                { id: 'jazzcash_easypaisa', label: 'Jazz / Paisa', icon: Smartphone },
                { id: 'card', label: 'Card POS', icon: CreditCard },
                { id: 'credit', label: 'Credit Khata', icon: BookOpen },
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = paymentMethod === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      setPaymentMethod(m.id as PaymentMethod);
                      if (m.id === 'credit') {
                        setTenderedAmount(0);
                      } else {
                        setTenderedAmount(grandTotal);
                      }
                    }}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                      isSelected
                        ? 'border-rose-600 bg-rose-50/60 text-rose-900 shadow-xs ring-1 ring-rose-500'
                        : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-700'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mb-1.5 ${isSelected ? 'text-rose-600' : 'text-stone-500'}`} />
                    <span className="text-xs font-medium whitespace-nowrap">{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cash Tender Calculation & Quick Buttons */}
          {paymentMethod === 'cash' && (
            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="text-xs font-medium text-stone-700">Cash Received from Customer</label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] text-stone-500 mr-1">Tender:</span>
                  <button
                    type="button"
                    onClick={() => handleQuickCash(grandTotal)}
                    className="px-2 py-1 text-xs bg-white border border-stone-300 rounded font-mono hover:bg-stone-100"
                  >
                    Exact ({formatCurrency(grandTotal, settings.currencySymbol)})
                  </button>
                  {[500, 1000, 5000, 10000].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleQuickCash(val)}
                      className="px-2 py-1 text-xs bg-white border border-stone-300 rounded font-mono hover:bg-stone-100"
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <div className="text-[11px] text-stone-500 mb-1">Tendered (PKR)</div>
                  <input
                    type="number"
                    min="0"
                    value={tenderedAmount}
                    onChange={(e) => setTenderedAmount(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm font-bold font-mono focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  />
                </div>

                <div>
                  <div className="text-[11px] text-stone-500 mb-1">
                    {tenderedAmount >= grandTotal ? 'Change Return' : 'Unpaid Balance'}
                  </div>
                  <div
                    className={`px-3 py-2 rounded-lg text-sm font-bold font-mono border ${
                      tenderedAmount >= grandTotal
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    {tenderedAmount >= grandTotal
                      ? formatCurrency(changeAmount, settings.currencySymbol)
                      : `${formatCurrency(unpaidBalance, settings.currencySymbol)} (To Khata)`}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">Invoice Notes (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Alteration pending, Advance token payment, Tariq Road branch..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
            />
          </div>

          {/* Summary Breakdown */}
          <div className="pt-2 border-t border-stone-200 space-y-1.5 text-xs text-stone-600">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-mono-numbers">{formatCurrency(subtotal, settings.currencySymbol)}</span>
            </div>
            {discountTotal > 0 && (
              <div className="flex justify-between text-rose-600">
                <span>Discounts applied:</span>
                <span className="font-mono-numbers">-{formatCurrency(discountTotal, settings.currencySymbol)}</span>
              </div>
            )}
            {taxTotal > 0 && (
              <div className="flex justify-between">
                <span>Tax ({taxRate}%):</span>
                <span className="font-mono-numbers">+{formatCurrency(taxTotal, settings.currencySymbol)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold text-stone-900 pt-2 border-t border-stone-200">
              <span>Total Payable:</span>
              <span className="font-mono-numbers text-rose-700">
                {formatCurrency(grandTotal, settings.currencySymbol)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-stone-200 bg-stone-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-200/50 rounded-lg transition-colors"
          >
            Back to Cart
          </button>
          <button
            type="button"
            disabled={isProcessing}
            onClick={handleProcessSale}
            className="flex items-center gap-2 px-6 py-2.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 active:scale-98 rounded-lg shadow-sm transition-all"
          >
            <Check className="w-4 h-4" />
            <span>{isProcessing ? 'Processing...' : 'Complete & Generate Receipt'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
