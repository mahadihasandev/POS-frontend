import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

/**
 * Global Base RTK Query API Slice
 * Enforces unified base URL, header injection (tokens, multi-tenant ID),
 * and centralized cache tag management.
 */
export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1",
    prepareHeaders: (headers) => {
      // 1. Multi-tenant Header
      const tenantId = process.env.NEXT_PUBLIC_TENANT_ID || "1";
      headers.set("X-Tenant-Id", tenantId);

      // 2. Auth Bearer Token (retrieved from client storage or auth state)
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("auth_token");
        if (token) {
          headers.set("Authorization", `Bearer ${token}`);
        }
      }

      headers.set("Accept", "application/json");
      return headers;
    },
  }),
  tagTypes: ["Orders", "Metrics", "Products", "Tenant"],
  endpoints: () => ({}),
});
