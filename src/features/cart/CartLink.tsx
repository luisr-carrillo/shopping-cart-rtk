import React from 'react';
import { Link } from 'react-router-dom';
import styles from './CartLink.module.css';

export const CartLink = () => {
  return (
    <Link to="/cart" className={styles.link}>
      <span className={styles.text}>🛒&nbsp;&nbsp;Cart</span>
    </Link>
  );
};
