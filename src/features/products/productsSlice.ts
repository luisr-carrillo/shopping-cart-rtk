import { createSlice } from '@reduxjs/toolkit';
import { Product } from '../../app/api';

export interface ProductsState {
  products: { [id: string]: Product };
}

const initialState: ProductsState = {
  products: {},
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {},
});

export default productsSlice.reducer;
