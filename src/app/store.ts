import { configureStore } from '@reduxjs/toolkit';
import rootReducer, { RootState } from './rootReducer';

export const store = configureStore({
  reducer: rootReducer,
});

export function getStoreWithState(preloadedState?: RootState) {
  return configureStore({ reducer: rootReducer, preloadedState });
}

export type AppDispatch = typeof store.dispatch;
