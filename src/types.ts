import { Timestamp } from 'firebase/firestore';

export type DonationType = 'Zakat' | 'Infaq' | 'Sedekah';
export type DonationStatus = 'pending' | 'success';

export interface Donation {
  id?: string;
  amount: number;
  donorName: string;
  donorEmail?: string;
  type: DonationType;
  status: DonationStatus;
  timestamp: Timestamp;
  transactionId: string;
  uid?: string;
}

export interface DistributionReport {
  id?: string;
  month: string; // e.g., "Januari 2024"
  totalAmount: number;
  educationAmount: number;
  healthAmount: number;
  socialAmount: number;
  economicAmount: number;
  recipientsCount: number;
  timestamp: Timestamp;
}

export interface AmbulanceReport {
  id?: string;
  month: string; // e.g., "Januari 2024"
  totalTrips: number;
  patientTrips: number;
  funeralTrips: number;
  socialTrips: number;
  timestamp: Timestamp;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  role: 'admin' | 'donor';
}

export interface Activity {
  id?: string;
  title: string;
  imageUrl: string;
  mediaType?: 'image' | 'video';
  timestamp: Timestamp;
}
