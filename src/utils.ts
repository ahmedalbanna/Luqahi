import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateUuid() {
  return crypto.randomUUID();
}

export function getStatusColor(status: string) {
  switch (status) {
    case 'COMPLETED': return 'bg-green-100 text-green-800 border-green-200';
    case 'OVERDUE': return 'bg-red-100 text-red-800 border-red-200';
    case 'PENDING': return 'bg-blue-100 text-blue-800 border-blue-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}
