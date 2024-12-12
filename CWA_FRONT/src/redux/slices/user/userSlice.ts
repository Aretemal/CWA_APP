import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { User, AppUser, UserState } from '../../../types/user';

const initialState: UserState = {
  userData: null,
  status: 'idle',
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      console.log('Setting user with data:', action.payload);
      const appUser: AppUser = {
        ...action.payload,
        isAdmin: action.payload.role === 'ADMIN',
      };
      state.userData = appUser;
      state.status = 'succeeded';
      state.error = null;
    },
    clearUser: (state) => {
      state.userData = null;
      state.status = 'idle';
      state.error = null;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.status = 'failed';
      state.error = action.payload;
    }
  }
});

export const { setUser, clearUser, setError } = userSlice.actions;
export default userSlice.reducer; 