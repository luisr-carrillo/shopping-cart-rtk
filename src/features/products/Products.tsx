import { useEffect } from 'react';
import { getProducts } from '../../app/api';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import styles from './Products.module.css';
import { receivedProducts } from './productsSlice';

export const Products = () => {
  const dispatch = useAppDispatch();
  const { products } = useAppSelector((state) => state.products);

  useEffect(() => {
    (async () => {
      const data = await getProducts();
      dispatch(receivedProducts(data));
    })();
  }, [dispatch]);

  return (
    <main className="page">
      <ul className={styles.products}>
        {Object.values(products).map((product) => (
          <li key={product.id}>
            <article className={styles.product}>
              <figure>
                <img src={product.imageURL} alt={product.imageAlt} />
                <figcaption className={styles.caption}>{product.imageCredit}</figcaption>
              </figure>
              <div>
                <h1>{product.name}</h1>
                <p>{product.description}</p>
                <p>${product.price}</p>
                <button type="button">Add to Cart 🛒</button>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </main>
  );
};
