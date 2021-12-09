import { combineReducers } from '@reduxjs/toolkit';
// eslint-disable-next-line import/no-cycle
import cartReducer from '../features/cart/cartSlice';
import productsReducer from '../features/products/productsSlice';

const rootReducer = combineReducers({
  cart: cartReducer,
  products: productsReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
