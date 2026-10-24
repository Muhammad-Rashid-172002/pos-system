import React, { useState } from 'react';
import { Sale, ShopSettings } from '../../types';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { IMAGE_PATHS } from '../../constants/imagePaths';
import { Printer, X, Check, Copy } from 'lucide-react';

interface ReceiptModalProps {
  sale: Sale;
  settings: ShopSettings;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ sale, settings, onClose }) => {
  const [printFormat, setPrintFormat] = useState<'thermal' | 'a4'>('thermal');
  const [copied, setCopied] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyDetails = () => {
    const text = `
*${settings.shopName}*
Invoice: ${sale.invoiceNumber}
Date: ${formatDateTime(sale.date)}
Customer: ${sale.customerName || 'Walk-in Customer'}
Cashier: ${sale.cashierName}
---------------------------------
${sale.items.map(it => `${it.name}${it.variantName ? ` (${it.variantName})` : ''} x${it.quantity} = ${formatCurrency(it.lineTotal, settings.currencySymbol)}`).join('\n')}
---------------------------------
Total: ${formatCurrency(sale.grandTotal, settings.currencySymbol)}
Paid: ${formatCurrency(sale.paidAmount, settings.currencySymbol)}
Payment: ${sale.paymentMethod.toUpperCase()}
Status: ${sale.paymentStatus.toUpperCase()}
${settings.receiptFooterNotice}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      {/* Modal Container */}
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden no-print animate-in fade-in zoom-in-95 duration-150">
        {/* Header Toolbar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50/80">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-stone-900 text-sm">Receipt Preview</span>
            <span className="text-stone-400">·</span>
            <span className="text-xs font-mono text-stone-500">{sale.invoiceNumber}</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Format toggle */}
            <div className="flex items-center bg-stone-200/80 p-0.5 rounded-lg text-xs font-medium">
              <button
                type="button"
                onClick={() => setPrintFormat('thermal')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  printFormat === 'thermal' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                80mm Slip
              </button>
              <button
                type="button"
                onClick={() => setPrintFormat('a4')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  printFormat === 'a4' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Standard
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200/50 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Receipt Area (Visual on screen) */}
        <div className="flex-1 overflow-y-auto p-6 bg-stone-100/50 flex justify-center">
          <div
            className={`bg-white shadow-sm border border-stone-200 rounded-lg p-5 text-stone-800 ${
              printFormat === 'thermal' ? 'w-[320px] font-mono-numbers text-xs' : 'w-full text-sm'
            }`}
          >
            {/* Store Branding */}
            <div className="text-center pb-4 border-b border-dashed border-stone-300">
              <img
                src={settings.logoUrl || IMAGE_PATHS.branding.logo}
                alt={settings.shopName}
                width={48}
                height={48}
                loading="eager"
                decoding="async"
                className="w-12 h-12 rounded-full mx-auto mb-2 object-cover border border-stone-200"
              />
              <h2 className="font-serif-luxury text-lg font-bold text-stone-900 tracking-tight">
                {settings.shopName}
              </h2>
              <p className="text-[11px] text-stone-500 mt-0.5">{settings.tagline}</p>
              <p className="text-[10px] text-stone-500 mt-1">{settings.address}</p>
              <p className="text-[10px] text-stone-600 font-medium">
                Ph: {settings.phone} {settings.whatsapp ? `· WA: ${settings.whatsapp}` : ''}
              </p>
            </div>

            {/* Invoice Meta */}
            <div className="py-3 border-b border-dashed border-stone-300 text-[11px] space-y-1">
              <div className="flex justify-between">
                <span className="text-stone-500">Invoice:</span>
                <span className="font-semibold text-stone-900">{sale.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Date & Time:</span>
                <span>{formatDateTime(sale.date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Cashier:</span>
                <span>{sale.cashierName}</span>
              </div>
              {sale.customerName && (
                <div className="flex justify-between pt-1 border-t border-stone-100">
                  <span className="text-stone-500">Customer:</span>
                  <span className="font-medium text-stone-900">{sale.customerName}</span>
                </div>
              )}
              {sale.customerPhone && (
                <div className="flex justify-between">
                  <span className="text-stone-500">Phone:</span>
                  <span>{sale.customerPhone}</span>
                </div>
              )}
            </div>

            {/* Line Items */}
            <div className="py-3 border-b border-dashed border-stone-300">
              <div className="flex justify-between text-[10px] uppercase font-semibold text-stone-500 mb-2">
                <span>Item</span>
                <span className="text-right">Total</span>
              </div>

              <div className="space-y-2">
                {sale.items.map((item) => (
                  <div key={item.cartItemId} className="text-[11px]">
                    <div className="flex justify-between font-medium text-stone-900">
                      <span className="pr-2">{item.name}</span>
                      <span className="shrink-0">{formatCurrency(item.lineTotal, settings.currencySymbol)}</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-stone-500">
                      <span>
                        {item.variantName ? `${item.variantName} · ` : ''}
                        {item.quantity} {item.unit} @ {formatCurrency(item.unitPrice, settings.currencySymbol)}
                      </span>
                      {item.discountValue > 0 && (
                        <span className="text-rose-600">
                          Disc: -
                          {item.discountType === 'percentage'
                            ? `${item.discountValue}%`
                            : formatCurrency(item.discountValue, settings.currencySymbol)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals Calculation */}
            <div className="py-3 border-b border-dashed border-stone-300 space-y-1.5 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal:</span>
                <span>{formatCurrency(sale.subtotal, settings.currencySymbol)}</span>
              </div>
              {sale.discountTotal > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>Discount:</span>
                  <span>-{formatCurrency(sale.discountTotal, settings.currencySymbol)}</span>
                </div>
              )}
              {sale.taxTotal > 0 && (
                <div className="flex justify-between text-stone-600">
                  <span>Tax ({sale.taxRate}%):</span>
                  <span>+{formatCurrency(sale.taxTotal, settings.currencySymbol)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-stone-900 pt-1 border-t border-stone-200">
                <span>Grand Total:</span>
                <span>{formatCurrency(sale.grandTotal, settings.currencySymbol)}</span>
              </div>
              <div className="flex justify-between text-stone-700 pt-1">
                <span className="capitalize">Paid via {sale.paymentMethod.replace('_', ' ')}:</span>
                <span className="font-semibold">{formatCurrency(sale.paidAmount, settings.currencySymbol)}</span>
              </div>
              {sale.changeAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Change Due:</span>
                  <span>{formatCurrency(sale.changeAmount, settings.currencySymbol)}</span>
                </div>
              )}
              {sale.grandTotal > sale.paidAmount && (
                <div className="flex justify-between text-amber-700 font-medium bg-amber-50 p-1.5 rounded-sm mt-1">
                  <span>Balance (Added to Credit Khata):</span>
                  <span>{formatCurrency(sale.grandTotal - sale.paidAmount, settings.currencySymbol)}</span>
                </div>
              )}
            </div>

            {/* Footer Notice & Barcode Simulator */}
            <div className="pt-4 text-center space-y-2">
              <p className="text-[10px] text-stone-500 leading-relaxed">{settings.receiptHeaderNotice}</p>
              <p className="text-[9px] text-stone-400 italic">{settings.receiptFooterNotice}</p>

              {/* Barcode line representation */}
              <div className="pt-2 flex flex-col items-center">
                <div className="h-9 w-44 flex items-center justify-center space-x-1 border-t border-b border-stone-800 py-1">
                  <div className="h-full w-1 bg-stone-900" />
                  <div className="h-full w-0.5 bg-stone-900" />
                  <div className="h-full w-1.5 bg-stone-900" />
                  <div className="h-full w-0.5 bg-stone-900" />
                  <div className="h-full w-2 bg-stone-900" />
                  <div className="h-full w-0.5 bg-stone-900" />
                  <div className="h-full w-1 bg-stone-900" />
                  <div className="h-full w-1.5 bg-stone-900" />
                  <div className="h-full w-0.5 bg-stone-900" />
                  <div className="h-full w-2 bg-stone-900" />
                  <div className="h-full w-1 bg-stone-900" />
                </div>
                <span className="text-[10px] font-mono tracking-widest text-stone-600 mt-0.5">
                  *{sale.invoiceNumber}*
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Action Bar */}
        <div className="flex items-center justify-between p-4 border-t border-stone-200 bg-white">
          <button
            type="button"
            onClick={handleCopyDetails}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-700 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Slip Text'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
            >
              Done
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 active:scale-98 rounded-lg shadow-sm transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Print Receipt</span>
            </button>
          </div>
        </div>
      </div>

      {/* Hidden container specifically styled for browser print action */}
      <div className="hidden print:block print-only-container">
        <div className="thermal-receipt-print">
          <div style={{ textAlign: 'center', marginBottom: '8px' }}>
            <img
              src={settings.logoUrl || IMAGE_PATHS.branding.logo}
              alt={settings.shopName}
              width={40}
              height={40}
              style={{ margin: '0 auto 6px auto', borderRadius: '50%', display: 'block', border: '1px solid #ccc' }}
            />
            <h3 style={{ fontSize: '13pt', fontWeight: 'bold', margin: '0' }}>{settings.shopName}</h3>
            <p style={{ margin: '2px 0', fontSize: '8pt' }}>{settings.tagline}</p>
            <p style={{ margin: '2px 0', fontSize: '8pt' }}>{settings.address}</p>
            <p style={{ margin: '2px 0', fontSize: '8pt' }}>Ph: {settings.phone}</p>
          </div>
          <hr style={{ borderTop: '1px dashed #000', margin: '6px 0' }} />
          <div style={{ fontSize: '8pt' }}>
            <div>Inv: {sale.invoiceNumber}</div>
            <div>Date: {formatDateTime(sale.date)}</div>
            <div>Cashier: {sale.cashierName}</div>
            {sale.customerName && <div>Customer: {sale.customerName} ({sale.customerPhone || ''})</div>}
          </div>
          <hr style={{ borderTop: '1px dashed #000', margin: '6px 0' }} />
          <table style={{ width: '100%', fontSize: '8pt', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #000' }}>
                <th style={{ textAlign: 'left' }}>Item</th>
                <th style={{ textAlign: 'center' }}>Qty</th>
                <th style={{ textAlign: 'right' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {sale.items.map((it) => (
                <tr key={it.cartItemId}>
                  <td style={{ paddingTop: '3px' }}>
                    {it.name}
                    {it.variantName ? ` - ${it.variantName}` : ''}
                  </td>
                  <td style={{ textAlign: 'center' }}>{it.quantity}</td>
                  <td style={{ textAlign: 'right' }}>{formatCurrency(it.lineTotal, settings.currencySymbol)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <hr style={{ borderTop: '1px dashed #000', margin: '6px 0' }} />
          <div style={{ fontSize: '9pt', fontWeight: 'bold', textAlign: 'right' }}>
            <div>Subtotal: {formatCurrency(sale.subtotal, settings.currencySymbol)}</div>
            {sale.discountTotal > 0 && <div>Discount: -{formatCurrency(sale.discountTotal, settings.currencySymbol)}</div>}
            <div>Grand Total: {formatCurrency(sale.grandTotal, settings.currencySymbol)}</div>
            <div>Paid: {formatCurrency(sale.paidAmount, settings.currencySymbol)}</div>
            {sale.changeAmount > 0 && <div>Change: {formatCurrency(sale.changeAmount, settings.currencySymbol)}</div>}
          </div>
          <hr style={{ borderTop: '1px dashed #000', margin: '6px 0' }} />
          <p style={{ textAlign: 'center', fontSize: '7pt', margin: '4px 0' }}>{settings.receiptHeaderNotice}</p>
          <p style={{ textAlign: 'center', fontSize: '7pt', margin: '2px 0' }}>{settings.receiptFooterNotice}</p>
        </div>
      </div>
    </div>
  );
};
