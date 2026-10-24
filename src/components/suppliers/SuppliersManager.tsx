import React, { useState, useEffect } from 'react';
import { Supplier, SupplierPurchase, Product, ShopSettings, StaffUser } from '../../types';
import { dataService } from '../../services/dataService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  Truck,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  PackagePlus,
  ShoppingBag,
  DollarSign,
  X,
  FileCheck,
} from 'lucide-react';

interface SuppliersManagerProps {
  currentStaff: StaffUser;
  settings: ShopSettings;
}

export const SuppliersManager: React.FC<SuppliersManagerProps> = ({ currentStaff, settings }) => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchases, setPurchases] = useState<SupplierPurchase[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  // Search & Modals
  const [search, setSearch] = useState('');
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Partial<Supplier> | null>(null);

  // New Purchase Order Modal
  const [isNewPurchaseOpen, setIsNewPurchaseOpen] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('');
  const [purchaseItems, setPurchaseItems] = useState<
    Array<{ productId: string; productName: string; quantity: number; unitCost: number }>
  >([]);
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [purchaseNotes, setPurchaseNotes] = useState<string>('');

  useEffect(() => {
    const load = () => {
      setSuppliers(dataService.getSuppliers());
      setPurchases(dataService.getSupplierPurchases());
      setProducts(dataService.getProducts());
    };
    load();
    const unsub = dataService.subscribe(load);
    return () => unsub();
  }, []);

  const filteredSuppliers = suppliers.filter((s) => {
    const q = search.toLowerCase().trim();
    return (
      !q ||
      s.companyName.toLowerCase().includes(q) ||
      s.contactPerson.toLowerCase().includes(q) ||
      s.phone.includes(q) ||
      s.address.toLowerCase().includes(q)
    );
  });

  const totalOwedToSuppliers = suppliers.reduce((sum, s) => sum + s.balanceDue, 0);

  const handleOpenAdd = () => {
    setEditingSupplier({
      companyName: '',
      contactPerson: '',
      phone: '',
      email: '',
      address: '',
      balanceDue: 0,
    });
    setIsAddSupplierOpen(true);
  };

  const handleSaveSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSupplier || !editingSupplier.companyName || !editingSupplier.phone) return;

    dataService.saveSupplier({
      ...editingSupplier,
      companyName: editingSupplier.companyName.trim(),
      phone: editingSupplier.phone.trim(),
      balanceDue: Number(editingSupplier.balanceDue) || 0,
    } as any);

    setIsAddSupplierOpen(false);
    setEditingSupplier(null);
  };

  const handleAddPurchaseRow = () => {
    if (products.length === 0) return;
    const first = products[0];
    setPurchaseItems((prev) => [
      ...prev,
      {
        productId: first.id,
        productName: first.name,
        quantity: 10,
        unitCost: first.purchasePrice,
      },
    ]);
  };

  const handleRemovePurchaseRow = (index: number) => {
    setPurchaseItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const totalPurchaseCost = purchaseItems.reduce((sum, it) => sum + it.quantity * it.unitCost, 0);

  const handleSavePurchaseOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplierId || purchaseItems.length === 0) {
      alert('Please select a supplier and add at least one product.');
      return;
    }

    const sup = suppliers.find((s) => s.id === selectedSupplierId);
    if (!sup) return;

    const formattedItems = purchaseItems.map((it) => ({
      ...it,
      totalCost: it.quantity * it.unitCost,
    }));

    const paymentStatus =
      paidAmount >= totalPurchaseCost ? 'paid' : paidAmount > 0 ? 'partial' : 'unpaid';

    dataService.recordSupplierPurchase({
      supplierId: sup.id,
      supplierName: sup.companyName,
      items: formattedItems,
      totalAmount: totalPurchaseCost,
      paidAmount,
      paymentStatus,
      notes: purchaseNotes.trim() || undefined,
    });

    setIsNewPurchaseOpen(false);
    setPurchaseItems([]);
    setPaidAmount(0);
    setPurchaseNotes('');
    alert('Stock received and inventory increased successfully!');
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-stone-50">
      {/* Top Header */}
      <div className="bg-white border-b border-stone-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-stone-900 tracking-tight font-serif-luxury">
            Suppliers & Wholesale Purchases
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Manage wholesale lace merchants, cosmetics distributors, and record incoming stock orders
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (suppliers.length > 0) setSelectedSupplierId(suppliers[0].id);
              if (purchaseItems.length === 0 && products.length > 0) {
                handleAddPurchaseRow();
              }
              setIsNewPurchaseOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <PackagePlus className="w-4 h-4" />
            <span>Record Received Stock</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Supplier</span>
          </button>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-6 pb-2">
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <span className="text-xs text-stone-500 font-medium">Registered Wholesale Suppliers</span>
          <div className="text-xl font-bold text-stone-900 font-mono-numbers mt-0.5">
            {suppliers.length} vendors
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <span className="text-xs text-rose-700 font-medium">Accounts Payable (Owed to Suppliers)</span>
          <div className="text-xl font-bold text-rose-800 font-mono-numbers mt-0.5">
            {formatCurrency(totalOwedToSuppliers, settings.currencySymbol)}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <span className="text-xs text-stone-500 font-medium">Recorded Purchase Orders</span>
          <div className="text-xl font-bold text-stone-900 font-mono-numbers mt-0.5">
            {purchases.length} stock receipts
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-6 pt-2 flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
        {/* Suppliers List Table */}
        <div className="flex-1 flex flex-col bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
          <div className="p-3 border-b border-stone-200 flex justify-between items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Search suppliers by company or contact..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 border border-stone-200 rounded-lg text-xs bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              />
            </div>
            <span className="text-xs text-stone-400">{filteredSuppliers.length} suppliers</span>
          </div>

          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left text-xs text-stone-600">
              <thead className="bg-stone-50 text-[11px] uppercase tracking-wider text-stone-500 border-b border-stone-200 font-semibold sticky top-0">
                <tr>
                  <th className="py-2.5 px-4">Company Name</th>
                  <th className="py-2.5 px-4">Contact Person</th>
                  <th className="py-2.5 px-4">Phone / Address</th>
                  <th className="py-2.5 px-4 font-mono-numbers">Total Purchases</th>
                  <th className="py-2.5 px-4 font-mono-numbers">Balance Due</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredSuppliers.map((s) => (
                  <tr key={s.id} className="hover:bg-stone-50 transition-colors">
                    <td className="py-3 px-4 font-semibold text-stone-900">{s.companyName}</td>
                    <td className="py-3 px-4 text-stone-700">{s.contactPerson}</td>
                    <td className="py-3 px-4">
                      <div className="font-mono text-stone-800">{s.phone}</div>
                      <div className="text-[11px] text-stone-400 line-clamp-1">{s.address}</div>
                    </td>
                    <td className="py-3 px-4 font-mono-numbers font-medium text-stone-900">
                      {formatCurrency(s.totalPurchases, settings.currencySymbol)}
                    </td>
                    <td className="py-3 px-4 font-mono-numbers">
                      {s.balanceDue > 0 ? (
                        <span className="text-rose-700 font-bold">
                          {formatCurrency(s.balanceDue, settings.currencySymbol)}
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-medium">Clear</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingSupplier(s);
                          setIsAddSupplierOpen(true);
                        }}
                        className="text-stone-400 hover:text-stone-700 text-xs font-medium"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Purchase Orders Log List */}
        <div className="w-full lg:w-96 flex flex-col bg-white rounded-2xl border border-stone-200 p-5 shadow-xs overflow-hidden">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-stone-900 text-sm">Recent Purchase Orders</h3>
            <span className="text-xs text-stone-400">{purchases.length} total</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3">
            {purchases.length === 0 ? (
              <div className="text-center py-10 text-stone-400 text-xs">
                <Truck className="w-8 h-8 mx-auto mb-2 text-stone-300" />
                No stock purchases recorded yet. Click "Record Received Stock" to receive supplier inventory.
              </div>
            ) : (
              purchases.map((po) => (
                <div key={po.id} className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-1">
                  <div className="flex justify-between font-semibold text-stone-900">
                    <span className="font-mono">{po.purchaseOrderNumber}</span>
                    <span className="font-mono-numbers">{formatCurrency(po.totalAmount, settings.currencySymbol)}</span>
                  </div>
                  <div className="text-stone-600 font-medium">{po.supplierName}</div>
                  <div className="text-[11px] text-stone-400 flex justify-between pt-1">
                    <span>{formatDate(po.date)}</span>
                    <span className="capitalize text-stone-700">Status: {po.paymentStatus}</span>
                  </div>
                  <div className="text-[11px] text-stone-500 pt-1 border-t border-stone-200/60">
                    {po.items.map((i) => `${i.productName} (x${i.quantity})`).join(', ')}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add / Edit Supplier Modal */}
      {isAddSupplierOpen && editingSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-stone-900 text-sm">
                {editingSupplier.id ? 'Edit Supplier' : 'Add Wholesale Supplier'}
              </h3>
              <button
                type="button"
                onClick={() => setIsAddSupplierOpen(false)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSupplier} className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-700 font-medium mb-1">Company / Shop Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Al-Madina Lace & Fancy Trimmings Tariq Road"
                  value={editingSupplier.companyName || ''}
                  onChange={(e) => setEditingSupplier({ ...editingSupplier, companyName: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">Contact Person Name</label>
                <input
                  type="text"
                  placeholder="e.g. Haji Abdul Qayyum"
                  value={editingSupplier.contactPerson || ''}
                  onChange={(e) => setEditingSupplier({ ...editingSupplier, contactPerson: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 0300-8432190"
                    value={editingSupplier.phone || ''}
                    onChange={(e) => setEditingSupplier({ ...editingSupplier, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-medium mb-1">Opening Payable (PKR)</label>
                  <input
                    type="number"
                    min="0"
                    value={editingSupplier.balanceDue || 0}
                    onChange={(e) =>
                      setEditingSupplier({ ...editingSupplier, balanceDue: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">Shop Address / Market</label>
                <input
                  type="text"
                  placeholder="e.g. Shop 12, Rabi Center Basement, Tariq Road, Karachi"
                  value={editingSupplier.address || ''}
                  onChange={(e) => setEditingSupplier({ ...editingSupplier, address: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsAddSupplierOpen(false)}
                  className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs"
                >
                  Save Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Stock Purchase Order Modal */}
      {isNewPurchaseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center px-6 py-4 border-b border-stone-200 bg-stone-50">
              <div>
                <h3 className="font-semibold text-stone-900 text-sm">Record Wholesale Stock Purchase</h3>
                <p className="text-xs text-stone-500">
                  Select supplier, items received, cost price, and auto-increase inventory
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsNewPurchaseOpen(false)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePurchaseOrder} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              <div>
                <label className="block text-stone-700 font-medium mb-1">Select Supplier *</label>
                <select
                  required
                  value={selectedSupplierId}
                  onChange={(e) => setSelectedSupplierId(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs bg-white"
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.companyName} ({s.contactPerson})
                    </option>
                  ))}
                </select>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-stone-800">Products Received into Store</span>
                  <button
                    type="button"
                    onClick={handleAddPurchaseRow}
                    className="text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add Product Line</span>
                  </button>
                </div>

                <div className="divide-y divide-stone-100 border border-stone-200 rounded-xl p-2 bg-stone-50/50">
                  {purchaseItems.map((item, idx) => (
                    <div key={idx} className="py-2.5 first:pt-1 flex items-center gap-2">
                      <div className="flex-1">
                        <select
                          value={item.productId}
                          onChange={(e) => {
                            const p = products.find((prod) => prod.id === e.target.value);
                            if (p) {
                              const updated = [...purchaseItems];
                              updated[idx] = {
                                ...updated[idx],
                                productId: p.id,
                                productName: p.name,
                                unitCost: p.purchasePrice,
                              };
                              setPurchaseItems(updated);
                            }
                          }}
                          className="w-full px-2 py-1.5 border border-stone-300 rounded text-xs bg-white"
                        >
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({p.category})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="w-24">
                        <input
                          type="number"
                          min="1"
                          placeholder="Quantity"
                          value={item.quantity}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 1;
                            const updated = [...purchaseItems];
                            updated[idx].quantity = val;
                            setPurchaseItems(updated);
                          }}
                          className="w-full px-2 py-1.5 border border-stone-300 rounded text-xs font-mono"
                        />
                      </div>

                      <div className="w-28">
                        <input
                          type="number"
                          min="0"
                          placeholder="Cost Price"
                          value={item.unitCost}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            const updated = [...purchaseItems];
                            updated[idx].unitCost = val;
                            setPurchaseItems(updated);
                          }}
                          className="w-full px-2 py-1.5 border border-stone-300 rounded text-xs font-mono"
                        />
                      </div>

                      <div className="w-24 text-right font-mono-numbers font-semibold text-stone-900">
                        {formatCurrency(item.quantity * item.unitCost, settings.currencySymbol)}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemovePurchaseRow(idx)}
                        className="text-stone-400 hover:text-rose-600 p-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment towards this PO */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Amount Paid to Supplier Now</label>
                  <input
                    type="number"
                    min="0"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-medium mb-1">Total Bill Cost</label>
                  <div className="px-3 py-2 bg-stone-100 rounded-lg font-bold text-stone-900 font-mono-numbers">
                    {formatCurrency(totalPurchaseCost, settings.currencySymbol)}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">Purchase Notes (Invoice / Bilty #)</label>
                <input
                  type="text"
                  placeholder="e.g. Received via M&P Courier Tariq Road shipment #8410"
                  value={purchaseNotes}
                  onChange={(e) => setPurchaseNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsNewPurchaseOpen(false)}
                  className="px-4 py-2 text-stone-600 hover:text-stone-900 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={purchaseItems.length === 0}
                  className="px-5 py-2 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-xs"
                >
                  Confirm Stock Receipt & Update Inventory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
