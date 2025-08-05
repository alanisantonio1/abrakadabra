
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
  notes: string;
  createdAt: string;
}

export interface Package {
  id: string;
  name: string;
  description: string;
  weekdayPrice: number;
  weekendPrice: number;
  image: string;
  features: string[];
}

export interface CalendarDay {
  date: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  isPast: boolean;
  hasEvent: boolean;
  eventCount: number;
}

// Database types for Supabase
export interface Database {
  public: {
    Tables: {
      events: {
        Row: {
          id: string;
          date: string;
          time: string;
          customer_name: string;
          customer_phone: string;
          child_name: string;
          package_type: 'Abra' | 'Kadabra' | 'Abrakadabra';
          total_amount: number;
          deposit: number;
          remaining_amount: number;
          is_paid: boolean;
          notes: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          date: string;
          time: string;
          customer_name: string;
          customer_phone: string;
          child_name: string;
          package_type: 'Abra' | 'Kadabra' | 'Abrakadabra';
          total_amount: number;
          deposit?: number;
          remaining_amount?: number;
          is_paid?: boolean;
          notes?: string;
        };
        Update: {
          id?: string;
          date?: string;
          time?: string;
          customer_name?: string;
          customer_phone?: string;
          child_name?: string;
          package_type?: 'Abra' | 'Kadabra' | 'Abrakadabra';
          total_amount?: number;
          deposit?: number;
          remaining_amount?: number;
          is_paid?: boolean;
          notes?: string;
        };
      };
    };
  };
}
