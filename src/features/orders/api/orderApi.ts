import { apiSlice } from "@/store/api/apiSlice";
import type { Order, DashboardMetrics, CreateOrderPayload } from "../types";

export const orderApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getOrders: builder.query<{ data: Order[] }, { status?: string; page?: number } | void>({
      query: (params) => ({
        url: "/orders",
        params: params || {},
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: "Orders" as const, id })),
              { type: "Orders", id: "LIST" },
            ]
          : [{ type: "Orders", id: "LIST" }],
    }),

    getDashboardMetrics: builder.query<{ success: boolean; data: DashboardMetrics }, void>({
      query: () => "/orders/metrics",
      providesTags: [{ type: "Metrics", id: "DASHBOARD" }],
    }),

    createOrder: builder.mutation<Order, CreateOrderPayload>({
      query: (body) => ({
        url: "/orders",
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "Orders", id: "LIST" },
        { type: "Metrics", id: "DASHBOARD" },
      ],
    }),
  }),
});

export const {
  useGetOrdersQuery,
  useGetDashboardMetricsQuery,
  useCreateOrderMutation,
} = orderApi;
