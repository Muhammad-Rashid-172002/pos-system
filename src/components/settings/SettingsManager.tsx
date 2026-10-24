import React, { useState, useEffect } from 'react';
import { ShopSettings, StaffUser } from '../../types';
import { dataService } from '../../services/dataService';
import {
  Settings,
  Store,
  Shield,
  Printer,
  Sliders,
  Download,
  Upload,
  RefreshCw,
  Check,
  UserCheck,
  Percent,
} from 'lucide-react';

interface SettingsManagerProps {
  currentStaff: StaffUser;
  settings: ShopSettings;
  onUpdateSettings: (newSettings: ShopSettings) => void;
  onSwitchStaff: (staff: StaffUser) => void;
}

export const SettingsManager: React.FC<SettingsManagerProps> = ({
  currentStaff,
  settings,
  onUpdateSettings,
  onSwitchStaff,
}) => {
  const [formData, setFormData] = useState<ShopSettings>({ ...settings });
  const [staffList, setStaffList] = useState<StaffUser[]>([]);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  useEffect(() => {
    setFormData({ ...settings });
    setStaffList(dataService.getStaff());
  }, [settings]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    dataService.saveSettings(formData);
    onUpdateSettings(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleExportBackup = () => {
    const jsonStr = dataService.exportDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zebaish-pos-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const ok = dataService.importDataJSON(text);
        if (ok) {
          setImportStatus('Data backup successfully restored!');
          setTimeout(() => setImportStatus(null), 3000);
        } else {
          setImportStatus('Invalid JSON format.');
        }
      } catch {
        setImportStatus('Failed to read file.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetDemo = () => {
    if (confirm('Reset all store inventory, sales, and khata records back to initial Pakistani boutique demo data?')) {
      dataService.resetToDemoData();
      window.location.reload();
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-stone-50">
      {/* Top Header */}
      <div className="bg-white border-b border-stone-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-stone-900 tracking-tight font-serif-luxury">
            Store Settings & Staff Permissions
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Configure boutique details, receipt headers, PKR currency, and role authorizations
          </p>
        </div>

        {saveSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-lg border border-emerald-200">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Settings Saved!</span>
          </div>
        )}
      </div>

      {/* Settings Form Body */}
      <div className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto space-y-6 w-full">
        {/* Active Staff & Role Switcher */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-rose-600" />
            <div>
              <h3 className="font-bold text-stone-900 text-sm">Active Staff Session & Permissions</h3>
              <p className="text-xs text-stone-400">Switch between Admin (Full store control) and Cashier mode</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {staffList.map((user) => {
              const isActive = currentStaff.id === user.id;
              return (
                <div
                  key={user.id}
                  onClick={() => onSwitchStaff(user)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isActive
                      ? 'border-rose-600 bg-rose-50/50 shadow-xs ring-1 ring-rose-500'
                      : 'border-stone-200 bg-stone-50 hover:bg-stone-100'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold text-stone-900 text-sm">{user.name}</div>
                      <div className="text-xs text-stone-500 font-mono">@{user.username}</div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        user.role === 'admin'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-stone-200 text-stone-800'
                      }`}
                    >
                      {user.role}
                    </span>
                  </div>

                  <div className="mt-3 pt-2 border-t border-stone-200/60 text-[11px] text-stone-600">
                    {user.role === 'admin' ? (
                      <span>Full Access: Inventory CRUD, Expenses, Khata overrides, System Settings</span>
                    ) : (
                      <span>Cashier Access: Fast Billing, Receipts, Daily Counter Invoices, Holds & Returns</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Store Profile Form */}
        <form onSubmit={handleSave} className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-2 mb-1">
            <Store className="w-5 h-5 text-rose-600" />
            <div>
              <h3 className="font-bold text-stone-900 text-sm">Boutique Information</h3>
              <p className="text-xs text-stone-400">Printed on receipts and tax invoices</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-stone-700 font-medium mb-1">Shop / Boutique Name *</label>
              <input
                type="text"
                required
                value={formData.shopName}
                onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block text-stone-700 font-medium mb-1">Tagline</label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block text-stone-700 font-medium mb-1">Phone Number *</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-stone-700 font-medium mb-1">WhatsApp Order Support</label>
              <input
                type="text"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-stone-700 font-medium mb-1">Shop Address & Market *</label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
              />
            </div>
          </div>

          {/* POS & Financial Rules */}
          <div className="pt-4 border-t border-stone-200">
            <h4 className="font-semibold text-stone-900 text-xs mb-3 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-stone-500" />
              <span>POS Defaults & Tax Settings</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-stone-700 font-medium mb-1">Currency Symbol</label>
                <input
                  type="text"
                  value={formData.currencySymbol}
                  onChange={(e) => setFormData({ ...formData, currencySymbol: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">Sales Tax Rate (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.taxRate}
                  onChange={(e) => setFormData({ ...formData, taxRate: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">Default Low Stock Threshold</label>
                <input
                  type="number"
                  min="1"
                  value={formData.defaultLowStockThreshold}
                  onChange={(e) =>
                    setFormData({ ...formData, defaultLowStockThreshold: parseInt(e.target.value) || 5 })
                  }
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs font-mono"
                />
              </div>
            </div>
          </div>

          {/* Receipt Header & Footer Notice */}
          <div className="pt-4 border-t border-stone-200 space-y-3 text-xs">
            <h4 className="font-semibold text-stone-900 text-xs flex items-center gap-1.5">
              <Printer className="w-4 h-4 text-stone-500" />
              <span>Thermal Receipt Notices</span>
            </h4>

            <div>
              <label className="block text-stone-700 font-medium mb-1">Receipt Header Notice</label>
              <textarea
                rows={2}
                value={formData.receiptHeaderNotice}
                onChange={(e) => setFormData({ ...formData, receiptHeaderNotice: e.target.value })}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block text-stone-700 font-medium mb-1">Receipt Footer & Return Policy Note</label>
              <textarea
                rows={2}
                value={formData.receiptFooterNotice}
                onChange={(e) => setFormData({ ...formData, receiptFooterNotice: e.target.value })}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
              />
            </div>
          </div>

          <div className="flex items-center justify-end pt-4 border-t border-stone-200">
            <button
              type="submit"
              className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              Save Store Settings
            </button>
          </div>
        </form>

        {/* Backup & Demo Data Management */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
          <div>
            <h3 className="font-bold text-stone-900 text-sm">Data Backup & Demo Maintenance</h3>
            <p className="text-xs text-stone-400">
              Download your store database as JSON or reset to default boutique sample data
            </p>
          </div>

          {importStatus && (
            <div className="p-3 bg-stone-100 rounded-lg text-xs font-medium text-stone-800">
              {importStatus}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              onClick={handleExportBackup}
              className="flex items-center gap-2 px-4 py-2 border border-stone-300 hover:bg-stone-50 text-stone-800 rounded-lg text-xs font-medium transition-colors"
            >
              <Download className="w-4 h-4 text-stone-500" />
              <span>Download JSON Backup</span>
            </button>

            <label className="flex items-center gap-2 px-4 py-2 border border-stone-300 hover:bg-stone-50 text-stone-800 rounded-lg text-xs font-medium transition-colors cursor-pointer">
              <Upload className="w-4 h-4 text-stone-500" />
              <span>Restore Backup</span>
              <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
            </label>

            <button
              type="button"
              onClick={handleResetDemo}
              className="flex items-center gap-2 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-semibold transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reset to Sample Data</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
