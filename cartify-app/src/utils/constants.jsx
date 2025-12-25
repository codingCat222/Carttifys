export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const USER_ROLES = {
  BUYER: 'buyer',
  SELLER: 'seller',
  ADMIN: 'admin'
};

export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
};

<<<<<<< HEAD
export const PRODsUCT_CATEGORIES = [
=======
export const PRODUCT_CATEGORIES = [
>>>>>>> c2101a68649d9082e9cf568fcbc35984d7a3ac6b
  'electronics',
  'fashion',
  'home',
  'sports',
  'beauty',
  'books',
  'other'
];

export const COMMISSION_RATE = 0.05; // 5%

export const VERIFICATION_FEE = 20.00;