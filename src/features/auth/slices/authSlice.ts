import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { AuthState, CashierUser, ShiftInfo } from "../types";

const initialState: AuthState = {
  user: null,
  token: typeof window !== "undefined" ? localStorage.getItem("auth_token") : null,
  isAuthenticated: false,
  activeShift: null,
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
      if (!state.activeShift) {
        state.activeShift = {
          id: Math.floor(Math.random() * 9000) + 1000,
          terminalId: "POS-01",
          openedAt: new Date().toISOString(),
          startingCash: 5000,
        };
      }
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
