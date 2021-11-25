import { combineReducers } from '@reduxjs/toolkit';
import cartReducer from '../features/cart/cartSlice';
import productsReducer from '../features/products/productsSlice';

const rootReducer = combineReducers({
  cart: cartReducer,
  products: productsReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
