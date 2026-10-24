export const formatCurrency = (amount: number, symbol = '₨'): string => {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return `${symbol} 0`;
  }
  return `${symbol} ${Math.round(amount).toLocaleString('en-PK')}`;
};

export const formatDate = (dateString?: string): string => {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
};

export const formatDateTime = (dateString?: string): string => {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return dateString;
  }
};

export const getStockStatus = (
  stock: number,
  threshold = 5
): {
  label: string;
  status: 'out_of_stock' | 'low_stock' | 'in_stock';
  badgeClass: string;
  dotColor: string;
} => {
  if (stock <= 0) {
    return {
      label: 'Out of Stock',
      status: 'out_of_stock',
      badgeClass: 'text-rose-700 bg-rose-50 border border-rose-200',
      dotColor: 'bg-rose-500',
    };
  }
  if (stock <= threshold) {
    return {
      label: `Low Stock (${stock} left)`,
      status: 'low_stock',
      badgeClass: 'text-amber-700 bg-amber-50 border border-amber-200',
      dotColor: 'bg-amber-500',
    };
  }
  return {
    label: `${stock} in stock`,
    status: 'in_stock',
    badgeClass: 'text-emerald-700 bg-emerald-50 border border-emerald-200',
    dotColor: 'bg-emerald-500',
  };
};

export const getCategoryColor = (category: string): { bg: string; text: string; border: string } => {
  switch (category) {
    case 'Cosmetics & Makeup':
      return { bg: 'bg-pink-50', text: 'text-pink-800', border: 'border-pink-200' };
    case 'Jewelry & Artificial Jewelry':
      return { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' };
    case 'Laces, Borders & Embroidery':
      return { bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-200' };
    case 'Hair Accessories':
      return { bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-200' };
    case 'Skincare Products':
      return { bg: 'bg-teal-50', text: 'text-teal-800', border: 'border-teal-200' };
    case 'Ladies Fashion Accessories':
      return { bg: 'bg-orange-50', text: 'text-orange-800', border: 'border-orange-200' };
    default:
      return { bg: 'bg-stone-50', text: 'text-stone-800', border: 'border-stone-200' };
  }
};
