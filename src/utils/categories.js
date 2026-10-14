import {
  Utensils,
  Car,
  ShoppingBag,
  Receipt,
  GraduationCap,
  Film,
  HeartPulse,
  Sparkles,
  Briefcase,
  Laptop,
  Building2,
  Gift,
  Coins
} from 'lucide-react';

export const EXPENSE_CATEGORIES = [
  {
    id: 'Food',
    name: 'Food',
    color: '#22D3EE',
    bgGlow: 'rgba(34, 211, 238, 0.15)',
    icon: Utensils,
    description: 'Dining out, groceries, cafes & daily meals'
  },
  {
    id: 'Transport',
    name: 'Transport',
    color: '#8B5CF6',
    bgGlow: 'rgba(139, 92, 246, 0.15)',
    icon: Car,
    description: 'Fuel, metro, cab rides & travel passes'
  },
  {
    id: 'Shopping',
    name: 'Shopping',
    color: '#F472B6',
    bgGlow: 'rgba(244, 114, 182, 0.15)',
    icon: ShoppingBag,
    description: 'Apparel, electronics, lifestyle & essentials'
  },
  {
    id: 'Bills',
    name: 'Bills',
    color: '#FBBF24',
    bgGlow: 'rgba(251, 191, 36, 0.15)',
    icon: Receipt,
    description: 'Electricity, Wi-Fi, rent, mobile & subscriptions'
  },
  {
    id: 'Education',
    name: 'Education',
    color: '#34D399',
    bgGlow: 'rgba(52, 211, 153, 0.15)',
    icon: GraduationCap,
    description: 'Courses, books, tuition & certifications'
  },
  {
    id: 'Entertainment',
    name: 'Entertainment',
    color: '#A78BFA',
    bgGlow: 'rgba(167, 139, 250, 0.15)',
    icon: Film,
    description: 'Movies, concerts, gaming & streaming'
  },
  {
    id: 'Healthcare',
    name: 'Healthcare',
    color: '#FB7185',
    bgGlow: 'rgba(251, 113, 133, 0.15)',
    icon: HeartPulse,
    description: 'Pharmacy, checkups, fitness & wellness'
  },
  {
    id: 'Other',
    name: 'Other',
    color: '#94A3B8',
    bgGlow: 'rgba(148, 163, 184, 0.15)',
    icon: Sparkles,
    description: 'Miscellaneous expenses & unplanned items'
  }
];

export const INCOME_SOURCES = [
  {
    id: 'Salary',
    name: 'Salary',
    color: '#34D399',
    bgGlow: 'rgba(52, 211, 153, 0.15)',
    icon: Briefcase,
    description: 'Primary monthly paycheck & stipends'
  },
  {
    id: 'Freelance',
    name: 'Freelance',
    color: '#22D3EE',
    bgGlow: 'rgba(34, 211, 238, 0.15)',
    icon: Laptop,
    description: 'Client projects, consulting & gigs'
  },
  {
    id: 'Business',
    name: 'Business',
    color: '#8B5CF6',
    bgGlow: 'rgba(139, 92, 246, 0.15)',
    icon: Building2,
    description: 'Side-business revenue & dividends'
  },
  {
    id: 'Gift',
    name: 'Gift',
    color: '#FBBF24',
    bgGlow: 'rgba(251, 191, 36, 0.15)',
    icon: Gift,
    description: 'Cash gifts, rewards & bonuses'
  },
  {
    id: 'Other',
    name: 'Other',
    color: '#94A3B8',
    bgGlow: 'rgba(148, 163, 184, 0.15)',
    icon: Coins,
    description: 'Other incoming cash flow'
  }
];

export const PAYMENT_METHODS = [
  'UPI / GPay / PhonePe',
  'Credit Card',
  'Debit Card',
  'Net Banking',
  'Cash'
];

export function getCategoryMeta(categoryName, type = 'expense') {
  if (type === 'income') {
    return INCOME_SOURCES.find((c) => c.id === categoryName) || INCOME_SOURCES[INCOME_SOURCES.length - 1];
  }
  return EXPENSE_CATEGORIES.find((c) => c.id === categoryName) || EXPENSE_CATEGORIES[EXPENSE_CATEGORIES.length - 1];
}
