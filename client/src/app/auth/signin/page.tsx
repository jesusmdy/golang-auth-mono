'use client';
import useAuth from '@/hooks/useAuth';
import { yupResolver } from '@hookform/resolvers/yup';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FC } from 'react';
import { useForm } from 'react-hook-form';
import { object, string } from 'yup';

interface FormValues {
  email: string;
  password: string;
}

const schema = object().shape({
  email: string().email('Valid email is required').required('Email is required'),
  password: string().required('Password is required'),
});

const AuthLoginPage: FC = () => {
  const { login, status, statusList } = useAuth();
  const router = useRouter();

  const methods = useForm<FormValues>(
    {
      resolver: yupResolver(schema),
    }
  );

  const onSubmit = (data: FormValues) => {
    login(data.email, data.password)
      .then(() => {
        router.push('/');
      })
      .catch(() => {
        alert('Invalid credentials');
      });
  };

  if (status === statusList.pending) {
    return (
      <div>Loading...</div>
    )
  }

  return (
    <form
      onSubmit={methods.handleSubmit(onSubmit)}
      className="flex flex-col max-w-md mx-auto mt-4 p-4 border rounded-xl"
    >
      <h1 className="text-xl font-bold mb-4">Login</h1>
      <input
        type="email"
        {
          ...methods.register('email', {
            required: true,
          })
        }
        className="border border-gray-300 p-2 rounded mb-2"
        placeholder="Email"
      />
      {
        methods.formState.errors.email &&
        <div className="text-red-500 text-xs mb-2">
          {methods.formState.errors.email.message}
        </div>
      }
      <input
        type="password"
        {
          ...methods.register('password', {
            required: true,
          })
        }
        className="border border-gray-300 p-2 rounded mb-2"
        placeholder="Password"
      />
      {
        methods.formState.errors.password &&
        <div className="text-red-500 text-xs mb-2">
          {methods.formState.errors.password.message}
        </div>
      }
      <button
        type="submit"
        className="bg-blue-500 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded"
      >
        Login
      </button>
      <Link href="/auth/signup" className="text-xs text-gray-500 mt-2">
        Need an account? Sign Up
      </Link>

    </form>
  )
};

export default AuthLoginPage;