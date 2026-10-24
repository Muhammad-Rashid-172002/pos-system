import React, { useState } from 'react';
import { Product, ReturnedItem, Sale, StaffUser } from '../../types';
import { dataService } from '../../services/dataService';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { Search, RotateCcw, X, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ReturnsModalProps {
  currentStaff: StaffUser;
  currencySymbol: string;
  onClose: () => void;
  onSuccess: (updatedSale: Sale) => void;
}

export const ReturnsModal: React.FC<ReturnsModalProps> = ({
  currentStaff,
  currencySymbol,
  onClose,
  onSuccess,
}) => {
  const [searchInvoice, setSearchInvoice] = useState('');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [returnItemsState, setReturnItemsState] = useState<{
    [cartItemId: string]: { selected: boolean; returnQty: number; reason: string; type: 'refund' | 'exchange' };
  }>({});
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const sales = dataService.getSales();
  const products = dataService.getProducts();

  const handleSearch = (invoiceToFind?: string) => {
    setError(null);
    const query = (invoiceToFind || searchInvoice).trim().toUpperCase();
    if (!query) {
      setError('Please enter an invoice number to search.');
      return;
    }

    const found = sales.find(
      (s) => s.invoiceNumber.toUpperCase() === query || s.id.toUpperCase() === query
    );

    if (!found) {
      setError(`No invoice found matching "${query}". Check spelling or select from recent.`);
      setSelectedSale(null);
      return;
    }

    setSelectedSale(found);
    // Initialize item return checkboxes
    const initialSelection: typeof returnItemsState = {};
    found.items.forEach((it) => {
      // Calculate how many were already returned
      const alreadyReturned = found.returnedItems
        ?.filter((r) => r.productId === it.productId && r.variantId === it.variantId)
        .reduce((sum, r) => sum + r.quantity, 0) || 0;
      
      const availableToReturn = Math.max(0, it.quantity - alreadyReturned);

      initialSelection[it.cartItemId] = {
        selected: false,
        returnQty: availableToReturn > 0 ? 1 : 0,
        reason: 'Customer changed mind',
        type: 'refund',
      };
    });
    setReturnItemsState(initialSelection);
  };

  const calculateTotalRefund = (): number => {
    if (!selectedSale) return 0;
    return selectedSale.items.reduce((total, item) => {
      const state = returnItemsState[item.cartItemId];
      if (state && state.selected && state.returnQty > 0) {
        // Average unit price paid after discounts
        const unitPriceEffective = item.lineTotal / item.quantity;
        return total + unitPriceEffective * state.returnQty;
      }
      return total;
    }, 0);
  };

  const handleSubmitReturn = () => {
    if (!selectedSale) return;

    const itemsToReturn: ReturnedItem[] = [];
    selectedSale.items.forEach((item) => {
      const state = returnItemsState[item.cartItemId];
      if (state && state.selected && state.returnQty > 0) {
        const unitPriceEffective = item.lineTotal / item.quantity;
        itemsToReturn.push({
          id: `ret-item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          productId: item.productId,
          variantId: item.variantId,
          productName: item.name + (item.variantName ? ` (${item.variantName})` : ''),
          quantity: state.returnQty,
          unitRefundAmount: unitPriceEffective,
          totalRefundAmount: unitPriceEffective * state.returnQty,
          reason: state.reason,
          type: state.type,
        });
      }
    });

    if (itemsToReturn.length === 0) {
      setError('Please select at least one item and quantity to return or exchange.');
      return;
    }

    setIsSubmitting(true);
    const totalRefund = calculateTotalRefund();

    try {
      const updatedSale = dataService.processReturn({
        saleId: selectedSale.id,
        items: itemsToReturn,
        totalRefundAmount: totalRefund,
        processedBy: currentStaff.name,
        notes: notes || undefined,
      });

      if (updatedSale) {
        setSuccessMessage(
          `Return processed successfully! ${formatCurrency(
            totalRefund,
            currencySymbol
          )} refunded & stock updated in inventory.`
        );
        setTimeout(() => {
          onSuccess(updatedSale);
          onClose();
        }, 1500);
      }
    } catch (e) {
      setError('Failed to process return. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-100 text-rose-700 rounded-lg">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-semibold text-stone-900 text-sm">Returns & Exchanges</h2>
              <p className="text-xs text-stone-500">Lookup invoice, select items to return, and restore inventory</p>
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

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {successMessage && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 text-rose-800 border border-rose-200 rounded-xl text-xs font-medium">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Search Bar */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-stone-700">Enter Invoice Number</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  placeholder="e.g. INV-2026-1001"
                  value={searchInvoice}
                  onChange={(e) => setSearchInvoice(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-9 pr-4 py-2 border border-stone-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 font-mono"
                />
              </div>
              <button
                type="button"
                onClick={() => handleSearch()}
                className="px-4 py-2 text-xs font-medium text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors shrink-0"
              >
                Find Sale
              </button>
            </div>

            {/* Quick Suggestions from Recent Sales */}
            <div className="flex items-center gap-2 pt-1 text-xs text-stone-500 flex-wrap">
              <span className="text-[11px]">Recent:</span>
              {sales.slice(0, 4).map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    setSearchInvoice(s.invoiceNumber);
                    handleSearch(s.invoiceNumber);
                  }}
                  className="px-2 py-0.5 rounded text-[11px] bg-stone-100 hover:bg-stone-200 text-stone-700 font-mono transition-colors"
                >
                  {s.invoiceNumber}
                </button>
              ))}
            </div>
          </div>

          {/* Sale Details & Item Selection */}
          {selectedSale && (
            <div className="border border-stone-200 rounded-xl overflow-hidden">
              <div className="bg-stone-50 px-4 py-3 border-b border-stone-200 flex flex-wrap justify-between items-center text-xs">
                <div>
                  <span className="font-semibold text-stone-900">{selectedSale.invoiceNumber}</span>
                  <span className="text-stone-400 mx-2">·</span>
                  <span className="text-stone-600">{formatDateTime(selectedSale.date)}</span>
                  {selectedSale.customerName && (
                    <span className="text-stone-600"> · Customer: {selectedSale.customerName}</span>
                  )}
                </div>
                <div className="font-semibold text-stone-900">
                  Total: {formatCurrency(selectedSale.grandTotal, currencySymbol)}
                </div>
              </div>

              {/* Items List */}
              <div className="divide-y divide-stone-100 p-2">
                {selectedSale.items.map((item) => {
                  const state = returnItemsState[item.cartItemId] || {
                    selected: false,
                    returnQty: 0,
                    reason: '',
                    type: 'refund',
                  };

                  const alreadyReturned =
                    selectedSale.returnedItems
                      ?.filter((r) => r.productId === item.productId && r.variantId === item.variantId)
                      .reduce((sum, r) => sum + r.quantity, 0) || 0;
                  const maxAllowed = item.quantity - alreadyReturned;

                  return (
                    <div
                      key={item.cartItemId}
                      className={`p-3 rounded-lg transition-colors ${
                        state.selected ? 'bg-rose-50/50' : 'hover:bg-stone-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          disabled={maxAllowed <= 0}
                          checked={state.selected}
                          onChange={(e) => {
                            setReturnItemsState((prev) => ({
                              ...prev,
                              [item.cartItemId]: {
                                ...state,
                                selected: e.target.checked,
                                returnQty: e.target.checked ? (state.returnQty || 1) : 0,
                              },
                            }));
                          }}
                          className="mt-1 w-4 h-4 text-rose-600 rounded border-stone-300 focus:ring-rose-500"
                        />

                        <div className="flex-1 text-xs">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-stone-900">
                              {item.name} {item.variantName ? `(${item.variantName})` : ''}
                            </span>
                            <span className="font-medium text-stone-900 font-mono-numbers">
                              {formatCurrency(item.lineTotal, currencySymbol)}
                            </span>
                          </div>
                          <div className="text-[11px] text-stone-500 mt-0.5">
                            Purchased: {item.quantity} {item.unit} @ {formatCurrency(item.unitPrice, currencySymbol)}
                            {alreadyReturned > 0 && (
                              <span className="text-amber-600 ml-2 font-medium">
                                ({alreadyReturned} already returned)
                              </span>
                            )}
                          </div>

                          {/* Controls if selected */}
                          {state.selected && (
                            <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-stone-200/60">
                              <div>
                                <label className="block text-[10px] text-stone-500 mb-0.5">Return Quantity</label>
                                <input
                                  type="number"
                                  min="1"
                                  max={maxAllowed}
                                  value={state.returnQty}
                                  onChange={(e) => {
                                    const qty = Math.min(maxAllowed, Math.max(1, parseInt(e.target.value) || 1));
                                    setReturnItemsState((prev) => ({
                                      ...prev,
                                      [item.cartItemId]: { ...state, returnQty: qty },
                                    }));
                                  }}
                                  className="w-full px-2 py-1 border border-stone-300 rounded text-xs font-mono"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] text-stone-500 mb-0.5">Action</label>
                                <select
                                  value={state.type}
                                  onChange={(e) => {
                                    setReturnItemsState((prev) => ({
                                      ...prev,
                                      [item.cartItemId]: {
                                        ...state,
                                        type: e.target.value as 'refund' | 'exchange',
                                      },
                                    }));
                                  }}
                                  className="w-full px-2 py-1 border border-stone-300 rounded text-xs"
                                >
                                  <option value="refund">Cash / Khata Refund</option>
                                  <option value="exchange">Exchange for other item</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-[10px] text-stone-500 mb-0.5">Reason</label>
                                <select
                                  value={state.reason}
                                  onChange={(e) => {
                                    setReturnItemsState((prev) => ({
                                      ...prev,
                                      [item.cartItemId]: { ...state, reason: e.target.value },
                                    }));
                                  }}
                                  className="w-full px-2 py-1 border border-stone-300 rounded text-xs"
                                >
                                  <option value="Customer changed mind">Customer changed mind</option>
                                  <option value="Wrong shade or color">Wrong shade or color</option>
                                  <option value="Defective piece">Defective piece</option>
                                  <option value="Excess fabric / lace length">Excess lace length</option>
                                  <option value="Other">Other</option>
                                </select>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Notes */}
              <div className="p-3 bg-stone-50 border-t border-stone-200">
                <input
                  type="text"
                  placeholder="Optional return / exchange note..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-1.5 border border-stone-300 rounded-lg text-xs"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-stone-200 bg-stone-50">
          <div>
            {selectedSale && (
              <div className="text-xs">
                <span className="text-stone-500">Total Refund / Credit: </span>
                <span className="font-bold text-rose-700 text-sm font-mono-numbers">
                  {formatCurrency(calculateTotalRefund(), currencySymbol)}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-200/50 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!selectedSale || calculateTotalRefund() === 0 || isSubmitting}
              onClick={handleSubmitReturn}
              className="px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:pointer-events-none rounded-lg shadow-sm transition-all"
            >
              {isSubmitting ? 'Processing...' : 'Confirm Return & Restock'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
