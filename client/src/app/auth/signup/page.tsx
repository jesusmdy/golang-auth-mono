'use client';
import { signUpWithEmailAndPassword } from '@/api/user';
import useAuth from '@/hooks/useAuth';
import { yupResolver } from '@hookform/resolvers/yup';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FC, useState } from 'react';
import { useForm } from 'react-hook-form';
import { object, string } from 'yup';

interface FormValues {
  fullName: string;
  username: string;
  email: string;
  password: string;
}

const schema = object().shape({
  fullName: string()
    .required('Full name is required')
    .min(3, 'Full name must be at least 3 characters')
    .max(50, 'Full name must be at most 50 characters')
    .matches(/^[a-zA-Z\s]*$/, 'Full name must contain only letters'),
  username: string()
    .required('Username is required')
    .min(5, 'Username must be at least 5 characters')
    .max(20, 'Username must be at most 20 characters')
    .matches(/^[a-zA-Z0-9_]*$/, 'Username must contain only letters, numbers, and underscores'),
  email: string().email('Valid email is required').required('Email is required'),
  password: string().required('Password is required'),
});

const AuthSignUpPage: FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, status, statusList } = useAuth();
  const router = useRouter();

  const methods = useForm<FormValues>(
    {
      resolver: yupResolver(schema),
    }
  );

  const onSubmit = (data: FormValues) => {
    setIsLoading(true);
    setError('');
    signUpWithEmailAndPassword(data)
      .then((user) => {
        login(user.email, data.password)
          .then(() => {
            router.push('/');
          })
          .catch((error) => {
            setError(error.message);
          });
      })
      .catch((error) => {
        setError(error.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  if (status === statusList.pending) {
    return (
      <div>Loading...</div>
    )
  }

  const labels = {
    fullName: 'Full Name',
    username: 'Username',
    email: 'Email',
    password: 'Password',
  } as const;

  const fields = ['fullName', 'username', 'email', 'password'] as const;

  return (
    <form
      onSubmit={methods.handleSubmit(onSubmit)}
      className="flex flex-col max-w-md mx-auto mt-4 p-4 border rounded-xl"
    >
      <h1 className="text-xl font-bold mb-4">Create a new account</h1>
      {
        fields.map((field, index) => (
          <div key={field} className="flex flex-col mb-4">
            <label htmlFor={field} className="text-sm font-semibold mb-1">
              {labels[field]}
            </label>
            <input
              type={field === 'password' ? 'password' : 'text'}
              autoFocus={index === 0}
              id={field}
              {...methods.register(field)}
              className="border rounded px-2 py-1"
              disabled={isLoading}
            />
            <span className="text-xs text-red-500">{methods.formState.errors[field]?.message}</span>
          </div>
        ))
      }
      {
        error && (
          <div className="text-red-500 text-xs mb-4">
            {error}
          </div>
        )
      }
      <button
        type="submit"
        className="bg-blue-500 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded"
        disabled={isLoading}
      >
        Create account
      </button>
      <Link href="/auth/signin" className="text-xs text-gray-500 mt-2">
        Already have an account? Sign In
      </Link>

    </form>
  )
};

export default AuthSignUpPage;