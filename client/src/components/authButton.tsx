'use client';
import useAuth, { AUTH_STATUS_LIST } from '@/hooks/useAuth';
import useClickOutside from '@/hooks/useClickOutside';
import useDisclosure from '@/hooks/useDisclosure';
import { useUser } from '@/store/user';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FC, useRef } from 'react';

const AuthButton: FC = () => {
  const { status, logout } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const router = useRouter();
  const user = useUser();

  const menuRef = useRef<HTMLDivElement>(null);

  useClickOutside(menuRef, onClose);

  if (status === AUTH_STATUS_LIST.unauthenticated) {
    return (
      <Link href="/auth/signin" className="bg-blue-500 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded">
        Access
      </Link>
    )
  }

  const handleLogout = () => {
    logout();
    onClose();
    router.push('/');
  }

  return (
    <div className="relative">
      <button
        className="w-8 h-8 bg-blue-100 text-blue-500 font-bold rounded-full"
        onClick={onOpen}
      >
        {
          user
            ? user.username.charAt(0).toUpperCase()
            : '...'
        }
      </button>
      {
        isOpen &&
        <div
          className="absolute top-0 right-0 mt-12"
          ref={menuRef}
        >
          <div className="bg-white border rounded-lg shadow-lg w-[200px]">
            <Link href="/profile" className="block px-4 py-2 hover:bg-gray-100 border-b text-xs">
              Profile
            </Link>
            <button onClick={handleLogout} className="block px-4 py-2 hover:bg-gray-100 w-full text-left text-xs">Logout</button>
          </div>
        </div>
      }
    </div>
  )
}

export default AuthButton;