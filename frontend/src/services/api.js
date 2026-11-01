import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import {
  API_BASE_URL,
  clearAuthStorage,
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
} from '../utils/api';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  timeout: 30000,
  prepareHeaders: (headers) => {
    const accessToken = getAccessToken();
    if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);
    return headers;
  },
});

let refreshRequest;

const baseQueryWithReauth = async (args, api, extraOptions = {}) => {
  let result = await rawBaseQuery(args, api, extraOptions);
  const requestUrl = typeof args === 'string' ? args : args.url;
  const canRefresh = !extraOptions.skipReauth && !requestUrl?.includes('/api/user/refresh-token');

  if ([401, 403].includes(result.error?.status) && canRefresh) {
    if (!refreshRequest) {
      refreshRequest = (async () => {
        const refreshToken = getRefreshToken();
        if (!refreshToken) return false;
        const refreshResult = await rawBaseQuery(
          {
            url: '/api/user/refresh-token',
            method: 'POST',
            body: { refreshToken },
          },
          api,
          { ...extraOptions, skipReauth: true }
        );

        const accessToken = refreshResult.data?.accessToken;
        const nextRefreshToken = refreshResult.data?.refreshToken;
        if (!accessToken || !nextRefreshToken) return false;
        setAccessToken(accessToken);
        setRefreshToken(nextRefreshToken);
        return true;
      })().finally(() => {
        refreshRequest = null;
      });
    }

    const refreshed = await refreshRequest;
    if (refreshed) {
      result = await rawBaseQuery(args, api, extraOptions);
    } else {
      clearAuthStorage();
      if (typeof window !== 'undefined') window.dispatchEvent(new Event('auth:logout'));
    }
  }

  return result;
};

export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'Profile',
    'Sessions',
    'Goals',
    'AchievementCatalog',
    'EarnedAchievements',
    'Streak',
    'LegacyExercises',
    'Heatmap',
  ],
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({ url: '/api/user/login', method: 'POST', body: credentials }),
      extraOptions: { skipReauth: true },
    }),
    register: builder.mutation({
      query: (details) => ({ url: '/api/user/add', method: 'POST', body: details }),
      extraOptions: { skipReauth: true },
    }),
    getProfile: builder.query({
      query: (userId) => `/api/user/${userId}`,
      providesTags: (_result, _error, userId) => [{ type: 'Profile', id: userId }],
    }),
    updateProfile: builder.mutation({
      query: ({ userId, body }) => ({ url: `/api/user/${userId}/update`, method: 'PUT', body }),
      invalidatesTags: (_result, _error, { userId }) => [{ type: 'Profile', id: userId }],
    }),
    getWorkoutSessions: builder.query({
      query: () => '/api/workout-sessions/',
      providesTags: (result) => [
        { type: 'Sessions', id: 'LIST' },
        ...(result || []).map(({ _id }) => ({ type: 'Sessions', id: _id })),
      ],
    }),
    createWorkoutSession: builder.mutation({
      query: (body) => ({ url: '/api/workout-sessions/', method: 'POST', body }),
      invalidatesTags: ['Sessions', 'Goals', 'Streak', 'EarnedAchievements', 'Profile'],
    }),
    updateWorkoutSession: builder.mutation({
      query: ({ sessionId, body }) => ({
        url: `/api/workout-sessions/${sessionId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { sessionId }) => [
        { type: 'Sessions', id: sessionId },
        'Sessions',
        'Goals',
        'Streak',
        'EarnedAchievements',
        'Profile',
      ],
    }),
    deleteWorkoutSession: builder.mutation({
      query: (sessionId) => ({ url: `/api/workout-sessions/${sessionId}`, method: 'DELETE' }),
      invalidatesTags: ['Sessions', 'Goals', 'Streak', 'EarnedAchievements', 'Profile'],
    }),
    getGoals: builder.query({
      query: (userId) => `/api/goals/${userId}`,
      providesTags: (_result, _error, userId) => [{ type: 'Goals', id: userId }],
    }),
    createGoal: builder.mutation({
      query: ({ userId, body }) => ({ url: `/api/goals/${userId}`, method: 'POST', body }),
      invalidatesTags: (_result, _error, { userId }) => [{ type: 'Goals', id: userId }, 'Goals'],
    }),
    updateGoal: builder.mutation({
      query: ({ userId, goalId, body }) => ({
        url: `/api/goals/${userId}/${goalId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { userId }) => [{ type: 'Goals', id: userId }, 'Goals'],
    }),
    deleteGoal: builder.mutation({
      query: ({ userId, goalId }) => ({ url: `/api/goals/${userId}/${goalId}`, method: 'DELETE' }),
      invalidatesTags: (_result, _error, { userId }) => [{ type: 'Goals', id: userId }, 'Goals'],
    }),
    getAchievementCatalog: builder.query({
      query: () => '/api/achievements/',
      providesTags: ['AchievementCatalog'],
    }),
    getEarnedAchievements: builder.query({
      query: () => '/api/user-achievements/',
      providesTags: ['EarnedAchievements'],
    }),
    getStreak: builder.query({
      query: (userId) => `/api/user/streak/${userId}`,
      providesTags: (_result, _error, userId) => [{ type: 'Streak', id: userId }],
    }),
    getLegacyExercises: builder.query({
      queryFn: async (userId, _api, _extraOptions, baseQuery) => {
        const result = await baseQuery(`/api/exercises/${userId}/exercises_list`);
        if (result.error?.status === 404) return { data: [] };
        if (result.error) return { error: result.error };
        return { data: result.data?.Exercises || [] };
      },
      providesTags: (_result, _error, userId) => [{ type: 'LegacyExercises', id: userId }],
    }),
    createLegacyExercise: builder.mutation({
      query: ({ userId, body }) => ({ url: `/api/exercises/${userId}/add`, method: 'POST', body }),
      invalidatesTags: (_result, _error, { userId }) => [
        { type: 'LegacyExercises', id: userId },
        { type: 'Streak', id: userId },
        'Goals',
        'EarnedAchievements',
        'Profile',
        'Sessions',
      ],
    }),
    deleteLegacyExercise: builder.mutation({
      query: ({ userId, exerciseId }) => ({
        url: `/api/exercises/${userId}/exercises_list/${exerciseId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { userId }) => [
        { type: 'LegacyExercises', id: userId },
        { type: 'Streak', id: userId },
        'Goals',
        'EarnedAchievements',
        'Profile',
        'Sessions',
      ],
    }),
    getHeatmapMonth: builder.query({
      query: ({ userId, month }) => `/api/exercises/${userId}/data/${encodeURIComponent(month)}`,
      providesTags: (_result, _error, { userId }) => [{ type: 'Heatmap', id: userId }],
    }),
    addHeatmapActivity: builder.mutation({
      query: ({ userId, body }) => ({
        url: `/api/exercises/${userId}/track-exercise`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { userId }) => [{ type: 'Heatmap', id: userId }],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useGetWorkoutSessionsQuery,
  useCreateWorkoutSessionMutation,
  useUpdateWorkoutSessionMutation,
  useDeleteWorkoutSessionMutation,
  useGetGoalsQuery,
  useCreateGoalMutation,
  useUpdateGoalMutation,
  useDeleteGoalMutation,
  useGetAchievementCatalogQuery,
  useGetEarnedAchievementsQuery,
  useGetStreakQuery,
  useGetLegacyExercisesQuery,
  useCreateLegacyExerciseMutation,
  useDeleteLegacyExerciseMutation,
  useGetHeatmapMonthQuery,
  useAddHeatmapActivityMutation,
} = api;
