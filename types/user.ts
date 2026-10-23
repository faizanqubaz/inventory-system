export interface IUser extends Document {
  email: string;
  password: string;
  role: "admin" | "customer" | "accountant";
  createdAt: Date;
  updatedAt: Date;
}


export type FormState = {
  itemName: string;
  category: string;
  quantity: string;
  amount: string;
  description: string;
  date: string;
};