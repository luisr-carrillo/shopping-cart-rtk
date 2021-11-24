import { createSlice, createSelector, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/types';

export interface CartState {
  items: { [productID: string]: number };
}

const initialState: CartState = { items: {} };

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart(state, action: PayloadAction<string>) {
      const id = action.payload;
      if (state.items[id]) {
        state.items[id] += 1;
      } else {
        state.items[id] = 1;
      }
    },
  },
});

export const { addToCart } = cartSlice.actions;
export default cartSlice.reducer;

export function getNumItems(state: RootState) {
  let numItem = 0;

  const { items } = state.cart;

  Object.values(items).forEach((itemCount) => {
    numItem += itemCount;
  });

  return numItem;
}

export const getMemoizedNumItems = createSelector(
  (state: RootState) => state.cart.items,
  (items) => {
    let numItem = 0;

    Object.values(items).forEach((itemCount) => {
      numItem += itemCount;
    });

    return numItem;
  },
);
