export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount || 0);
};

export const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'Healthy':
      return 'badge-success';
    case 'Low Stock':
      return 'badge-warning';
    case 'Out of Stock':
      return 'badge-danger';
    case 'Overstock':
      return 'badge-info';
    case 'Delivered':
    case 'Completed':
      return 'badge-success';
    case 'Processing':
    case 'Shipped':
    case 'Confirmed':
      return 'badge-primary';
    case 'Pending':
      return 'badge-warning';
    case 'Cancelled':
      return 'badge-danger';
    default:
      return 'badge-neutral';
  }
};
