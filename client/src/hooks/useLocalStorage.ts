import { useEffect, useState } from 'react';

export const useLocalStorageState = <T>(
  name: string,
  defaultValue: T,
  hydrater?: (value: T) => T | void
): [T, (value: T) => void] => {
  const [value, setValue] = useState<T>(() => {
    const savedValue = localStorage.getItem(name);
    if (savedValue) {
      return JSON.parse(savedValue);
    }
    return defaultValue;
  });

  useEffect(() => {
    localStorage.setItem(name, JSON.stringify(value));
    if (hydrater) {
      hydrater(value);
    }
  }, [name, value]);

  return [value, setValue];
}