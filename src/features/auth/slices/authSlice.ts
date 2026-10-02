import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { AuthState, CashierUser, ShiftInfo } from "../types";

// Default demo cashier for seamless instant operation
const DEFAULT_CASHIER: CashierUser = {
  id: 3,
  name: "Terminal Cashier 1",
  email: "cashier@supershop.com",
  role: "cashier",
  pin_code: "0000",
  tenant_id: 1,
};

const DEFAULT_SHIFT: ShiftInfo = {
  id: 101,
  terminalId: "POS-01",
  openedAt: new Date().toISOString(),
  startingCash: 5000,
};

const initialState: AuthState = {
  user: DEFAULT_CASHIER,
  token: typeof window !== "undefined" ? localStorage.getItem("auth_token") : null,
  isAuthenticated: true,
  activeShift: DEFAULT_SHIFT,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (
      state,
      action: PayloadAction<{ user: CashierUser; token: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      if (typeof window !== "undefined") {
        localStorage.setItem("auth_token", action.payload.token);
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.activeShift = null;
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth_token");
      }
    },
    openShift: (
      state,
      action: PayloadAction<{ startingCash: number; terminalId: string }>
    ) => {
      state.activeShift = {
        id: Math.floor(Math.random() * 9000) + 1000,
        terminalId: action.payload.terminalId,
        openedAt: new Date().toISOString(),
        startingCash: action.payload.startingCash,
      };
    },
    closeShift: (state) => {
      state.activeShift = null;
    },
  },
});

export const { setUser, logout, openShift, closeShift } = authSlice.actions;
export default authSlice.reducer;
