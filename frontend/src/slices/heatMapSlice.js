import { createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE_URL, getAuthConfig } from '../utils/api';

const backendURL = API_BASE_URL;

const initialState = {
  userMonthData: {},
  status: 'idle',
  error: null,
};

const heatMapSlice = createSlice({
  name: 'heatmap',
  initialState,
  reducers: {
    fetchMonthDataSuccess: (state, action) => {
      // Setting monthData to be empty array to avoid overriding backend data
      const { userID, data } = action.payload;
      state.userMonthData[userID] = data;
      state.status = 'succeeded';
    },
    fetchMonthDataFailure: (state, action) => {
      state.error = action.payload;
      state.status = 'failed';
    },
    addExerciseSuccess: (state, action) => {
      // Use backend data to update state after adding exercise
      const { userID, data } = action.payload;
      state.userMonthData[userID] = data;
      state.status = 'succeeded';
    },
    addExerciseFailure: (state, action) => {
      state.error = action.payload;
      state.status = 'failed';
    },
    setStatus: (state, action) => {
      state.status = action.payload;
    },
  },
});

// Async thunk to fetch month data
export const fetchMonthData = (userID, selectedMonth) => async (dispatch) => {
  dispatch(setStatus('loading'));
  try {
    const response = await axios.get(
      `${backendURL}/api/exercises/${userID}/data/${selectedMonth}`,
      getAuthConfig()
    );
    dispatch(fetchMonthDataSuccess({ userID, data: response.data }));
  } catch (error) {
    dispatch(fetchMonthDataFailure(error.toString()));
  }
};

// Async thunk to add exercise
export const addExercise = (userID, newExerciseData) => async (dispatch) => {
  dispatch(setStatus('loading'));
  try {
    await axios.post(
      `${backendURL}/api/exercises/${userID}/track-exercise`,
      newExerciseData,
      getAuthConfig()
    );
    const selectedMonth = new Date(newExerciseData.date).toLocaleString('default', {
      month: 'long',
    });

    // Fetch updated month data after adding exercise
    const updatedMonthResponse = await axios.get(
      `${backendURL}/api/exercises/${userID}/data/${selectedMonth}`,
      getAuthConfig()
    );

    // Dispatch success with updated month data
    dispatch(addExerciseSuccess({ userID, data: updatedMonthResponse.data }));
    dispatch(setStatus('succeeded'));
    return true;
  } catch (error) {
    dispatch(addExerciseFailure(error.toString()));
    dispatch(setStatus('failed'));
    return false;
  }
};

export const {
  fetchMonthDataSuccess,
  fetchMonthDataFailure,
  addExerciseSuccess,
  addExerciseFailure,
  setStatus,
} = heatMapSlice.actions;

export default heatMapSlice.reducer;
