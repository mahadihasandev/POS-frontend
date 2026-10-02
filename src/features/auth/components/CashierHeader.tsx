"use client";

import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "../slices/authSlice";
import { 
  Store, 
  UserCheck, 
  LogOut, 
  Clock, 
  ExternalLink,
  ShieldCheck
} from "lucide-react";

interface CashierHeaderProps {
  onOpenLoginModal: () => void;
}

export function CashierHeader({ onOpenLoginModal }: CashierHeaderProps) {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, activeShift } = useAppSelector((state) => state.auth);
  
  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    onOpenLoginModal();
  };

  return (
    <header className="bg-white border-b border-slate-200/80 px-4 sm:px-6 py-2.5 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Store & Counter Brand */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-500/20 shrink-0">
          <Store className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold text-slate-900 tracking-tight">
              POS SuperShop
            </h1>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200/60">
              Terminal {activeShift?.terminalId ?? "POS-01"}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 hidden sm:block">
            Branch #101 • Dhanmondi Outlet, Dhaka
          </p>
        </div>
      </div>

      {/* Live Clock & Shift Status */}
      <div className="hidden md:flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Shift Active</span>
        </div>
        
        <div className="flex items-center gap-1 text-slate-500 font-mono text-xs">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{currentTime || "12:00:00 PM"}</span>
        </div>
      </div>

      {/* Cashier User Section & Admin Switcher */}
      <div className="flex items-center gap-2 sm:gap-3">
        {isAuthenticated && user ? (
          <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
              {user.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[120px]">
                {user.name}
              </p>
              <p className="text-[10px] text-slate-500 capitalize">
                {user.role.replace("_", " ")}
              </p>
            </div>
            
            <button
              onClick={handleLogout}
              title="Logout / Switch Cashier"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition ml-1"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenLoginModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Cashier Login</span>
          </button>
        )}

        {/* Link to Admin Dashboard */}
        <a
          href={
            process.env.NEXT_PUBLIC_ADMIN_URL ||
            (process.env.NEXT_PUBLIC_API_URL
              ? process.env.NEXT_PUBLIC_API_URL.replace("/api/v1", "/admin/login")
              : "http://localhost:8000/admin/login")
          }
          target="_blank"
          rel="noopener noreferrer"
          className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-medium transition"
          title="Open Admin Back-Office"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
          <span>Admin Portal</span>
          <ExternalLink className="w-3 h-3 text-slate-400" />
        </a>
      </div>
    </header>
  );
}
