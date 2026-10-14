export const DEMO_USER_ID = 'user_demo_myfinance';

export const DEMO_USER_PROFILE = {
  id: DEMO_USER_ID,
  name: 'Aarav Sharma',
  email: 'demo@myfinance.app',
  createdAt: '2026-05-01T09:00:00.000Z',
  isDemoAccount: true,
};

/**
 * Generates internally consistent multi-month sample data for the demo account.
 * Current default month (October 2026) matches exact Master Prompt specifications:
 * - Monthly Income: ₹48,000
 * - Monthly Budget: ₹35,000
 * - Expenses:
 *   - Food: ₹4,500
 *   - Transport: ₹2,200
 *   - Shopping: ₹5,800
 *   - Bills: ₹3,500
 *   - Education: ₹2,000
 *   - Entertainment: ₹1,500
 *   - Healthcare: ₹1,000
 *   - Other: ₹1,500
 * - Total Expenses: ₹22,000
 * - Remaining Budget: ₹13,000
 * - Budget Used: 62.86%
 */
export function buildSeedDataForUser(userId = DEMO_USER_ID) {
  const now = new Date();
  const currentYear = now.getFullYear(); // 2026
  const currentMonth = now.getMonth(); // 9 (October, 0-indexed)

  // Helper to format YYYY-MM-DD relative to current month
  const makeDate = (monthOffset, day) => {
    const d = new Date(currentYear, currentMonth + monthOffset, day);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dy = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${dy}`;
  };

  const transactions = [
    // ================= CURRENT MONTH (Exact Totals: Income ₹48,000 | Expenses ₹22,000) =================
    // Income: ₹48,000
    {
      id: `tx_${userId}_curr_inc_1`,
      userId,
      type: 'income',
      amount: 40000,
      category: 'Salary',
      description: 'Monthly Tech Stipend & Salary',
      date: makeDate(0, 1),
      paymentMethod: 'Net Banking',
      createdAt: `${makeDate(0, 1)}T09:30:00.000Z`
    },
    {
      id: `tx_${userId}_curr_inc_2`,
      userId,
      type: 'income',
      amount: 8000,
      category: 'Freelance',
      description: 'UI/UX Frontend Sprint Deliverable',
      date: makeDate(0, 5),
      paymentMethod: 'UPI / GPay / PhonePe',
      createdAt: `${makeDate(0, 5)}T14:20:00.000Z`
    },

    // Food: ₹4,500 (2,600 + 1,900)
    {
      id: `tx_${userId}_curr_exp_1`,
      userId,
      type: 'expense',
      amount: 2600,
      category: 'Food',
      description: 'Monthly Organic Groceries & Fresh Produce',
      date: makeDate(0, 2),
      paymentMethod: 'UPI / GPay / PhonePe',
      createdAt: `${makeDate(0, 2)}T18:10:00.000Z`
    },
    {
      id: `tx_${userId}_curr_exp_2`,
      userId,
      type: 'expense',
      amount: 1900,
      category: 'Food',
      description: 'Weekend Cafe & Team Dinner',
      date: makeDate(0, 8),
      paymentMethod: 'Credit Card',
      createdAt: `${makeDate(0, 8)}T21:15:00.000Z`
    },

    // Transport: ₹2,200 (1,400 + 800)
    {
      id: `tx_${userId}_curr_exp_3`,
      userId,
      type: 'expense',
      amount: 1400,
      category: 'Transport',
      description: 'Metro Smart Card & Commute Pass',
      date: makeDate(0, 3),
      paymentMethod: 'UPI / GPay / PhonePe',
      createdAt: `${makeDate(0, 3)}T08:45:00.000Z`
    },
    {
      id: `tx_${userId}_curr_exp_4`,
      userId,
      type: 'expense',
      amount: 800,
      category: 'Transport',
      description: 'Uber Airport & City Rides',
      date: makeDate(0, 10),
      paymentMethod: 'UPI / GPay / PhonePe',
      createdAt: `${makeDate(0, 10)}T19:00:00.000Z`
    },

    // Shopping: ₹5,800 (3,800 + 2,000)
    {
      id: `tx_${userId}_curr_exp_5`,
      userId,
      type: 'expense',
      amount: 3800,
      category: 'Shopping',
      description: 'Wireless Mechanical Keyboard & Desk Mat',
      date: makeDate(0, 6),
      paymentMethod: 'Credit Card',
      createdAt: `${makeDate(0, 6)}T15:40:00.000Z`
    },
    {
      id: `tx_${userId}_curr_exp_6`,
      userId,
      type: 'expense',
      amount: 2000,
      category: 'Shopping',
      description: 'Autumn Casual Wear & Sneakers',
      date: makeDate(0, 11),
      paymentMethod: 'Debit Card',
      createdAt: `${makeDate(0, 11)}T17:20:00.000Z`
    },

    // Bills: ₹3,500 (2,200 + 1,300)
    {
      id: `tx_${userId}_curr_exp_7`,
      userId,
      type: 'expense',
      amount: 2200,
      category: 'Bills',
      description: 'Electricity & Utility Bill',
      date: makeDate(0, 4),
      paymentMethod: 'Net Banking',
      createdAt: `${makeDate(0, 4)}T11:00:00.000Z`
    },
    {
      id: `tx_${userId}_curr_exp_8`,
      userId,
      type: 'expense',
      amount: 1300,
      category: 'Bills',
      description: 'Gigabit Fiber Wi-Fi & Cloud Storage',
      date: makeDate(0, 7),
      paymentMethod: 'Credit Card',
      createdAt: `${makeDate(0, 7)}T10:05:00.000Z`
    },

    // Education: ₹2,000
    {
      id: `tx_${userId}_curr_exp_9`,
      userId,
      type: 'expense',
      amount: 2000,
      category: 'Education',
      description: 'Three.js & WebGL Shaders Masterclass',
      date: makeDate(0, 5),
      paymentMethod: 'Debit Card',
      createdAt: `${makeDate(0, 5)}T16:00:00.000Z`
    },

    // Entertainment: ₹1,500
    {
      id: `tx_${userId}_curr_exp_10`,
      userId,
      type: 'expense',
      amount: 1500,
      category: 'Entertainment',
      description: 'IMAX Movie Night & Spotify Duo',
      date: makeDate(0, 9),
      paymentMethod: 'UPI / GPay / PhonePe',
      createdAt: `${makeDate(0, 9)}T20:30:00.000Z`
    },

    // Healthcare: ₹1,000
    {
      id: `tx_${userId}_curr_exp_11`,
      userId,
      type: 'expense',
      amount: 1000,
      category: 'Healthcare',
      description: 'Multivitamins & Dental Checkup',
      date: makeDate(0, 7),
      paymentMethod: 'UPI / GPay / PhonePe',
      createdAt: `${makeDate(0, 7)}T12:15:00.000Z`
    },

    // Other: ₹1,500
    {
      id: `tx_${userId}_curr_exp_12`,
      userId,
      type: 'expense',
      amount: 1500,
      category: 'Other',
      description: 'Hostel Fest Contribution & Stationery',
      date: makeDate(0, 12),
      paymentMethod: 'UPI / GPay / PhonePe',
      createdAt: `${makeDate(0, 12)}T13:50:00.000Z`
    },

    // ================= MONTH -1 (September: Income ₹46,000 | Expenses ₹24,500) =================
    {
      id: `tx_${userId}_m1_inc_1`,
      userId,
      type: 'income',
      amount: 40000,
      category: 'Salary',
      description: 'Monthly Tech Stipend & Salary',
      date: makeDate(-1, 1),
      paymentMethod: 'Net Banking',
      createdAt: `${makeDate(-1, 1)}T09:00:00.000Z`
    },
    {
      id: `tx_${userId}_m1_inc_2`,
      userId,
      type: 'income',
      amount: 6000,
      category: 'Freelance',
      description: 'React Dashboard Optimization Audit',
      date: makeDate(-1, 14),
      paymentMethod: 'UPI / GPay / PhonePe',
      createdAt: `${makeDate(-1, 14)}T17:00:00.000Z`
    },
    {
      id: `tx_${userId}_m1_exp_1`,
      userId,
      type: 'expense',
      amount: 4800,
      category: 'Food',
      description: 'Groceries & Dining Out',
      date: makeDate(-1, 5),
      paymentMethod: 'UPI / GPay / PhonePe',
      createdAt: `${makeDate(-1, 5)}T19:00:00.000Z`
    },
    {
      id: `tx_${userId}_m1_exp_2`,
      userId,
      type: 'expense',
      amount: 2400,
      category: 'Transport',
      description: 'City Commute & Train Tickets',
      date: makeDate(-1, 9),
      paymentMethod: 'UPI / GPay / PhonePe',
      createdAt: `${makeDate(-1, 9)}T10:00:00.000Z`
    },
    {
      id: `tx_${userId}_m1_exp_3`,
      userId,
      type: 'expense',
      amount: 6500,
      category: 'Shopping',
      description: 'Noise Cancelling Earbuds',
      date: makeDate(-1, 15),
      paymentMethod: 'Credit Card',
      createdAt: `${makeDate(-1, 15)}T14:00:00.000Z`
    },
    {
      id: `tx_${userId}_m1_exp_4`,
      userId,
      type: 'expense',
      amount: 3600,
      category: 'Bills',
      description: 'Power, Broadband & Mobile Plan',
      date: makeDate(-1, 6),
      paymentMethod: 'Net Banking',
      createdAt: `${makeDate(-1, 6)}T11:30:00.000Z`
    },
    {
      id: `tx_${userId}_m1_exp_5`,
      userId,
      type: 'expense',
      amount: 3200,
      category: 'Education',
      description: 'AWS Cloud Practitioner Exam Voucher',
      date: makeDate(-1, 18),
      paymentMethod: 'Credit Card',
      createdAt: `${makeDate(-1, 18)}T15:00:00.000Z`
    },
    {
      id: `tx_${userId}_m1_exp_6`,
      userId,
      type: 'expense',
      amount: 2200,
      category: 'Entertainment',
      description: 'Live Indie Concert Pass',
      date: makeDate(-1, 22),
      paymentMethod: 'UPI / GPay / PhonePe',
      createdAt: `${makeDate(-1, 22)}T20:00:00.000Z`
    },
    {
      id: `tx_${userId}_m1_exp_7`,
      userId,
      type: 'expense',
      amount: 1800,
      category: 'Healthcare',
      description: 'Gym Membership Renewal',
      date: makeDate(-1, 11),
      paymentMethod: 'Debit Card',
      createdAt: `${makeDate(-1, 11)}T08:00:00.000Z`
    },

    // ================= MONTH -2 (August: Income ₹45,000 | Expenses ₹19,800) =================
    {
      id: `tx_${userId}_m2_inc_1`,
      userId,
      type: 'income',
      amount: 40000,
      category: 'Salary',
      description: 'Monthly Tech Stipend & Salary',
      date: makeDate(-2, 1),
      paymentMethod: 'Net Banking',
      createdAt: `${makeDate(-2, 1)}T09:00:00.000Z`
    },
    {
      id: `tx_${userId}_m2_inc_2`,
      userId,
      type: 'income',
      amount: 5000,
      category: 'Gift',
      description: 'Hackathon Best UI Runner-Up Prize',
      date: makeDate(-2, 19),
      paymentMethod: 'Net Banking',
      createdAt: `${makeDate(-2, 19)}T16:00:00.000Z`
    },
    {
      id: `tx_${userId}_m2_exp_1`,
      userId,
      type: 'expense',
      amount: 4200,
      category: 'Food',
      description: 'Monthly Groceries & Canteen',
      date: makeDate(-2, 4),
      paymentMethod: 'UPI / GPay / PhonePe',
      createdAt: `${makeDate(-2, 4)}T18:00:00.000Z`
    },
    {
      id: `tx_${userId}_m2_exp_2`,
      userId,
      type: 'expense',
      amount: 1900,
      category: 'Transport',
      description: 'Metro & Auto Rides',
      date: makeDate(-2, 10),
      paymentMethod: 'UPI / GPay / PhonePe',
      createdAt: `${makeDate(-2, 10)}T09:30:00.000Z`
    },
    {
      id: `tx_${userId}_m2_exp_3`,
      userId,
      type: 'expense',
      amount: 4100,
      category: 'Shopping',
      description: 'Laptop Stand & USB-C Hub',
      date: makeDate(-2, 12),
      paymentMethod: 'Credit Card',
      createdAt: `${makeDate(-2, 12)}T13:00:00.000Z`
    },
    {
      id: `tx_${userId}_m2_exp_4`,
      userId,
      type: 'expense',
      amount: 3400,
      category: 'Bills',
      description: 'Electricity & Fiber Internet',
      date: makeDate(-2, 5),
      paymentMethod: 'Net Banking',
      createdAt: `${makeDate(-2, 5)}T11:00:00.000Z`
    },
    {
      id: `tx_${userId}_m2_exp_5`,
      userId,
      type: 'expense',
      amount: 2800,
      category: 'Education',
      description: 'System Design & Algorithms Reference Books',
      date: makeDate(-2, 16),
      paymentMethod: 'Debit Card',
      createdAt: `${makeDate(-2, 16)}T14:30:00.000Z`
    },
    {
      id: `tx_${userId}_m2_exp_6`,
      userId,
      type: 'expense',
      amount: 1600,
      category: 'Entertainment',
      description: 'Bowling & Gaming Arcade',
      date: makeDate(-2, 23),
      paymentMethod: 'UPI / GPay / PhonePe',
      createdAt: `${makeDate(-2, 23)}T19:30:00.000Z`
    },
    {
      id: `tx_${userId}_m2_exp_7`,
      userId,
      type: 'expense',
      amount: 1800,
      category: 'Other',
      description: 'Gift for Sister Birthday',
      date: makeDate(-2, 26),
      paymentMethod: 'UPI / GPay / PhonePe',
      createdAt: `${makeDate(-2, 26)}T17:00:00.000Z`
    },

    // ================= MONTH -3 (July: Income ₹42,000 | Expenses ₹21,200) =================
    {
      id: `tx_${userId}_m3_inc_1`,
      userId,
      type: 'income',
      amount: 42000,
      category: 'Salary',
      description: 'Monthly Tech Stipend & Bonus',
      date: makeDate(-3, 1),
      paymentMethod: 'Net Banking',
      createdAt: `${makeDate(-3, 1)}T09:00:00.000Z`
    },
    {
      id: `tx_${userId}_m3_exp_1`,
      userId,
      type: 'expense',
      amount: 4600,
      category: 'Food',
      description: 'Groceries & Mess Subscription',
      date: makeDate(-3, 3),
      paymentMethod: 'UPI / GPay / PhonePe',
      createdAt: `${makeDate(-3, 3)}T18:00:00.000Z`
    },
    {
      id: `tx_${userId}_m3_exp_2`,
      userId,
      type: 'expense',
      amount: 2100,
      category: 'Transport',
      description: 'City Commute & Fuel',
      date: makeDate(-3, 8),
      paymentMethod: 'UPI / GPay / PhonePe',
      createdAt: `${makeDate(-3, 8)}T10:00:00.000Z`
    },
    {
      id: `tx_${userId}_m3_exp_3`,
      userId,
      type: 'expense',
      amount: 5200,
      category: 'Shopping',
      description: 'Running Shoes & Backpack',
      date: makeDate(-3, 14),
      paymentMethod: 'Credit Card',
      createdAt: `${makeDate(-3, 14)}T16:00:00.000Z`
    },
    {
      id: `tx_${userId}_m3_exp_4`,
      userId,
      type: 'expense',
      amount: 3300,
      category: 'Bills',
      description: 'Utility & Internet Bills',
      date: makeDate(-3, 5),
      paymentMethod: 'Net Banking',
      createdAt: `${makeDate(-3, 5)}T11:00:00.000Z`
    },
    {
      id: `tx_${userId}_m3_exp_5`,
      userId,
      type: 'expense',
      amount: 3500,
      category: 'Education',
      description: 'Annual Frontend Masters Subscription',
      date: makeDate(-3, 19),
      paymentMethod: 'Credit Card',
      createdAt: `${makeDate(-3, 19)}T12:00:00.000Z`
    },
    {
      id: `tx_${userId}_m3_exp_6`,
      userId,
      type: 'expense',
      amount: 1500,
      category: 'Entertainment',
      description: 'Streaming & Weekend Outing',
      date: makeDate(-3, 21),
      paymentMethod: 'UPI / GPay / PhonePe',
      createdAt: `${makeDate(-3, 21)}T20:00:00.000Z`
    },
    {
      id: `tx_${userId}_m3_exp_7`,
      userId,
      type: 'expense',
      amount: 1000,
      category: 'Healthcare',
      description: 'First-Aid & Protein Supplement',
      date: makeDate(-3, 25),
      paymentMethod: 'UPI / GPay / PhonePe',
      createdAt: `${makeDate(-3, 25)}T15:00:00.000Z`
    },

    // ================= MONTH -4 (June: Income ₹44,000 | Expenses ₹18,500) =================
    {
      id: `tx_${userId}_m4_inc_1`,
      userId,
      type: 'income',
      amount: 40000,
      category: 'Salary',
      description: 'Monthly Tech Stipend & Salary',
      date: makeDate(-4, 1),
      paymentMethod: 'Net Banking',
      createdAt: `${makeDate(-4, 1)}T09:00:00.000Z`
    },
    {
      id: `tx_${userId}_m4_inc_2`,
      userId,
      type: 'income',
      amount: 4000,
      category: 'Business',
      description: 'Figma UI Kit Gumroad Royalties',
      date: makeDate(-4, 15),
      paymentMethod: 'Net Banking',
      createdAt: `${makeDate(-4, 15)}T11:00:00.000Z`
    },
    {
      id: `tx_${userId}_m4_exp_1`,
      userId,
      type: 'expense',
      amount: 4100,
      category: 'Food',
      description: 'Groceries & Dining',
      date: makeDate(-4, 4),
      paymentMethod: 'UPI / GPay / PhonePe',
      createdAt: `${makeDate(-4, 4)}T19:00:00.000Z`
    },
    {
      id: `tx_${userId}_m4_exp_2`,
      userId,
      type: 'expense',
      amount: 1800,
      category: 'Transport',
      description: 'Metro Pass & Cabs',
      date: makeDate(-4, 9),
      paymentMethod: 'UPI / GPay / PhonePe',
      createdAt: `${makeDate(-4, 9)}T09:00:00.000Z`
    },
    {
      id: `tx_${userId}_m4_exp_3`,
      userId,
      type: 'expense',
      amount: 3900,
      category: 'Shopping',
      description: 'Ergonomic Desk Lamp & Accessories',
      date: makeDate(-4, 14),
      paymentMethod: 'Credit Card',
      createdAt: `${makeDate(-4, 14)}T16:00:00.000Z`
    },
    {
      id: `tx_${userId}_m4_exp_4`,
      userId,
      type: 'expense',
      amount: 3500,
      category: 'Bills',
      description: 'Electricity, Wi-Fi & Mobile',
      date: makeDate(-4, 6),
      paymentMethod: 'Net Banking',
      createdAt: `${makeDate(-4, 6)}T10:30:00.000Z`
    },
    {
      id: `tx_${userId}_m4_exp_5`,
      userId,
      type: 'expense',
      amount: 2500,
      category: 'Education',
      description: 'Design Systems Workshop',
      date: makeDate(-4, 18),
      paymentMethod: 'Debit Card',
      createdAt: `${makeDate(-4, 18)}T14:00:00.000Z`
    },
    {
      id: `tx_${userId}_m4_exp_6`,
      userId,
      type: 'expense',
      amount: 1700,
      category: 'Entertainment',
      description: 'Weekend Cinema & Snacks',
      date: makeDate(-4, 22),
      paymentMethod: 'UPI / GPay / PhonePe',
      createdAt: `${makeDate(-4, 22)}T20:00:00.000Z`
    },
    {
      id: `tx_${userId}_m4_exp_7`,
      userId,
      type: 'expense',
      amount: 1000,
      category: 'Other',
      description: 'Bookstore & Misc Supplies',
      date: makeDate(-4, 27),
      paymentMethod: 'Cash',
      createdAt: `${makeDate(-4, 27)}T17:00:00.000Z`
    },
  ];

  // Budgets for the last 5 months (₹35,000 default monthly budget)
  const budgets = [0, -1, -2, -3, -4].map((offset) => {
    const d = new Date(currentYear, currentMonth + offset, 1);
    return {
      id: `budget_${userId}_${d.getFullYear()}_${d.getMonth()}`,
      userId,
      month: d.getMonth(),
      year: d.getFullYear(),
      amount: 35000,
    };
  });

  // Savings Goals (Stored separately from expense transactions to prevent double counting)
  const savingsGoals = [
    {
      id: `goal_${userId}_1`,
      userId,
      title: 'MacBook Pro M4 Workstation',
      targetAmount: 165000,
      savedAmount: 112000,
      targetDate: `${currentYear + 1}-03-15`,
      category: 'Laptop',
      color: '#22D3EE'
    },
    {
      id: `goal_${userId}_2`,
      userId,
      title: 'Emergency Liquid Reserve',
      targetAmount: 100000,
      savedAmount: 85000,
      targetDate: `${currentYear}-12-31`,
      category: 'Emergency Fund',
      color: '#34D399'
    },
    {
      id: `goal_${userId}_3`,
      userId,
      title: 'Himalayan Winter Trek & Travel',
      targetAmount: 45000,
      savedAmount: 29500,
      targetDate: `${currentYear + 1}-01-20`,
      category: 'Travel',
      color: '#8B5CF6'
    },
    {
      id: `goal_${userId}_4`,
      userId,
      title: 'AI & FinTech Postgrad Certification',
      targetAmount: 60000,
      savedAmount: 36000,
      targetDate: `${currentYear + 1}-06-01`,
      category: 'Education',
      color: '#FBBF24'
    }
  ];

  return {
    transactions,
    budgets,
    savingsGoals
  };
}
