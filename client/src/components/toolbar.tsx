import { FC } from 'react';
import AuthButton from './authButton';
import Link from 'next/link';

const Toolbar: FC = () => {
  return (
    <nav className="h-[6vh] border-b px-4">
      <ul className="flex items-center h-full">
        <li>
          <Link href="/">
            Home
          </Link>
        </li>
        <li className="flex-grow"></li>
        <li>
          <AuthButton />
        </li>
      </ul>
    </nav>
  )
}

export default Toolbar;