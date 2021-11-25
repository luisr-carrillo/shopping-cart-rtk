import classNames from 'classnames';
import { FocusEvent, FormEvent } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import styles from './Cart.module.css';
import { checkoutCart, removeFromCart, updateQuantity } from './cartSlice';
import { getTotalPrice } from './cartUtils';

export const Cart = () => {
  const dispatch = useAppDispatch();
  const { products } = useAppSelector((state) => state.products);
  const { items, checkoutState, errorMsg } = useAppSelector((state) => state.cart);
  const totalPrice = useAppSelector(getTotalPrice);
  const onQuantityChanged = (e: FocusEvent<HTMLInputElement>, id: string) => {
    const quantity = parseInt(e.target.value, 10) || 0;
    dispatch(updateQuantity({ id, quantity }));
  };

  const onCheckout = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await dispatch(checkoutCart());
  };

  const tableClasses = classNames({
    [styles.table as string]: true,
    [styles.checkoutError as string]: checkoutState === 'ERROR',
    [styles.checkoutLoading as string]: checkoutState === 'LOADING',
  });

  return (
    <main className="page">
      <h1>Shopping Cart</h1>
      <table className={tableClasses}>
        <thead>
          <tr>
            <th>Product</th>
            <th>Quantity</th>
            <th>Total</th>
            <th>Remove</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(items).map(([id, quantity]) => {
            const product = products[id];
            if (!product) return;

            const { id: productId, name, price } = product;

            return (
              <tr key={productId}>
                <td>{name}</td>
                <td>
                  <input
                    type="text"
                    className={styles.input}
                    defaultValue={quantity}
                    onBlur={(e) => onQuantityChanged(e, productId)}
                  />
                </td>
                <td>${price}</td>
                <td>
                  <button
                    type="button"
                    aria-label={`Remove ${name} from Shopping Cart`}
                    onClick={() => {
                      dispatch(removeFromCart(productId));
                    }}
                  >
                    X
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr>
            <td>Total</td>
            <td />
            <td className={styles.total}>${totalPrice}</td>
            <td />
          </tr>
        </tfoot>
      </table>
      <form onSubmit={onCheckout}>
        {checkoutState === 'ERROR' && errorMsg && (
          <p className={styles.errorBox}>{errorMsg}</p>
        )}
        <button className={styles.button} type="submit">
          Checkout
        </button>
      </form>
    </main>
  );
};
