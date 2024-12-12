import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/user/userSlice';
import authReducer from './slices/auth/authSlice';

const store = configureStore({
  reducer: {
    user: userReducer,
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;