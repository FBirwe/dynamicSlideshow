import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
const BASE_URL = `http://${window.location.hostname}:5454/api/v1/config/`;

// / Define a service using a base URL and expected endpoints
export const configApi = createApi({
  reducerPath: "configApi",
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL }),
  refetchOnFocus: true,
  endpoints: (builder) => ({
    getImageDuration: builder.query({
      query: () => `imageDuration`,
      providesTags: ["imageDuration"],
      refetchOnMountOrArgChange: true,
    }),
    updateImageDuration: builder.mutation({
      // note: an optional `queryFn` may be used in place of `query`
      query: (value) => ({
        url: `imageDuration`,
        method: "PUT",
        body: { value },
      }),
      // Pick out data and prevent nested properties in a hook or selector
      transformResponse: (response, meta, arg) => response.value,
      invalidatesTags: ["imageDuration"],
    }),
    getDelay: builder.query({
      query: () => `delay`,
      providesTags: ["delay"],
      refetchOnMountOrArgChange: true,
    }),
    updateDelay: builder.mutation({
      query: (value) => ({
        url: `delay`,
        method: "PUT",
        body: { value },
      }),
      // Pick out data and prevent nested properties in a hook or selector
      transformResponse: (response, meta, arg) => response.value,
      invalidatesTags: ["delay"],
    }),
    getImageParallelCount: builder.query({
      query: () => `imageParallelCount`,
      providesTags: ["imageParallelCount"],
      refetchOnMountOrArgChange: true,
    }),
    updateImageParallelCounty: builder.mutation({
      // note: an optional `queryFn` may be used in place of `query`
      query: (value) => ({
        url: `imageParallelCount`,
        method: "PUT",
        body: { value },
      }),
      // Pick out data and prevent nested properties in a hook or selector
      transformResponse: (response, meta, arg) => response.value,
      invalidatesTags: ["imageParallelCount"],
    }),
  }),
});

// Export hooks for usage in function components, which are
// auto-generated based on the defined endpoints
export const {
  useGetImageDurationQuery,
  useUpdateImageDurationMutation,
  useGetDelayQuery,
  useUpdateDelayMutation,
  useGetImageParallelCountQuery,
  useUpdateImageParallelCountyMutation,
} = configApi;
