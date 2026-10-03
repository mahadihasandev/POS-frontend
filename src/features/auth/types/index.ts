export interface CashierUser {
  id: number;
  name: string;
  email: string;
  role: "super_admin" | "branch_manager" | "floor_supervisor" | "cashier";
  pin_code: string;
  tenant_id: number;
  can_sell?: boolean;
}

export interface ShiftInfo {
  id: number;
  terminalId: string;
  openedAt: string;
  startingCash: number;
}

export interface AuthState {
  user: CashierUser | null;
  token: string | null;
  isAuthenticated: boolean;
  activeShift: ShiftInfo | null;
}
