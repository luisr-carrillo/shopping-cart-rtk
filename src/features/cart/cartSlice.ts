import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { checkout } from '../../app/api';
import { RootState } from '../../app/rootReducer';

type CheckoutState = 'LOADING' | 'READY' | 'ERROR';

export interface CartState {
  items: { [productID: string]: number };
  checkoutState: CheckoutState;
  errorMsg: string;
}

const initialState: CartState = { items: {}, checkoutState: 'READY', errorMsg: '' };

export const checkoutCart = createAsyncThunk('cart/checkout', async (_, thunkAPI) => {
  const { items } = (thunkAPI.getState() as RootState).cart;
  const res = await checkout(items);

  return res;
});

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
    removeFromCart(state, action: PayloadAction<string>) {
      delete state.items[action.payload];
    },
    updateQuantity(state, action: PayloadAction<{ id: string; quantity: number }>) {
      const { id, quantity } = action.payload;
      state.items[id] = quantity;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(checkoutCart.pending, (state) => {
      state.checkoutState = 'LOADING';
    });
    builder.addCase(
      checkoutCart.fulfilled,
      (state, action: PayloadAction<{ success: boolean }>) => {
        const { success } = action.payload;
        if (!success) {
          state.checkoutState = 'ERROR';
          return;
        }

        state.checkoutState = 'READY';
        state.items = {};
      },
    );
    builder.addCase(checkoutCart.rejected, (state, action) => {
      state.checkoutState = 'ERROR';
      state.errorMsg = action.error.message || '';
    });
  },
});

const { actions, reducer } = cartSlice;
export const { addToCart, removeFromCart, updateQuantity } = actions;
export default reducer;
