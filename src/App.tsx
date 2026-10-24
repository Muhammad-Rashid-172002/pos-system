import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  LayoutDashboard,
  Package,
  FileText,
  Users,
  Truck,
  CreditCard,
  Settings,
  Shield,
  RotateCcw,
  Sparkles,
  Menu,
  X,
  Bell,
  ArrowRight,
} from 'lucide-react';
import { dataService } from './services/dataService';
import { ShopSettings, StaffUser } from './types';
import { IMAGE_PATHS } from './constants/imagePaths';
import { POSScreen } from './components/pos/POSScreen';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { InventoryManager } from './components/inventory/InventoryManager';
import { ReportsManager } from './components/reports/ReportsManager';
import { CustomersManager } from './components/customers/CustomersManager';
import { SuppliersManager } from './components/suppliers/SuppliersManager';
import { ExpensesManager } from './components/expenses/ExpensesManager';
import { SettingsManager } from './components/settings/SettingsManager';
import { formatCurrency } from './utils/formatters';

type TabView =
  | 'pos'
  | 'dashboard'
  | 'inventory'
  | 'reports'
  | 'customers'
  | 'suppliers'
  | 'expenses'
  | 'settings';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabView>('pos');
  const [settings, setSettings] = useState<ShopSettings>(dataService.getSettings());
  const [staffList, setStaffList] = useState<StaffUser[]>(dataService.getStaff());
  const [currentStaff, setCurrentStaff] = useState<StaffUser>(dataService.getStaff()[0]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Sync settings when modified
  useEffect(() => {
    const unsub = dataService.subscribe(() => {
      setSettings(dataService.getSettings());
      setStaffList(dataService.getStaff());
    });
    return () => unsub();
  }, []);

  const navItems = [
    { id: 'pos' as TabView, label: 'POS Terminal', icon: ShoppingBag },
    { id: 'dashboard' as TabView, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inventory' as TabView, label: 'Products & Stock', icon: Package },
    { id: 'reports' as TabView, label: 'Reports & P&L', icon: FileText },
    { id: 'customers' as TabView, label: 'Customers & Khata', icon: Users },
    { id: 'suppliers' as TabView, label: 'Suppliers', icon: Truck },
    { id: 'expenses' as TabView, label: 'Expenses', icon: CreditCard },
    { id: 'settings' as TabView, label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-stone-100/80 text-stone-900 font-sans">
      {/* SIDEBAR NAVIGATION (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-stone-200 shrink-0 no-print">
        {/* Brand Lockup */}
        <div className="p-5 border-b border-stone-200">
          <div className="flex items-center gap-2.5">
            <img
              src={settings.logoUrl || IMAGE_PATHS.branding.logo}
              alt={settings.shopName}
              width={36}
              height={36}
              loading="eager"
              decoding="async"
              className="w-9 h-9 rounded-lg object-cover border border-rose-200/60 shadow-xs shrink-0"
            />
            <div>
              <h1 className="font-serif-luxury font-bold text-stone-900 text-base leading-none">
                {settings.shopName}
              </h1>
              <p className="text-[10px] text-stone-400 mt-1 uppercase tracking-wider font-medium">
                Point of Sale System
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-rose-600 text-white shadow-sm shadow-rose-600/20'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-stone-400'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Session & Role Footer */}
        <div className="p-3 border-t border-stone-200 bg-stone-50/60">
          <div className="p-2.5 rounded-xl border border-stone-200/80 bg-white flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-7 h-7 rounded-full bg-stone-200 flex items-center justify-center font-bold text-xs text-stone-700 shrink-0">
                {currentStaff.name[0]}
              </div>
              <div className="truncate">
                <div className="text-xs font-semibold text-stone-900 truncate">{currentStaff.name}</div>
                <div className="text-[10px] text-stone-500 uppercase tracking-wide font-mono">
                  {currentStaff.role}
                </div>
              </div>
            </div>

            {/* Quick Switch Role */}
            <button
              type="button"
              onClick={() => {
                const nextUser = staffList.find((u) => u.id !== currentStaff.id) || staffList[0];
                setCurrentStaff(nextUser);
              }}
              className="text-[10px] font-medium text-rose-600 hover:text-rose-700 p-1 rounded hover:bg-rose-50"
              title="Click to toggle between Admin and Cashier"
            >
              Switch
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN VIEWPORT */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* MOBILE HEADER (Phones/Small Tablets) */}
        <header className="md:hidden bg-white border-b border-stone-200 px-4 py-3 flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <img
              src={settings.logoUrl || IMAGE_PATHS.branding.logo}
              alt={settings.shopName}
              width={28}
              height={28}
              loading="eager"
              decoding="async"
              className="w-7 h-7 rounded-lg object-cover border border-rose-200/60 shadow-xs shrink-0"
            />
            <span className="font-serif-luxury font-bold text-stone-900 text-sm">{settings.shopName}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('pos')}
              className="px-3 py-1 bg-rose-600 text-white rounded-lg text-xs font-semibold"
            >
              POS
            </button>
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1.5 text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-100"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-stone-200 p-3 space-y-1 z-30 shadow-lg no-print animate-in slide-in-from-top duration-150">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium ${
                    isActive ? 'bg-rose-600 text-white font-semibold' : 'text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* ACTIVE TAB CONTENT */}
        <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          {activeTab === 'pos' && (
            <POSScreen currentStaff={currentStaff} settings={settings} />
          )}

          {activeTab === 'dashboard' && (
            <DashboardOverview
              currentStaff={currentStaff}
              settings={settings}
              onNavigateToPOS={() => setActiveTab('pos')}
              onNavigateToInventory={() => setActiveTab('inventory')}
              onNavigateToExpenses={() => setActiveTab('expenses')}
            />
          )}

          {activeTab === 'inventory' && (
            <InventoryManager currentStaff={currentStaff} settings={settings} />
          )}

          {activeTab === 'reports' && (
            <ReportsManager currentStaff={currentStaff} settings={settings} />
          )}

          {activeTab === 'customers' && (
            <CustomersManager currentStaff={currentStaff} settings={settings} />
          )}

          {activeTab === 'suppliers' && (
            <SuppliersManager currentStaff={currentStaff} settings={settings} />
          )}

          {activeTab === 'expenses' && (
            <ExpensesManager currentStaff={currentStaff} settings={settings} />
          )}

          {activeTab === 'settings' && (
            <SettingsManager
              currentStaff={currentStaff}
              settings={settings}
              onUpdateSettings={setSettings}
              onSwitchStaff={setCurrentStaff}
            />
          )}
        </main>
      </div>
    </div>
  );
}
