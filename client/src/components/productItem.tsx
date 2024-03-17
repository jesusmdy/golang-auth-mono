'use client'
import { Product } from '@/api/products';
import { toMoney } from '@/utils/toMoney';
import { FC, useMemo } from 'react';
import Button from './generic/button';
import { CartProduct, useCartItems, useSetCartItems } from '@/store/cart';
import { useLocalStorageState } from '@/hooks/useLocalStorage';
import _ from 'lodash';

const AddToCartButton: FC<{ product: Product }> = ({ product }) => {
  const setCartItems = useSetCartItems();
  const storeCartItems = useCartItems();
  const [cartItems, addCartItem] = useLocalStorageState('cart', [] as CartProduct[], setCartItems);

  const isInCart = useMemo(
    () => _.some(storeCartItems, (item) => item.ID === product.ID),
    [storeCartItems, product]
  );

  const handleAddToCart = () => {
    if (isInCart) return;
    addCartItem(
      _.uniq(
        [...cartItems, product],
        // 'ID'
      )
    );
  };

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={handleAddToCart}
      disabled={isInCart}
    >
      {
        isInCart ? 'In Cart' : 'Add to Cart'
      }
    </Button>
  )
};

const ProductItem: FC<{ product: Product }> = ({ product }) => {

  const price = toMoney(product.Price);

  return (
    <li
      className="bg-white shadow-md p-4 rounded-md border flex flex-col"
    >
      <img
        src={product.Image}
        alt={product.Title}
        className="w-full h-48 object-contain p-2"
      />
      <h3 className="text-sm flex-1">{product.Title}</h3>
      <div className="flex mt-4 items-center">
        <p className="text-xs font-bold flex-1">{price}</p>
        <div className="flex gap-2">
          <AddToCartButton product={product} />
          <Button variant="primary" size="sm">Buy</Button>
        </div>
      </div>
    </li>
  )
};

export default ProductItem;