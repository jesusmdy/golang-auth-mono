'use client';

import useAuth from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { FC, PropsWithChildren, useEffect } from 'react';

const AuthLayout: FC<PropsWithChildren<any>> = ({ children }) => {
  const { status, statusList } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === statusList.authenticated) {
      router.push('/');
    }
  }, [status]);
    
  return (
    <div className="w-full max-w-screen-md mx-auto">
      {children}
    </div>
  )
};

export default AuthLayout;