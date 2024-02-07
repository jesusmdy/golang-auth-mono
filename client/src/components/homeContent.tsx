'use client';

import { useUser } from '@/store/user';
import { FC } from 'react';
import ProductList from './productList';

const HomeContent: FC = () => {
  const user = useUser();
  return (
    <div>
      <h1 className="text-2xl my-4">
        {
          `Welcome ${user ? user.fullName : 'guest'}!`
        }
      </h1>
      <ProductList />
    </div>
  )
};

export default HomeContent;