import { FC } from 'react';
import AuthButton from './authButton';

const Toolbar: FC = () => {
  return (
    <nav className="h-[6vh] border-b px-4">
      <ul className="flex items-center h-full">
        <li>Authy</li>
        <li className="flex-grow"></li>
        <li>
          <AuthButton />
        </li>
      </ul>
    </nav>
  )
}

export default Toolbar;