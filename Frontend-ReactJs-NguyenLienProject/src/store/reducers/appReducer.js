import { createSlice } from '@reduxjs/toolkit';

const initContentOfConfirmModal = {
    isOpen: false,
    messageId: '',
};

const initialState = {
    started: true,
    language: localStorage.getItem('lang') || 'vi',
    systemMenuPath: '/system/user-manage',
    contentOfConfirmModal: {
        isOpen: false,
        messageId: '',
    },
};

const appSlice = createSlice({
    name: 'app',
    initialState,
    reducers: {
        appStartUpComplete(state) {
            state.started = true;
        },
        setContentOfConfirmModal(state, action) {
            const { handleFunc, dataFunc, ...rest } = action.payload;
            state.contentOfConfirmModal = {
                ...state.contentOfConfirmModal,
                ...rest,
            };
        },
        // --- BỔ SUNG MỚI ---
        setLanguage(state, action) {
            state.language = action.payload;
            localStorage.setItem('lang', action.payload);  // Lưu vào localStorage
        },
    },
});

export const { appStartUpComplete, setContentOfConfirmModal, setLanguage } = appSlice.actions;
export default appSlice.reducer;

