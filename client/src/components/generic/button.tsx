import classNames from 'classnames';
import { ButtonHTMLAttributes, FC, PropsWithChildren } from 'react';

const buttonTypes = ['primary', 'secondary', 'danger', 'danger-outline'] as const;

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: typeof buttonTypes[number];
  size?: 'sm' | 'md' | 'lg';
}

const Button: FC<PropsWithChildren<ButtonProps>> = (props) => {
  const style = (() => {
    switch (props.variant) {
      case 'primary':
        return 'bg-blue-500 text-white';
      case 'secondary':
        return 'bg-blue-50 text-blue-500';
      case 'danger':
        return 'bg-red-500 text-white';
      case 'danger-outline':
        return 'bg-transparent border border-red-500 text-red-500';
      default:
        return '';
    }
  })();

  const size = (() => {
    switch (props.size) {
      case 'sm':
        return 'text-xs';
      case 'md':
        return 'text-sm';
      case 'lg':
        return 'text-md';
      default:
        return 'text-md';
    }
  })();

  return (
    <button
      {...props}
      className={classNames(
        'px-3 py-1 rounded-md flex',
        style, size,
        'disabled:bg-gray-50 disabled:text-gray-500',
      )}
    >
      {props.children}
    </button>
  )
}

export default Button;