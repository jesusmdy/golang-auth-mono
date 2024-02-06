'use client';
import useAuth, { AUTH_STATUS_LIST } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { FC, PropsWithChildren, useEffect } from 'react';

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
  return children;
};

export default AuthedLayout;