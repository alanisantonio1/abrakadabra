
export interface Event {
  id: string;
  date: string;
  time: string;
  customerName: string;
  customerPhone: string;
  childName: string;
  packageType: 'Abra' | 'Kadabra' | 'Abrakadabra';
  totalAmount: number;
  deposit: number;
  remainingAmount: number;
  isPaid: boolean;
  notes?: string;
  createdAt: string;
}

export interface Package {
  id: string;
  name: 'Abra' | 'Kadabra' | 'Abrakadabra';
  description: string;
  weekdayPrice: number;
  weekendPrice: number;
  image: string;
  features: string[];
}

export interface CalendarDay {
  date: string;
  isAvailable: boolean;
  events: Event[];
}
