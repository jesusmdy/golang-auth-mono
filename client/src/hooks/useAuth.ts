'use client';
import { getUser, signInWithEmailAndPassword } from '@/api/user';
import { useSetUser } from '@/store/user';
import { User } from '@/types/user';
import { useEffect, useState } from 'react';

const TOKEN_KEY = 'token';

type AUTH_STATUS = 'authenticated' | 'unauthenticated' | 'pending';

export const AUTH_STATUS_LIST: Record<AUTH_STATUS, AUTH_STATUS> = {
  authenticated: 'authenticated',
  unauthenticated: 'unauthenticated',
  pending: 'pending',
};

interface ValidUser extends User {
  token: string;
}

const useAuth = () => {
  const [status, setStatus] = useState<AUTH_STATUS>(AUTH_STATUS_LIST.pending);
  const [token, setToken] = useState<string | null>(null);
  const setUser = useSetUser();

  const isUserValid = async (): Promise<ValidUser | null> => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      return new Promise(async (resolve, reject) => {
        try {
          const user = await getUser(token);
          resolve({ ...user, token });
        }
        catch (error: any) {
          reject(null);
        }
      });
    }
    return null;
  }
  
  useEffect(() => {
    isUserValid()
      .then((user) => {
        if (user) {
          setStatus(AUTH_STATUS_LIST.authenticated);
          setToken(user.token);
          setUser(user);
        }
        else {
          setStatus(AUTH_STATUS_LIST.unauthenticated);
        }
      })
      .catch(() => {
        setStatus(AUTH_STATUS_LIST.unauthenticated);
      });
  }, []);

  const login = async (identifier: string, password: string): Promise<void> => {
    return await signInWithEmailAndPassword(identifier, password)
      .then(({ token }) => {
        localStorage.setItem(TOKEN_KEY, token);
        setStatus(AUTH_STATUS_LIST.authenticated);
      })
      .catch((error) => {
        throw new Error(error);
      });
  }

  const logout = (): void => {
    localStorage.removeItem(TOKEN_KEY);
    setStatus(AUTH_STATUS_LIST.unauthenticated);
    setUser(null);
  }

  return {
    status,
    login,
    logout,
    token,
    statusList: AUTH_STATUS_LIST,
  };
};

export default useAuth;