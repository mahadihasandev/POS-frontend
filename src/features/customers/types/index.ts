export interface RetailCustomer {
  id: number;
  name: string;
  phone: string;
  email?: string | null;
  loyalty_points: number;
  credit_balance: number;
  credit_limit: number;
}
