import React from 'react';
import { getStateWithItems, render, screen } from '../../../test-utils';
import { CartLink } from '../CartLink';
import { addToCart, removeFromCart, updateQuantity } from '../cartSlice';

describe('<CartLink />', () => {
  test('should contain a link', () => {
    render(<CartLink />);
    expect(screen.getByRole('link')).toBeInTheDocument();
  });
  test('should show text when there are no items', () => {
    render(<CartLink />);

    const link = screen.getByRole('link');

    expect(link).toHaveTextContent('Cart');
    expect(link).not.toHaveTextContent('0');
    expect(link).not.toHaveTextContent('1');
  });
  test('should show the correct number of items', () => {
    const state = getStateWithItems({ testItem: 1 });
    const { store } = render(<CartLink />, { state });
    const link = screen.getByRole('link');

    expect(link).toHaveTextContent('1');

    store.dispatch(updateQuantity({ id: 'testItem', quantity: 5 }));
    expect(link).toHaveTextContent('5');

    store.dispatch(addToCart('anotherItem'));
    expect(link).toHaveTextContent('6');

    store.dispatch(removeFromCart('testItem'));
    store.dispatch(removeFromCart('anotherItem'));
    expect(link).toHaveTextContent('Cart');
  });
});
