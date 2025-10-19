import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Simple debounce function
export function debounce<T extends (...args: any[]) => void>(func: T, delay: number): T {
    let timeout: ReturnType<typeof setTimeout> | null;

    return ((...args: Parameters<T>) => {
        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(() => {
            func(...args);
            timeout = null;
        }, delay);
    }) as T;
}