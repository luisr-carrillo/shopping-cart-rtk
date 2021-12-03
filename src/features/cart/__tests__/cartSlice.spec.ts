import cartReducer, {
  addToCart,
  CartState,
  removeFromCart,
  updateQuantity,
} from '../cartSlice';
import type { RootState } from '../../../app/rootReducer';
import { getMemoizedNumItems, getNumItems, getTotalPrice } from '../cartUtils';
import products from '../../../../public/products.json';
import { Product } from '../../../app/api';

describe('cartReducer', () => {
  test('an empty action', () => {
    const initialState = undefined;
    const action = { type: '' };
    const state = cartReducer(initialState, action);
    expect(state).toEqual({
      checkoutState: 'READY',
      errorMsg: '',
      items: {},
    });
  });
  test('addToCart', () => {
    const initialState = undefined;
    const action = addToCart('abc');
    let state = cartReducer(initialState, action);
    expect(state).toEqual({
      checkoutState: 'READY',
      errorMsg: '',
      items: { abc: 1 },
    });
    state = cartReducer(state, action);
    state = cartReducer(state, action);
    expect(state).toEqual({
      checkoutState: 'READY',
      errorMsg: '',
      items: { abc: 3 },
    });
  });
  test('removeFromCart', () => {
    const initialState: CartState = {
      checkoutState: 'READY',
      errorMsg: '',
      items: {
        abc: 1,
        def: 3,
      },
    };
    const action = removeFromCart('abc');
    const state = cartReducer(initialState, action);
    expect(state).toEqual({
      checkoutState: 'READY',
      errorMsg: '',
      items: { def: 3 },
    });
  });
  test('updateQuantity', () => {
    const initialState: CartState = {
      checkoutState: 'READY',
      errorMsg: '',
      items: {
        abc: 1,
        def: 3,
      },
    };
    const action = updateQuantity({ id: 'def', quantity: 5 });
    const state = cartReducer(initialState, action);
    expect(state).toEqual({
      checkoutState: 'READY',
      errorMsg: '',
      items: { abc: 1, def: 5 },
    });
  });
});

describe('selectors', () => {
  describe('getNumItems', () => {
    test('should return 0 with no items', () => {
      const cart: CartState = {
        checkoutState: 'READY',
        errorMsg: '',
        items: {},
      };

      const res = getNumItems({ cart } as RootState);
      expect(res).toEqual(0);
    });
    test('should add up the total', () => {
      const cart: CartState = {
        checkoutState: 'READY',
        errorMsg: '',
        items: { abc: 3, def: 3 },
      };

      const res = getNumItems({ cart } as RootState);
      expect(res).toEqual(6);
    });
  });
  describe('getMemoizedNumItems', () => {
    test('should return 0 with no items', () => {
      const cart: CartState = {
        checkoutState: 'READY',
        errorMsg: '',
        items: {},
      };

      const res = getMemoizedNumItems({ cart } as RootState);
      expect(res).toEqual(0);
    });
    test('should add up the total', () => {
      const cart: CartState = {
        checkoutState: 'READY',
        errorMsg: '',
        items: { abc: 3, def: 3 },
      };

      const res = getMemoizedNumItems({ cart } as RootState);
      expect(res).toEqual(6);
    });
    test('should not compute again with the same state', () => {
      const cart: CartState = {
        checkoutState: 'READY',
        errorMsg: '',
        items: { abc: 3, def: 3 },
      };

      getMemoizedNumItems.resetRecomputations();
      getMemoizedNumItems({ cart } as RootState);
      expect(getMemoizedNumItems.recomputations()).toEqual(1);
      getMemoizedNumItems({ cart } as RootState);
      expect(getMemoizedNumItems.recomputations()).toEqual(1);
    });
    test('should recompute with new state', () => {
      const cart: CartState = {
        checkoutState: 'READY',
        errorMsg: '',
        items: { abc: 3, def: 3 },
      };

      getMemoizedNumItems.resetRecomputations();
      getMemoizedNumItems({ cart } as RootState);
      expect(getMemoizedNumItems.recomputations()).toEqual(1);

      cart.items = { abc: 2 };
      getMemoizedNumItems({ cart } as RootState);
      expect(getMemoizedNumItems.recomputations()).toEqual(2);
    });
  });
  describe('getTotalPrice', () => {
    test('should return 0 with empty cart', () => {
      const state: RootState = {
        cart: { checkoutState: 'READY', errorMsg: '', items: {} },
        products: { products: {} },
      };

      const result = getTotalPrice(state);
      expect(result).toEqual('0.00');
    });
    test('should add up the totals', () => {
      const prod0 = products[0] as Product;
      const prod1 = products[1] as Product;

      const state: RootState = {
        cart: {
          checkoutState: 'READY',
          errorMsg: '',
          items: {
            [prod0.id]: 3,
            [prod1.id]: 4,
          },
        },
        products: {
          products: {
            [prod0.id]: prod0,
            [prod1.id]: prod1,
          },
        },
      };

      const result = getTotalPrice(state);
      expect(result).toEqual('43.23');
    });
    test('should not compute again with the same state', () => {
      const prod0 = products[0] as Product;
      const prod1 = products[1] as Product;

      const state: RootState = {
        cart: {
          checkoutState: 'READY',
          errorMsg: '',
          items: {
            [prod0.id]: 3,
            [prod1.id]: 4,
          },
        },
        products: {
          products: {
            [prod0.id]: prod0,
            [prod1.id]: prod1,
          },
        },
      };

      getTotalPrice.resetRecomputations();
      const result = getTotalPrice(state);
      expect(result).toEqual('43.23');
      expect(getTotalPrice.recomputations()).toEqual(1);
      getTotalPrice(state);
      expect(getTotalPrice.recomputations()).toEqual(1);
    });
    test('should recompute with new products', () => {
      const prod0 = products[0] as Product;
      const prod1 = products[1] as Product;
      const prod2 = products[2] as Product;

      const state: RootState = {
        cart: {
          checkoutState: 'READY',
          errorMsg: '',
          items: {
            [prod0.id]: 3,
            [prod1.id]: 4,
          },
        },
        products: {
          products: {
            [prod0.id]: prod0,
            [prod1.id]: prod1,
          },
        },
      };

      getTotalPrice.resetRecomputations();
      let result = getTotalPrice(state);
      expect(result).toEqual('43.23');
      expect(getTotalPrice.recomputations()).toEqual(1);
      state.products.products = {
        [prod0.id]: prod0,
        [prod1.id]: prod1,
        [prod2.id]: prod2,
      };
      result = getTotalPrice({ ...state });
      expect(result).toEqual('43.23');
      expect(getTotalPrice.recomputations()).toEqual(2);
    });
    test('should recompute when cart changes', () => {
      const prod0 = products[0] as Product;
      const prod1 = products[1] as Product;

      const state: RootState = {
        cart: {
          checkoutState: 'READY',
          errorMsg: '',
          items: {
            [prod0.id]: 3,
            [prod1.id]: 4,
          },
        },
        products: {
          products: {
            [prod0.id]: prod0,
            [prod1.id]: prod1,
          },
        },
      };

      getTotalPrice.resetRecomputations();
      let result = getTotalPrice(state);
      expect(result).toEqual('43.23');
      expect(getTotalPrice.recomputations()).toEqual(1);
      state.cart.items = {};
      result = getTotalPrice({ ...state });
      expect(result).toEqual('0.00');
      expect(getTotalPrice.recomputations()).toEqual(2);
    });
  });
});
