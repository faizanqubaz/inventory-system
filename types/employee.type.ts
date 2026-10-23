export type Employee = {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  status: "active" | "inactive";
  createdAt?: string;
};

export type EmployeesState = {
  employees: Employee[];
  loading: boolean;
  error: string | null;
};
export interface EmployeeFormData {
  name: string;
  email: string;
  department: string;
  phone: string;
  position: string;
  status: string;
}

export interface EmployeeFormProps {
  onClose: () => void;
  onSubmit: (employee: EmployeeFormData) => Promise<void>;
  error: string;
  isSubmitting: boolean;
}

// Employee activation payload
export interface EmployeeActivationData {
  token: string;
  password: string;
}


export interface PurchaseRequestPayload {
  itemName: string;
  category: string;
  quantity: string;
  amount: string;
  description: string;
  date: string;
  receipt: File | null;
}