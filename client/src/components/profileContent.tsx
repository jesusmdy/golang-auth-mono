'use client';
import { FC, Fragment } from 'react';
import Toolbar from './toolbar';
import { FormProvider, useForm } from 'react-hook-form';
import './profileContent.styles.scss';
import { useSetUser, useUser } from '@/store/user';
import { object, string } from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { checkEmail, checkUsername, updateUserDetails } from '@/api/user';
import useAuth from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

interface FormInterface {
  fullName: string;
  username: string;
  email: string;
}

const schema = object().shape({
  fullName: string()
    .required()
    .min(3)
    .max(50)
    .matches(/^[a-zA-Z\s]*$/, 'Full name must contain only letters and spaces'),
  username: string().required()
    .min(3)
    .max(50)
    .matches(/^[a-zA-Z0-9_]*$/, 'Username must contain only letters, numbers, and underscores')
    .test('username', 'Username is already taken', async (value, testParam) => {

      if (value === testParam.originalValue) {
        return true;
      }
      try {
        await checkUsername(value);
        return true;
      } catch (error: any) {
        return false;
      }
    }),
  email: string()
    .email()
    .required()
    .test('email', 'Email is already taken', async (value, testParam) => {
        if (value === testParam.originalValue) {
          return true;
        }

        try {
          await checkEmail(value);
          return true;
        } catch (error: any) {
          return false;
        }
      }
    )
});

const ProfileContent: FC = () => {
  const user = useUser();
  const { token } = useAuth();
  const setUser = useSetUser();
  const router = useRouter();

  const methods = useForm<FormInterface>({
    defaultValues: {
      fullName: user?.fullName,
      username: user?.username,
      email: user?.email
    },
    resolver: yupResolver(schema)
  });

  const onSubmit = async (data: FormInterface) => {
    if (data.fullName === user?.fullName && data.username === user?.username && data.email === user?.email) {
      return;
    }
    try {
      if (!token) throw new Error('Token not found');
      const response = await updateUserDetails(token, data);
      if (
        user &&
        (
          user.username !== data.username ||
          user.email !== data.email
        )
      ) {
        alert('Updated profile details. Please sign in again');
        router.push('/auth/signin');
        return;
      }
      alert('Profile updated successfully');
      setUser({
        ...user,
        ...response
      });
    } catch (error: any) {
      alert(error.message);
    }
  };

  if (!user) return null;

  return (
    <Fragment>
      <Toolbar />
      <div className="w-full max-w-xl mx-auto">
        <h1 className="text-3xl my-4 border-b pb-2">Profile</h1>
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div>
              <label htmlFor="fullName">Full Name</label>
              <input
                id="fullName"
                type="text"
                className="input"
                {...methods.register('fullName')}
              />
              {
                methods.formState.errors.fullName &&
                <p className="error">{methods.formState.errors.fullName.message}</p>
              }
            </div>
            <div>
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                className="input"
                {...methods.register('username')}
              />
              {
                methods.formState.errors.username &&
                <p className="error">{methods.formState.errors.username.message}</p>
              }
            </div>
            <div>
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                className="input"
                {...methods.register('email')}
              />
              {
                methods.formState.errors.email &&
                <p className="error">{methods.formState.errors.email.message}</p>
              }
            </div>
            <div className="mt-4 border-t pt-4 flex justify-end">
              <button>Save changes</button>
            </div>
          </form>
        </FormProvider>
      </div>
    </Fragment>
  )
};

export default ProfileContent;