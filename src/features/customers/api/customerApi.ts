import { apiSlice } from "@/store/api/apiSlice";
import type { RetailCustomer } from "../types";

export const MOCK_CUSTOMERS: RetailCustomer[] = [
  {
    id: 1,
    name: "Walk-in Customer",
    phone: "01700000000",
    email: "walkin@supershop.com",
    loyalty_points: 0,
    credit_balance: 0,
    credit_limit: 0,
  },
  {
    id: 2,
    name: "Rafiqul Islam (VIP)",
    phone: "01812345678",
    email: "rafiq@example.com",
    loyalty_points: 120,
    credit_balance: 450,
    credit_limit: 5000,
  },
  {
    id: 3,
    name: "Farhana Yasmin",
    phone: "01999887766",
    email: "farhana@example.com",
    loyalty_points: 65,
    credit_balance: 0,
    credit_limit: 3000,
  },
];

export const customerApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCustomers: builder.query<
      { success: boolean; data: RetailCustomer[] },
      string | void
    >({
      query: (search) => ({
        url: "/customers",
        params: search ? { search } : {},
      }),
      providesTags: ["Tenant"],
    }),

    enrollCustomer: builder.mutation<
      { success: boolean; data: RetailCustomer },
      { name: string; phone: string; email?: string }
    >({
      query: (body) => ({
        url: "/customers",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Tenant"],
    }),
  }),
});

export const { useGetCustomersQuery, useEnrollCustomerMutation } = customerApi;
