import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { IUser, IAuthState } from '../types/auth.types';

const initialState: IAuthState = {
    user: null,
    isAuthenticated: false,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (
            state,
            action: PayloadAction<{ user: IUser }>
        ) => {
            state.user = action.payload.user;
            state.isAuthenticated = true;
        },
        logout: (state) => {
            state.user = null;
            state.isAuthenticated = false;
        },
    },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
