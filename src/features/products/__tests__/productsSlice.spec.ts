import productsReducer, { receivedProducts } from '../productsSlice';
import products from '../../../../public/products.json';

describe('productsReducer', () => {
  test('should return the initial state when passed an empty action', () => {
    const initialState = undefined;
    const action = { type: '' };
    const result = productsReducer(initialState, action);

    expect(result).toEqual({ products: {} });
  });
  test('should convert the products received to an object', () => {
    const initialState = undefined;
    const action = receivedProducts(products);
    const result = productsReducer(initialState, action);

    expect(Object.keys(result.products)).toHaveLength(products.length);
    products.forEach((product) => {
      expect(result.products[product.id]).toEqual(product);
    });
  });
  test('should not allow the same product to be added more than once', () => {
    const initialState = undefined;
    const action = receivedProducts(products);
    let result = productsReducer(initialState, action);

    expect(Object.keys(result.products)).toHaveLength(products.length);
    products.forEach((product) => {
      expect(result.products[product.id]).toEqual(product);
    });

    result = productsReducer(result, action);
    expect(Object.keys(result.products)).toHaveLength(products.length);
  });
  test('should allow multiple products to be received at different times', () => {
    const initialState = undefined;
    const action = receivedProducts(products.slice(0, 2));
    let result = productsReducer(initialState, action);
    expect(Object.keys(result.products)).toHaveLength(2);

    const secondAction = receivedProducts(products.slice(2, 4));
    result = productsReducer(result, secondAction);
    expect(Object.keys(result.products)).toHaveLength(4);
  });
});
