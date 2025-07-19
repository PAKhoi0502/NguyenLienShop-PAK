//src\store\reducers\rootReducer.js
import { combineReducers } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';

import appReducer from './appReducer';
import adminReducer from './adminReducer';
// import userReducer from './userReducer'; // Xóa nếu không dùng

const persistCommonConfig = {
    storage,
    stateReconciler: autoMergeLevel2,
};

const adminPersistConfig = {
    ...persistCommonConfig,
    key: 'admin',
    whitelist: ['isLoggedIn', 'adminInfo'],
};

const rootReducer = combineReducers({
    admin: persistReducer(adminPersistConfig, adminReducer),
    app: appReducer,
    // user: userReducer, // Xóa nếu không dùng
});

export default rootReducer;