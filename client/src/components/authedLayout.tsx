'use client';
import useAuth, { AUTH_STATUS_LIST } from '@/hooks/useAuth';
import { useLocalStorage, useLocalStorageState } from '@/hooks/useLocalStorage';
import { useCartItems, useSetCartItems } from '@/store/cart';
import { useRouter } from 'next/navigation';
import { FC, PropsWithChildren, useEffect } from 'react';

export const Providers: FC<PropsWithChildren<any>> = ({ children }) => {
  const cart = useCartItems();
  const setCart = useSetCartItems();

  // useLocalStorage(cart, setCart, 'cart');
  useLocalStorageState(
    'cart',
    cart,
  );

  return children;
}

const AuthedLayout: FC<PropsWithChildren<any>> = ({ children }) => {
  const { status } = useAuth();
  const router = useRouter();

  useEffect(
    () => {
      if (status === AUTH_STATUS_LIST.pending) return;
      if (status === AUTH_STATUS_LIST.unauthenticated) {
        router.push('/auth/signin');
      }
    },
    [status]
  )

  if (status === AUTH_STATUS_LIST.pending) return 'Loading...';
  return (
    <Providers>
      {children}
    </Providers>
  );
};

export default AuthedLayout;