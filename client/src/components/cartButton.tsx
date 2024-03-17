'use client';
import { FC, Fragment, useMemo } from 'react';
import Button from './generic/button';
import { CartProduct, useCartItems, useRemoveItem, useSetCartItems } from '@/store/cart';
import { useLocalStorageState } from '@/hooks/useLocalStorage';
import { toMoney } from '@/utils/toMoney';
import { Product } from '@/api/products';
import _ from 'lodash';
import { useUser } from '@/store/user';
import classNames from 'classnames';

const CartIcon: FC = () => (
  <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
  </svg>
);

const CartItem: FC<{
  item: CartProduct;
}> = ({ item }) => {
  const setCartItems = useSetCartItems();
  const [cartItems, setCart] = useLocalStorageState('cart', [] as CartProduct[], data => {
    setCartItems(data);
  });

  const removeItem = () => {
    setCart(
      _.remove(cartItems, (cartItem) => cartItem.ID !== item.ID)
    );
  }

  return (
    <li className="flex items-center">
      <img src={item.Image} alt={item.Title} className="w-20 h-20 object-contain" />
      <div className="flex-1 flex flex-col">
        <p className="text-sm">{item.Title}</p>
        <p className=" font-semibold">{toMoney(item.Price)}</p>
        <div className="mt-2">
          <Button variant="danger-outline" size="sm" onClick={removeItem}>Remove</Button>
        </div>
      </div>
    </li>
  )
};

const CheckoutSection: FC = () => {
  const user = useUser();
  const cartItems = useCartItems();
  const setCartItems = useSetCartItems();
  const [, setCart] = useLocalStorageState('cart', [] as CartProduct[], setCartItems);
  const total = cartItems.reduce((acc, item) => acc + item.Price, 0);

  const isOverBalance = useMemo(
    () => {
      if (!user) return false;
      return user.balance < total;
    },
    [user, total]
  );

  if (!user) return null;
  return (
    <div className="p-4 border-t">
      <div className="flex flex-col gap-2 my-4">
        <div className="flex justify-between">
          <p className="text-sm">Total</p>
          <p
            className={
              classNames(
                'font-semibold',
                {
                  'text-red-500': isOverBalance
                }
              )
            }
          >
            {toMoney(total)}
          </p>
        </div>
        <div className="flex justify-between">
          <p className="text-sm">Your balance</p>
          <p className="text-sm font-semibold">{toMoney(user.balance)}</p>
        </div>
      </div>
      <div className="mt-4">
        <Button
          variant="primary"
          size="sm"
          onClick={() => setCart([])}
          disabled={isOverBalance}
        >
          Purchase
        </Button>
      </div>
    </div>
  )
}

const CartButton: FC = () => {
  const [isOpen, setIsOpen] = useLocalStorageState('cartIsOpen', false);
  const cartItems = useCartItems();
  return (
    <Fragment>
      <Button
        onClick={() => setIsOpen(!isOpen)}
      >
        <CartIcon />
        <span className="ml-2">{cartItems.length}</span>
      </Button>
      <div
        className="fixed inset-0 w-screen h-screen bg-black/50 z-10"
        style={{ display: isOpen ? 'block' : 'none' }}
        onClick={() => setIsOpen(false)}
      >
        <div
          className="absolute right-0 top-0 bottom-0 h-screen w-[30vw] bg-white shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-4 border-b">
            <p className="text-sm font-semibold">Your cart</p>
          </div>
          <div className="p-4">
            {
              cartItems && (
                <Fragment>
                  <ul className="flex flex-col gap-4">
                    {
                      cartItems.map((item, index) => <CartItem key={index} item={item} />)
                    
                    }
                  </ul>
                </Fragment>
              )
            }
          </div>
          <CheckoutSection />
        </div>
      </div>
    </Fragment>
  )
}

export default CartButton;