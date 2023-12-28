import { useEffect, useState } from 'react';

function useLocalStorage<T>(key: string, initialValue: T | null = null) {
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const item = localStorage.getItem(key);
            return item ? parseValue(item) : initialValue;
        } catch (error) {
            console.error(
                `Error retrieving value from local storage: ${error}`
            );
            return initialValue;
        }
    });

    useEffect(() => {
        const intervalId = setInterval(() => {
            const item = localStorage.getItem(key);
            if (item !== JSON.stringify(storedValue)) {
                setStoredValue(item ? parseValue(item) : initialValue);
            }
        }, 1000);

        return () => clearInterval(intervalId);
    }, []);

    function setItem(value: T): void {
        try {
            if (typeof value === 'object') {
                localStorage.setItem(key, JSON.stringify(value));
            } else {
                localStorage.setItem(key, String(value));
            }
            setStoredValue(value);
        } catch (error) {
            console.error(`Error setting value in local storage: ${error}`);
        }
    }

    function getItem(): T | null {
        try {
            const item = localStorage.getItem(key);
            return item ? parseValue(item) : initialValue;
        } catch (error) {
            console.error(
                `Error retrieving value from local storage: ${error}`
            );
            return initialValue;
        }
    }

    function deleteItem(): void {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error(`Error deleting value from local storage: ${error}`);
        }
    }

    return { value: storedValue, setItem, getItem, deleteItem };
}

function parseValue(value?: string | null) {
    if (value === undefined || value === null) {
        return null;
    }

    try {
        return JSON.parse(value);
    } catch (error) {
        return value;
    }
}

export default useLocalStorage;
