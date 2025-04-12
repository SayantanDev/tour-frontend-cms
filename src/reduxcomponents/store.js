import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import rootReducer from "./slices/rootReducer";

const persistConfig = {
    key: 'root',
    storage,
    safelist: ['loggedinUser', 'sideOpen', 'configLabels', 'tokens', 'inquiries','package,notification',"queries"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);


const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                // Ignore these action types
                ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
                // Ignore these paths in the state
                ignoredPaths: ['register'], // Adjust based on your state structure
                
            },
        }),
});

const persistor = persistStore(store);
export { store, persistor };