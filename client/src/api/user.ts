import { User } from '@/types/user';
import { BASE_URL } from '.';

interface SignInWithEmailAndPasswordResponse extends User {
  token: string;
};

export const signInWithEmailAndPassword = (
  email: string,
  password: string
): Promise<SignInWithEmailAndPasswordResponse> => {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await fetch(`${BASE_URL}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) {
        reject(new Error('Invalid credentials'));
      }
      const data = await response.json();
      resolve(data);
    }
    catch (error: any) {
      reject(new Error(error));
    }
  });
};

export const getUser = (token: string): Promise<User> => {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await fetch(`${BASE_URL}/users/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `ApiKey ${token}`,
        },
      });
      if (!response.ok) {
        reject(new Error('Invalid credentials'));
      }
      const data = await response.json();
      resolve(data);
    }
    catch (error: any) {
      reject(new Error(error));
    }
  });
}

interface FormValues {
  fullName: string;
  username: string;
  email: string;
  password: string;
}

export const signUpWithEmailAndPassword = (form: FormValues): Promise<SignInWithEmailAndPasswordResponse> => {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await fetch(`${BASE_URL}/users`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });
      if (!response.ok) {
        const body = await response.json();
        if (body.error) {
          reject(new Error(body.error));
        }
        reject(new Error('Error signing up'));
      }
      const data = await response.json();
      resolve(data);
    }
    catch (error: any) {
      reject(new Error(error));
    }
  });
};

export const checkUsername = (username: string): Promise<boolean> => {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await fetch(`${BASE_URL}/users/check-username?username=${username}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (!response.ok) {
        reject(new Error(data.error));
      }
      resolve(data);
    }
    catch (error: any) {
      reject(new Error(error));
    }
  });
}

export const checkEmail = (email: string): Promise<boolean> => {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await fetch(`${BASE_URL}/users/check-email?email=${email}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (!response.ok) {
        reject(new Error(data.error));
      }
      resolve(data);
    }
    catch (error: any) {
      reject(new Error(error));
    }
  });
}

type UpdateUserFields = Omit<FormValues, 'password'>;

export const updateUserDetails = (token: string, form: UpdateUserFields): Promise<User> => {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await fetch(`${BASE_URL}/users/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `ApiKey ${token}`,
        },
        body: JSON.stringify(form),
      });
      if (!response.ok) {
        const body = await response.json();
        if (body.error) {
          reject(new Error(body.error));
        }
        reject(new Error('Error updating user details'));
      }
      const data = await response.json();
      resolve(data);
    }
    catch (error: any) {
      reject(new Error(error));
    }
  });
}
