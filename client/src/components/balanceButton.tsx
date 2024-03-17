'use client';

import { useUser } from '@/store/user';
import { toMoney } from '@/utils/toMoney';
import { FC, useMemo } from 'react';

const BalanceButton: FC = () => {
  const user = useUser();

  const formattedBalance = useMemo(
    () => {
      if (user?.balance) {
        if (user.balance === 0) {
          return 'Add funds';
        }
        return `Wallet: ${toMoney(user.balance)}`;
      }
      return 'Add funds';
    },
    [user]
  );

  if (!user) {
    return null;
  }

  return (
    <button className="text-xs border px-4 py-2 rounded border-gray-100">{formattedBalance}</button>
  )
};

export default BalanceButton;