/**
 * Format number as Vietnamese currency
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

/**
 * Format number with thousand separators
 */
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('vi-VN').format(num);
};

/**
 * Get relative time string
 */
export const getRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMs < 0) {
    return 'Đã kết thúc';
  }

  if (diffMins < 60) {
    return `${diffMins} phút nữa`;
  }

  if (diffHours < 24) {
    return `${diffHours} giờ nữa`;
  }

  if (diffDays < 7) {
    return `${diffDays} ngày nữa`;
  }

  return date.toLocaleDateString('vi-VN');
};

/**
 * Check if product is ending soon (within 24 hours)
 */
export const isEndingSoon = (endTime: string): boolean => {
  const end = new Date(endTime);
  const now = new Date();
  const diffHours = (end.getTime() - now.getTime()) / 3600000;
  return diffHours > 0 && diffHours <= 24;
};

/**
 * Check if product was recently posted (within N minutes)
 */
export const isNewProduct = (createdAt: string, minutes = 30): boolean => {
  const created = new Date(createdAt);
  const now = new Date();
  const diffMins = (now.getTime() - created.getTime()) / 60000;
  return diffMins <= minutes;
};

/**
 * Format date to Vietnamese locale
 */
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Format date to Vietnamese locale (date only, no time)
 */
export const formatDateOnly = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

/**
 * Mask bidder name (show last 4 characters)
 */
export const maskName = (name: string): string => {
  if (name.length <= 4) return '****' + name;
  return '****' + name.slice(-4);
};
