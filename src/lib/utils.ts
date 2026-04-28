import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

export function getDirectImageUrl(url: string): string {
  if (!url) return '';
  
  const cleanUrl = url.trim();
  
  // Handle Google Drive links
  if (cleanUrl.includes('drive.google.com') || cleanUrl.includes('docs.google.com')) {
    const driveIdMatch = cleanUrl.match(/[-\w]{25,}/);
    if (driveIdMatch) {
      return `https://lh3.googleusercontent.com/d/${driveIdMatch[0]}`;
    }
  }

  // If it's just a 25+ char string (likely a file ID)
  if (cleanUrl.length >= 25 && cleanUrl.length <= 50 && !cleanUrl.includes('/') && !cleanUrl.includes('.')) {
    return `https://lh3.googleusercontent.com/d/${cleanUrl}`;
  }
  
  // Handle ImgBB links that might not be direct
  if (cleanUrl.includes('ibb.co') && !cleanUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
    return cleanUrl;
  }
  
  return cleanUrl;
}

export function getEmbedUrl(url: string): string | null {
  if (!url) return null;
  const cleanUrl = url.trim();

  // Google Drive Video
  if (cleanUrl.includes('drive.google.com')) {
    const driveIdMatch = cleanUrl.match(/[-\w]{25,}/);
    if (driveIdMatch) {
      return `https://drive.google.com/file/d/${driveIdMatch[0]}/preview`;
    }
  }

  // YouTube
  const ytMatch = cleanUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (ytMatch) {
    return `https://www.youtube.com/embed/${ytMatch[1]}`;
  }

  return null;
}
