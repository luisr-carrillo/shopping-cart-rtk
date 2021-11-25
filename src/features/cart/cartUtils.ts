import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../../app/rootReducer';

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

export const getTotalPrice = createSelector(
  (state: RootState) => state.cart.items,
  (state: RootState) => state.products.products,
  (items, products) => {
    let total = 0;

    Object.keys(items).forEach((id) => {
      const product = products[id];
      const item = items[id];
      if (!product || !item) return;

      total += product.price * item;
    });

    return total.toFixed(2);
  },
);
