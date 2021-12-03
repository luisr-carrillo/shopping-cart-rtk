import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import products from '../../../../public/products.json';
import * as api from '../../../app/api';
import { Product } from '../../../app/api';
import type { RootState } from '../../../app/rootReducer';
import { getStoreWithState } from '../../../app/store';
import cartReducer, {
  addToCart,
  CartState,
  checkoutCart,
  removeFromCart,
  updateQuantity,
} from '../cartSlice';
import { getMemoizedNumItems, getNumItems, getTotalPrice } from '../cartUtils';

type Action = {
  type: string;
  payload: { success: boolean } | undefined;
  error?: { message: string };
};

const mockStore = configureStore([thunk]);

jest.mock('../../../app/api', () => {
  return {
    getProducts() {
      return [];
    },
    checkout(items: api.CartItems = {}) {
      const empty = Object.keys(items).length === 0;
      if (empty) throw new Error('Must include cart items');
      if ((items.evilItem as number) > 0) throw new Error();
      if ((items.badItem as number) > 0) return { success: false };
      return { success: true };
    },
  };
});

const getStateWithItems = (items: Record<string, number>): RootState => ({
  products: { products: {} },
  cart: { checkoutState: 'READY', errorMsg: '', items },
});

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

describe('thunks', () => {
  describe('checkoutCart w/mocked dispatch', () => {
    test('should checkout', async () => {
      const dispatch = jest.fn();
      const state: RootState = {
        products: { products: {} },
        cart: { checkoutState: 'READY', errorMsg: '', items: { abc: 123 } },
      };
      const thunkMock = checkoutCart();
      await thunkMock(dispatch, () => state, undefined);

      const { calls } = dispatch.mock;
      expect(calls).toHaveLength(2);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(calls[0][0].type).toBe('cart/checkout/pending');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(calls[1][0].type).toBe('cart/checkout/fulfilled');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(calls[1][0].payload).toEqual({ success: true });
    });
    test('should fail with no items', async () => {
      const dispatch = jest.fn();
      const state: RootState = {
        products: { products: {} },
        cart: { checkoutState: 'READY', errorMsg: '', items: {} },
      };
      const thunkMock = checkoutCart();
      await thunkMock(dispatch, () => state, undefined);

      const { calls } = dispatch.mock;
      expect(calls).toHaveLength(2);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(calls[0][0].type).toBe('cart/checkout/pending');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(calls[1][0].type).toBe('cart/checkout/rejected');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(calls[1][0].payload).toBeUndefined();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(calls[1][0].error.message).toBe('Must include cart items');
    });
  });
  describe('checkoutCart w/mock redux', () => {
    test('should checkout', async () => {
      const store = mockStore({ cart: { items: { testItem: 3 } } });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await store.dispatch(checkoutCart() as any);
      const actions = store.getActions();
      const action0 = actions[0] as Action;
      const action1 = actions[1] as Action;

      expect(actions).toHaveLength(2);
      expect(action0.type).toBe('cart/checkout/pending');
      expect(action1.type).toBe('cart/checkout/fulfilled');
      expect(action1.payload).toEqual({ success: true });
    });
    test('should fail with no items', async () => {
      const store = mockStore({ cart: { items: {} } });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await store.dispatch(checkoutCart() as any);
      const actions = store.getActions();

      const action0 = actions[0] as Action;
      const action1 = actions[1] as Action;

      expect(actions).toHaveLength(2);
      expect(action0.type).toBe('cart/checkout/pending');
      expect(action1.type).toBe('cart/checkout/rejected');
      expect(action1.payload).toBeUndefined();
      expect(action1?.error?.message).toBe('Must include cart items');
    });
  });
  describe('checkoutCart w/full redux store', () => {
    test('should checkout with items', async () => {
      const state = getStateWithItems({ testItem: 3 });
      const store = getStoreWithState(state);

      await store.dispatch(checkoutCart());

      expect(store.getState().cart).toEqual({
        items: {},
        errorMsg: '',
        checkoutState: 'READY',
      });
    });
    test('should fail with no items', async () => {
      const state = getStateWithItems({});
      const store = getStoreWithState(state);

      await store.dispatch(checkoutCart());

      expect(store.getState().cart).toEqual({
        items: {},
        errorMsg: 'Must include cart items',
        checkoutState: 'ERROR',
      });
    });
    test('should handle an error response', async () => {
      const state = getStateWithItems({ badItem: 7 });
      const store = getStoreWithState(state);
      await store.dispatch(checkoutCart());
      expect(store.getState().cart).toEqual({
        items: { badItem: 7 },
        checkoutState: 'ERROR',
        errorMsg: '',
      });
    });
    test('should handle an empty error message', async () => {
      const state = getStateWithItems({ evilItem: 7 });
      const store = getStoreWithState(state);

      await store.dispatch(checkoutCart());

      expect(store.getState().cart).toEqual({
        items: { evilItem: 7 },
        errorMsg: '',
        checkoutState: 'ERROR',
      });
    });
    test('should be pending before checkout out', async () => {
      const state = getStateWithItems({ goodItem: 7 });
      const store = getStoreWithState(state);
      expect(store.getState().cart.checkoutState).toBe('READY');
      const action = store.dispatch(checkoutCart());

      expect(store.getState().cart.checkoutState).toBe('LOADING');
      await action;
      expect(store.getState().cart.checkoutState).toBe('READY');
    });
  });
});
