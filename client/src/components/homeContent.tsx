'use client';

import { useUser } from '@/store/user';
import { FC } from 'react';

const HomeContent: FC = () => {
  const user = useUser();
  return (
    <div>
      <h1 className="text-2xl">Welcome</h1>
      <div className="text-xl">
        {
          user
            ? `Hello, ${user.username}`
            : 'Hello, guest'
        }
      </div>
    </div>
  )
};

export default HomeContent;