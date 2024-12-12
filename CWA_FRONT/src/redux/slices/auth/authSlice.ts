import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
    accessToken: string | null;
}

const initialState: AuthState = {
    accessToken: localStorage.getItem('access_token') || null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setAccessToken(state, action: PayloadAction<string | null>) {
            state.accessToken = action.payload;
            if (action.payload) {
                localStorage.setItem('access_token', action.payload);
            } else {
                localStorage.removeItem('access_token');
            }
        },
    },
});

export const { setAccessToken } = authSlice.actions;
export default authSlice.reducer;