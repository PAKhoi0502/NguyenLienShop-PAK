// src/store/reducers/adminReducer.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    isLoggedIn: false,
    adminInfo: null,
    error: null,
    success: null,
};

const adminSlice = createSlice({
    name: 'admin',
    initialState,
    reducers: {
        adminLoginSuccess(state, action) {
            state.isLoggedIn = true;
            state.adminInfo = action.payload; // Chỉ chứa object tuần tự hóa
            state.error = null;
            state.success = 'Đăng ký/Đăng nhập thành công!';
        },
        adminLoginFail(state, action) {
            state.isLoggedIn = false;
            state.adminInfo = null;
            state.error = action.payload || 'Đăng nhập thất bại!';
            state.success = null;
        },
        processLogout(state) {
            state.isLoggedIn = false;
            state.adminInfo = null;
            state.error = null;
            state.success = null;
        },
    },
});

export const { adminLoginSuccess, adminLoginFail, processLogout } = adminSlice.actions;
export default adminSlice.reducer;