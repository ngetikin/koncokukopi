export type UserRole = 'admin' | 'cashier' | 'customer';

export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  role: UserRole;
  createdAt: any;
  isDeleted?: boolean;
}

export interface Category {
  id: string;
  name: string;
  isDeleted?: boolean;
}

export interface Product {
  id: string;
  categoryId: string;
  name: string;
  price: number;
  imageUrl?: string;
  isAvailable: boolean;
  createdAt: any;
  isDeleted?: boolean;
}

export interface TransactionItem {
  productId: string;
  name: string;
  qty: number;
  price: number;
  subtotal: number;
}

export interface Transaction {
  id: string;
  invoiceCode: string;
  cashierId: string;
  total: number;
  paymentAmount: number;
  changeAmount: number;
  items: TransactionItem[];
  createdAt: any;
  isDeleted?: boolean;
}
