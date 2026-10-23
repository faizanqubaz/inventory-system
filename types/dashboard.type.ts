export interface PurchaseRequestData {
  _id: string;
  itemName: string;
  category: string;
  quantity: number;
  amount: number;
  description?: string;
  date?: string;
  receipt?: string;
  employeeId?: {
    _id?: string;
    name?: string;
    email?: string;
  } | string;
  status: "pending" | "approved" | "rejected";
  createdAt?: string;
}

export interface NotificationData {
  _id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt?: string;
  requestId?: PurchaseRequestData | string | null;
}

export interface DashboardStats {
  purchasingCost: number;
  totalPurchaseItems: number;
  approvedRequisitions: number;
  rejectedRequests: number;
}