import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import rootReducer from './store/reducers/rootReducer';
import actionTypes from './store/actions/actionTypes';

const environment = process.env.NODE_ENV || 'development';
const isDevelopment = environment === 'development';

const persistConfig = {
    key: 'root',
    storage,
    whitelist: ['admin', 'app'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const reduxStore = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [
                    actionTypes.APP_START_UP_COMPLETE,
                    'persist/PERSIST',
                    'persist/REHYDRATE'
                ],
                ignoredPaths: ['register'],
            },
        }).concat(isDevelopment ? [require('redux-logger').logger] : []),

    devTools: isDevelopment,
});

export const dispatch = reduxStore.dispatch;
export const persistor = persistStore(reduxStore);

export default reduxStore;