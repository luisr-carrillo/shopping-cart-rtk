import userEvent from '@testing-library/user-event';
import React from 'react';
import mockProducts from '../../../../public/products.json';
import * as api from '../../../app/api';
import { render, screen, waitFor } from '../../../test-utils';
import { Products } from '../Products';

const getProductsSpy = jest.spyOn(api, 'getProducts');
getProductsSpy.mockResolvedValue(mockProducts);
describe('<Products />', () => {
  test('should list several products', async () => {
    render(<Products />);
    await waitFor(() => expect(getProductsSpy).toHaveBeenCalledTimes(1));

    const articles = screen.getAllByRole('article');
    expect(articles).toHaveLength(mockProducts.length);
  });
  test('Each individual product should contain a heading', async () => {
    render(<Products />);

    // eslint-disable-next-line no-restricted-syntax
    for await (const product of mockProducts) {
      expect(
        await screen.findByRole('heading', { name: product.name }),
      ).toBeInTheDocument();
    }

    // This could works too (?)
    const products = await screen.findAllByRole('heading');
    expect(products).toHaveLength(mockProducts.length);
  });
  test('should be able to add a banana to your cart', async () => {
    const { store } = render(<Products />);
    const btn = await screen.findByRole('button', { name: /bananas/i });

    userEvent.click(btn);
    expect(store.getState().cart.items['207']).toEqual(1);

    userEvent.click(btn);
    userEvent.click(btn);
    expect(store.getState().cart.items['207']).toEqual(3);
  });
});
