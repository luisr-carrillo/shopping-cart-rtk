import userEvent from '@testing-library/user-event';
import React from 'react';
import * as api from '../../../app/api';
import { RootState } from '../../../app/rootReducer';
import { getStateWithItems, render, screen, waitFor } from '../../../test-utils';
import { Cart } from '../Cart';

type Product = api.Product;

const checkoutSpy = jest.spyOn(api, 'checkout');

describe('<Cart />', () => {
  let state: RootState = getStateWithItems(
    { testItem: 3 },
    { testItem: { id: 'testItem', name: 'testItem', price: 10 } as Product },
  );

  test('An empty cart should not have any items', () => {
    render(<Cart />);

    const rows = screen.getAllByRole('row');

    expect(rows).toHaveLength(2);
    expect(screen.getByText('$0.00', { selector: '.total' })).toBeInTheDocument();
  });
  test('Cart should display correct total', () => {
    render(<Cart />, { state });

    expect(screen.getAllByRole('row')).toHaveLength(3);
    expect(screen.getByText('$30.00', { selector: '.total' })).toBeInTheDocument();
  });
  test('Updating product quantity should update total', () => {
    render(<Cart />, { state });

    const input = screen.getByLabelText(/Update testItem quantity/i);

    userEvent.clear(input);
    userEvent.tab();
    expect(screen.getByText('$0.00', { selector: '.total' })).toBeInTheDocument();

    userEvent.type(input, '4');
    userEvent.tab();
    expect(screen.getByText('$40.00', { selector: '.total' })).toBeInTheDocument();
  });
  test('Removing items should update total', () => {
    state = getStateWithItems(
      { carrots: 2, bunnies: 3 },
      {
        carrots: { id: 'carrots', name: 'carrots', price: 5.5 } as Product,
        bunnies: { id: 'bunnies', name: 'bunnies', price: 20.0 } as Product,
      },
    );

    render(<Cart />, { state });
    expect(screen.getByText('$71.00', { selector: '.total' })).toBeInTheDocument();

    const removeBunnies = screen.getByRole('button', { name: /remove bunnies/i });
    userEvent.click(removeBunnies);
    expect(screen.getByText('$11.00', { selector: '.total' })).toBeInTheDocument();

    const removeCarrots = screen.getByRole('button', { name: /remove carrots/i });
    userEvent.click(removeCarrots);
    expect(screen.getByText('$0.00', { selector: '.total' })).toBeInTheDocument();
  });
  test('cannot checkout with an empty cart', async () => {
    const err = 'Cart must not be empty';
    checkoutSpy.mockRejectedValueOnce(new Error(err));

    render(<Cart />);

    const checkout = screen.getByRole('button', { name: /checkout/i });
    const table = screen.getByRole('table');

    expect(table).not.toHaveClass('checkoutLoading');
    userEvent.click(checkout);

    expect(table).toHaveClass('checkoutLoading');
    expect(await screen.findByText(err)).toBeInTheDocument();
    expect(table).toHaveClass('checkoutError');
  });
  test('should clear items after checkout', async () => {
    checkoutSpy.mockResolvedValueOnce({ success: true });
    state = getStateWithItems(
      { carrots: 2, bunnies: 3 },
      {
        carrots: { id: 'carrots', name: 'carrots', price: 5.5 } as Product,
        bunnies: { id: 'bunnies', name: 'bunnies', price: 20.0 } as Product,
      },
    );

    render(<Cart />, { state });
    expect(screen.getByText('$71.00', { selector: '.total' })).toBeInTheDocument();
    expect(screen.getAllByRole('row')).toHaveLength(4);

    userEvent.click(screen.getByRole('button', { name: /checkout/i }));

    expect(await screen.findByText('$0.00', { selector: '.total' })).toBeInTheDocument();

    expect(screen.getAllByRole('row')).toHaveLength(2);
    expect(screen.getByRole('table')).not.toHaveClass('checkoutError');
  });
});
