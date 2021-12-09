import { render, RenderOptions } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import { Product } from './app/api';
import { RootState } from './app/rootReducer';
import { getStoreWithState } from './app/store';

type Options = Omit<RenderOptions, 'wrapper'> & { state?: RootState };

const customRender = (ui: React.ReactElement, options?: Options) => {
  const store = getStoreWithState(options?.state);

  const utils = render(
    <Provider store={store}>
      <Router>{ui}</Router>
    </Provider>,
    { ...options },
  );

  return { store, ...utils };
};
export const getStateWithItems = (
  items: Record<string, number>,
  products: Record<string, Product> = {},
): RootState => ({
  products: { products },
  cart: { checkoutState: 'READY', errorMsg: '', items },
});

export * from '@testing-library/react';
export { customRender as render };
