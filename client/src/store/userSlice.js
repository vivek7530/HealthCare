import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
  name: 'user',
  initialState: {
    currentUser: null,
    isLoggedIn: false,
    loading: false,
    error: null
  },
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.loading = false;
      state.isLoggedIn = true;
      state.currentUser = action.payload;
      state.error = null;
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.isLoggedIn = false;
      state.currentUser = null;
      state.error = action.payload;
    },
    logout: (state) => {
      state.currentUser = null;
      state.isLoggedIn = false;
      state.error = null;
    },
    updateUser: (state, action) => {
      state.currentUser = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    }
  }
});

export const { loginStart, loginSuccess, loginFailure, logout, updateUser, clearError } = userSlice.actions;
export default userSlice.reducer;
