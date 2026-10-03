import { createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE_URL, getAuthConfig } from '../utils/api';

const backendURL = API_BASE_URL;

const initialState = {
  userExercises: {},
  status: 'idle',
  error: null,
};

const exercisesSlice = createSlice({
  name: 'exercises',
  initialState,
  reducers: {
    fetchExercisesSuccess: (state, action) => {
      const { userID, data } = action.payload;
      state.userExercises[userID] = data;
      state.status = 'succeeded';
    },
    fetchExercisesFailure: (state, action) => {
      state.error = action.payload;
      state.status = 'failed';
    },
    addExerciseSuccess: (state, action) => {
      const { userID, data } = action.payload;
      if (!state.userExercises[userID]) {
        state.userExercises[userID] = [];
      }
      state.userExercises[userID].push(data);
      state.status = 'succeeded';
    },
    deleteExerciseSuccess: (state, action) => {
      const { userID, exerciseId } = action.payload;
      if (state.userExercises[userID]) {
        state.userExercises[userID] = state.userExercises[userID].filter(
          (exercise) => exercise._id !== exerciseId
        );
      }
      state.status = 'succeeded';
    },
    setStatus: (state, action) => {
      state.status = action.payload;
    },
  },
});

export const fetchExercises = (userID) => async (dispatch) => {
  dispatch(setStatus('loading'));
  try {
    const response = await axios.get(
      `${backendURL}/api/exercises/${userID}/exercises_list`,
      getAuthConfig()
    );
    dispatch(fetchExercisesSuccess({ userID, data: response.data.Exercises }));
  } catch (error) {
    dispatch(fetchExercisesFailure(error.toString()));
  }
};

export const addExercise = (userID, newExerciseData) => async (dispatch) => {
  try {
    const response = await axios.post(
      `${backendURL}/api/exercises/${userID}/add`,
      newExerciseData,
      getAuthConfig()
    );
    dispatch(addExerciseSuccess({ userID, data: response.data.newExercise })); // Assuming the API returns the newly added exercise
    return true;
  } catch (error) {
    console.error('Error adding exercise:', error);
    dispatch(fetchExercisesFailure(error.toString())); // Handle errors correctly
    return false;
  }
};

export const deleteExercise = (userID, exerciseId) => async (dispatch) => {
  try {
    await axios.delete(
      `${backendURL}/api/exercises/${userID}/exercises_list/${exerciseId}`,
      getAuthConfig()
    );
    dispatch(deleteExerciseSuccess({ userID, exerciseId }));
  } catch (error) {
    console.error('Error deleting exercise:', error);
    dispatch(fetchExercisesFailure(error.toString())); // Handle errors correctly
  }
};

export const {
  fetchExercisesSuccess,
  fetchExercisesFailure,
  addExerciseSuccess,
  deleteExerciseSuccess,
  setStatus,
} = exercisesSlice.actions;

export default exercisesSlice.reducer;
