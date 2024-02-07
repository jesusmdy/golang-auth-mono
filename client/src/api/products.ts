import { BASE_URL } from '.';

export interface Product {
  ID: string;
  Title: string;
  Price: number;
  Description: string;
  Image: string;
  Rate: number;
  Count: number;
}

export const getProducts = (
  // limit?: number,
): Promise<Product[]> => {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await fetch(`${BASE_URL}/products`, {
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
  })
};